# OTB USA — agent configuration reset

## Context

This repository is now scoped to **OTB USA — Grupo US**. Agent configuration must not inherit routes, products, CTAs, examples, or memory from other projects.

## Decisions

- Root guides rewritten for OTB USA: `AGENTS.md`, `.claude/CLAUDE.md`, `README.md`, `PRODUCT.md`, `DESIGN.md`.
- Project skills renamed to `otb-usa` and `otb-theme`.
- Astro project overlay renamed to `references/otb-usa-overlay.md`.
- Evolution profile renamed to `references/otb-profile.md`.
- `.claude/config.json` now identifies `otb-usa` and the canonical URL `https://otb.drasacha.com.br`.

## Validation target

```bash
bun run lint
bunx astro check
bun run build
```
