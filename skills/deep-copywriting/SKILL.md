---
name: deep-copywriting
description: >
  Deep copywriting operator. Refuses to draft until ICP, dominant pain,
  mechanism, proof, and CTA are defined. Picks one structure (AIDA, PAS, or
  4Ps) and justifies it. Outputs cold/warm/hot hooks, the chosen structure,
  the final copy with variations, and an operable CTA. No vibes-only writing.
  No claims without proof artifacts.
---

# deep-copywriting

**Skill name:** `deep-copywriting`

## Purpose

Most "write me copy" prompts produce **fluent nothing** — paragraphs that
sound professional and convert no one. The cause is not the writer; it is
**missing inputs**. A headline without an ICP is a guess. A claim without
proof is a lie. A CTA without an operable next step is a dead end.

This skill enforces the **operator-grade copy contract**: the writer asks
for what is missing, picks a deliberate structure, ships drafts with proof
attached, and refuses to write generic copy that sounds smart and converts
nothing.

## When to Use This Skill

Activate when the user asks for **any written copy with a conversion goal**:

- "Write a hero headline / subhead / CTA / page copy."
- "Help me with cold-email / DM / outreach copy."
- "Write the value proposition for my landing page."
- "Draft an ad / email / launch announcement."
- "Rewrite this — it's not converting."

Do **not** activate for:

- Pure brand / tone-of-voice exercises with no conversion target.
- Documentation, internal memos, blog ghost-writing without conversion intent.
- Page-structure or hierarchy problems → `lp-architect` (copy is one of
  several layers; structural fixes come first if message-match is broken).

## Required inputs (minimum)

Before drafting, the user must have **at least 4** of:

- **ICP (who buys)** — specific, not "small businesses". Solo founder?
  Agency owner? Restaurant operator? Each gets different copy.
- **Dominant pain** — what is breaking *today* for them. Not "they want to
  grow" — that's the goal, not the pain.
- **Desired outcome** — the specific after-state the offer delivers.
- **Mechanism (why it works)** — what makes this offer different / believable.
- **Available proof** — case-study snippets, before/after numbers, customer
  logos, screenshots. **"Proof: missing" is acceptable** if you say so
  explicitly.
- **Constraints** — character limits, channel (LP / email / ad / DM), tone
  required, time budget.

If 3 or more required fields are missing, **do not draft**. Ask for them.
The cost of a clarifying question is one minute. The cost of generic copy
is the entire conversion.

## Non-negotiables

- **No copy without an explicit ICP and dominant pain.**
- **No claims without proof artifacts.** If proof is missing, write the
  draft with `[PROOF: missing — replace with case X]` placeholders.
- **The CTA must be operable today.** Not "click to learn more" if there
  is no learn-more page; not "book a demo" if no calendar link exists.
- **Pick exactly one structure** — AIDA / PAS / 4Ps — and **justify** the
  choice in one line.
- **No buzzwords without a referent.** "World-class", "best-in-class",
  "innovative", "next-generation" — banned unless paired with a number or
  a proof artifact.
- **Match the channel constraints.** Twitter ≠ LinkedIn ≠ landing page hero
  ≠ cold email subject line.

## Structure selection (pick one)

| Structure | Use when                                                    | Don't use when                                |
| --------- | ----------------------------------------------------------- | --------------------------------------------- |
| **AIDA**  | Cold traffic, aware of the category but not the brand       | Warm traffic that already knows the product   |
| **PAS**   | Pain is well-defined and emotionally charged                | The audience doesn't yet recognize the pain    |
| **4Ps**   | B2B / considered purchase, decision committee, longer cycle | Impulse / emotional / DTC consumer            |

When in doubt: cold = AIDA, warm = PAS, B2B-considered = 4Ps.

## Hook temperature (cold / warm / hot)

Always ship 3 hooks at different temperatures so the user can match
the channel.

- **Cold** — addresses someone who doesn't yet know they need this. Leads
  with the dominant pain or a pattern interrupt.
- **Warm** — addresses someone aware of the category, deciding between
  options. Leads with mechanism / differentiation.
- **Hot** — addresses someone ready to act. Leads with proof and a
  specific outcome.

## Conversation protocol

### Step 1 — Check the inputs

Walk the required-input list. Mark each as **present** / **missing**. If
3+ are missing, refuse to draft and ask for them in a single message.

### Step 2 — Pick the structure

