# Trusted Skill Sources

This file is the **live registry** consumed by `skill-finder` at runtime to decide
where to search and which sources are safe enough for direct install.

## How `skill-finder` uses this file

- Sources marked `trusted: true` may be **auto-installed** (skill writes the file
  after a 5-line preview and explicit user confirmation).
- Sources marked `trusted: false` are **preview-only**: the full `SKILL.md` is
  shown, and the user must say "yes, write it" before any file is written.
- Sources marked `kind: cli` are external tools the skill may invoke via Bash if
  they are installed locally.

## Format

Each entry is a fenced block with these fields:

- `name` — short label
- `url` — canonical URL (or local path)
- `kind` — `github-repo` | `github-search` | `cli` | `local`
- `trusted` — `true` | `false`
- `why` — one-line reason for inclusion

---

## Verified sources

```
name: anthropics/skills
url: https://github.com/anthropics/skills
kind: github-repo
trusted: true
why: Official Anthropic-maintained agent skills repo. Marketplace name: `anthropic-agent-skills`. Canonical install: `/plugin marketplace add anthropics/skills`.
```

```
name: vercel-labs/skills (CLI)
url: https://github.com/vercel-labs/skills
kind: cli
trusted: true
why: Official Vercel CLI for managing skills across 45+ agents. Skill-finder calls `npx skills find <query>` and `npx skills add --list` when available.
```

```
name: pinho-skills (this hub)
url: ./skills/INDEX.md
kind: local
trusted: true
why: This plugin's own catalog. Recommended only when it genuinely beats external options for the user's project.
```

```
name: GitHub Code Search (path:SKILL.md)
url: https://github.com/search?q=path%3ASKILL.md+sort%3Astars&type=code
kind: github-search
trusted: false
why: Wide net for community skills. Quality varies. Always preview before install.
```

---

## Adding new sources

Append a new fenced block above. Set `trusted: false` if you have not personally
vetted the source — `skill-finder` will require manual confirmation for every
install from that source.

When in doubt, default to `trusted: false`.
