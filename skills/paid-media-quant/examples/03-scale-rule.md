# Example 03 — Scale decision (3-day stability + 20% rule)

## Input (user)

Platform: Meta  
Objective: Purchases  
Target CPA: R$ 80  
Last 3 days CPA: R$ 78, R$ 79, R$ 77  
CTR (link): 1.4% (stable)  
CVR: 3.8% (stable)  
Spend: R$ 1.000/day

## Expected output (assistant)

**1) Dominant bottleneck**
- Bottleneck: None — signals stable
- Evidence: CPA stable for 3 consecutive days with stable CTR + CVR

**2) Diagnosis (auction)**
- CPM: not provided (assume stable given CPC stable)
- CTR: 1.4% (stable, healthy for the objective)
- CPC: implied stable from CTR + CPM
- CVR: 3.8% (stable, above the 3-day floor we'd worry about)
- CPA: R$ 77–79 vs target R$ 80 (within tolerance, 3 consecutive days)
- Interpretation: input-side and output-side both healthy; this is a scale candidate, not a fix candidate.

**3) Decision**
- You can scale, but keep risk controlled.

**4) Capital allocation plan**
- Budget action: +20% (R$ 1.000 → R$ 1.200/day)
- Constraint: no other changes for 48h

**5) Validation**
- Leading indicators: CTR + CVR remain stable
- Lagging metric: CPA stays ≤ R$ 80
- Time window: 48–72h
- Kill rule: if CPA breaches target for 3 consecutive days, revert budget

