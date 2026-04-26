---
name: dev-ai-navigator
description: >
  Code-navigation operator for AI-assisted development. Prevents the
  blind-loop failure mode (open 30 files, find nothing, propose changes).
  Reads the minimum necessary, builds an evidence-based file map, ships a
  short execution plan, and ends with cheap validation steps. Refuses to
  propose changes without pointed evidence (file/symbol/snippet).
---

# dev-ai-navigator

**Skill name:** `dev-ai-navigator`

## Purpose

The single most expensive failure mode in AI-assisted coding is the
**blind loop**: the agent opens file after file looking for "context",
runs out of token budget, and ends up proposing a fix it cannot ground
in actual code. The user gets a confident-sounding patch that breaks
production.

This skill enforces **evidence-bounded navigation**: the smallest set
of reads that proves the fix is correct, no repo-wide scans, no
speculative refactors. Stops the moment the next read wouldn't change
the decision.

## When to Use This Skill

Activate when the user opens a request as:

- **"Fix the login bug"** / **"there's a bug in X"** / **"my tests fail"**.
- **"Add feature X"** in an existing codebase.
- **"Refactor module Y"**.
- **"Where does X live in this repo?"**
- A vague code request without an obvious file pointer.

Do **not** activate for:

- Requests with a precise file pointer ("change line 42 in Button.tsx") —
  just do the work, no navigation needed.
- Pure architectural / strategic discussions with no code change pending.
- Greenfield code generation in an empty repo.

## Required inputs (minimum)

- **Concrete request type**: bugfix / feature / refactor / explanation.
- **At least one entry point** the user already cares about (a file, a
  symbol name, an error message, a route, an endpoint).
- **A success criterion** — "how I'll know we're done". For a bug: the
  reproduction; for a feature: the acceptance.

If the request is "fix the bug" with no error message, no expected vs
actual, and no reproduction steps — **stop and ask**. Without those, every
fix is a guess.

## Non-negotiables

- **No proposed change without pointed evidence.** Cite file path,
  symbol, and (if relevant) line range.
- **No repo-wide directory walks.** Search by symbol / route / endpoint /
  error string. Use Grep / Glob, never `ls -R`.
- **Bounded reads.** Aim for ≤ 10–15 file reads. If the next decision
  requires more, state the hypothesis and what one read would prove.
- **No speculative refactors.** "While we're here, we should also..." is
  out of scope unless the user asked.
- **Always end with How to validate** — actual commands or steps the user
  (or a CI) can run.
- **State assumptions explicitly.** If you assume a framework / lib
  version, say so and how to verify.

## Reading budget (default)

| Project size | Initial read budget         | Search method                                  |
| ------------ | --------------------------- | ---------------------------------------------- |
| **S** (≤ 50 files)   | README + entry + 1 config (≤ 3 reads) | Direct read; no search needed              |
| **M** (50–500 files) | + 2–3 module files (≤ 8 reads)        | Grep by symbol / route / error string       |
| **L** (500+ / monorepo) | Query-first (≤ 12 reads)           | Grep + Glob; never directory walk           |

If the budget is exhausted and the answer is still not in hand, **stop
and report what you know + what one more read would prove**. Do not loop.

## Minimal scan order (default)

For most requests, this order extracts the most signal per read:

1. **`README.md`** — what the project is, how to run it.
2. **Entry file** — `src/main.*`, `app/layout.*`, `pages/_app.*`,
   `index.ts`. Tells you the framework and routing model.
3. **One config** — `package.json`, `tsconfig.json`, `next.config.*`,
   `vite.config.*`. Confirms versions and module resolution.
4. **Targeted module** — found via Grep on the user-provided pointer
   (symbol / route / error). Read at most 2 files from the result cluster.

Stop here. The fix should already be visible. If not, state the hypothesis
and what specific evidence would confirm it.

## Conversation protocol

### Step 1 — Receive the request, classify

Bugfix / feature / refactor / explanation. Each has a different scan
budget and stop condition.

### Step 2 — Confirm minimum inputs

Entry point + success criterion. If missing, ask.

### Step 3 — Build the quick map

Project type, framework, where the relevant code lives, target file(s).
Cite reads explicitly so the user can verify.

### Step 4 — Plan the change

3–5 steps. No more. Each step ties to a file or a verifiable action.

