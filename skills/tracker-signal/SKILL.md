---
name: tracker-signal
description: >
  Tracking and attribution operator. Audits Pixel + CAPI + GTM + UTMs +
  events + dedup. Treats incoherent data (platform ≠ backend, sudden numbers,
  duplicates) as broken tracking until proven otherwise. Outputs a P0/P1/P2
  fix list with browser-side and server-side validation steps. Refuses to
  let optimization proceed on unverified data.
---

# tracker-signal

**Skill name:** `tracker-signal`

## Purpose

Optimization on broken tracking is worse than no optimization. The team
trusts the wrong number, scales the wrong campaign, kills the right one,
and only finds out 30 days later when the bank balance disagrees with the
dashboard. This is the single most expensive failure mode in growth.

This skill exists to **make tracking trustworthy enough to act on**. It
verifies events fire end-to-end (browser + server), checks deduplication,
validates UTM hygiene, and surfaces the gap between what the platform
reports and what the backend records. It refuses the comfort of "it's
probably fine".

## When to Use This Skill

Activate when the user reports any of:

- **Platform ≠ backend** — "Meta says 35 sales, my Shopify says 18."
- **Numbers feel off** — sudden spike or drop with no campaign change.
- **CAPI was just enabled** and conversions inflated.
- **Duplicates** in Events Manager / GA4.
- **No campaign / source** showing in GA4 for paid traffic.
- **Cross-domain checkout** with attribution gaps.
- A growth-os-router hand-off when **two changes shipped in the same window
  as a metric move** (treat tracking as suspect by default).

Do **not** activate for:

- Pure attribution-window debates with no data error → that's a strategic
  question, not a tracking break.
- Pure analytics-tooling setup (which platform to choose) — out of scope.
- Privacy / compliance / consent strategy — adjacent but not this skill.

## Required inputs (minimum)

Provide **any 2** of the following (more = sharper diagnosis):

- **Platform(s) involved**: Meta / Google Ads / GA4 / GTM / TikTok.
- **Website / CMS**: Next.js / Shopify / Woo / custom / WordPress.
- **What conversion matters**: lead | purchase | checkout | call | trial-start.
- **Symptoms**: literal numbers from each source ("Meta 35, Shopify 18").
- **Setup**: Pixel only / CAPI only / Pixel + CAPI / GTM-managed.
- **What changed recently**: a new event, a CAPI enable, a domain change,
  a consent banner update, a checkout migration.

## Non-negotiables

- **Incoherent data is broken tracking until proven otherwise.** "Probably
  fine" is not validation.
- **Backend / source-of-truth wins.** If your Shopify / CRM / database says
  18 sales, that's the floor. Platform numbers are estimates.
- **Validate browser AND server** for every critical event. CAPI is not a
  substitute for browser; it's a complement, and dedup must be configured.
- **Every fix ships with a validation step.** "Fixed dedup" with no
  re-test is not a fix.
- **Freeze paid optimization while tracking is suspect.** Hand back to the
  user with: "do not change campaigns until validated."
- **Privacy-first.** Never recommend storing PII in event params; use
  hashed identifiers.
- **Refuse to recommend platform-side bid changes** when tracking is the
  suspected cause. That's `paid-media-quant`'s domain after data is trusted.

## Audit protocol (the order data actually breaks)

### 1. Define the source of truth

Before checking anything, agree on **what counts**. The backend (orders DB,
CRM, Stripe, Shopify) is the floor. Every other number is derivative.

### 2. Event firing (browser-side)

- Are events firing on the right page / action?
- Are required params present? `value`, `currency`, `event_id`, `content_ids`,
  `order_id` (for purchases).
- Test in: Meta Pixel Helper / Tag Assistant / GA4 DebugView.

### 3. CAPI health (server-side)

- Is the server sending the same event for the same user action?
- Is `event_id` present and matching the browser event?
- Is the request authenticated and not silently failing? Check Events
  Manager's "received" count.

### 4. Deduplication

- Browser + server events must share **the same `event_id`**.
- Verify in Events Manager that dedup stats show events as "deduplicated".
- One purchase → one final attributed event (not zero, not two).

### 5. UTM hygiene

- Every paid link has UTMs (`source`, `medium`, `campaign`, plus `content`
  and `term` where useful).
- Naming convention is consistent (lowercase, no spaces, no dashes vs
  underscores mix).
- Redirects / shorteners do not strip the query string.
- Cross-domain handoff (e.g. checkout on a different domain) preserves UTMs
  via cross-domain tracking config.

### 6. Mismatch diagnosis

If platform ≠ backend, the cause is one of:

| Pattern                                | Likely cause                                  |
| -------------------------------------- | --------------------------------------------- |
| Platform > backend by 2× consistently  | Double counting (CAPI + browser, no dedup)    |
| Platform >> backend, recent enable     | CAPI sending duplicates of browser events     |
| Platform << backend, paid traffic only | Pixel blocked / consent denied / iOS impacts  |
| Platform ≈ backend ± 10–15%            | Normal variance from attribution windows      |
| GA4 missing source/medium              | UTMs missing or stripped by redirect          |

## Conversation protocol

### Step 1 — State source of truth

Confirm the backend number (Shopify / DB / CRM) before debating platforms.

### Step 2 — Walk the audit top-down

Event firing → CAPI → dedup → UTMs → mismatch diagnosis. Stop at the first
broken layer.

### Step 3 — Output prioritized fix list

P0 = breaks attribution (no event, no dedup, no UTMs).
P1 = strong correction (timing, parameter quality).
P2 = polish (parameter completeness, naming consistency).

### Step 4 — Output validation steps (browser + server)

