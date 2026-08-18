# Claude Code Behavioral Config — GPUS Astro Landing

> Tier 1 — sempre carregado. Camada **genérica e portável** para landings Astro do **Grupo US · Dra. Sacha Gualberto**.
> Valores de instância vivem em `.claude/config.json`, lidos via `${...}` (ex.: `${project.displayName}`, `${content.productJson}`, `${lead.whatsappGreeting}`).
> Leia o root `AGENTS.md` primeiro: @../AGENTS.md
> Subdirectory `AGENTS.md` só vale ao editar arquivos naquele subtree (ex.: `src/AGENTS.md`).

---

## Project identity

**Name:** `${project.displayName}` (config: `project.displayName`)
**Parent brand:** Grupo US · Dra. Sacha Gualberto
**Purpose:** `${project.purpose}` — landing estática premium (config: `project.purpose`).

Stack: Astro 6 static-only · Bun · Tailwind CSS v4 · React 19 (islands mínimas — preferir zero ilha) · Lucide / SVG inline · Sora + Inter · `${project.locale}` · deploy Vercel static em `${project.productionUrl}`.

Project metadata: `.claude/config.json`. Product/copy SSOT: `${content.productJson}`. Schema: `src/content.config.ts`. Brand skills: `gpus-theme` (Navy/Gold — **esta landing diverge: escala `ink` preta, ver root `DESIGN.md § 2`**) + `grupo-us` (copy/funil drasacha). Sistema de design: root `DESIGN.md`; posicionamento/conversão: root `PRODUCT.md`.

---

## Behavior

- **Implementar direto, não só sugerir.**
- **Explicação mínima e técnica.**
- **Bun only:** `bun install`, `bun run`, `bunx`. Nunca `npm` / `yarn` / `pnpm`.
- **Escopo do produto:** não trazer rotas, produtos, copy, CTAs ou exemplos de outros projetos GPUS. Modelo de design opcional = `${project.designModelRepo}` quando definido.
- **Referenciar regras aplicadas** quando relevante.

---

## Intent classification

| Type | Indicators | Action |
|---|---|---|
| Trivial L1–L2 | single file, padrão conhecido | direct fix |
| Explicit L3 | requisito claro | light plan → execute |
| Exploratory L4 | escopo ambíguo, múltiplas abordagens | discover → research → plan |
| Open-ended L5+ | decomposição ampla | `/plan` |

Autonomia quando a mudança é local, reversível, baseada em evidência e dentro da arquitetura atual. Perguntar antes de operações destrutivas, dependências novas, schema-shape relevante, **destino de lead/form**, **pixel/tag/IDs de tracking**, deploy/produção ou ação externa visível.

---

## Cardinal rules

1. **Never assume correctness.** Verifique por docs oficiais, runtime/build ou evidência local antes de aplicar.
2. **Always debug after changes.** Gate padrão: `bun run lint && bunx astro check && bun run build`.
3. **NEVER use emojis as UI icons.** Lucide ou SVG inline only.
4. **NEVER use SPA/SSR.** Astro static MPA only — sem `ClientRouter`, sem `prerender = false`, sem SSR adapter.
5. **NEVER hardcode copy do produto em `.astro` / `.tsx`.** Copy vive em `${content.productJson}`; schema em `src/content.config.ts`. Adicionar campo = schema + JSON + leitor numa mudança.
6. **NEVER inline `wa.me/...`.** Usar `${lead.whatsappHelper}` (`whatsappUrlWithText`, `whatsappUrlBase`). Toda mensagem começa com `${lead.whatsappGreeting}`.
7. **NEVER hardcode hex** fora do bloco `@theme` em `src/styles/global.css` (exceção documentada: `<meta theme-color>` literal espelhando `--color-navy`). Usar tokens semânticos.
8. **Motion livre e expressivo.** Animar qualquer propriedade é permitido (incl. `width`/`height`/`top`/`left`/`padding`/`margin`) e `transition: all` é permitido. Profundidade marcante, sombras dramáticas, glow e glass liberados — sem teto de gold. Preferir `transform`/`opacity` quando o efeito for equivalente (anima sem jank), mas não obrigatório. Único requisito: honrar `prefers-reduced-motion` (a11y). Reveal via `[data-reveal]` + IntersectionObserver (gate `.js`).
9. **MAIN-ONLY branch workflow.** Sempre editar em `main`. Sem feature branches, sem force-push, sem auto-merge. Deploy/push só quando pedido.
10. **Conversão form → WhatsApp; PII com cuidado.** O fluxo é `lead.leadFlow: "form-then-whatsapp"`: as duas superfícies de captura (`LeadFormDialog.astro` modal + `Aplicacao.astro` inline) fazem `POST /api/leads` → Apps Script → planilha, gravam o hand-off em `sessionStorage` e passam por `/redirecionando`, que dispara `lead_submit` no GTM antes de abrir o WhatsApp da SDR. **Mudar o payload do lead** (campo novo, campo opcional) = mexer em `src/lib/leads.ts` + `api/leads.ts` + `integrations/google-apps-script/otb-leads/Code.js` + `tests/` na mesma mudança; se mexer em `LEAD_SHEET_HEADERS`, a planilha existente também precisa migrar. Todo campo novo carrega `<label>` real, validação, erro acessível e consent LGPD. Segredos e IDs de tracking vivem em env; instrumentar tracking novo = aprovação.

