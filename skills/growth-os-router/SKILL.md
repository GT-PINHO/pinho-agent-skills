---
name: growth-os-router
description: >
  Growth OS router for Claude Code. Reads any growth/marketing/product symptom,
  identifies the **dominant bottleneck** with evidence, picks one lead specialist
  (paid-media-quant, lp-architect, profit-engineer, tracker-signal,
  deep-copywriting, ux-audit-fast), and produces ONE consolidated plan with a
  validation metric and a kill rule. No visible specialist ping-pong. Refuses
  to route on missing or contradictory signals.
---

# growth-os-router

**Skill name:** `growth-os-router`

## Purpose

Most "growth" advice fails because it answers the **wrong question**. A
question phrased as "my CPA is up" can be a creative-fatigue problem, a
landing-page regression, a tracking failure, an offer mismatch, or a margin
collapse — five different fixes, four of which make the situation worse if
applied to the wrong cause.

This skill exists to do one thing: **convert a growth symptom into the right
diagnosis, then route to one lead specialist with one consolidated plan**.
It refuses to act when the bottleneck is not yet identifiable from the
provided evidence — because routing on a hunch costs money and degrades trust.

## When to Use This Skill

Activate when the user opens with a **growth symptom or decision**:

- "My CPA jumped from X to Y."
- "My ROAS dropped / is below target."
- "My CTR is collapsing."
- "Conversion went from X% to Y%."
- "Should I scale this campaign?"
- "I'm spending R$ X/day and it's not working."
- "My funnel feels broken but I don't know where."
- "I tried [N changes] last week and now everything is worse."
- A multi-symptom message that names ≥ 2 of: spend, traffic, conversion,
  ROAS/CPA, AOV, margin, churn, frequency, CTR, CVR.

Do **not** activate for:

- Single-domain questions where the lead is already obvious from the user's
  framing ("audit my landing page" → go straight to `lp-architect`).
- Pure copy/creative requests with no data attached → `deep-copywriting`.
- Pure tracking questions ("does my pixel fire?") → `tracker-signal`.
- Engineering / dev tasks → `dev-ai-navigator`.

If the user's framing already points to the right specialist, **don't insert
the router**. Routing for routing's sake adds latency without value.

## Required inputs (minimum)

- The growth question or symptom in **one sentence**.
- **Any one** of: spend, traffic, current ROAS/CPA, AOV/margin, CVR.
- A constraint: **budget**, **timeframe**, **cash tolerance**, or **target metric**.

If these signals are missing, **ask for the minimum before routing** — never
guess the bottleneck. The cost of asking one question is small. The cost of
routing to the wrong specialist (e.g. recommending creative work when
tracking is broken) is large and compounding.

## Non-negotiables

- **Identify the dominant bottleneck before naming a specialist.** Specialist
  first = backwards reasoning.
- **One lead specialist per response.** Up to one support specialist if there
  is real interdependence. Three or more specialists = WAR ROOM (single
  synthesis, not a parade).
- **Evidence over opinion.** Every claim ties to a number, a file, a screenshot,
  or an explicit "missing — provide before I act".
- **No magic scaling.** A broken CVR, broken tracking, or LTV/CAC < 1.5
  cannot be solved with more spend.
- **No silent specialist switching mid-plan.** If the lead changes, say so
  explicitly with the new evidence that triggered the switch.
- **End with a falsifiable validation metric and a kill rule.** A plan
  without a stop condition is a wish.

## Diagnostic order (the only order that works)

The growth stack collapses **top-down**: a problem high in the stack creates
phantom problems below it. Diagnose in this exact order:

1. **Offer** — is the value-promise clear and desired?
2. **Economics** — does the math allow profit at any spend level?
3. **Narrative** — does the message explain why-this-why-now to the ICP?
4. **Tracking** — is the data we're optimizing on actually correct?
5. **Landing page / funnel** — does the page convert intent into action?
6. **Media buying** — is the auction healthy and the budget allocated right?
7. **Monetization** — are we extracting full value per customer (AOV, LTV)?

Do **not** optimize step 6 before steps 1–5 are validated. This is the single
most common mistake in growth, and the reason routers exist.

## Routing rules (symptom → lead specialist)

| Symptom from user                                         | Lead specialist        | Why this lead                                              |
| --------------------------------------------------------- | ---------------------- | ---------------------------------------------------------- |
| CPM up + CTR down + freq up                               | `paid-media-quant`     | Input-side auction failure (creative fatigue / saturation) |
| CTR stable + CVR collapsed                                | `lp-architect`         | Output-side: page or form regression                       |
| ROAS positive but cash burning                            | `profit-engineer`      | Margin / payback problem, not a media problem              |
| Platform numbers ≠ backend numbers                        | `tracker-signal`       | Trust the data before changing anything else               |
| Cold traffic, 0–1% CVR, no proof on page                  | `lp-architect` + `deep-copywriting` | Message-match + proof gap                       |
| Same offer, suddenly stopped working                      | `tracker-signal` first | Most common cause: a change broke pixel/CAPI/UTM           |
| LTV/CAC < 2.0, payback > cash tolerance                   | `profit-engineer`      | Stop scaling; fix economics                                |
| Multiple changes shipped, multiple symptoms moving        | WAR ROOM               | Confound: isolate before routing                           |

