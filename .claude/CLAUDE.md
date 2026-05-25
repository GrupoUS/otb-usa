# Claude Code Behavioral Config — OTB USA

> Tier 1 — sempre carregado. Projeto específico: **OTB USA — Grupo US**.
> Leia o root `AGENTS.md` primeiro: @../AGENTS.md
> Subdirectory `AGENTS.md` só vale ao editar arquivos naquele subtree.

---

## Project identity

**Name:** OTB USA
**Parent brand:** Grupo US
**Purpose:** Landing estática do OTB Estados Unidos, MBA em Business Aesthetic Health com imersão internacional em Boston/EUA.

Stack: Astro 6 static-only · Bun · Tailwind CSS v4 · React 19 islands mínimas · Lucide · Playfair Display + Inter · pt-BR · static hosting.

Project metadata: `.claude/config.json`. Product/copy SSOT: `src/content/products/otb.json`. Brand/product skills: `otb-usa` + `otb-theme`.

---

## Behavior

- **Implementar direto, não só sugerir.**
- **Explicação mínima e técnica.**
- **Bun only:** `bun install`, `bun run`, `bunx`. Nunca `npm` / `yarn` / `pnpm`.
- **OTB-only:** não trazer rotas, produtos, copy, CTAs, memórias ou exemplos de outros projetos.
- **Referenciar regras aplicadas** quando relevante.

---

## Intent classification

| Type | Indicators | Action |
|---|---|---|
| Trivial L1–L2 | single file, padrão conhecido | direct fix |
| Explicit L3 | requisito claro | light plan → execute |
| Exploratory L4 | escopo ambíguo, múltiplas abordagens | discover → research → plan |
| Open-ended L5+ | decomposição ampla | `/plan` |

Autonomia quando a mudança é local, reversível, baseada em evidência e dentro da arquitetura atual. Perguntar antes de operações destrutivas, dependências novas, schema-shape relevante, deploy/produção ou ação externa visível.

---

## Cardinal rules

1. **Never assume correctness.** Verifique por docs oficiais, runtime/build ou evidência local antes de aplicar.
2. **Always debug after changes.** Gate padrão: `bun run lint && bunx astro check && bun run build`.
3. **NEVER use emojis as UI icons.** Lucide SVG only.
4. **NEVER use SPA/SSR.** Astro static MPA only — sem `ClientRouter`, sem `prerender = false`, sem SSR adapter.
5. **NEVER hardcode OTB copy in `.astro` / `.tsx`.** Copy do produto vive em `src/content/products/otb.json` e schema em `src/content.config.ts`.
6. **NEVER inline `wa.me/...`.** Usar `src/lib/whatsapp.ts`.
7. **NEVER hardcode hex** fora do bloco `@theme` em `src/styles/global.css`. Usar tokens semânticos.
8. **NEVER animate layout properties** (`width`, `height`, `top`, `left`, `padding`, `margin`). Motion: `transform` + `opacity`.
9. **MAIN-ONLY branch workflow.** Sempre editar em `main`. Não criar feature branches, `dev-test`, `feature/*`, `fix/*`. Sem force-push, sem auto-merge.

---

## Routing matrix

| Task touches | Load these | Implement in |
|---|---|---|
| OTB copy, FAQ, price, dates, legal/disclaimer | `otb-usa` + `astro` | `src/content/products/otb.json` |
| WhatsApp CTA/message | `otb-usa/references/whatsapp-ssot.md` | `src/content/products/otb.json` message; `src/lib/whatsapp.ts` only for number/helper |
| OTB landing section | `frontend.md` + `DESIGN.md` + `astro` + `otb-theme` | `src/components/landing/*.astro` |
| React island / floating UI | `astro` + `frontend.md` | `.tsx` only when interactivity is proven; prefer `client:idle`/`client:visible` |
| Content schema | `astro/references/content-collections.md` | `src/content.config.ts` + JSON in one change |
| SEO meta / JSON-LD / canonical | `seo.md` + `astro` | `src/layouts/Layout.astro`, `src/pages/otb.astro`, `astro.config.mjs` |
| Theme token / utility | `DESIGN.md` + `otb-theme` | `src/styles/global.css` `@theme` / utilities |
| FAQ behavior | `frontend.md` + `DESIGN.md § Motion` | `src/components/landing/FAQ.astro`; native/static first |
| Performance / Lighthouse | `stability.md` + `performance-optimization` | hydration audit, image priority, fonts, bundle |
| Agent prompt / command | `senior-prompt-engineer` | `.claude/agents/*.md`, `.claude/commands/*.md` |
| Anywhere | `stability.md` | universal checklist |

---

## Sequential thinking

Invoke before acting when L4+, multi-domain, 3+ dependent phases, irreversible architecture choice, cascade error, or confidence < 4 on root cause. Do not invoke for trivial direct edits.

---

## Stopping conditions

- Max 3 fix attempts on same hypothesis → evaluator Mode 3 / `/debug recover`.
- Max 5 agent spawns per request → checkpoint with user.
- Confidence < 3 on critical finding → flag assumption and ask.
- Scope expansion beyond OTB USA request → stop and confirm.
- Quality gate fails 2× consecutively → `/debug recover`.

---

## Decision authority

| Action | Authority |
|---|---|
| L1–L2 fixes, style/lint/type fixes | Autonomous |
| Schema additions, new dependency, file deletion | Confirm first |
| Production config, destructive ops, deploy | Always ask unless explicitly requested in current turn |

---

## Pointers

### Project-specific

- `.claude/config.json` — project metadata, tooling, gates, protected files.
- `Skill('otb-usa')` — product facts, audience, CTA, legal Harvard/Boston guardrails.
- `Skill('otb-theme')` — Navy/Gold dark-only visual canon.
- `Skill('astro')` → `references/otb-usa-overlay.md` — Astro static-only rules for this repo.

### Universal rules

- `.claude/rules/frontend.md` — Astro/component/hydration/a11y/frontend guardrails.
- `.claude/rules/DESIGN.md` — universal design do/don't.
- `.claude/rules/stability.md` — validation, anti-patterns, smoke thinking.
- `.claude/rules/seo.md` — locale, sitemap, OG/Twitter, JSON-LD, CWV.
- `.claude/rules/{astro,commit,mcp,commands}.md` — project execution overlays.

### Docs

- `PRODUCT.md` — product brief OTB USA.
- `DESIGN.md` — design index OTB USA.
- `README.md` — setup, structure, commands.
