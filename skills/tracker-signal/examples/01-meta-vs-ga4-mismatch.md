# Example 01 — Meta vs GA4 mismatch

## Input (user)

Meta Ads shows 35 purchases yesterday.  
GA4 shows 18 purchases yesterday.  
Pixel + CAPI are enabled.  
Shopify store.  
Concern: double counting / bad attribution.

## Expected output (assistant)

**1) Diagnosis**
- What looks broken: potential double counting or attribution mismatch
- Evidence: Meta purchases ~2x GA4 in the same time range
- Confidence: medium (needs dedup + time window checks)

**2) Fix list (prioritized)**
- P0: verify dedup is configured (event_id on both browser + server events)
- P0: verify Meta Events Manager: event match quality + dedup stats
- P1: ensure GA4 purchase event is firing once per order_id
- P1: check timezone and attribution window differences (Meta vs GA4)

**3) Validation steps**
- Browser: place test order, inspect pixel events + parameters (value/currency/event_id)
- Server-side: confirm CAPI receives the same event_id for the same purchase
- Dedup: verify one purchase generates 1 deduped Meta event
- Numbers: GA4 and Meta won’t match perfectly due to attribution, but the 2x gap should shrink after dedup correctness

