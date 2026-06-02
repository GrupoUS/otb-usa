# Rules — Tier 2 Guardrails (GPUS Astro Landing)

> Tier-2 rules para **landings Astro do Grupo US** (Astro 6 + React 19 + Tailwind v4 + Bun + static-only MPA, deploy Vercel). Valores de instância em `.claude/config.json`.
> Project-specific values resolve from `.claude/config.json` + `Skill('astro')` + `Skill('gpus-theme')` + `Skill('grupo-us')`.

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
| Tailwind v4 `@theme` | `Skill('gpus-theme')` + `Skill('astro')` |

## Project signals

| Surface | Skill |
|---|---|
| Copy, CTA, público, oferta, legal do produto | `Skill('grupo-us')` |
| Navy/Gold dark-first token canon | `Skill('gpus-theme')` + `DESIGN.md` |
| WhatsApp SDR SSOT | `src/lib/whatsapp.ts` (prefixo `${lead.whatsappGreeting}`) |

## Cardinal rules

Non-negotiable invariants live in `.claude/CLAUDE.md § Cardinal rules`: Bun-only, main-only branch workflow (no feature branches), static MPA, Content Collections SSOT (`${content.productJson}`), WhatsApp SSOT, no hardcoded hex outside `@theme`, motion expressivo (qualquer propriedade) honrando `prefers-reduced-motion`, lead/PII com consent LGPD, tracking/endpoint via env.

## Scope guard

Não importar rotas, product copy, CTAs, exemplos ou memória de outros projetos. Modelo de design opcional = `${project.designModelRepo}`. Grupo US / Dra. Sacha é o contexto de marca.
