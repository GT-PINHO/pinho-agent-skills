# Example 01 — Next.js SaaS, user wants token reduction + better LP copy

## Input (user)

"I'm building a Next.js 14 SaaS for solo founders. The landing page converts at 1.5%. I also feel like sessions are burning tokens fast. Help me find skills that fit."

## Expected output (assistant)

**Project diagnosis**
- Stack: Next.js 14 (App Router), TypeScript (inferred from `tsconfig.json`), TailwindCSS (`tailwind.config.*` present), no monorepo signals.
- Product type: SaaS landing + app, B2B (solo-founder ICP).
- User goal: (a) lift LP CVR from 1.5%, (b) reduce token usage in agent sessions.
- Evidence (files): `package.json`, `app/layout.tsx`, `tailwind.config.ts`, `app/(marketing)/page.tsx`.

**Ranked recommendations**

1) `lp-architect` · source: pinho-skills (this hub) · trust: high · why it fits: CVR at 1.5% is the dominant bottleneck for revenue today. This skill audits message-match, hierarchy, friction, and proof — and forbids scaling spend on a broken CVR. Direct match for your stated goal. · install method: already installed (this hub).

2) `token-discipline` · source: pinho-skills · trust: high · why it fits: explicitly addresses your second goal. Auto-classifies project size, recommends model tier (haiku/sonnet/opus), and routes via subagents. · install method: already installed.

3) `deep-copywriting` · source: pinho-skills · trust: high · why it fits: pairs with `lp-architect` — once message-match is fixed structurally, copy quality becomes the next leverage point. Refuses to draft without ICP, dominant pain, mechanism, proof. · install method: already installed.

4) `document-skills@anthropic-agent-skills` · source: https://github.com/anthropics/skills · trust: high · why it fits: optional. If you generate sales decks or onboarding PDFs, the official Anthropic document skills are well-tested. Not a direct fit for your stated CVR goal but useful for SaaS workflows downstream. · install method: user runs `/plugin marketplace add anthropics/skills && /plugin install document-skills@anthropic-agent-skills`.

**Install plan (after user confirmation)**

Awaiting your reply with numbers (e.g. "1, 2, 3"), `all`, or `none`.

- Auto-install (this session writes files): items 1–3 are already in this hub; nothing to write.
- Manual install required (user runs the command): item 4, only if you want it.
- Skipped: none yet.

**Activation**
- Items 1–3: invokable now as `/pinho-skills:lp-architect`, `/pinho-skills:token-discipline`, `/pinho-skills:deep-copywriting`.
- Item 4: invokable after you run the two commands above and reload the session.
