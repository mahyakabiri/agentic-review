# agentic-review

A CLI tool that takes a Git PR diff and produces structured, actionable code review comments using the Claude Agent SDK as the agentic layer.

```
$ agentic-review --diff ./my-feature.diff

Analyzing diff (3 files, +187 / -42 lines)...

src/components/PaymentForm.tsx
  ⚠  line 34  Prop `onSuccess` is typed as `any` — consider `(result: PaymentResult) => void`
  ⚠  line 67  State update inside a loop may cause redundant re-renders; batch with a single setState call
  💡 line 89  This validation logic is duplicated from AuthForm.tsx — candidate for extraction

src/hooks/usePayment.ts
  🚨 line 12  API key passed as a prop — should come from env or context, not parent component
  ✅          Error boundary coverage looks solid

src/utils/format.ts
  ✅          No issues found

Summary: 1 critical · 2 warnings · 1 suggestion
```

---

## Why this exists

At [Snapp](https://snapp.ir) — Iran's largest ride-hailing platform — I introduced Claude Code-based workflows into our frontend team's daily code review process. The result was a **35% reduction in time spent on routine review comments**, freeing engineers to focus on architecture and product decisions rather than mechanical feedback.

This project is the public version of that idea: a standalone, composable CLI that any engineering team can drop into their workflow or CI pipeline.

---

## How it works

```
PR diff (stdin or file)
        │
        ▼
  parse & chunk diff
        │
        ▼
  Claude Agent SDK          ← streams structured review output
  (query per file/chunk)
        │
        ▼
  format + output           ← inline comments, JSON, or Markdown report
```

The agent receives each file's diff with its full context (file path, language, surrounding lines) and produces structured review output. It uses Claude's understanding of the codebase to flag real issues — not linting errors that a static analyser would catch — and categorises them by severity.

The tool runs entirely locally. No diff content is stored. API calls go directly to Anthropic.

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| Language | TypeScript + Node.js | Type safety for structured output parsing; native ESM |
| Agentic layer | `@anthropic-ai/claude-agent-sdk` | Official SDK — streams messages, manages multi-turn context, handles tool use |
| CLI interface | `commander` | Minimal, zero-config argument parsing |
| Output formatting | `chalk` + custom formatter | Coloured inline output; optional JSON/Markdown modes |
| Testing | `vitest` | Fast, ESM-native, consistent with the frontend toolchain I use daily |

---

## Getting started

### Prerequisites

- Node.js 18+
- An Anthropic API key: `export ANTHROPIC_API_KEY=your_key_here`

### Install

```bash
npm install -g agentic-review
# or run without installing:
npx agentic-review --diff ./my.diff
```

### Usage

**From a diff file:**
```bash
agentic-review --diff ./feature-branch.diff
```

**From git directly:**
```bash
git diff main...HEAD | agentic-review --stdin
```

**As a pre-push hook:**
```bash
# .git/hooks/pre-push
git diff main...HEAD | agentic-review --stdin --fail-on critical
```

**Output as JSON (for CI integration):**
```bash
git diff main...HEAD | agentic-review --stdin --format json > review.json
```

**Output as Markdown (for PR comments):**
```bash
git diff main...HEAD | agentic-review --stdin --format markdown > review.md
```

---

## Configuration

Create an `agentic-review.config.json` in your project root:

```json
{
  "language": "typescript",
  "framework": "react",
  "strictness": "standard",
  "ignore": ["*.test.ts", "*.spec.tsx", "dist/**"],
  "focus": ["security", "performance", "accessibility"],
  "maxFilesPerRun": 10
}
```

| Option | Values | Default |
|---|---|---|
| `strictness` | `"light"` / `"standard"` / `"strict"` | `"standard"` |
| `focus` | array of concern categories | all categories |
| `maxFilesPerRun` | integer | `10` |

---

## Review categories

| Icon | Category | Example |
|---|---|---|
| 🚨 Critical | Security issues, data loss risk, breaking API contracts | API key exposed in props |
| ⚠ Warning | Correctness issues, performance problems, type safety | State update inside loop |
| 💡 Suggestion | Duplication, naming, readability | Extract shared validation logic |
| ✅ Clear | File reviewed, nothing flagged | — |

---

## Engineering notes

**Why the Agent SDK rather than the plain Anthropic API?**

The Agent SDK's `query()` function streams structured messages and manages multi-turn context natively. For reviewing large diffs, this matters: instead of sending a single massive prompt, the agent can reason about one file at a time and maintain context across the review session (e.g., flagging inconsistency between two files it has already read). The plain API would require me to manage that state manually.

**Chunking strategy**

Large diffs are chunked by file, not by line count. This keeps each agent turn focused on a coherent unit of change and avoids review comments that lack file context. Files above a configurable line threshold are reviewed in two passes: structure first, then implementation details.

**What it doesn't do**

This tool is not a linter replacement. It won't catch missing semicolons or wrong indentation — your existing ESLint/Prettier setup handles that. It's meant to catch the things static analysis misses: architectural concerns, missing error handling, unclear intent, security issues that require understanding the context.

---

## Roadmap

- [ ] GitHub Actions integration (post review as PR comments via GitHub API)
- [ ] GitLab CI integration (Snapp runs GitLab; this is the real-world use case)
- [ ] Support for reviewing full file context, not just the diff
- [ ] Team rule files (`.agentic-review/rules.md`) for project-specific conventions
- [ ] Token usage reporting per review run

---

## Contributing

Issues and PRs welcome. If you're building something similar or have used Claude Code in a team workflow, I'd especially like to hear about your experience with prompt strategies and chunking approaches.

---

## License

MIT