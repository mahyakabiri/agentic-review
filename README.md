# agentic-review

A CLI tool that fetches a GitHub PR's changed files and produces structured, actionable code review comments using the Claude Agent SDK as the agentic layer.

```
$ agentic-review --url https://github.com/owner/repo/pull/42 --mode BUGS

── src/components/PaymentForm.tsx (+34/-8)
  🚨 line 12  API key passed as a prop — should come from env or context, not parent component
  ⚠  line 34  Prop `onSuccess` is typed as `any` — consider `(result: PaymentResult) => void`
  💡 line 89  Validation logic duplicated from AuthForm.tsx — candidate for extraction

── src/hooks/usePayment.ts (+12/-3)
  ✅  No issues found

── src/utils/format.ts (+5/-1)
  ✅  No issues found
```

---

## Why this exists

I introduced Claude Code-based workflows into daily code review process. The result was a **35% reduction in time spent on routine review comments**, freeing engineers to focus on architecture and product decisions rather than mechanical feedback.

This project is the public version of that idea: a standalone, composable CLI that any engineering team can drop into their workflow or CI pipeline.

---

## How it works

```
GitHub PR URL
      │
      ▼
fetch changed files via Octokit
      │
      ▼
Claude Agent SDK          ← one query() call per file
(per-file review loop)
      │
      ▼
format + output           ← colour-coded inline comments
```

The agent receives each file's diff (and optionally the full file content) and produces structured review output. It flags real issues — not linting errors that a static analyser would catch — and categorises them by severity.

The tool runs entirely locally. No diff content is stored. API calls go directly to Anthropic.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript + Node.js | Type safety; native ESM |
| Agentic layer | `@anthropic-ai/claude-agent-sdk` | Streams messages, manages multi-turn context, handles tool use |
| GitHub integration | `@octokit/rest` | Fetches per-file diffs via `pulls.listFiles()` |
| CLI interface | `commander` | Minimal, zero-config argument parsing |
| Output formatting | `chalk` + custom formatter | Colour-coded inline output by severity |
| Build | Vite | Bundles to a single ESM binary with `.ts` imports in source |
| Testing | `vitest` | Fast, ESM-native |

---

## Getting started

### Prerequisites

- Node.js 18+
- Claude Code installed and authenticated (the SDK uses its credentials)
- A GitHub personal access token: `export GITHUB_TOKEN=your_token_here`

### Install

```bash
npm install -g agentic-review
# or run without installing:
npx agentic-review --url https://github.com/owner/repo/pull/42
```

### Usage

**Review a PR (default — diff only):**
```bash
agentic-review --url https://github.com/owner/repo/pull/42
```

**Focus the review with a mode:**
```bash
agentic-review --url https://github.com/owner/repo/pull/42 --mode BUGS
agentic-review --url https://github.com/owner/repo/pull/42 --mode SECURITY
agentic-review --url https://github.com/owner/repo/pull/42 --mode PERFORMANCE
```

**Include full file context alongside the diff:**
```bash
agentic-review --url https://github.com/owner/repo/pull/42 --context full
```

**All flags:**

| Flag | Values | Default |
|---|---|---|
| `--url` | GitHub PR URL | required |
| `--mode` | `BUGS` / `SECURITY` / `PERFORMANCE` / `GENERAL` | `GENERAL` |
| `--context` | `diff` / `full` | `diff` |

---

## Team rule files

Create a `.agentic-review/rules.md` file in your project root to inject project-specific conventions into every review:

```markdown
# My Team's Rules

- All API handlers must validate input with Zod before processing
- Never use `any` — use `unknown` and narrow the type
- Database calls must go through the repository layer, not directly in route handlers
- Error responses must follow the shape `{ error: string, code: string }`
```

The rules are loaded automatically — no flag needed.

---

## Review categories

| Icon | Category | Example |
|---|---|---|
| 🚨 Critical | Security issues, data loss risk, breaking API contracts | API key exposed in props |
| ⚠ Warning | Correctness issues, performance problems, type safety | State update inside loop |
| 💡 Suggestion | Duplication, naming, readability | Extract shared validation logic |
| ✅ Clear | File reviewed, nothing flagged | — |

---

## CI/CD

The repo ships with two GitHub Actions workflows:

- **CI** (`ci.yml`) — runs install → lint → test → build on every pull request and merge to `main`
- **Publish** (`publish.yml`) — runs the full pipeline then publishes to npm on tag push (`v*.*.*`) or manual trigger, with a required approval gate via GitHub Environments

To publish a new version:
```bash
npm version patch   # bumps version, commits, creates tag
git push --follow-tags
```

---

## Engineering notes

**Why the Agent SDK rather than the plain Anthropic API?**

The Agent SDK's `query()` function streams structured messages and manages multi-turn context natively. For reviewing large diffs, this matters: instead of sending a single massive prompt, the agent reviews one file at a time. The plain API would require managing that state manually.

**Two-pass strategy**

Files with more than 200 changed lines are reviewed with a structure-only pass — architecture, wrong patterns, missing abstractions. Smaller files get a full line-level review. This avoids a wall of low-value comments on large diffs.

**What it doesn't do**

This tool is not a linter replacement. It won't catch missing semicolons or wrong indentation — your existing ESLint/Prettier setup handles that. It catches the things static analysis misses: architectural concerns, missing error handling, unclear intent, and security issues that require understanding context.

---

## Contributing

Issues and PRs welcome. If you're building something similar or have used Claude Code in a team workflow, I'd especially like to hear about your experience with prompt strategies and chunking approaches.

---

## License

MIT
