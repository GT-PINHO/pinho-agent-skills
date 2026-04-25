# Example 01 — Capturing project invariants from ad-hoc context

## Input (user)

"We keep getting the same problem: every time someone resizes the social media slides we have to redo the LinkedIn version because LI requires square 1080x1080 while IG uses 1080x1440. Also, we don't change slide structure to fix copy — copy fix only. Where do I write this so the team and the AI don't keep making the same mistakes?"

## Expected output (assistant)

**Proposed memory (bullet points)**

- Invariants:
  - **Social asset formats:** Instagram = 1080x1440 portrait. LinkedIn = 1080x1080 square. LinkedIn PDF carousels = uploaded as Document, not Image.
  - **Copy edits never change slide structure.** If copy doesn't fit, rewrite the copy — do not redesign the slide.

- Decisions:
  - One template per platform, sized at the canonical dimensions above. Resizing is forbidden; create a platform-specific export instead.

- Maps:
  - Source files: `/design/social/ig/` (1080x1440) and `/design/social/li/` (1080x1080).
  - Export script: `npm run export:social` (writes platform-specific PNGs/PDFs).

**How to validate**
- Open the LI export → confirm 1080x1080.
- Open the IG export → confirm 1080x1440.
- Diff slide structure between today and last week's PR — if structure changed for a copy fix, the rule was violated.

**Where to store this**
- Repo root `MEMORY.md` (project-level, version-controlled).
- Each invariant gets a "How to verify" line, otherwise it's not an invariant — it's a wish.
