---
name: project-memory
description: >
  Project-memory operator. Captures invariants, decisions, and high-utility
  context to reduce tokens and prevent repeated mistakes across sessions.
  Each item is short, testable, and tied to a "how to verify" check.
  Refuses to store PII, secrets, or low-utility "diary" entries.
---

# project-memory

**Skill name:** `project-memory`

## Purpose

Every recurring mistake in a codebase or marketing operation comes from
the same root cause: **the team / agent forgot what was already decided**.
The LP gets resized to the wrong dimensions for the third time. The same
edge case in copy gets shipped and reverted. A new dev refactors a name
that the team agreed not to change.

This skill captures **operational memory** — the small set of invariants,
decisions, and maps that prevent repeated mistakes. It is not a diary,
not a knowledge base, not documentation. It is the **shortest possible
list of facts that, if followed, would have prevented the last 5 avoidable
errors**.

## When to Use This Skill

Activate when the user:

- Says **"we keep making the same mistake"**, **"every time we ship X,
  someone gets Y wrong"**.
- Asks **"where do I write this so the team / AI doesn't forget?"**
- Describes a **rule that broke twice** and they want it captured.
- Onboards a new collaborator (human or agent) and needs to crystallize
  invariants.
- Reaches the end of a project phase and wants to lock in what must not
  change.

Do **not** activate for:

- One-off facts that aren't likely to be violated again.
- Information that belongs in proper documentation (architecture docs,
  ADRs, runbooks). Memory is for **invariants**, not narratives.
- Personal notes / diary / "what we did last week" — that's a changelog,
  not memory.

## Required inputs (minimum)

- **Project name + 1-line goal** (so memory has scope).
- **1–3 invariant candidates** — formats, naming rules, hard constraints.
- **1–3 decisions to record** — and *why* (a decision without a why
  becomes a cargo-cult rule).
- **Optional: a map** — where key things live, how to render or validate
  them.

## Non-negotiables

- **Only capture what prevents repeated mistakes.** No diary. No prose
  knowledge dump.
- **Never store PII or secrets.** No emails, phone numbers, API keys, or
  tokens.
- **Each item is short and testable** — has a "How to verify" line.
  Without that, it's a wish, not an invariant.
- **Update or remove stale items** rather than letting them rot. Stale
  memory is worse than no memory — it produces confidently wrong actions.
- **Lead with the rule, follow with the why.** Both matter; rule alone
  becomes a cargo cult, why alone becomes a memoir.

## What to capture (high utility)

### Invariants
- **Formats** — IG 1080×1440, LI 1080×1080, LI PDF as Document, mobile
  hero must render < 360px width.
- **Content rules** — "do not change slide structure to fix copy", "never
  replace the H1 without checking the ad headline", "all CTAs link to
  active pages, no 404 placeholders".
- **Hard constraints** — naming, casing, allowed file types, deprecated
  modules.

### Decisions
- **Architectural decisions** — "auth is Auth.js, do not roll our own",
  "we use Postgres, no other DB", "all images served via Next/Image".
- **Names that must not change** — public API surface, slugs, redirect
  paths, event names in the analytics layer.
- **Trade-offs already adjudicated** — "we picked Tailwind over CSS-in-JS
  for build cost; revisit only if X".

### Maps
- **Where things live** — `app/(marketing)` for the LP, `lib/api` for
  external calls, `scripts/` for one-shot ops.
- **How to render / validate** — `npm run build && npm run lint`, manual
  smoke flow at `/healthcheck`.

## Storage location (where to write)

| Scope         | Path                                | Use for                                     |
| ------------- | ----------------------------------- | ------------------------------------------- |
| **Project**   | `<repo-root>/MEMORY.md`             | Invariants and decisions tied to this repo  |
| **User**      | `~/.claude/memory/<topic>.md`       | Personal preferences across all repos        |
| **Topic-scoped** | `<repo>/docs/<topic>-invariants.md` | Specialty rules (design, ops, copy)        |

`MEMORY.md` at repo root is preferred for project-level memory because
it's version-controlled and visible in PR review.

## Conversation protocol

### Step 1 — Confirm scope

Project? User? Topic? If unclear, ask. Memory at the wrong scope is
discoverable to the wrong audience.

### Step 2 — Filter inputs

