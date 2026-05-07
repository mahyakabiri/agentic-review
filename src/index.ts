import { query } from "@anthropic-ai/claude-agent-sdk";

// Skills in .claude/skills/ are discovered automatically
// when settingSources includes "project"
for await (const message of query({
  prompt: "Review this PR using our code review checklist",
  options: {
    settingSources: ["user", "project"],
    allowedTools: ["Skill", "Read", "Grep", "Glob"]
  }
})) {
  if (message.type === "result" && message.subtype === "success") {
    console.log(message.result);
  }
}