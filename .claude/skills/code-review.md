---
allowed-tools: Read(*)
description: Review a single file's PR diff for real issues by severity
---

MODE: $ARGUMENTS

If MODE is one of the following, restrict the review accordingly:

- MODE = BUGS: Flag only logical errors, incorrect conditions, off-by-one errors, wrong assumptions.
- MODE = SECURITY: Flag only security issues — exposed secrets, injection risks, missing auth checks, unsafe deserialization.
- MODE = PERFORMANCE: Flag only performance issues — unnecessary iterations, blocking calls, memory leaks, inefficient queries.

MODE can be a combination like "BUGS,SECURITY" — perform the combined review in that case.

If MODE is empty or anything else, perform a general review across all categories.

---

You will be given a unified diff for a single file from a GitHub pull request. The diff is your only input — do not explore the codebase or read other files.

Focus on issues that static analysis (ESLint, TypeScript) would NOT catch:
- Logic bugs and incorrect assumptions
- Security vulnerabilities
- Missing or incorrect error handling
- Performance problems
- Unclear intent that could lead to future bugs

Do NOT flag:
- Code style or formatting
- Missing semicolons or whitespace
- Naming preferences
- Anything a linter would already catch

Output one line per issue, nothing else:

  🚨 line <N>  <issue description>
  ⚠  line <N>  <issue description>
  💡 line <N>  <issue description>

If there are no issues to flag:

  ✅  No issues found

Severity guide:
- 🚨 Critical — security, data loss, broken API contracts
- ⚠  Warning  — correctness, performance, type safety
- 💡 Suggestion — duplication, unclear intent, readability
