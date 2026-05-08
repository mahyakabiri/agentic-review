# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`agentic-review` — a CLI tool that fetches a GitHub PR's file-by-file diff via the Octokit REST API and reviews each file using `query()` from `@anthropic-ai/claude-agent-sdk`.

## Commands

```bash
# Requires Node 18+ — use nvm if system node is older
nvm use 20

npm install
npm run dev          # run src/index.ts via tsx (no build step)
npm run build        # vite build → dist/
npm test             # vitest watch
npm run test:run     # vitest single run (CI)

# Run a single test file
npx vitest src/path/to/file.test.ts
```

## Architecture

Pipeline: **resolve owner/repo/PR → fetch files via Octokit → one `query()` per file → format + output**.

### GitHub integration
Owner and repo are inferred from `git remote get-url origin` (handles both SSH and HTTPS). PR number comes from the `--pr` CLI flag. Files are fetched with `octokit.rest.pulls.listFiles()` — each file object carries `filename`, `patch` (unified diff), `status`, `additions`, `deletions`.

### Agent layer (`src/index.ts` → `src/agent/`)
One `query()` call per file. The prompt explicitly provides the diff so the agent doesn't need to explore the filesystem. Large files (above a configurable `additions + deletions` threshold) get two passes: structure first, then implementation details.

`query()` is called with:
```typescript
options: {
  allowedTools: ['Skill', 'Read'],
  settingSources: ['project'],   // loads .claude/skills/
}
```

### Skill (`.claude/skills/code-review.md`)
Accepts a `MODE` argument: `BUGS`, `SECURITY`, `PERFORMANCE`, combinations, or empty for general review. The prompt passes the mode via `$ARGUMENTS` and overrides the skill's "explore codebase" instruction by providing the diff directly.

### CLI (`src/cli/`)
Built with `commander`. Flags: `--pr <number>`, `--mode <mode>`, `--format inline|json|markdown`, `--fail-on critical|warning`.

### Output formatter (`src/formatter/`)
Parses structured lines from the agent's result and renders with `chalk`. Expected agent output format:
```
🚨 line <N>  <issue>
⚠  line <N>  <issue>
💡 line <N>  <issue>
✅  No issues found
```

### Configuration
Optional `agentic-review.config.json` in the project root:
```json
{
  "strictness": "standard",
  "ignore": ["*.test.ts", "dist/**"],
  "focus": ["security", "performance"],
  "maxFilesPerRun": 10,
  "largeFileThreshold": 200
}
```

## MCP

`.mcp.json` configures an MCP filesystem server. Update the path from `/Users/me/projects` to your local projects directory.
