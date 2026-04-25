---
name: dev-ai-navigator
description: >
  Dev + AI skill: prevents getting lost in a repo. Uses minimal evidence-based reading,
  builds a file map, an execution plan, and objective validation.
---

# dev-ai-navigator

**Skill name:** `dev-ai-navigator`

## Human alias

Dev AI Navigator

## Purpose

When the user requests a change/bugfix/refactor, this skill avoids the “blind loop”:

- reads the minimum to understand local architecture
- defines **where to change** (target files)
- creates a **short plan** (steps) and **validation criteria**
- stays precise: no guessing and no repo-wide scanning

## Required inputs (minimum)

- Concrete request: bugfix / feature / refactor / explanation
- At least 1 entry point or file the user already cares about
- A success criterion (“how I’ll know we’re done”)

## Non-negotiables

- Never propose changes without pointing to **evidence** (file/symbol/snippet).
- Don’t open 30 files. Prefer 10–15 max.
- If ambiguous, state hypotheses and how to confirm with 1 read.
- Always end with **How to validate** (commands/steps).
- No repo-wide scans, no speculative refactors.

## Rules (anti-lost / anti-guessing)

- Never propose changes without pointing to **evidence** (file/symbol/snippet).
- Don’t open 30 files. Prefer 10–15 max.
- If ambiguous, state hypotheses and how to confirm with 1 read.
- Always end with **How to validate** (commands/steps).

## Suggested minimal scan (order)

1) README + app entry point (e.g. `src/main.*`, `app/layout.*`)  
2) configs (e.g. `package.json`, `tsconfig.json`, `next.config.*`, `vite.config.*`)  
3) 1–2 most likely modules (search by symbol/route/endpoint)

## Output format

**Quick map**
- What the project is:
- Where X lives:
- Target files:

**Plan (short)**
1.
2.
3.

**Risks**
- 1–3 concrete risks

**How to validate**
- minimal commands and/or manual steps

