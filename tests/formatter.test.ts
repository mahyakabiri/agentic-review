import { describe, it, expect } from 'vitest';
import { parsePRUrl } from '../utils/formatter';

describe('parsePRUrl', () => {
  it('parses a valid HTTPS PR URL', () => {
    const result = parsePRUrl('https://github.com/anthropics/anthropic-sdk-python/pull/42');
    expect(result).toEqual({ owner: 'anthropics', repo: 'anthropic-sdk-python', pull_number: 42 });
  });

  it('parses pull_number as a number, not a string', () => {
    const { pull_number } = parsePRUrl('https://github.com/owner/repo/pull/7');
    expect(typeof pull_number).toBe('number');
    expect(pull_number).toBe(7);
  });

  it('throws on a non-PR GitHub URL', () => {
    expect(() => parsePRUrl('https://github.com/owner/repo')).toThrow('Invalid GitHub PR URL');
  });

  it('throws when pull_number is not a number', () => {
    expect(() => parsePRUrl('https://github.com/owner/repo/pull/abc')).toThrow('Invalid GitHub PR URL');
  });

  it('throws on a completely invalid URL', () => {
    expect(() => parsePRUrl('not-a-url')).toThrow();
  });
});
