import chalk from 'chalk';
import { PRFile } from "../src/types";

export function getDiff(files: PRFile[]) {
    return files                                                                                                                                                                                                  
    .map(f => `--- a/${f.filename}\n+++ b/${f.filename}\n${f.patch ?? ''}`)
    .join('\n\n'); 
}

export function parsePRUrl(rawUrl: string): {
    owner: string;
    repo: string;
    pull_number: number;
  } {
    const url = new URL(rawUrl);
    const parts = url.pathname.split('/').filter(Boolean);
    // pathname: /owner/repo/pull/42  →  ['owner', 'repo', 'pull', '42']
  
    if (parts.length < 4 || parts[2] !== 'pull' || isNaN(Number(parts[3]))) {
      throw new Error(
        `Invalid GitHub PR URL: "${rawUrl}". Expected https://github.com/<owner>/<repo>/pull/<number>`
      );
    }
  
    return {
      owner: parts[0],
      repo: parts[1],
      pull_number: parseInt(parts[3], 10),
    };
  }

export function formatFileHeader(file: PRFile): string {
  const name = chalk.bold.cyan(file.filename);
  const additions = chalk.green(`+${file.additions}`);
  const deletions = chalk.red(`-${file.deletions}`);
  const pass = file.additions + file.deletions > 200
    ? chalk.yellow(' [structure pass]')
    : '';
  return `\n── ${name} (${additions}/${deletions})${pass}`;
}

export function formatResult(result: string): string {
  return result
    .split('\n')
    .map(line => {
      if (line.startsWith('🚨')) return chalk.red(line);
      if (line.startsWith('⚠'))  return chalk.yellow(line);
      if (line.startsWith('💡')) return chalk.cyan(line);
      if (line.startsWith('✅')) return chalk.green(line);
      return chalk.white(line);
    })
    .join('\n');
}