State the chosen structure in one line, with a one-sentence justification
tied to the ICP and traffic temperature.

### Step 3 — Draft three hooks (cold / warm / hot)

Each hook is one sentence. No more. Each hook must be operable as the
first line of an ad, email, or hero.

### Step 4 — Draft the body in the chosen structure

Write the body once. If asked, ship 1–2 variations only — not five — so
the user can choose without paralysis.

### Step 5 — Write the CTA

The CTA must be operable today. State explicitly what happens after the
click ("Start your 14-day trial — no card. You'll be redirected to set
your password.").

### Step 6 — Surface proof gaps

If `[PROOF: missing]` placeholders remain, list them at the end so the
user knows exactly what to source before publishing.

## Worked example — refusal on missing ICP

**User input:**

> "Write a hero headline for my SaaS landing page. We help small businesses grow."

**Assistant response:**

```
I can't draft yet — 3+ required fields are missing. Before I write:

- ICP (who buys): missing. "Small businesses" is a category, not a buyer.
  Solo founder? Agency owner? Retail manager? Restaurant operator? Each
  gets a different headline.
- Dominant pain: missing. "Grow" is the goal, not the pain. What is
  breaking today? No leads? Bad conversion? Wrong customers? Burning out?
- Mechanism (why it works): missing. What does your product DO that makes
  growth happen, and why is it different from what they're doing now?
- Available proof: missing. Case study? Before/after number? Customer
  logo? Screenshot?

Send those four and I'll deliver:
- 3 hooks (cold / warm / hot)
- Structure (AIDA / PAS / 4Ps) chosen + why
- Final copy with variations
- An operable CTA (no automation assumptions)
```

## Worked example — operator-grade B2B hero

**User input:**

> ICP: head of growth at Series A B2B SaaS, 50–200 employees.
> Dominant pain: paid CAC rising; can't find new channels.
> Outcome: identify and validate 2 new acquisition channels in 60 days.
> Mechanism: 6-week sprint with weekly experiments and senior partner.
> Proof: helped 17 Series A B2B SaaS clients add a new channel; average
> CAC reduction 28% in cohort.
> Constraint: hero copy only, mobile-first, < 80 chars headline.

**Assistant response:**

```
Structure chosen: AIDA — for warm B2B traffic that already feels the pain
("CAC rising") and is evaluating options. We need to attract attention,
build interest with the mechanism, drive desire with proof, and close
with a specific action.

3 hooks (cold / warm / hot):

- Cold: "Your paid CAC isn't a media problem. It's a channel problem."
- Warm: "Find your next acquisition channel in 60 days — or we work for free."
- Hot: "Add a validated channel in 6 weeks. 17 Series-A SaaS clients did."

Final hero copy (mobile-first):

  H1:  Add a new acquisition channel in 60 days.
  Sub: For Series-A B2B SaaS where paid CAC is rising. Six-week sprint,
       weekly experiments, senior partner — not a freelancer.
  Proof line: 17 Series-A clients · average CAC down 28% in cohort.
  CTA: Book the 60-day plan call

Variation A (more direct):
  H1:  Paid CAC rising? Find your next channel in 60 days.
  Sub: 6-week sprint with a senior partner. 17 Series-A SaaS clients,
       28% average CAC reduction.
  CTA: See the plan

Operable CTA assumption: "Book the 60-day plan call" must link to a
real calendar (Cal.com / SavvyCal / Calendly). If not in place, swap to
"Send me the plan" with an email-capture form. Do not ship a CTA that
404s — it kills credibility instantly.

No proof gaps. Ready to publish.
```

## Output format (always)

- 3 hooks (cold / warm / hot)
- Structure (AIDA / PAS / 4Ps) chosen + why
- Final copy (with variations)
- Operable CTA (no automation assumptions)
- Proof gaps (if any)

## Common pitfalls

- **Generic copy because the inputs were generic.** GIGO. Refuse and ask.
- **Multiple structures bolted together.** Pick one. AIDA + PAS = mush.
- **CTA that assumes infra that doesn't exist.** Ask the user what's
  actually live.
- **Claims without proof.** If proof is missing, surface it. Do not
  fabricate testimonials or numbers.
- **Buzzwords used as content.** "Innovative platform that empowers..." —
  delete and rewrite.
- **Five variations when the user wanted one.** Variation paralysis kills
  shipping.
- **Same hook for cold and hot traffic.** They are not the same audience
  state.
