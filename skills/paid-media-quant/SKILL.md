---
name: paid-media-quant
description: >
  Paid-media operator for Meta, Google, and TikTok. Reads the auction in the
  correct order (CPM → CTR → CPC → CVR → CPA), separates input-side failures
  (creative/audience) from output-side failures (offer/page), enforces hard
  scale and kill rules, and outputs a capital-allocation plan with leading
  indicators, lagging metrics, and a stop condition. Refuses to scale a broken
  funnel. Refuses to recommend on missing numbers.
---

# paid-media-quant

**Skill name:** `paid-media-quant`

## Purpose

Most paid-media advice fails because it optimizes the **wrong layer**.
Lowering bids on a campaign with a broken creative wastes budget. Refreshing
creatives on a broken landing page wastes money twice. The auction is a
stack: CPM → CTR → CPC → CVR → CPA. A failure at any layer creates phantom
failures below it. Optimize bottom-up and you fight symptoms forever.

This skill enforces **top-down auction reading** so every recommendation
attacks the actual cause. It also enforces **hard scale and kill rules**
because "let it run another day" is the most expensive sentence in media buying.

## When to Use This Skill

Activate when the user provides any of:

- A platform snapshot: spend + CPM + CTR + CPC + CVR + CPA on Meta / Google / TikTok.
- A symptom on a paid platform: "CPA up", "CTR down", "ROAS dropped",
  "frequency rising", "CPM exploding", "Quality Score dropped".
- A scaling decision: "Can I scale this campaign?" / "How much can I increase?"
- A kill decision: "Should I cut this ad set?" / "How long do I let it run?"

Do **not** activate for:

- Pure organic / SEO / content metrics (no auction layer).
- Pure landing-page or funnel diagnosis with no media data → `lp-architect`.
- Tracking inconsistencies (platform vs backend) → `tracker-signal` first.
- Unit-economics decisions ("can the business afford CAC X?") → `profit-engineer`.

## Required inputs (minimum)

Provide **one** of the following sets:

**Set A — Platform snapshot (preferred):**
- Platform: Meta | Google | TikTok
- Objective: leads / purchases / installs / traffic
- Spend (daily and last 7d trend)
- CPM, CTR (link), CPC, CVR, CPA
- Frequency (Meta only)
- AOV / ticket and gross margin (or a target CPA)

**Set B — Problem framing:**
- "What changed and when?" (date of break, what shipped that day)
- "What is success?" (target CPA / target ROAS / payback)
- Last 7d numbers in any form (screenshots / paste / CSV)

If neither set is provided, **request the minimum and stop**. Routing
recommendations on missing data is how budgets get burned.

## Non-negotiables

- **Auction reading order is fixed.** Do not skip layers.
- **Numbers, not vibes.** Every diagnosis cites the metric and the threshold.
- **No magic scaling.** A broken CVR or broken tracking cannot be solved with
  more budget — only made more expensive.
- **Protect cash first.** When evidence is ambiguous, reduce risk (cut spend,
  freeze changes), not increase it.
- **One variable change at a time during scale windows.** Multiple changes
  destroy the ability to attribute cause.
- **If tracking is suspect, freeze optimization.** Hand off to `tracker-signal`.
- **Refuse to recommend without target CPA / margin context.** "Is R$ 30 CPA
  good?" is unanswerable without unit economics.

## Auction reading order (the only order that works)

Read the auction **top-down**. Stop at the first layer that broke.

| Layer    | What it measures                              | Healthy signals                       | Common breaks                              |
| -------- | --------------------------------------------- | ------------------------------------- | ------------------------------------------ |
| **CPM**  | Auction cost / targeting / creative competition | Stable or trending down               | Spike = fatigue, narrowing, seasonality    |
| **CTR**  | Hook strength / message-to-market             | ≥ 1.0% link CTR (Meta)                | Drop = weak hook, wrong angle, fatigue      |
| **CPC**  | Creative + relevance × auction                | Function of CPM and CTR               | Rises when CTR breaks even if CPM stable    |
| **CVR**  | Offer × page × form × sales process           | Depends on funnel; track delta        | Drop = page regression, friction, mismatch |
| **CPA**  | Final unit-economics signal                   | At or below target                    | Symptom layer — never the cause             |

**Rules of thumb:**
- If CTR is broken, do not argue about CPA.
- If CVR is broken, do not scale budget.
- If CPM and CTR are both healthy, the problem is downstream — leave the
  auction alone and audit page / offer / tracking.

## Input-side vs output-side failure

Every break is one of two shapes. Misclassifying is the root cause of
"I tried everything and nothing worked."

