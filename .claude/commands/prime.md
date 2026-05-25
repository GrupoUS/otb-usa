---
description: Load the right OTB USA context before implementation, design, debugging, or verification.
---

# /prime — OTB USA Context Loader

**ARGUMENTS**: $ARGUMENTS

Use when the task scope is unclear, cross-domain, or L3+.

## 0. Always load

- `AGENTS.md`
- `.claude/CLAUDE.md`
- `.claude/config.json`

## 1. Mode routing

| Mode / signal | Load |
|---|---|
| `frontend`, Astro, `.astro`, `src/**` | `.claude/rules/frontend.md`, `.claude/rules/DESIGN.md`, `.claude/rules/astro.md`, `Skill("astro")` |
| Design/UI/visual polish | `Skill("otb-theme")`, `Skill("ui-ux-pro-max")` |
| Product/copy/CTA/legal | `Skill("otb-usa")` |
| Build/runtime bug | `Skill("debugger")`, `Skill("astro")` |
| Perf/SEO/a11y/security | `Skill("performance-optimization")`, `.claude/rules/seo.md` |
| Planning/decomposition | `Skill("planning")` |

## 2. Project invariants to keep in context

- OTB USA only; Grupo US is the parent brand, not a replacement scope.
- Product copy source of truth: `src/content/products/otb.json`.
- WhatsApp source of truth: `src/lib/whatsapp.ts`; messages start with `Olá, Laura!`.
- Harvard can be referenced only as geographic/institutional context, with no affiliation/endorsement/certification claim.
- Astro static MPA only; no SPA router or SSR.
- Bun only.

## 3. Output

Return a concise context summary:

- Mode selected.
- Rules/skills loaded.
- Files likely relevant.
- Validation gate to run.
