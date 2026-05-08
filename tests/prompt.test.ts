import { describe, it, expect } from 'vitest';
import buildPrompt from '../src/prompt';
import type { PRFile } from '../src/types';

const baseFile: PRFile = {
  filename: 'src/auth.ts',
  status: 'modified',
  additions: 10,
  deletions: 5,
  changes: 15,
  patch: '@@ -1,5 +1,10 @@\n+const x = 1;',
  blob_url: '',
  raw_url: '',
  contents_url: '',
  sha: 'abc123',
};

describe('buildPrompt', () => {
  it('includes the filename and change stats', () => {
    const prompt = buildPrompt(baseFile, 'full');
    expect(prompt).toContain('src/auth.ts');
    expect(prompt).toContain('+10');
    expect(prompt).toContain('-5');
    expect(prompt).toContain('modified');
  });

  it('includes the diff patch', () => {
    const prompt = buildPrompt(baseFile, 'full');
    expect(prompt).toContain('@@ -1,5 +1,10 @@');
    expect(prompt).toContain('+const x = 1;');
  });

  it('includes the mode in the skill invocation', () => {
    const prompt = buildPrompt(baseFile, 'full', 'SECURITY');
    expect(prompt).toContain('MODE: SECURITY');
  });

  it('defaults mode to GENERAL', () => {
    const prompt = buildPrompt(baseFile, 'full');
    expect(prompt).toContain('MODE: GENERAL');
  });

  it('adds structure note when pass is structure', () => {
    const prompt = buildPrompt(baseFile, 'structure');
    expect(prompt).toContain('structural issues only');
  });

  it('does not add structure note when pass is full', () => {
    const prompt = buildPrompt(baseFile, 'full');
    expect(prompt).not.toContain('structural issues only');
  });

  it('shows fallback message for binary files with no patch', () => {
    const binaryFile = { ...baseFile, patch: undefined };
    const prompt = buildPrompt(binaryFile, 'full');
    expect(prompt).toContain('binary or empty file');
  });

  it('instructs the agent not to read files', () => {
    const prompt = buildPrompt(baseFile, 'full');
    expect(prompt).toContain('do not read any files');
  });
});