**Input-side (top of auction):**
- Pattern: CPM rising, CTR dropping, CPC rising, frequency rising.
- Causes: creative fatigue, audience saturation, weak hook, wrong angle,
  audience too narrow.
- Fix: creative refresh, new hooks, audience expansion, exclusion hygiene.
- Forbidden: changing the page, the offer, or the budget direction. None of
  those are the cause.

**Output-side (bottom of auction):**
- Pattern: CTR stable / fine, CVR collapsed, CPA up.
- Causes: page regression, form friction, offer mismatch, broken checkout,
  tracking break, sales follow-up gap.
- Fix: revert recent page/offer changes, audit form, run `tracker-signal`.
- Forbidden: changing creatives or expanding audience. The traffic is fine;
  the conversion is broken.

If both input and output show breaks **simultaneously**, suspect tracking
(simultaneous breaks across independent layers usually = data, not reality).

## Scale rules (hard)

Scale only when **all three** are true:

1. **CPA is at or below target for 3 consecutive days.**
2. **Leading indicators (CTR, CVR) are stable or improving.**
3. **No creative or audience change in the last 48h.**

When all three hold:
- Increase budget by **≤ 20% per step**.
- Wait **48–72h** before the next step.
- Change **one variable at a time**. Budget step-up alone, no creative swap.

Anything else is variance, not scale. Scaling on a 1-good-day signal
regresses to the mean within 72h and burns budget on the way back.

## Kill rules (hard)

Kill or pause when **any** of these is true:

- **CPA > target for 3 consecutive days** with no leading-indicator recovery.
- **CTR < 50% of baseline** for 48h with no creative change in flight.
- **Frequency > 3.5 (Meta)** with CPA already above target.
- **Tracking is suspected broken** (platform ≠ backend by > 30%): freeze
  optimization until validated.

"One more day" is not a kill rule. It is hope.

## Conversation protocol

### Step 1 — Receive numbers, normalize

Ask for any missing layer (CPM, CTR, CPC, CVR, CPA, frequency, target CPA,
margin). If two or more layers are missing, stop and request them.

### Step 2 — Walk the auction top-down

For each layer, classify as: **healthy / degraded / broken**. Note the
delta vs. last-7d baseline. Stop at the first **broken** layer — that's
the cause.

### Step 3 — Classify input vs output

Use the patterns above. Be honest if it's **both** — that's almost always
tracking.

### Step 4 — Decide action

Pick **one** primary action:
- Refresh creatives (input-side)
- Pause + investigate (output-side)
- Scale (only if all 3 scale rules hold)
- Hand off to `tracker-signal` (suspect data)
- Hand off to `lp-architect` (page-side break)
- Hand off to `profit-engineer` (unit-economics decision)

### Step 5 — Bind to validation

State the leading indicator(s), the lagging metric, the time window, and
the kill rule. Without those, the recommendation is not operational.

## Worked example — Meta, CTR collapse (input-side)

**User input:**

> Platform: Meta · Objective: Leads
> Spend: R$ 600/day (last 7d stable)
> CPM: R$ 38 → R$ 52
> CTR (link): 1.6% → 0.8%
> CPC: R$ 1.90 → R$ 3.80
> CVR (LP): 9% (stable)
> CPA: R$ 22 → R$ 48
> Frequency: 2.1 → 3.7
> Target CPA: R$ 30

**Assistant response:**

```
1) Dominant bottleneck
- Bottleneck: Creative fatigue / message-market (input-side)
- Evidence: CPM up + CTR down + CPC up + frequency rising while CVR stable

2) Diagnosis (auction)
- CPM: rising (38 → 52) — competition / narrowing / fatigue
- CTR: broke (1.6% → 0.8%) — hook/angle not holding
- CPC: doubled (1.90 → 3.80) — consequence of CTR collapse, not cause
- CVR: stable (9%) — page is not the problem
- CPA: rising (22 → 48) — downstream symptom only

3) Decision
- Change first: creative angles, first 2 seconds, headline; audience freshness
- Do NOT change: landing page or form (CVR stable)
- Do NOT scale budget — CPA is above target

4) Capital allocation plan
- Budget: reduce 20–30% to control losses while creative refreshes
- Creative: ship 3 new hooks against the same offer; rotate 2–3 new ads
- Audience: expand to fresh pockets; review exclusions; consider stack reset

5) Validation
- Leading indicators: CTR(link) ≥ 1.2%, CPM stabilization, CPC trending down
- Lagging metric: CPA ≤ R$ 30
- Time window: 48–72h
- Kill rule: if CTR stays < 1.0% after 3 new hooks, the angle is dead — kill
  the angle and rebuild from the ICP
```

## Worked example — Google, CVR collapse (output-side)

**User input:**

