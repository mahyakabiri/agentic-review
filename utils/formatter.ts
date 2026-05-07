import { PRFile } from "../src/types";

export function getDiff(files: PRFile[]) {
    return files                                                                                                                                                                                                  
    .map(f => `--- a/${f.filename}\n+++ b/${f.filename}\n${f.patch ?? ''}`)
    .join('\n\n'); 
}