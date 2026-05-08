import { query } from "@anthropic-ai/claude-agent-sdk";
import buildPrompt from "./prompt";
import { owner, repo, pull_number, mode } from "./cli";
import { githubService } from "./github";
import type { Pass, PRFile } from "./types";

const LARGE_FILE_THRESHOLD = 200;

const files: PRFile[] = await githubService.getDiff(owner, repo, Number(pull_number));

for (const file of files) {
  const pass: Pass =
    file.additions + file.deletions > LARGE_FILE_THRESHOLD
      ? "structure"
      : "full";

  console.log(`\n── ${file.filename} (+${file.additions}/-${file.deletions})`);

  for await (const message of query({
    prompt: buildPrompt(file, pass, mode),
    options: {
      settingSources: ["user", "project"],
      allowedTools: ["Skill", "Read", "Grep", "Glob"],
    },
  })) {
    if (message.type === "result" && message.subtype === "success") {
      console.log(message.result);
    }
  }
}