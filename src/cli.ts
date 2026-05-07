import { Command } from 'commander';  

const program = new Command(); 

program.requiredOption('--url <url>', 'GitHub PR URL');
program.parse();                                                                                                                                                                                                    
                                                          
const url = new URL(program.opts().url);                                                                                                                                                                            
export const [, owner, repo, , pull_number] = url.pathname.split('/');
