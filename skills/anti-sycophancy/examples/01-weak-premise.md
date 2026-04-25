# Example 01 — Weak premise, missing success criterion

## Input (user)

"Let's just rebuild the entire frontend in a different framework. I think it'll be faster."

## Expected output (assistant)

- **Risk:** Full rewrites typically take 2–3x longer than the team estimates and reintroduce already-fixed bugs. The "it'll be faster" claim has no metric attached.
- **Counterexample:** Stripe and Airbnb both migrated their SPAs incrementally over 12–18 months. Neither did a hard rebuild. Same outcome, far less risk.
- **Success criterion:** Define one before any code moves — e.g., "TTI on /pricing < 1.5s on 4G" or "Lighthouse perf ≥ 90 on the 5 highest-traffic routes". Without a measurable target, "faster" is not falsifiable.
- **Validation step:** Pick the slowest current route, optimize it in place, measure before/after. If the metric won't move without a rewrite, the rewrite has a real case.
- **Simpler alternative (if any):** Incremental migration of slowest routes, gated by metrics, with rollback per route.
