# Example 01 — Sudden CPA spike, multiple suspected causes

## Input (user)

"Our Meta Ads CPA jumped from R$45 to R$120 in 5 days. Spend is the same. We launched a new landing page last week and changed the offer copy. Tracking shows fewer leads but also weird numbers."

## Expected output (assistant)

**Dominant bottleneck**
- What it is: probable input-side break compounded by tracking uncertainty. Two changes shipped together (LP + offer copy) within the CPA spike window — confounder.
- Evidence: timing match (LP + copy change → 5-day spike), "weird numbers" signal in tracking, no spend change rules out budget mechanics.

**Lead specialist**
- Lead: **tracker-signal** (first), then **lp-architect** (second).
- Why: "fewer leads + weird numbers" means data is potentially invalid. Optimizing on broken data is worse than doing nothing. Once tracking is verified, route to LP since the LP+copy change is the most recent intervention.

**Plan (executable)**
1) Freeze further LP/copy changes. Don't optimize on data you don't trust.
2) Run `tracker-signal` audit on Meta Pixel + CAPI dedup, UTM hygiene, and event firing on the new LP.
3) Once tracking is confirmed valid, run `lp-architect` audit on the new LP focusing on message-match between ad copy and hero.
4) If tracking is fine and LP is fine, then escalate to `paid-media-quant` for auction-side diagnosis.

**Validation**
- Success metric: CPA back to ≤ R$60 within 7 days OR clear evidence of broken tracking that explains the spike.
- Time window: 7 days.
- Stop/kill rule: if tracking is broken, stop spend until fixed; if LP message-match is the cause, revert LP first, validate, then iterate.
