---
name: ux-audit-fast
description: >
  Fast UX/UI audit operator. Audits a single screen against the user's
  stated primary action — never against generic "best practices". Outputs
  up to 10 prioritized findings (P0/P1/P2) with problem, impact, fix, and
  validation. Stops adding findings when returns are diminishing. Refuses
  to audit without a stated goal and target screen.
---

# ux-audit-fast

**Skill name:** `ux-audit-fast`

## Purpose

Most UX audits are useless because they audit **the screen**, not **the
job the screen is supposed to do**. Generic "improve hierarchy" findings
move nothing because they are not tied to a primary action. A pricing
page audited for sign-ups produces different P0s than the same page
audited for demo-bookings.

This skill audits **against the user's stated goal**. Every finding has
an impact, a concrete fix, and a validation step. The audit stops at
diminishing returns — usually 5–10 findings — instead of producing the
ritual "47-item UX report" no one ships.

## When to Use This Skill

Activate when the user:

- Says **"audit my [screen]"**, **"review my UX"**, **"why is this page
  hard to use"**.
- Provides screenshots, a URL, or describes a specific screen and the
  primary user action.
- Reports a **specific UX symptom**: high bounce, low task completion,
  high error rate, drop-off at a known step.

Do **not** activate for:

- Conversion or page-level optimization with explicit conversion goal
  → `lp-architect` (CRO frame).
- Pure visual / brand polish with no functional goal stated.
- Component-level engineering (accessibility, framework choice) — adjacent
  skills.
- Whole-product UX strategy — out of scope for a fast audit.

## Required inputs (minimum)

- **Target screen / flow** — which screen, which step, which goal it is
  supposed to enable.
- **Primary user action / desired outcome** on that screen, stated as a
  verb. ("Start free trial", "Submit lead form", "Book a 30-min call".)
- **Device target** — mobile / desktop / both. Default mobile if traffic
  is consumer / DTC.
- Optional but high-value: **screenshots or URL**, current task-completion
  rate or drop-off data.

If the primary action is missing, **stop and ask**. An audit without a
goal is decoration.

## Non-negotiables

- **Audit against the user's stated goal**, not against generic UX rules.
- **Every finding has an impact note + a concrete fix + a validation step.**
  No vague advice ("improve clarity").
- **Prioritize by impact, not aesthetics.** P0 / P1 / P2.
- **If the goal or target screen is missing, ask before auditing.**
- **Stop at diminishing returns.** When the next finding would be P2 with
  clean P0/P1, stop. The team needs to ship, not absorb a treatise.
- **No more than 10 findings.** If everything is a finding, the user can't
  prioritize.

## Audit checklist (the order in which UX breaks)

### 1. Hierarchy

- Does the headline say **what / for whom / benefit**?
- Is there exactly one **primary CTA**, visually dominant?
- Does the eye travel: H1 → subhead → proof → CTA?

### 2. Readability

- Contrast (WCAG AA minimum: 4.5:1 for body text).
- Font size (≥ 16px body on mobile).
- Line length (45–75 chars), spacing, hierarchy of weights.

### 3. Friction

- Form fields: keep to the minimum that qualifies the action.
- Error and validation messages: surface before submit, in the right place.
- Distractions: nav, secondary CTAs, autoplay carousels.

### 4. States

- **Loading** — skeleton, spinner, or progress.
- **Empty** — what the user sees on first visit / no data.
- **Error** — what the user sees when something breaks (and what to do next).
- **Success** — confirmation that the action completed.

A page with no defined empty / error / loading states is a page that
fails silently in production.

### 5. Consistency

- Tokens (colors, spacing, type) used consistently.
- Repeated components (buttons, cards) styled the same.
- Spacing rhythm follows a grid (4 / 8 / 16).

### 6. Accessibility baseline

- Visible focus states on all interactive elements.
- Labels on form fields (not placeholder-only).
- Keyboard navigation works in primary action flow.
- Alt text on meaningful images.

### 7. Goal-fit

The finding-of-findings: **does the screen unambiguously support the
primary action above all other actions?** Most UX failures are
priority failures dressed as design failures.

## Conversation protocol

### Step 1 — Confirm goal + screen

State the primary action in one sentence. If missing, ask. Do not audit.

### Step 2 — Pull evidence

Read the URL or work from screenshots. Default to mobile rendering for
B2C / DTC. For B2B, default to desktop unless told otherwise.

