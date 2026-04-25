---
name: paid-media-quant
description: >
  Media buying operator (Meta/Google/TikTok): reads the auction in the right order,
  diagnoses input vs output failures, enforces kill/scale rules, and outputs a
  capital allocation plan with validation metrics. Evidence over vibes.
---

# paid-media-quant

**Skill name:** `paid-media-quant`

## Human alias

Paid Media Quant (auction + capital allocation)

## Purpose

Turn paid media performance data into **operator-grade decisions**:

- diagnose the auction (input vs output)
- decide what to change first (and what *not* to touch)
- allocate capital (budget) with explicit constraints
- enforce kill/scale rules to protect cash

## Required inputs (minimum)

Provide at least one of:

1) **Platform snapshot** (preferred)
- Platform: Meta | Google | TikTok
- Objective: (traffic/leads/purchases/etc)
- Spend (daily + last 7d)
- CPM, CTR (link), CPC, CVR, CPA
- Frequency (if Meta)
- AOV/ticket and gross margin (or a target CPA)

2) **Problem framing**
- “What changed” (when did it break?)
- “What is success” (CPA target / ROI / payback)

## Non-negotiables

- **Order of operations:** do not optimize downstream before upstream is healthy.
- **Evidence policy:** if numbers are missing, request the minimum required.
- **No magic scaling:** never scale a broken funnel with more budget.
- **Protect cash first:** when unsure, tighten risk and reduce spend.

## Auction reading order (always)

1) **CPM** (auction cost / targeting / creative competition)
2) **CTR (link)** (message-to-market / thumbstop)
3) **CPC** (creative + relevance + auction dynamics)
4) **CVR** (offer/page/sales process)
5) **CPA** (final unit economics)

Rule of thumb:
- If CTR is broken, don’t argue about CPA.
- If CVR is broken, don’t scale budget.

## Diagnose: input vs output

**Input-side failure (top)**
- CPM spikes, CTR drops, CPC rises
- Usually: creative fatigue, wrong audience, weak hook, weak angle

**Output-side failure (bottom)**
- CTR OK but CVR drops, CPA rises
- Usually: offer mismatch, landing page friction, sales follow-up

## Scale & kill rules (hard)

**Scale**
- Only if CPA is stable (or improving) for **3 consecutive days**
- Increase budget **≤ 20% per step**
- One variable change at a time during scale windows

**Kill / cut**
- If CPA > target for **3 consecutive days** with no leading indicator recovery
  (CTR and CVR not improving): cut or pause.
- If tracking is suspected broken: treat data as invalid until proven otherwise.

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
- Campaign/ad set actions:
- Creative actions:

**5) Validation**
- Leading indicator(s):
- Lagging metric(s):
- Time window:
- Kill rule:

