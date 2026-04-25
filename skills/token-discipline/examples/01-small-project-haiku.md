# Example 01 — Small project on Opus, single-file edit

## Input (user)

"I need to fix a typo in `src/components/Button.tsx` on line 42. Change 'Sumbit' to 'Submit'. Project has ~20 source files, one Vite + React app, no monorepo."

## Expected output (assistant)

**Mode**
- Project size: **S**
- Evidence (files/signals): ~20 source files, single Vite+React app, no workspaces, no monorepo signals.

**Model**
- Recommended: **haiku**
- Why: single-file edit, single line, deterministic transformation. Smallest viable model finishes this reliably. Running this on Opus is wasted tokens.

**Plan (bounded)**
1) Files I will read: `src/components/Button.tsx` only (≤ 1 read).
2) Decision I expect to make: line 42 column-precise replace `Sumbit` → `Submit`.
3) How I will validate: type-check (`tsc --noEmit`) or one render test if a snapshot exists.

**Routing**
- Coordinator is on Opus → spawn subagent on Haiku with the exact file path + edit instruction. No re-reading.

**Stop rules**
- I will stop reading when: line 42 is read once.
- I will escalate model only if: the subagent reports the file does not contain `Sumbit` on line 42 (then a wider grep is needed and Sonnet might be justified).
