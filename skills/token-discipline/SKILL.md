---
name: token-discipline
description: >
  Token discipline (always-on): minimizes reading and output, avoids repo-wide scans
  and repetition, demands evidence before expanding context. Auto-activates by project
  size and recommends the smallest viable model (haiku / sonnet / opus).
---

# token-discipline

**Skill name:** `token-discipline`

## Human alias

Token Discipline

## Purpose

Keep cost and latency under control without losing precision. This skill is **always-on
by default**: its strictness scales with project complexity, and it picks the **smallest
viable model** (haiku → sonnet → opus) for the task at hand.

## Required inputs (minimum)

Provide any 2 (more = better):

- Repo size signal (LOC, # files, monorepo y/n)
- Stack signal (framework, language)
- Task type: read-only / single-file edit / cross-file refactor / architecture
- Time budget: fast / normal / careful
- Cost preference: cheap / balanced / quality-first

If signals are missing, default to **size M** and **Sonnet**.

## Non-negotiables

- **Always-on by default.** Token economy is the baseline, not opt-in.
- **Read the minimum** to act safely; sample, don’t scan.
- **Don’t repeat known context.** Use memory, don’t re-read.
- **Evidence before expansion.** Open more files only when the next decision actually depends on them.
- **No loops, no polling.** One read, one decision.
- **Stop adding tokens** the moment the answer is complete.

## Auto-activation by project complexity

Run the short scan, classify, then apply the matching mode.

**S — Small** (≤ ~50 source files, single app, few deps)
- Reads: README + entry file + 1 config (max).
- Output: terse, no preambles, no extra structure.
- Default model: **Haiku**.

**M — Medium** (~50–500 files, single framework, possibly a backend)
- Reads: README + entry + 2–3 configs + 1–2 module files (by symbol).
- Output: structured but compact (top 3 findings, no fluff).
- Default model: **Sonnet**.

**L — Large** (500+ files, monorepo, multi-framework, or critical infra)
- Reads: query-first (grep by symbol/route/endpoint). Never directory walks.
- Output: explicit evidence map → decision → validation. Still bounded.
- Default model: **Opus** for architecture / cross-cutting; **Sonnet** for local edits.

## Model selection (haiku / sonnet / opus)

Pick the smallest model that can finish the task reliably.

- **Haiku** — short answers, single-file edits, lookups, summaries, well-defined transformations. Default for size **S**.
- **Sonnet** — most coding work: multi-file edits, debugging with limited evidence, code review, planning a small feature. Default for size **M** and for local tasks in **L**.
- **Opus** — architecture, ambiguous specs, multi-system reasoning, hard refactors, reviews of risky diffs. Reserve for size **L** and for critical decisions in **M**.

Escalate **only with evidence** (Haiku missed → Sonnet; Sonnet missed → Opus). Never start at Opus “to be safe”.

## Routing protocol (operational, inside Claude Code)

The coordinator (whichever model is loaded in the session) **does not switch its own model** — the harness doesn't allow that. To honor the size→model rule without asking the user to type `/model`, route work via subagents:

```
# Size S task while running on Opus
Agent({ subagent_type: "general-purpose", model: "haiku",  prompt: "<task>" })

# Size M task while running on Opus
Agent({ subagent_type: "general-purpose", model: "sonnet", prompt: "<task>" })

# Size L architectural decision: keep inline on Opus (or delegate to a specialist agent)
```

Rules:

- If the coordinator is already on the right model for the task, do the work inline — no subagent.
- If the coordinator is **heavier** than the task needs (e.g. Opus on a size-S edit), spawn a subagent on the smaller model and pass it a self-contained prompt.
- Never spawn a subagent on a **heavier** model than the coordinator just to "be safe" — escalate only with evidence.
- Pass enough context in the subagent prompt that it doesn't need to re-read what the coordinator already read.

This is the only way to deliver "auto-select model by complexity" without the user typing `/model`.

## Static defaults (per-project)

For projects that are stably size **S**, set a project-level default in `.claude/settings.json` so every session starts on the right model. See `docs/AUTO_ROUTING.md` for ready-to-paste snippets.

## Heuristics

- First reads: README + entry file + relevant config.
- Search by symbol/term, scoped — not by directory walk.
- Change minimum, validate cheaply (type-check / one test / one manual step).
- Stop early when the gain per extra token drops.

## Output format (always)

**Mode**
- Project size: S | M | L
- Evidence (files/signals):

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
