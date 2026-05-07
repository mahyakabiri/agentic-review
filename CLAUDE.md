# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`agentic-review` — a CLI tool that accepts a Git PR diff and produces structured, actionable code review comments using the Claude Agent SDK as the agentic layer.

## Setup

```bash
npm install
export ANTHROPIC_API_KEY=your_key_here
```

## Commands

```bash
# Run the CLI from a diff file
node dist/index.js --diff ./my.diff

# Pipe from git
git diff main...HEAD | node dist/index.js --stdin

# Run tests
npx vitest

# Run a single test file
npx vitest src/path/to/file.test.ts
```

## Architecture

The pipeline is: **parse & chunk diff → Claude Agent SDK (one turn per file/chunk) → format output**.

### Diff chunking (`src/diff/`)
Diffs are chunked by file, not by line count, so each agent turn reviews a coherent unit of change. Files above a configurable line threshold get two passes: structure first, then implementation details.

### Agent layer (`src/agent/`)
Uses `@anthropic-ai/claude-agent-sdk`'s `query()` function, which streams structured messages and manages multi-turn context natively. This lets the agent cross-reference findings across files (e.g., flag duplication between files already reviewed) without manual state management.

### CLI (`src/cli/`)
Built with `commander`. Entry point at `src/index.ts`. Flags: `--diff <path>`, `--stdin`, `--format inline|json|markdown`, `--fail-on critical|warning`.

### Output formatter (`src/formatter/`)
Uses `chalk` for coloured inline output. JSON and Markdown modes emit machine-readable output for CI integration.

### Configuration
Optional `agentic-review.config.json` in the project root:
```json
{
  "language": "typescript",
  "framework": "react",
  "strictness": "standard",
  "ignore": ["*.test.ts", "dist/**"],
  "focus": ["security", "performance", "accessibility"],
  "maxFilesPerRun": 10
}
```

## MCP

`.mcp.json` configures an MCP filesystem server scoped to `/Users/me/projects`. Update the path if working locally.

## Review severity levels

| Symbol | Level | Meaning |
|--------|-------|---------|
| 🚨 | Critical | Security, data loss, broken API contracts |
| ⚠ | Warning | Correctness, performance, type safety |
| 💡 | Suggestion | Duplication, naming, readability |
| ✅ | Clear | Nothing flagged |
