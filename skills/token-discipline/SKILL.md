---
name: token-discipline
description: >
  Always-on token-economy operator. Bounds reading and output, refuses
  repo-wide scans and repetition, and recommends the smallest viable Claude
  model (Haiku → Sonnet → Opus) for the task at hand. Auto-classifies
  project size (S / M / L) and routes work to the right model via subagents.
  Escalates only with evidence that the smaller tier failed.
---

# token-discipline

**Skill name:** `token-discipline`

## Purpose

Most token waste in agent sessions has the same shape: **reading too much,
running too long, and using a bigger model than the task needs**. None of
these failures show up as errors — they show up later as slow responses,
unnecessarily expensive runs, and degraded precision because the model is
distracted by irrelevant context.

This skill is the discipline layer that runs underneath everything else.
It bounds reads, bounds output, picks the smallest viable model, and
routes work to the right tier without asking the user to type `/model`.

## When to Use This Skill

This skill is **always-on by default**. Other skills should query its
rules before:

- Starting any read-heavy task.
- Choosing a model tier.
- Deciding whether to spawn a subagent.
- Producing long output.

Activate explicitly when the user:

- Says **"reduce token usage"**, **"this is burning tokens"**, **"why is
  this slow / expensive"**.
- Asks **"which model should I use for X"**.
- Reports an unexpectedly large bill or slow agent runs.
- Starts a task in a known-large repo (monorepo / 500+ files).

Do **not** activate to second-guess decisions already made — apply on the
next read or the next decision, not retroactively.

## Required inputs (minimum)

Provide **any 2** of the following (more = better):

- **Repo size signal** — LOC, # files, monorepo y/n.
- **Stack signal** — framework, language, single-app vs multi-app.
- **Task type** — read-only / single-file edit / cross-file refactor /
  architecture / debugging.
- **Time budget** — fast / normal / careful.
- **Cost preference** — cheap / balanced / quality-first.

If signals are missing, default to **size M, Sonnet, balanced**.

## Non-negotiables

- **Always-on by default.** Token economy is the baseline, not opt-in.
- **Read the minimum.** Sample, don't scan.
- **Don't repeat known context.** If memory or a previous read already
  covers it, do not re-read.
- **Evidence before expansion.** Open more files only when the next
  decision actually depends on them.
- **No loops, no polling.** One read, one decision.
- **Stop adding tokens** the moment the answer is complete.
- **Escalate model only with evidence.** Haiku missed → Sonnet. Sonnet
  missed → Opus. Never start at Opus "to be safe".

## Project-size classification (the only one that matters)

Run a 3-read scan, classify, then apply the matching mode.

| Size | Definition                                              | Initial reads             | Output style        | Default model   |
| ---- | ------------------------------------------------------- | ------------------------- | ------------------- | --------------- |
| **S** | ≤ ~50 source files, single app, few deps                | README + entry + 1 config | Terse, no preamble  | **Haiku**       |
| **M** | ~50–500 files, single framework, possibly a backend     | + 2–3 configs + 1–2 modules (by symbol) | Compact, top-3 findings | **Sonnet**      |
| **L** | 500+ files, monorepo, multi-framework, or critical infra | Query-first by symbol / route / endpoint | Evidence map → decision → validation | **Opus** for architecture; **Sonnet** for local edits |

If signals are ambiguous, classify **down** (M instead of L; S instead of
M). The cost of misclassifying upward is real money; the cost of
misclassifying downward is one failed read that triggers a clean
escalation.

## Model selection (Haiku / Sonnet / Opus)

Pick the **smallest model that can finish the task reliably**.

| Model       | Best for                                                                | Avoid for                                |
| ----------- | ----------------------------------------------------------------------- | ---------------------------------------- |
| **Haiku**   | Single-file edits, lookups, summaries, well-defined transformations     | Multi-step debugging, architecture       |
| **Sonnet**  | Multi-file edits, debugging with limited evidence, code review, planning | Whole-system architecture in unfamiliar repos |
| **Opus**    | Architecture, ambiguous specs, multi-system reasoning, hard refactors, risky-diff review | Tasks Sonnet can finish — wasted cost   |

**Escalation rule:** start with the smallest plausible tier. Escalate only
when the lower tier returns "I cannot finish this with the evidence
available". Never preemptively jump to Opus.

## Routing protocol (operational, inside Claude Code)

The coordinator (whichever model is loaded for the session) **cannot
switch its own model** — Claude Code does not allow that. To honor
size→model without asking the user to type `/model`, route work via
subagents:

```
# Size-S task while running on Opus
Agent({
  subagent_type: "general-purpose",
  model: "haiku",
  prompt: "<self-contained task with the file path and the exact change>"
})

# Size-M task while running on Opus
Agent({
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: "<self-contained task>"
})

# Size-L architectural decision: keep inline on Opus
# OR delegate to a domain-specific subagent
```

**Hard rules:**

- If the coordinator is already on the right model for the task, do the
  work inline — no subagent.
- If the coordinator is **heavier** than the task needs, spawn a subagent
  on the smaller model.
- **Never spawn a subagent on a heavier model than the coordinator just
  to "be safe".** Escalate with evidence only.
