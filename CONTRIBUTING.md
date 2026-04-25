# Contributing

## Scope

This repo is for **Agent Skills** (`SKILL.md` format) under the DP standard:

- short project scan
- evidence before recommendation
- executable checklist

## How to contribute

1) Create a new skill at `skills/<skill-name>/SKILL.md`
2) Use the same front-matter format (`name`, `description`)
3) Follow the output standard in `docs/QUALITY_BAR.md`

## Minimum criteria (pull request)

- The skill does not guess the stack
- The skill does not require reading the whole repo
- The skill ships a validation checklist (even a simple one)
- The skill passes `npm run quality`
