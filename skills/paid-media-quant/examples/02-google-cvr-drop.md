# Example 02 — Google: CVR drop (output-side failure)

## Input (user)

Platform: Google Search  
Spend: R$ 900/day  
CTR: 7.2% (stable)  
CPC: R$ 2.10 (stable)  
CVR: 6.5% → 2.9%  
CPA: R$ 32 → R$ 74  
Offer unchanged, but site was updated yesterday.

## Expected output (assistant)

**1) Dominant bottleneck**
- Bottleneck: Conversion layer / landing page regression (output-side)
- Evidence: CTR and CPC stable, CVR collapsed after site update

**2) Diagnosis (auction)**
- CPM: (not applicable)
- CTR: healthy and stable → intent + ads ok
- CPC: stable → auction stable
- CVR: broke → page/checkout/form/friction
- CPA: downstream symptom

**3) Decision**
- Change first: revert/inspect landing page changes; validate form + speed + tracking
- Do NOT change: bids/keywords/ads yet (top-of-funnel signals are fine)

**4) Capital allocation plan**
- Budget action: hold or cut 20% until CVR recovers
- Actions: QA page, speed, form submit, error logs, mobile rendering

**5) Validation**
- Leading indicators: form submit success rate, page load, CVR back ≥ 5%
- Lagging metrics: CPA back ≤ R$ 35
- Time window: 24–48h
- Kill rule: if CVR stays < 4% after rollback, pause the landing page variant