### Step 3 — Walk the checklist top-down

Stop adding findings when the next would be P2 and P0/P1 are clean.

### Step 4 — Output the prioritized list

Each finding: **problem · impact · fix · validation**. Group by P0 / P1 / P2.

### Step 5 — Cross-cutting note

If the screen's symptom suggests a non-UX cause (e.g. tracking break,
sudden traffic-source change), state it once at the end. Don't pretend
UX fixes solve tracking or media problems.

## Worked example — pricing page, trial-start regression

**User input:**

> "Audit my SaaS pricing page. The goal is starting a free trial.
> Mobile is ~70% of traffic. Trial-start rate dropped from 6% to 3.5%
> last month. URL: example.com/pricing"

**Assistant response:**

```
Top findings (priority P0/P1/P2)

1) [P0] No single primary CTA on mobile. Three buttons of equal weight
   ("Free", "Pro", "Enterprise") — the eye doesn't know where to go.
   - Impact: dilutes the trial-start action; mobile users bounce.
   - Fix: make "Start free trial" the single high-contrast primary on
     the recommended plan (Pro). Demote Free / Enterprise to secondary
     text links.
   - Validation: trial-start rate on mobile within 7 days; expect ≥ 5%.

2) [P0] No proof above the fold. Logos and testimonials only appear
   after the pricing tiers — past where most mobile users scroll.
   - Impact: visitors evaluate price before context.
   - Fix: insert a 1-row logo strip + 1 short testimonial directly
     under the H1.
   - Validation: scroll-depth to first CTA, bounce rate.

3) [P1] CTA labels are generic. "Get started" appears 3 times; ambiguous.
   - Impact: users don't know which click commits to what.
   - Fix: "Start 14-day trial — no card" on the primary; "Talk to sales"
     for Enterprise.
   - Validation: CTR per CTA.

4) [P1] FAQ section ignores top objections. Trial length and "what
   happens after?" not visible.
   - Impact: friction at decision moment.
   - Fix: add 3 FAQs above the comparison grid: trial length, card
     requirement, cancellation.
   - Validation: trial-start rate, support tickets.

5) [P2] Comparison grid uses dense rows on mobile. Text wraps awkwardly
   under 360px.
   - Impact: comprehension drops on small screens.
   - Fix: collapse non-essential rows behind "Compare all features".
   - Validation: time-on-page, mobile bounce.

6) [P2] Inconsistent spacing between sections. Visual rhythm broken.
   - Impact: minor; perceived polish.
   - Fix: align section padding to a single 8px-grid token.
   - Validation: design QA only.

7) [P2] Body copy uses passive voice ("Plans are designed to...").
   - Impact: low — tone, not conversion.
   - Fix: rewrite to second person.
   - Validation: subjective.

(Stopping at 7 — beyond this returns are diminishing for the stated goal.)

Cross-cutting note
- A 6% → 3.5% drop in 1 month is not just a UX issue. Cross-check with
  tracker-signal (event firing on the trial-start CTA) and recent
  ad-source changes. If tracking is the cause, none of the UX fixes
  above will move the metric.
```

## Worked example — refusal on missing goal

**User input:**

> "Audit my dashboard."

**Assistant response:**

```
I need two things before I audit:

1) Primary action — what is the user supposed to DO on this screen?
   Examples: "view today's revenue", "trigger a sync", "configure alerts".

2) Device target — desktop, mobile, or both?

The audit changes completely depending on the answer. A dashboard
audited for "monitor a metric in 5 seconds" looks different from one
audited for "drill into a problem and configure a fix".

Send those two and (if available) the URL or one screenshot of the
current state.
```

## Output format (always)

**Top 10 findings (priority P0/P1/P2)**
- Problem:
- Impact:
- Fix:
- Validation:

## Common pitfalls

- **Auditing without the primary action.** Generic best-practice noise.
- **47-item reports.** Team ships zero. Stop at diminishing returns.
- **Findings without fixes.** "Hierarchy is poor" is not a finding.
- **Findings without validation.** No way to know if the fix worked.
- **All P0s.** Force-rank.
- **Missing the cross-cutting cause.** Sometimes the UX is fine and the
  tracking is broken or the traffic source changed. Surface it.
- **Auditing desktop when 70% of traffic is mobile.** Audit where the users
  are.
