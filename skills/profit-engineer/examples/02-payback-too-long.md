# Example 02 — Payback too long (cash risk)

## Input (user)

Subscription: R$ 199/month  
Gross margin: 80%  
Ad spend (30d): R$ 40.000  
New customers (30d): 50  
Churn: 8% / month  
Cash tolerance: payback must be ≤ 2 months  

## Expected output (assistant)

**1) Economics snapshot**
- Contribution/month ≈ 199 * 0.80 = R$ 159
- CAC = 40.000 / 50 = R$ 800
- Payback ≈ 800 / 159 = 5.0 months (scale-risk)
- LTV (simple): with 8% churn, expected lifetime ~12.5 months → LTV ≈ 159 * 12.5 = R$ 1.987
- LTV/CAC ≈ 2.48 (below 3, scale-risk)
- Risk level: scale-risk (cash constraint)

**2) Dominant constraint**
- Constraint: payback exceeds cash tolerance
- Evidence: payback ~5 months vs tolerance 2 months

**3) Highest-leverage lever**
- Lever: CAC reduction + activation/retention (churn) improvement
- Why: shortening payback protects cash even if LTV is ok

**4) Plan (executable)**
1) Cap spend and optimize acquisition to bring CAC down (target ≤ R$ 320)
2) Improve onboarding/activation to reduce churn (target 5%/month)
3) Introduce annual plan / upfront incentives to shorten payback

**5) Validation**
- Leading indicators: CAC down, churn down, annual-plan adoption up
- Lagging metrics: payback ≤ 2 months, LTV/CAC ≥ 3
- Time window: 30–60 days
- Kill rule: if CAC > R$ 800 for 14 days, pause prospecting and focus on retention + funnel