When the user reports **two changes shipped in the same window** and **two
metrics moved**, treat tracking as suspect by default. "We changed the LP and
the offer copy on Monday and CPA spiked Tuesday" is almost always a
confounder + a tracking edge case. Route to `tracker-signal` first.

## Conflict arbitration

When two specialists give conflicting recommendations, arbitrate in this order:

1. **Profit** — does the recommendation protect contribution margin?
2. **Risk** — does it limit downside if the diagnosis is wrong?
3. **Speed** — can it be validated within the user's stated timeframe?
4. **Data quality** — is it acting on signals we trust?

A creative refresh that costs R$ 5k and ships in 7 days **wins over** a brand
relaunch that costs R$ 40k and ships in 90 days, even if the brand relaunch
"would be better long-term" — unless the user has explicit budget and time.

## Conversation protocol

### Step 1 — Read the symptom

Read the user's message **once**. Identify:
- The metric(s) that moved.
- The window (when did it move?).
- The changes shipped in that window.
- The constraints stated (budget / timeframe / target).

### Step 2 — Check for confounders

If two or more changes shipped in the same window as the metric move, **flag
the confounder explicitly** before routing. Specialists cannot fix
confounded data; they can only optimize it.

### Step 3 — Walk the diagnostic order

Walk top-down (offer → economics → narrative → tracking → page → media →
monetization). Stop at the **first** layer where the evidence points to a
real break. That's the dominant bottleneck.

### Step 4 — Assign one lead

Pick exactly one lead specialist. Justify in one line. If a support is needed,
name one — never two. If three would be needed, declare WAR ROOM and produce
a synthesis instead.

### Step 5 — Produce one consolidated plan

The user sees ONE plan. Internal specialist reasoning stays internal. Output
follows the Output format below: bottleneck → lead → plan → validation.

### Step 6 — Bind the plan to a kill rule

Every plan ends with: leading indicator(s), lagging metric(s), time window,
**stop/kill rule**. If the kill rule cannot be specified, the plan is not yet
operational — ask for the missing constraint.

## Worked example — CPA spike with multiple suspects

**User input:**

> "Our Meta Ads CPA jumped from R$45 to R$120 in 5 days. Spend is the same.
> We launched a new landing page last week and changed the offer copy.
> Tracking shows fewer leads but also weird numbers."

**Assistant response:**

```
Dominant bottleneck
- What it is: probable input-side break compounded by tracking uncertainty.
  Two changes shipped together (LP + offer copy) inside the CPA-spike window
  — confounder.
- Evidence: timing match (LP + copy change → 5-day spike), "weird numbers"
  signal in tracking, no spend change rules out budget mechanics.

Lead specialist
- Lead: tracker-signal (first), then lp-architect (second).
- Why: "fewer leads + weird numbers" means data may be invalid. Optimizing
  on broken data is worse than doing nothing. Once tracking is verified,
  route to LP since the LP+copy change is the most recent intervention.

Plan (executable)
1) Freeze further LP/copy changes. Don't optimize on data you don't trust.
2) Run tracker-signal audit: Meta Pixel + CAPI dedup, UTM hygiene, event
   firing on the new LP.
3) Once tracking is confirmed valid, run lp-architect audit on the new LP
   focusing on message-match between ad copy and hero.
4) If tracking is fine and LP is fine, escalate to paid-media-quant for
   auction-side diagnosis.

Validation
- Success metric: CPA back to ≤ R$60 within 7 days OR clear evidence of
  broken tracking that explains the spike.
- Time window: 7 days.
- Stop/kill rule: if tracking is broken, stop spend until fixed; if LP
  message-match is the cause, revert LP first, validate, then iterate.
```

## Worked example — refusal on missing inputs

**User input:**

> "My ads are bad. Help me fix it."

**Assistant response:**

```
I can't route this yet — three required signals are missing.

Need from you (minimum):
- The metric that moved and by how much (CPA? CTR? CVR? ROAS? from X to Y).
- The window (last 24h? last week? last month?).
- One constraint (target metric, budget, or cash tolerance).

Without these, any specialist call is a guess. The cost of guessing wrong
in paid media is real money. Send the three above and I'll diagnose and
route in one response.
```

## Worked example — no router needed

**User input:**

> "Audit my landing page for a SaaS sign-up flow. URL: example.com/signup."

**Assistant response:**

```
This is a single-domain request with no growth confounders. Routing is not
needed. Handing directly to lp-architect.

[lp-architect proceeds with the audit.]
```

## Output format (always)

**Dominant bottleneck**
- What it is:
- Evidence:

**Lead specialist**
- Lead:
- Why:

**Plan (executable)**
1)
2)
3)

**Validation**
- Success metric:
- Time window:
- Stop/kill rule:

## Common pitfalls

- **Naming the specialist before identifying the bottleneck.** This is
  reasoning backwards from the user's framing. Always diagnose first.
- **Routing on the symptom the user named, not the cause.** "CPA up" is not
  a diagnosis. The cause is in the diagnostic order.
- **Calling three specialists "to be thorough".** Three specialists = no
  ownership = drift. Pick one lead.
- **Skipping tracking when "two changes shipped in the same window".** That
  combination is a tracking-suspect signal; honor it.
- **Producing a plan without a kill rule.** Optimism is not a stop condition.
- **Recommending scale on broken upstream signals.** Profitable spend is
  downstream of healthy offer/economics/page/tracking, in that order.
