# Example 03 — Dedup double count

## Input (user)

Meta Events shows almost every purchase duplicated.  
Pixel + CAPI enabled.  
Conversions inflated after enabling CAPI.

## Expected output (assistant)

**1) Diagnosis**
- What looks broken: deduplication is failing (double counting)
- Evidence: purchases appear duplicated after enabling CAPI
- Confidence: high

**2) Fix list (prioritized)**
- P0: ensure event_id is generated once and shared across browser + server
- P0: confirm both events use the same event name and consistent parameters
- P1: check for multiple pixel initializations / GTM containers duplicating

**3) Validation steps**
- Send test purchase: confirm only 1 deduped purchase in Events Manager
- Verify dedup stats show “deduplicated” events
- Confirm purchase count aligns with backend order count (source of truth)