- **Pass enough context** in the subagent prompt that it doesn't re-read
  what the coordinator already read.

## Static defaults (per-project)

For projects that are stably size **S**, set a project-level default in
`.claude/settings.json` so every session starts on the right model. See
`docs/AUTO_ROUTING.md` for ready-to-paste snippets.

```json
// Size-S project default
{ "model": "claude-haiku-4-5-20251001" }

// Size-M project default
{ "model": "claude-sonnet-4-6" }

// Size-L project default
{ "model": "claude-opus-4-7" }
```

## Heuristics (the only ones that matter)

- **First reads:** README + entry + relevant config. Stop. Decide.
- **Search by symbol / term, scoped.** Never directory walks.
- **Change minimum, validate cheaply** — type-check, one test, one manual
  step.
- **Stop early** when the gain per extra token drops below the cost.
- **Reuse memory.** If a previous skill's output answers part of the
  current question, cite it instead of re-deriving.

## Conversation protocol

### Step 1 — Quick scan, classify

≤ 3 reads. Classify size S / M / L. State evidence (file count, stack,
monorepo y/n).

### Step 2 — Pick model tier

Apply the size→model rule. State the choice and one-line justification.

### Step 3 — Decide routing

If coordinator = recommended tier, work inline. Otherwise, spawn a
subagent. Pass full context.

### Step 4 — Bound the work

State explicitly: "I will read X, decide Y, validate via Z. I will stop
reading when …, and escalate model only if …".

### Step 5 — Stop on completion

The moment the answer is in hand, stop. No trailing summary. No "anything
else?" — that's a token tax on every turn.

## Worked example — small project, single-file edit on Opus

**User input:**

> "I need to fix a typo in `src/components/Button.tsx` on line 42.
> Change 'Sumbit' to 'Submit'. Project has ~20 source files, one
> Vite + React app, no monorepo."

**Assistant response:**

```
Mode
- Project size: S
- Evidence (files/signals): ~20 source files, single Vite+React app,
  no workspaces, no monorepo signals.

Model
- Recommended: haiku
- Why: single-file edit, single line, deterministic transformation.
  Smallest viable model finishes this reliably. Running this on Opus
  is wasted tokens.

Plan (bounded)
1) Files I will read: src/components/Button.tsx only (≤ 1 read).
2) Decision I expect to make: line 42 column-precise replace
   `Sumbit` → `Submit`.
3) How I will validate: type-check (`tsc --noEmit`) or one render test
   if a snapshot exists.

Routing
- Coordinator is on Opus → spawn subagent on Haiku with the exact file
  path + edit instruction. No re-reading.

Stop rules
- I will stop reading when: line 42 is read once.
- I will escalate model only if: the subagent reports the file does
  not contain `Sumbit` on line 42 (then a wider Grep is needed and
  Sonnet might be justified).
```

## Worked example — large monorepo, ambiguous spec

**User input:**

> "We need to migrate the auth flow from session-based to JWT in our
> monorepo. ~3000 files across 4 apps. Where do I even start?"

**Assistant response:**

```
Mode
- Project size: L
- Evidence: ~3000 files across 4 apps. Monorepo signal confirmed.

Model
- Recommended: opus (for the architecture step), then sonnet for the
  per-app implementation.
- Why: cross-system reasoning, breaking-change identification, and
  rollout sequencing are exactly Opus's strength. Implementation per
  app is Sonnet territory.

Plan (bounded)
1) Read root: package.json (workspaces), turbo.json or nx.json, README.
2) Grep `session|cookie|setCookie|getServerSession` — identify the
   contact surfaces. Read at most 2 files per app from the result
   cluster (≤ 8 reads total).
3) Output: a sequenced rollout plan with feature-flagged cutover, not
   a big-bang.

Routing
- Coordinator on Opus inline for steps 1–3 (planning).
- Per-app implementation: spawn Sonnet subagents with the per-app
  context already gathered, so they don't re-read.

Stop rules
- I will stop reading when: the 4 apps' session entry points are
  identified (≤ 8 reads).
- I will escalate to deeper reads only if: the rollout requires
  understanding a specific app's session middleware in detail —
  triggered as a Sonnet subagent task, not by the coordinator.
```

## Output format (always)

**Mode**
- Project size: S | M | L
- Evidence (files / signals):

**Model**
- Recommended: haiku | sonnet | opus
- Why:

**Plan (bounded)**
1) Files I will read:
2) Decision I expect to make:
3) How I will validate:

**Stop rules**
- I will stop reading when:
- I will escalate model only if:

## Common pitfalls

- **Starting at Opus to "be safe".** Wasted cost; smaller models do most
  work fine.
- **Reading 10 files before deciding.** Decide after 3, then read more
  only if the next decision requires it.
- **Spawning subagents on a heavier model.** Backwards.
- **Forgetting to pass context to subagents.** They re-read the same
  files; double cost.
- **Skipping the static project default.** Size-S projects pay the
  Sonnet tax forever if the default is wrong.
- **Long output for short answers.** "Anything else?" trailers add tokens
  per turn at zero value.
