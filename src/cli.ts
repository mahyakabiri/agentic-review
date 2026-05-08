import { Command } from 'commander';
import type { Mode } from './types';
import { parsePRUrl } from '../utils/formatter';

const program = new Command();

program.requiredOption('--url <url>', 'GitHub PR URL');
program.requiredOption('--mode <mode>', 'Mode to run the tool in', ['BUGS', 'SECURITY', 'PERFORMANCE']);
program.parse();

const { owner, repo, pull_number } = parsePRUrl(program.opts().url);

const mode: Mode = program.opts().mode || 'GENERAL';

if (mode === 'BUGS') {
    console.log('Running in BUGS mode');
} else if (mode === 'SECURITY') {
    console.log('Running in SECURITY mode');
} else if (mode === 'PERFORMANCE') {
    console.log('Running in PERFORMANCE mode');
}


export {
    owner,
    repo,
    pull_number,
    mode,
}