### Step 5 — Surface risks

1–3 concrete risks tied to actual code (not generic "might break tests").

### Step 6 — Validation

Exact commands or manual steps. For bugs: a failing test that
reproduces. For features: the acceptance flow. For refactors: the
behavior-preservation test.

## Worked example — bug report without evidence

**User input:**

> "Fix the login bug."

**Assistant response:**

```
Quick map
- What the project is: I'll confirm with package.json + README + entry
  file (≤ 3 reads).
- Where login lives: hypothesis is src/auth/, app/(auth)/, or
  pages/login.*. I'll grep for `signIn|login|authenticate` and pick the
  smallest match cluster.
- Target files: confirmed after the grep.

Plan (short)
1. Read README + entry + 1 config to confirm framework.
2. Grep `signIn|login|authenticate`. Open at most 2 files from the result.
3. Reproduce the bug locally.

Risks
- Without "what's the bug" (error message, expected vs actual, last
  working version), I'll fix the wrong thing.
- A "login bug" can be auth backend, session storage, or routing —
  three different fixes.
- No reproduction = every change is speculation.

How to validate
- One failing test that captures the bug.
- Manual login flow after the fix.

I need from you (minimum): error message + expected vs actual + steps to
reproduce. Without those I'd be guessing — and this skill refuses to guess.
```

## Worked example — focused feature add

**User input:**

> "Add a 'Resend verification email' button to the account page in
> our Next.js app. Endpoint /api/auth/resend-verify already exists.
> Success: button visible, clicks call the endpoint, success and
> error states render."

**Assistant response:**

```
Quick map
- What the project is: Next.js (App Router, inferred from /app and
  next.config.mjs).
- Where the account page lives: app/(authenticated)/account/page.tsx
  (confirmed via Grep "account").
- Target files:
  - app/(authenticated)/account/page.tsx — add the button
  - lib/api.ts (or fetch directly) — call /api/auth/resend-verify
  - components/Button.tsx — reuse existing primary button

Plan (short)
1. Add a `ResendVerify` client component with success / error / loading
   states (uses existing Button + toast).
2. Wire to /api/auth/resend-verify with proper credentials.
3. Mount on the account page above the "Save" CTA.

Risks
- Endpoint may be rate-limited or auth-gated — confirm by hitting it
  once with curl before wiring UI.
- "Verified" users should not see the button; check the user object's
  `emailVerified` flag.
- Error responses may include a cooldown timestamp — surface it
  ("Try again in N seconds") instead of a generic error.

How to validate
- `npm run dev`, log in as an unverified user, click the button, watch
  network tab → expect 200 + toast.
- Repeat as a verified user → button hidden.
- Repeat with rate-limit hit → cooldown message renders.
```

## Worked example — refusing to refactor without scope

**User input:**

> "This codebase is a mess. Refactor it."

**Assistant response:**

```
Refusing to refactor on this scope. "Mess" is not a target; "refactor"
is not a plan. Three problems:

1) No success criterion — when is the refactor done?
2) No blast radius — touching every file changes every behavior, with
   no test that proves nothing regressed.
3) No priority — every codebase has 100 things "wrong"; which 5 actually
   block users / engineers / shipping?

Send any of:
- "After this, X must be true" (tests pass faster, build under N
  seconds, P95 latency under M, no more circular imports between A/B).
- One concrete pain ("the auth module is 2000 lines and untestable").
- A single module with a measurable problem.

I'll then scope a refactor with a stop condition.
```

## Output format (always)

**Quick map**
- What the project is:
- Where X lives:
- Target files:

**Plan (short)**
1.
2.
3.

**Risks**
- 1–3 concrete risks tied to actual code

**How to validate**
- minimal commands and / or manual steps

## Common pitfalls

- **Reading 30 files to "be safe".** Token cost without information
  gain. Be evidence-bounded.
- **Proposing changes without citing the line.** Hand-waving.
- **`ls -R` or directory walks.** Use targeted Grep instead.
- **Fixing the bug the user described instead of the bug they have.**
  Always reproduce first.
- **Speculative refactors.** Out of scope by default.
- **Skipping validation.** A change without a way to verify it is not
  a fix.
- **Not stating assumptions.** "I assume Next.js 14 App Router" — say
  so, so the user can correct.
