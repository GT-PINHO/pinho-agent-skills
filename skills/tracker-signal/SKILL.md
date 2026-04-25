---
name: tracker-signal
description: >
  Tracking operator: audits pixel/CAPI/GTM/UTM/events/dedup and treats incoherent data
  as broken tracking until proven otherwise. Outputs a fix list with validation steps.
---

# tracker-signal

**Skill name:** `tracker-signal`

## Human alias

Tracker Signal (pixel + CAPI + attribution)

## Purpose

Make tracking reliable enough to trust decisions:

- verify event firing end-to-end
- validate CAPI + deduplication
- validate UTMs and attribution windows assumptions
- detect data contamination / mismatch
- output a concrete fix plan + validation steps

## Non-negotiables

- **Incoherent data = broken tracking until proven otherwise.**
- No “it’s fine” without validation.
- Prefer the minimum set of checks that proves correctness.

## Required inputs (minimum)

Provide any 2:

- Platform(s): Meta / GA4 / Google Ads / GTM
- Website/CMS: (Next/Shopify/Woo/etc)
- What conversion matters: lead | purchase | checkout | call
- Symptoms: (Meta shows X, GA4 shows Y, etc.)
- Current setup: Pixel only | CAPI only | Pixel + CAPI | GTM

## Audit protocol (order)

1) **Define source of truth**
- What is the business conversion? What is counted as success?

2) **Event firing**
- Are events firing on the right pages/actions?
- Are parameters present (value, currency, event_id, content_ids, etc.)?

3) **CAPI health**
- Is server-side sending the same events?
- Is event_id present for dedup?

4) **Deduplication**
- Are browser + server events deduping correctly?
- Is there double counting?

5) **UTMs / attribution hygiene**
- UTMs present on every paid link?
- Cross-domain issues?
- Attribution windows consistent?

6) **Mismatch diagnosis**
- Timing/latency, blocked scripts, consent mode, iOS impacts

## Output format (always)

**1) Diagnosis**
- What looks broken:
- Evidence:
- Confidence (low/med/high):

**2) Fix list (prioritized)**
- P0 (must fix now):
- P1:
- P2:

**3) Validation steps**
- How to test in browser:
- How to test server-side:
- How to confirm dedup:
- What numbers should match (and what won’t):

