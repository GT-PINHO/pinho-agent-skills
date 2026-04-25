# Example 01 — LTV/CAC below 3 (scale-risk)

## Input (user)

Offer price (AOV): R$ 297  
COGS: R$ 35  
Payment fees: 6%  
Refund rate: 8%  
Ad spend (30d): R$ 60.000  
New customers (30d): 120  
Repeat purchase rate (90d): 15%  
Goal: scale spend by 50%

## Expected output (assistant)

**1) Economics snapshot**
- Contribution/order (approx):
  - Revenue: 297
  - Fees: ~18
  - COGS: 35
  - Refund leakage: ~24 (8% * 297)
  - Contribution ≈ 297 - 18 - 35 - 24 = R$ 220
- CAC = 60.000 / 120 = R$ 500
- LTV assumption: low repeat; conservative LTV ≈ R$ 220–R$ 250
- LTV/CAC ≈ 0.44–0.50 (no-scale)
- Payback: impossible (CAC > contribution)
- Risk level: no-scale
- Evidence/assumptions: using conservative LTV; repeat rate too low to close gap

**2) Dominant constraint**
- Constraint: CAC is structurally above contribution margin
- Evidence: CAC ~500 vs contribution ~220

**3) Highest-leverage lever**
- Lever: conversion + offer economics (pricing/upsell)
- Why: you can’t scale spend into negative unit economics

**4) Plan (executable)**
1) Stop scaling and cap spend until CAC < contribution
2) Improve CVR (LP + checkout) and qualify leads; reduce CAC
3) Add upsell/order bump to raise contribution per customer

**5) Validation**
- Leading indicators: CVR up, CPA down, AOV up
- Lagging metrics: CAC < R$ 220 and LTV/CAC trending toward ≥ 3
- Time window: 2–4 weeks
- Kill rule: if CAC stays > contribution for 14 days, pause acquisition and fix offer/funnel

