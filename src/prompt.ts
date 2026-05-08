import type { PRFile, Pass, Mode } from "./types";

function buildPrompt(file: PRFile, pass: Pass, mode: Mode = "GENERAL"): string {

  const passNote =
    pass === "structure"
      ? "\nThis is a large file. Focus on structural issues only (architecture, wrong patterns, missing abstractions). Skip line-level nits."
      : "";

  return `Use the code-review skill with MODE: ${mode}.

You do NOT need to explore the codebase. The diff below is your only input — do not read any files.

File: ${file.filename}
Status: ${file.status}
Changes: +${file.additions} / -${file.deletions} lines${passNote}

\`\`\`diff
${file.patch ?? "(binary or empty file — no patch available)"}
\`\`\``;
}

export default buildPrompt;