Walk the candidates. For each, ask:
- Is this preventing a **repeated** mistake?
- Is it **testable** in one line?
- Does it carry **PII or secrets**? (If yes, refuse.)
- Is it **stable** for at least the next 30 days? (Otherwise it's not
  an invariant; it's a current state.)

### Step 3 — Write the memory in the proposed format

Each item:
- **Rule / fact**, lead with it.
- **Why** — one sentence (the prior incident, the trade-off).
- **How to verify** — the one-line test.

### Step 4 — Surface stale items if any are visible

If existing memory contradicts the new entry, flag it. Update or remove,
don't pile up.

### Step 5 — Tell the user where it lives

Path, scope, and how it's loaded by future sessions.

## Worked example — capturing format invariants

**User input:**

> "We keep getting the same problem: every time someone resizes the
> social-media slides we have to redo the LinkedIn version because LI
> requires square 1080×1080 while IG uses 1080×1440. Also, we don't
> change slide structure to fix copy — copy fix only. Where do I write
> this so the team and the AI don't keep making the same mistakes?"

**Assistant response:**

```
Proposed memory (bullet points)

- Invariants:
  - Social asset formats:
    - Instagram = 1080×1440 portrait.
    - LinkedIn = 1080×1080 square.
    - LinkedIn PDF carousels = uploaded as Document, not Image.
    - Why: each platform crops differently; wrong size = wasted post.
    - How to verify: open the export → confirm dimensions match the
      target platform.
  - Copy edits never change slide structure.
    - Why: structural changes invalidate previously-tested visual
      hierarchy and consume design time without conversion gain.
    - How to verify: diff slide structure between versions; if
      structure changed for a copy fix, the rule was violated.

- Decisions:
  - One template per platform, sized at the canonical dimensions
    above. Resizing is forbidden; create a platform-specific export
    instead.
    - Why: resizing introduces aspect-ratio errors and wastes design
      cycles. Platform-specific exports are deterministic.
    - How to verify: the export script outputs both 1080×1440 and
      1080×1080 from the same source — check both files exist.

- Maps:
  - Source files: /design/social/ig/ (1080×1440) and /design/social/li/
    (1080×1080).
  - Export script: `npm run export:social` (writes platform-specific
    PNGs / PDFs).

How to validate
- Open the LI export → confirm 1080×1080.
- Open the IG export → confirm 1080×1440.
- Diff slide structure between today and last week's PR — if structure
  changed for a copy fix, the rule was violated.

Where to store this
- Repo root MEMORY.md (project-level, version-controlled).
- Each invariant gets a "How to verify" line, otherwise it's not an
  invariant — it's a wish.
```

## Worked example — refusing to store the wrong thing

**User input:**

> "Save this in memory: the lead I spoke with yesterday, john@bigcorp.com,
> said they want a discount."

**Assistant response:**

```
Refusing to store. Three reasons:

1) PII — email + named individual + meeting context. Memory is shared
   with future Claude sessions and may end up in shared repos.
2) Volatile fact — "wants a discount" is the state of one negotiation,
   not an invariant. It expires.
3) Wrong tool — this belongs in the CRM, not in agent memory.

If there is a recurring pattern worth capturing (e.g. "enterprise leads
consistently negotiate the first quote"), I can capture that as an
invariant — without names, without emails, without specifics that tie
to one person.
```

## Worked example — replacing stale memory

**User input:**

> "Update memory: we switched our DB from MySQL to Postgres last week."

**Assistant response:**

```
Found the stale entry in MEMORY.md:

> Decisions: We use MySQL for all primary data. (added 2025-09)

Replacing with:

- Decisions:
  - Primary database: PostgreSQL (migrated 2026-04).
    - Why: switched from MySQL for JSONB support and better extension
      ecosystem. Migration completed; no MySQL instances remain.
    - How to verify: `grep -ri "mysql" --include="*.{ts,js,env*}"`
      should return zero results.

I also flagged this previously-loaded rule:
- "All ORM queries must be MySQL-compatible" — now obsolete. Removing.

If there are other places in the repo that hard-code MySQL assumptions,
say the word and I'll grep for them before more code is written
against the wrong assumption.
```

## Output format (always)

**Proposed memory (bullet points)**
- Invariants:
- Decisions:
- Maps:

**How to validate**
- 1–3 quick checks

**Where to store this**
- Path + scope

## Common pitfalls

- **Diary entries.** "We had a great brainstorm Friday" is not memory.
- **Storing PII / secrets.** Hard refuse.
- **Items without "How to verify".** Wishes, not invariants.
- **Letting stale items pile up.** Stale memory is worse than no memory.
- **Memory at the wrong scope.** Project memory in user-scope leaks to
  unrelated repos; user memory in project-scope clutters version control.
- **Using memory as documentation.** Architecture docs, ADRs, and
  runbooks belong in their own files. Memory is for invariants only.
