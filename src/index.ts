import { query } from "@anthropic-ai/claude-agent-sdk";
import buildPrompt from "./prompt";
import { owner, repo, pull_number, mode, context } from "./cli";
import { githubService } from "./github";
import type { Pass, PRFile } from "./types";
import { spinner } from "../utils/spinner";
import { formatFileHeader, formatResult } from "../utils/formatter";
import { loadRules } from "../utils/rules";

const LARGE_FILE_THRESHOLD = 200;

const rules = loadRules();
const files: PRFile[] = await githubService.getDiff(owner, repo, Number(pull_number));

for (const file of files) {
  const pass: Pass =
    file.additions + file.deletions > LARGE_FILE_THRESHOLD ? "structure" : "full";

  const fullContent =
    context === "full" && file.status !== "removed"
      ? await githubService.getFileContent(owner, repo, file.sha)
      : undefined;

  console.log(formatFileHeader(file));
  const stop = spinner("reviewing...");

  for await (const message of query({
    prompt: buildPrompt(file, pass, mode, fullContent, rules),
    options: {
      settingSources: ["user", "project"],
      allowedTools: ["Skill", "Read", "Grep", "Glob"],
    },
  })) {
    if (message.type === "result" && message.subtype === "success") {
      stop();
      console.log(formatResult(message.result));
    }
  }
}