# Auto-routing — model selection by project complexity

This is the operational companion to `skills/token-discipline/SKILL.md`. It tells the
coordinator (and the Claude Code harness) **how** to honor the size→model rule without
asking the user to type `/model` mid-session.

## TL;DR

- **Per-session, dynamic:** route work via **subagents** with explicit `model:` (option 1).
- **Per-project, static:** set a default model in `.claude/settings.json` (option 2).
- **Outside Claude Code:** run the standalone router `scripts/auto-route.mjs` (option 3).

Combine 1 + 2 by default. Use 3 when you want a programmatic router (CI, batch jobs,
custom CLIs).

---

## Option 1 — Subagent routing (dynamic, per task)

The coordinator can't switch its own model, but it can delegate to a subagent on a
specific model. Use it whenever the coordinator is heavier than the task needs.

```text
# Size S — single-file edit, lookup, short summary
Agent({
  subagent_type: "general-purpose",
  model: "haiku",
  prompt: "<self-contained task with all needed context>"
})

# Size M — typical coding work, multi-file edit, code review
Agent({
  subagent_type: "general-purpose",
  model: "sonnet",
  prompt: "<self-contained task>"
})

# Size L — architecture, ambiguous specs: do it inline on Opus
# or delegate to a domain-specific subagent
```

**Hard rules**
- Never spawn a subagent on a heavier model than the coordinator just to "be safe".
- Pass enough context that the subagent doesn't re-read files the coordinator already saw.
- If the coordinator is already on the right model, do the work inline — no subagent.

---

## Option 2 — Static project default (`.claude/settings.json`)

Set a default model per project so every session starts on the right tier. The
coordinator can still escalate via subagents when needed.

### Size S project (small app, few files)

```json
{
  "model": "claude-haiku-4-5-20251001"
}
```

### Size M project (typical SaaS, single framework)

```json
{
  "model": "claude-sonnet-4-6"
}
```

### Size L project (monorepo, multi-framework, critical infra)

```json
{
  "model": "claude-opus-4-7"
}
```

### Mixed / pragmatic default

When in doubt, pick **Sonnet** as the coordinator and let the routing protocol
delegate down to Haiku for size-S tasks and up to Opus for size-L decisions.

```json
{
  "model": "claude-sonnet-4-6"
}
```

> Place the file at `<project-root>/.claude/settings.json`. It is loaded automatically
> by Claude Code when the session starts in that directory.

---

## Option 3 — Standalone router (`scripts/auto-route.mjs`)

For non-interactive use (CI jobs, batch processing, custom CLIs), the hub ships a
runtime router that classifies a task and calls the right model via the Anthropic SDK.

See `scripts/auto-route.mjs` and the README section "Auto-route runtime" for usage.

---

## How `skill-finder` and `token-discipline` wire together

1. `skill-finder` runs the short scan and labels the project **S / M / L**.
2. `token-discipline` reads that label and:
   - decides the coordinator's read budget,
   - decides the default model tier,
   - either routes via subagent (option 1) or honors the static default (option 2).
3. Escalation is **evidence-based**: Haiku → Sonnet → Opus, only when the lower tier
   demonstrably failed.