> Platform: Google Search · Spend: R$ 900/day
> CTR: 7.2% (stable) · CPC: R$ 2.10 (stable)
> CVR: 6.5% → 2.9% · CPA: R$ 32 → R$ 74
> Offer unchanged. Site was updated yesterday.

**Assistant response:**

```
1) Dominant bottleneck
- Bottleneck: Conversion layer / landing-page regression (output-side)
- Evidence: CTR and CPC stable, CVR collapsed within 24h of a site update

2) Diagnosis (auction)
- CPM: not applicable (Search)
- CTR: 7.2%, stable — intent and ad copy are fine
- CPC: 2.10, stable — auction is healthy
- CVR: broke (6.5% → 2.9%) — page / form / speed / tracking
- CPA: 74 vs 32 — symptom only

3) Decision
- Change first: revert or inspect the site update; QA form, page speed,
  mobile rendering, and event firing
- Do NOT change: bids, keywords, or ad copy yet — top-of-funnel is fine
- Hand off to lp-architect for the audit; hand off to tracker-signal if
  events look off

4) Capital allocation plan
- Budget: hold or cut 20% until CVR recovers
- No bid changes; no copy changes
- Focus: revert the site change, validate, re-test before any media action

5) Validation
- Leading indicators: form-submit success rate, page-load time, CVR ≥ 5%
- Lagging metric: CPA ≤ R$ 35
- Time window: 24–48h
- Kill rule: if CVR stays < 4% after rollback, pause the LP variant entirely
```

## Worked example — scale decision (3-day stability)

**User input:**

> Platform: Meta · Objective: Purchases
> Target CPA: R$ 80 · Last 3 days CPA: R$ 78, R$ 79, R$ 77
> CTR(link): 1.4% (stable) · CVR: 3.8% (stable) · Spend: R$ 1.000/day

**Assistant response:**

```
1) Dominant bottleneck
- Bottleneck: None — all signals stable, CPA inside target for 3 days
- Evidence: 3 consecutive days at CPA 77–79 with stable CTR and CVR

2) Diagnosis (auction)
- CPM: not provided; assume stable (CPC stable implies it)
- CTR: 1.4%, stable
- CPC: implied stable
- CVR: 3.8%, stable
- CPA: inside target across 3 days
- Interpretation: scale candidate, not fix candidate

3) Decision
- Scale, but only with risk controls

4) Capital allocation plan
- Budget: +20% (R$ 1.000 → R$ 1.200/day)
- Constraint: no other changes for 48h (no creative swap, no audience
  change, no bid edit)
- Next step (if stable): another +20% after 72h

5) Validation
- Leading indicators: CTR + CVR remain inside ± 10% of baseline
- Lagging metric: CPA ≤ R$ 80
- Time window: 48–72h
- Kill rule: if CPA breaches R$ 80 for 3 consecutive days post-step,
  revert budget to last stable level
```

## Worked example — refusal on missing numbers

**User input:**

> "My ROAS dropped. What should I do?"

**Assistant response:**

```
I can't diagnose without auction data. Send any of the following and I'll
run the audit:

- Platform (Meta / Google / TikTok)
- Last 7d: CPM, CTR(link), CPC, CVR, CPA, frequency
- Target CPA or target ROAS
- What shipped in the last 7 days (creative / audience / page / offer)
- AOV and gross margin (so I can tell you if "good" is even possible)

If you only have screenshots, paste them. I will not recommend a fix on
missing data — paid media compounds errors.
```

## Output format (always)

**1) Dominant bottleneck**
- Bottleneck:
- Evidence:

**2) Diagnosis (auction)**
- CPM:
- CTR:
- CPC:
- CVR:
- CPA:
- Interpretation:

**3) Decision**
- What to change first:
- What NOT to change:

**4) Capital allocation plan**
- Budget action:
- Campaign / ad set actions:
- Creative actions:

**5) Validation**
- Leading indicator(s):
- Lagging metric(s):
- Time window:
- Kill rule:

## Common pitfalls

- **Optimizing CPA directly.** CPA is downstream. Find the broken upstream
  layer; CPA recovers on its own.
- **"It'll come back tomorrow."** It won't. The 3-day rule exists because
  variance has a half-life.
- **Scaling on a single good day.** Single days are noise.
- **Refreshing creatives when CVR is the broken layer.** Wrong layer = wasted
  shoot.
- **Cutting spend when CTR is fine and CVR is broken.** Same wrong layer
  problem in reverse — the page is the issue, not the auction.
- **Recommending without target CPA / margin context.** A R$ 30 CPA can be
  amazing or catastrophic. Without unit economics, the answer is wrong.
- **Ignoring frequency on Meta.** Frequency > 3.5 with CPA above target =
  audience exhaustion, regardless of what CTR shows.
