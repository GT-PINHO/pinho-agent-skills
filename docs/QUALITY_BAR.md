# Quality Bar (DP standard)

## Non-negotiables

- **No guessing**: every recommendation needs evidence from the project (file/signal).
- **No oscillation**: decisions/invariants do not change without an explicit reason.
- **Anti-sycophancy**: don't agree to be polite — flag risks and failures.
- **Short scan**: minimal reads (avoid scanning the whole repo).
- **Useful memory**: record invariants/decisions to reduce tokens and repeated mistakes.

## Minimum evidence (short scan)

Prefer reading:

- `package.json`, `tsconfig.json`, `next.config.*`, `vite.config.*`
- `tailwind.config.*`, `postcss.config.*`
- `README.md`
- entry file (`src/main.*`, `app/layout.*`, `pages/_app.*`)

## Standard skill output

- Diagnosis (stack/product) with evidence
- Recommendations (Top 3–5) with “why”
- Execution checklist
- How to validate (no heavy loops)
