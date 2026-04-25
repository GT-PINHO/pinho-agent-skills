# Example 02 — UTM hygiene is missing

## Input (user)

Meta shows conversions but I can’t see campaign/source in GA4.  
Links go to multiple landing pages.  
Setup: GTM + GA4.

## Expected output (assistant)

**1) Diagnosis**
- What looks broken: missing UTMs / inconsistent tagging
- Evidence: GA4 has conversions but no paid campaign attribution
- Confidence: high

**2) Fix list (prioritized)**
- P0: enforce UTMs on every paid link (source/medium/campaign/content/term)
- P0: standardize naming convention (lowercase, no spaces)
- P1: check redirects stripping query params
- P1: verify cross-domain if checkout is on another domain

**3) Validation steps**
- Open ad URL and confirm UTMs persist to final page
- Real-time GA4: confirm session source/medium reflects UTMs
- Place a test conversion and confirm attribution dimensions populate

