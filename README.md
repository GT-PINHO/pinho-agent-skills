# pinho-skills

Anti-guessing, evidence-based agent skills for **Claude Code**.

> Not "skills that sound smart." Skills that **refuse to act without evidence**,
> **cite sources**, and ship with an **eval runner** that proves they deliver
> what they promise.

## Proof

Every push to `main` runs:

1. **Quality Gate** — validates structure of every `SKILL.md`, enforces required sections (`Purpose`, `Required inputs`, `Non-negotiables`, `Output format`), validates every `examples/*.md`, regenerates `skills/INDEX.md`, and fails CI if it drifted.
2. **Static evals** — for each skill's `examples/*.md`, verifies that the expected output covers every label declared in the skill's `Output format` section.

```bash
npm run quality      # static structure + index check
npm run evals        # static eval grade (no API needed)
npm run evals:live   # API call, structural grade against actual model output
npm run evals:judge  # API + LLM-as-judge for semantic match
```

Current state: **20 / 20 static evals passing across 12 skills.** CI is the public source of truth.

## Install (Claude Code)

```bash
# 1) Add this repo as a marketplace
/plugin marketplace add https://github.com/GT-PINHO/pinho-agent-skills

# 2) Install the plugin
/plugin install pinho-skills@pinho-skills
```

Skills become invokable as `/pinho-skills:<skill-name>` in any Claude Code session.

## Skills

12 skills in three clusters. See [`skills/INDEX.md`](skills/INDEX.md) for the full auto-generated catalog.

- **Discipline & routing:** `token-discipline`, `anti-sycophancy`, `project-memory`, `skill-finder`, `dev-ai-navigator`, `ux-audit-fast`
- **Growth ops (operator-grade):** `growth-os-router`, `paid-media-quant`, `tracker-signal`, `profit-engineer`, `lp-architect`, `deep-copywriting`

The growth-ops cluster is the differentiator — auction reading order with kill/scale rules, real unit-economics computation (LTV/CAC + payback), tracking audit with CAPI/dedup, message-match-first CRO, and a router that picks the lead specialist by dominant bottleneck.

## Auto-routing model selection

`token-discipline` ships a size→model rule:

- **S** (small project) → Haiku
- **M** (typical) → Sonnet
- **L** (monorepo / critical infra) → Opus

In a running session the coordinator delegates via subagents
(`Agent({ model: "haiku" | "sonnet" | "opus" })`) — the user never types `/model`.
For per-project static defaults, see [`docs/AUTO_ROUTING.md`](docs/AUTO_ROUTING.md).
For a runtime classifier outside Claude Code, see [`scripts/auto-route.mjs`](scripts/auto-route.mjs).

## Repo layout

```
public-skills/
├── .claude-plugin/         plugin.json + marketplace.json (Claude Code install)
├── .github/workflows/      Quality Gate + static evals on every push/PR
├── docs/                   QUALITY_BAR.md, AUTO_ROUTING.md, SOURCES.md
├── scripts/                quality-gate.mjs, run-evals.mjs, auto-route.mjs
├── skills/                 12 skills, each with SKILL.md (+ examples/ where relevant)
│   └── INDEX.md            auto-generated; do not edit by hand
├── CONTRIBUTING.md
├── LICENSE                 Apache-2.0
└── package.json
```

## Stance

- **No guessing.** Every recommendation cites evidence (file/signal/source).
- **No sycophancy.** A skill that finds a weak premise refuses to endorse it.
- **No silent fabrication.** If a skill can't fulfill its non-negotiables, it asks for the missing input or stops.
- **No marketing claims without proof.** Every promise here is exercised by an eval.

## License

Apache-2.0 — see [`LICENSE`](LICENSE).
