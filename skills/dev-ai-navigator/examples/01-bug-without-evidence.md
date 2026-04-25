# Example 01 — Bug report without evidence

## Input (user)

"Fix the login bug."

## Expected output (assistant)

**Quick map**
- What the project is: I'll confirm with `package.json` + `README` + entry file (≤3 reads).
- Where login lives: hypothesis is `src/auth/`, `app/(auth)/`, or `pages/login.*`. I'll grep for `signIn|login|authenticate` and pick the smallest match cluster.
- Target files: confirmed after the grep.

**Plan (short)**
1. Read README + entry + 1 config to confirm framework.
2. Grep `signIn|login|authenticate`. Open at most 2 files from the result.
3. Reproduce the bug locally.

**Risks**
- Without "what's the bug" (error message, expected vs actual, last working version), I'll fix the wrong thing.
- A "login bug" can be auth backend, session storage, or routing — three different fixes.
- No reproduction = every change is speculation.

**How to validate**
- One failing test that captures the bug.
- Manual login flow after the fix.

**I need from you (minimum):** error message + expected vs actual + steps to reproduce. Without those I'd be guessing — and this skill refuses to guess.
