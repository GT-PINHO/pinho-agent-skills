# Example 01 — Pricing page, low conversion to "Start trial"

## Input (user)

"Audit my SaaS pricing page. The goal is starting a free trial. Mobile is ~70% of traffic. Trial-start rate dropped from 6% to 3.5% last month. URL: example.com/pricing"

## Expected output (assistant)

**Top 10 findings (priority P0/P1/P2)**

1) [P0] **No single primary CTA on mobile.** Three buttons of equal weight ("Free", "Pro", "Enterprise") — the eye doesn't know where to go.
   - Impact: dilutes the trial-start action; mobile users bounce.
   - Fix: make "Start free trial" the single high-contrast primary on the recommended plan (Pro). Demote Free/Enterprise to secondary text links.
   - Validation: trial-start rate on mobile within 7 days; expect ≥ 5%.

2) [P0] **No proof above the fold.** Logos and testimonials only appear after the pricing tiers — past where most mobile users scroll.
   - Impact: visitors evaluate price before context.
   - Fix: insert a 1-row logo strip + 1 short testimonial immediately under the H1.
   - Validation: scroll-depth to first CTA, bounce rate.

3) [P1] **CTA labels are generic.** "Get started" appears 3 times; ambiguous.
   - Impact: users don't know which click commits to what.
   - Fix: "Start 14-day trial — no card" on the primary; "Talk to sales" for Enterprise.
   - Validation: CTR per CTA.

4) [P1] **FAQ section ignores top objections.** Trial length and "what happens after?" are not visible.
   - Impact: friction at decision moment.
   - Fix: add 3 FAQs above the comparison grid: trial length, card requirement, cancellation.
   - Validation: trial-start rate, support tickets.

5) [P2] **Comparison grid uses dense rows on mobile.** Text wraps awkwardly under 360px.
   - Impact: comprehension drops on small screens.
   - Fix: collapse non-essential rows behind "Compare all features".
   - Validation: time-on-page, mobile bounce.

6) [P2] **Inconsistent spacing between sections.** Visual rhythm broken.
   - Impact: minor; perceived polish.
   - Fix: align section padding to a single 8px-grid token.
   - Validation: design QA only.

7) [P2] **Body copy uses passive voice.** "Plans are designed to..."
   - Impact: low — tone, not conversion.
   - Fix: rewrite to second person.
   - Validation: subjective.

(Stopping at 7 — beyond this, returns are diminishing for the stated goal.)

**Cross-cutting note**
- A 6% → 3.5% drop in 1 month is not just a UX issue. Cross-check with `tracker-signal` (event firing on the trial-start CTA) and recent ad-source changes. If tracking is the cause, none of the UX fixes above will move the metric.
