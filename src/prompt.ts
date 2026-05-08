import type { PRFile, Pass, Mode } from "./types";

function buildPrompt(file: PRFile, pass: Pass, mode: Mode = "GENERAL", fullContent?: string): string {
  const passNote =
    pass === "structure"
      ? "\nThis is a large file. Focus on structural issues only (architecture, wrong patterns, missing abstractions). Skip line-level nits."
      : "";

  const contextSection = fullContent
    ? `Full file content:\n\`\`\`\n${fullContent}\n\`\`\`\n\nDiff (what changed in this PR):`
    : "Diff:";

  return `Use the code-review skill with MODE: ${mode}.

You do NOT need to explore the codebase. All context is provided below — do not read any files.

File: ${file.filename}
Status: ${file.status}
Changes: +${file.additions} / -${file.deletions} lines${passNote}

${contextSection}
\`\`\`diff
${file.patch ?? "(binary or empty file — no patch available)"}
\`\`\``;
}

export default buildPrompt;