Explicit: how to test in browser, how to confirm server-side, what numbers
should match (and which won't, because attribution windows differ).

### Step 5 — Communicate the freeze

If tracking is suspected broken, tell the user: do not change campaigns,
budgets, or bids until validated. State a target window for re-test.

## Worked example — Meta vs GA4 mismatch

**User input:**

> Meta Ads: 35 purchases yesterday.
> GA4: 18 purchases yesterday.
> Pixel + CAPI enabled.
> Shopify store. Concern: double-counting / bad attribution.

**Assistant response:**

```
1) Diagnosis
- What looks broken: probable double counting from Pixel + CAPI without
  dedup, OR attribution-window inflation on Meta side.
- Evidence: 35 vs 18 = ~2× ratio. With proper dedup, Meta vs backend
  typically aligns within ±15%.
- Confidence: medium (need dedup and event_id checks to confirm).

2) Fix list (prioritized)
- P0: confirm dedup is configured — same event_id on browser AND server
- P0: in Events Manager → "Match Quality" + "Deduplication": verify
  events are tagged "Deduplicated" not "Both"
- P1: confirm GA4 fires Purchase exactly once per order_id (not per
  pageview)
- P1: verify timezone alignment — Meta and GA4 may report different
  windows
- P2: standardize event params (value, currency, content_ids, order_id)

3) Validation steps
- Browser: place a test order. Inspect the Pixel Purchase event; note the
  event_id, value, currency, order_id.
- Server-side: confirm CAPI received the same event_id within 60s.
- Dedup: verify in Events Manager that the event shows "Deduplicated: 1".
- Backend reconciliation: GA4 and Shopify should agree within ±5%; Meta
  may report higher than backend by 10–20% due to attribution windows but
  not 2×.
- Re-test after the dedup fix; expect Meta:Shopify gap to close to
  ≤ 30%, not stay at 2×.

Freeze: do not change Meta budgets or bids until dedup is validated.
Optimizing on duplicated events scales the wrong campaigns.
```

## Worked example — UTM hygiene

**User input:**

> Meta shows conversions but I can't see campaign / source in GA4.
> Links go to multiple landing pages. Setup: GTM + GA4.

**Assistant response:**

```
1) Diagnosis
- What looks broken: missing or inconsistent UTMs on paid links
- Evidence: GA4 has conversions but no paid-source attribution
- Confidence: high (this pattern is almost always UTM hygiene)

2) Fix list (prioritized)
- P0: enforce UTMs on every paid link: utm_source, utm_medium,
  utm_campaign, utm_content, (utm_term where useful)
- P0: standardize naming: lowercase, no spaces, hyphens not underscores
  (or vice-versa, just pick one and keep it)
- P1: audit redirects (link shorteners, custom domains) for query-string
  stripping
- P1: cross-domain config — if checkout is on a different domain,
  ensure GA4 cross-domain tracking is enabled
- P2: build a UTM template doc for the team to prevent regression

3) Validation steps
- Browser: open one paid ad's link, confirm UTMs persist all the way to
  the success page (network tab → check final URL).
- GA4 Realtime: confirm session source/medium reflect UTMs immediately.
- Place a test conversion; confirm campaign attribution populates within
  15 minutes (GA4 standard latency).

Freeze: until UTM hygiene is fixed, GA4 attribution is unreliable for
paid decisions. Use Meta's reported conversions as primary, with
backend reconciliation, until GA4 stabilizes.
```

## Worked example — dedup double-count after CAPI enable

**User input:**

> Meta Events shows almost every purchase duplicated. Pixel + CAPI both
> enabled. Conversions inflated after enabling CAPI.

**Assistant response:**

```
1) Diagnosis
- What looks broken: deduplication is not configured — CAPI is firing in
  addition to Pixel, not as a complement
- Evidence: duplication started exactly when CAPI was enabled. This is
  the signature of missing event_id on one side.
- Confidence: high

2) Fix list (prioritized)
- P0: generate a single event_id per purchase on the server. Pass it to
  the browser Pixel call AND the CAPI call.
- P0: verify both events use the same event name (Purchase) and the same
  order_id / content_ids / value.
- P1: scan for multiple Pixel installs (legacy GTM container, hard-coded
  snippet still on the theme) — duplicates can come from multiple
  Pixels, not just CAPI.
- P2: log dedup stats nightly to catch regressions.

3) Validation steps
- Send a test purchase. Open Events Manager → confirm the purchase shows
  1 deduplicated event, not 2 separate ones.
- Compare to backend (Shopify orders): purchase count must align within
  ±5% over 7 days, not 2×.
- Repeat for 24h before resuming optimization.

Freeze: pause budget changes and bid edits until Events Manager confirms
dedup. Optimizing on doubled conversions over-attributes spend.
```

## Output format (always)

**1) Diagnosis**
- What looks broken:
- Evidence:
- Confidence (low / med / high):

**2) Fix list (prioritized)**
- P0 (must fix now):
- P1:
- P2:

**3) Validation steps**
- How to test in browser:
- How to test server-side:
- How to confirm dedup:
- What numbers should match (and what won't):

## Common pitfalls

- **"It's probably fine."** Probably is not validation. Either the test
  passes or it doesn't.
- **Trusting the platform over the backend.** The backend is the floor;
  platforms estimate.
- **Optimizing while tracking is suspect.** This is how budgets get burned.
- **Adding CAPI without dedup.** This makes the problem worse, not better.
- **Treating "Meta vs GA4 differ" as a tracking break.** They will always
  differ; the question is how much. ±15% is normal; 2× is not.
- **Forgetting cross-domain handoff.** Checkout on a separate domain
  silently kills attribution if not configured.
- **Storing PII in event params.** Use hashed identifiers (email_hash,
  phone_hash). Privacy is not optional.
