---
description: Load the right GPUS Astro landing context before implementation, design, debugging, or verification.
---

# /prime — ${project.displayName} Context Loader

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
| Design/UI/visual polish | `Skill("gpus-theme")`, `Skill("ui-ux-pro-max")` |
| Product/copy/CTA/legal | `Skill("grupo-us")` |
| Build/runtime bug | `Skill("debugger")`, `Skill("astro")` |
| Perf/SEO/a11y/security | `Skill("performance-optimization")`, `.claude/rules/seo.md` |
| Planning/decomposition | `Skill("planning")` |

## 2. Project invariants to keep in context

- ${project.displayName} (GPUS Astro landing, Dra. Sacha Gualberto); Grupo US is the parent brand.
- Product copy source of truth: `${content.productJson}`.
- WhatsApp source of truth: `src/lib/whatsapp.ts`; messages start with `${lead.whatsappGreeting}`.
- Conversão é **WhatsApp-only** (`lead.leadFlow`): não há formulário, endpoint ou banco. CTA primário único = "Falar com Laura no WhatsApp".
- Tracking IDs viveriam em env (`${tracking.ga4Env}`, `${tracking.pixelEnv}`) — hoje **não instrumentados**; adicionar = aprovação.
- Rota única `/` + redirect `/otb` → `/`. Não existem páginas legais nem `/404` neste repo.
- Astro static MPA only; no SPA router or SSR; zero ilha React hoje.
- Superfície = modo **Persuade** (impeccable 4.x).
- Bun only.

## 3. Output

Return a concise context summary:

- Mode selected.
- Rules/skills loaded.
- Files likely relevant.
- Validation gate to run.
