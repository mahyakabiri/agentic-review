import { Command } from 'commander';
import type { Mode, Context } from './types';
import { parsePRUrl } from '../utils/formatter';

const program = new Command();

program.requiredOption('--url <url>', 'GitHub PR URL');
program.option('--mode <mode>', 'Review focus: BUGS, SECURITY, PERFORMANCE', 'GENERAL');
program.option('--context <context>', 'Review scope: diff (changed lines only) or full (entire file)', 'diff');
program.parse();

const { owner, repo, pull_number } = parsePRUrl(program.opts().url);
const mode: Mode = program.opts().mode;
const context: Context = program.opts().context || 'diff';

export { owner, repo, pull_number, mode, context };