---

## Routing matrix

| Task touches | Load these | Implement in |
|---|---|---|
| Copy, FAQ, datas, oferta, legal/disclaimer | `grupo-us` + `astro` | `${content.productJson}` |
| WhatsApp CTA/message | `grupo-us` | `${content.productJson}` message; `${lead.whatsappHelper}` só para número/helper |
| Seção da landing | `frontend.md` + `DESIGN.md` + `astro` + `gpus-theme` | `src/components/landing/*.astro` |
| Design de seção/página (chain completo) | `impeccable` (4.x) + `gpus-theme` + `ui-ux-pro-max` | `/design`, `/design-improve`, `/design-fix` |
| UX de conversão / objeção / oferta | `uxmaster` + `grupo-us` | `${content.productJson}` + seção correspondente |
| Tracking GA4/Pixel/GTM/consent | `seo.md` + `performance-optimization` | GTM inline em `src/layouts/Layout.astro`; evento de conversão em `src/pages/redirecionando.astro` (mudança = aprovação) |
| Captura de lead / payload / planilha | `frontend.md` + `stability.md` | `src/lib/leads.ts` + `src/lib/lead-client.ts` + `api/leads.ts` + Apps Script + `tests/` numa só mudança |
| Motion (reveal, parallax, marquee, countdown, trilho fixado) | `DESIGN.md § 9` | `src/scripts/motion.ts` (runtime único) + `global.css`; nunca um listener de scroll novo num componente |
| React island / floating UI | `astro` + `frontend.md` | `.tsx`/`.astro` só quando interatividade provada; preferir Astro puro |
| Content schema | `astro/references/content-collections.md` | `src/content.config.ts` + JSON em uma mudança |
| SEO meta / JSON-LD / canonical | `seo.md` + `astro` | `src/layouts/Layout.astro`, `src/pages/index.astro`, `astro.config.mjs` |
| Theme token / utility | `DESIGN.md` + `gpus-theme` | `src/styles/global.css` `@theme` / utilities |
| FAQ behavior | `frontend.md` + `DESIGN.md § Motion` | `src/components/landing/FAQ.astro`; `<details>` nativo ou disclosure animado (height/grid livre) |
| Performance / Lighthouse | `stability.md` + `performance-optimization` | hydration audit, image priority, fonts, bundle |
| Agent prompt / command | `senior-prompt-engineer` | `.claude/agents/*.md`, `.claude/commands/*.md` |
| Anywhere | `stability.md` | universal checklist |

---

## Sequential thinking

Invoke before acting when L4+, multi-domain, 3+ dependent phases, irreversible architecture choice, cascade error, ou confidence < 4 no root cause. Não invocar para edits triviais.

---

## Stopping conditions

- Max 3 fix attempts no mesmo hipótese → evaluator Mode 3 / `/debug recover`.
- Max 5 agent spawns por request → checkpoint com usuário.
- Confidence < 3 em finding crítico → flag assumption e pergunte.
- Scope expansion além do request → pare e confirme.
- Quality gate falha 2× seguidas → `/debug recover`.

---

## Decision authority

| Action | Authority |
|---|---|
| L1–L2 fixes, style/lint/type fixes | Autonomous |
| Schema additions, new dependency, file deletion | Confirm first |
| Destino de lead/form, IDs de pixel/tag, env vars | Confirm first |
| Production config (`astro.config.mjs`, `vercel.json`), destructive ops, deploy | Always ask unless explicitly requested in current turn |

---

## Pointers

### Project-specific

- `.claude/config.json` — instância (nome, domínio, slug, SDR, rotas, tracking), tooling, gates, protected files.
- `Skill('grupo-us')` — marca, copy, público, funil drasacha, voz Dra. Sacha.
- `Skill('gpus-theme')` — Navy/Gold dark-first visual canon.
- `Skill('astro')` — Astro static-only patterns.
- root `DESIGN.md` / `PRODUCT.md` — sistema de design + posicionamento GPUS.
- Modelo de design opcional: `${project.designModelRepo}`.

### Universal rules

- `.claude/rules/frontend.md` — Astro/component/hydration/a11y/frontend guardrails.
- `.claude/rules/DESIGN.md` — universal design do/don't.
- `.claude/rules/stability.md` — validation, anti-patterns, smoke thinking.
- `.claude/rules/seo.md` — locale, sitemap, OG/Twitter, JSON-LD, CWV.
- `.claude/rules/{astro,commit,mcp,commands}.md` — project execution overlays.

### Docs

- `README.md` — setup, structure, commands.
- `docs/<project>-changelog.md` — histórico da instância.
