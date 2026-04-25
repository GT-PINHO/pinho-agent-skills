# Example 01 — Message match failure

## Input (user)

Ad promise: “Get qualified leads in 7 days (without discounting)”  
Landing page hero: “Welcome to our agency”  
Funnel: lead form  
CVR: 10% → 4% after changing the landing page copy

## Expected output (assistant)

**1) Diagnosis**
- Dominant bottleneck: message match broken
- Evidence: ad promise is specific, hero is generic; CVR dropped after copy change

**2) Fix list (prioritized)**
- P0: rewrite hero to mirror promise + audience + outcome (same words as ad)
- P0: add proof directly under hero (case snippet / numbers)
- P1: reduce form friction (fields + clarity)

**3) Test plan**
- Change first: hero + subhead + proof block
- Measure: CVR, form completion rate, scroll depth
- Time window: 48–72h

**4) Validation**
- Leading indicators: higher scroll-to-CTA, lower bounce
- Lagging metric: CVR back ≥ 8–10%
- Kill rule: if CVR stays < 6% after message match fix, audit offer/process next

