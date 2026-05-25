# Rules — Tier 2 Guardrails (OTB USA)

> Tier-2 rules for **OTB USA** (Astro 6 + React 19 + Tailwind v4 + Bun + static-only MPA).
> Project-specific values resolve from `.claude/config.json` + `Skill('astro')` + `Skill('otb-theme')` + `Skill('otb-usa')`.

## Files

| File | Scope |
|---|---|
| `frontend.md` | Component placement, Astro `client:*`, Content Collections SSOT, forms, perf, a11y |
| `DESIGN.md` | Color tokens, typography, components, motion, imagery, depth, focus |
| `stability.md` | Validation checklist, render-mode invariants, CWV gates, anti-patterns, debug triage |
| `seo.md` | pt-BR locale, sitemap, robots, OG/Twitter, JSON-LD, CWV, AI citation |
| `astro.md` | Astro static-only invariants, hydration table, Content Collections SSOT, `Layout.astro` contracts |
| `commit.md` | Conventional Commits + lefthook + manual gate checklist |
| `mcp.md` | MCP inventory, terminal discipline, debug loop |
| `commands.md` | Slash commands + skill order + agent pairings |

## Stack signals

| Surface | Skill / Rule |
|---|---|
| `*.astro`, Content Collections, `client:*`, `astro.config.mjs` | `Skill('astro')` + `.claude/rules/astro.md` |
| React 19 islands (`*.tsx`) | `Skill('astro')` |
| Tailwind v4 `@theme` | `Skill('otb-theme')` + `Skill('astro')` |

## Project signals

| Surface | Skill |
|---|---|
| OTB USA product facts, copy, CTA, audience, legal | `Skill('otb-usa')` |
| Navy/Gold dark-only token canon | `Skill('otb-theme')` |
| WhatsApp Laura SSOT | `Skill('otb-usa')` → `references/whatsapp-ssot.md` |

## Cardinal rules

Non-negotiable invariants live in `.claude/CLAUDE.md § Cardinal rules`: Bun-only, main-only branch workflow (no feature branches), static MPA, Content Collections SSOT, WhatsApp SSOT, no hardcoded hex outside `@theme`, no layout-property animation.

## OTB-only guard

Do not import routes, product copy, CTAs, examples or memory from non-OTB projects. Grupo US is parent-brand context only.
