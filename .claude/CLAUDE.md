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

Stack: Astro 6 static-only · Bun · Tailwind CSS v4 · **zero ilhas** (sem React: `astro.config.mjs` removeu a integração — nenhum `.tsx`, nenhum `client:*` em `src`; volta junto com a primeira ilha real) · Lucide / SVG inline · Sora + Inter · `${project.locale}` · deploy Vercel static em `${project.productionUrl}`.

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
| Copy, FAQ, datas, oferta, legal/disclaimer | `grupo-us` + `graph-powers:astro` | `${content.productJson}` |
| WhatsApp CTA/message | `grupo-us` | `${content.productJson}` message; `${lead.whatsappHelper}` só para número/helper |
| Seção da landing | `frontend.md` + `DESIGN.md` + `graph-powers:astro` + `gpus-theme` | `src/components/landing/*.astro` |
| Design de seção/página (chain completo) | `impeccable` (4.x) + `gpus-theme` + `ui-ux-pro-max` | `/design`, `/design-improve`, `/design-fix` |
| Estrutura de landing, ordem de seções, headline/CTA, objeção, FAQ | `landing-page-design` **Part A only** (ver nota abaixo) + `grupo-us` | `${content.productJson}` + `src/components/landing/*.astro` |
| Audit / upgrade de landing existente ("está genérico", "parece feito por IA") | `redesign-existing-projects` **diagnóstico only** (ver nota abaixo) + `DESIGN.md` + `gpus-theme` | `/design-fix`, `/design-improve` |
| UX de conversão / objeção / oferta | `graph-powers:uxmaster` + `grupo-us` | `${content.productJson}` + seção correspondente |
| Tracking GA4/Pixel/GTM/consent | `seo.md` + `graph-powers:performance-optimization` | GTM inline em `src/layouts/Layout.astro`; evento de conversão em `src/pages/redirecionando.astro` (mudança = aprovação) |
| Captura de lead / payload / planilha | `frontend.md` + `stability.md` | `src/lib/leads.ts` + `src/lib/lead-client.ts` + `api/leads.ts` + Apps Script + `tests/` numa só mudança |
| Motion (reveal, parallax, marquee, countdown, trilho fixado) | `DESIGN.md § 9` | `src/scripts/motion.ts` (runtime único) + `global.css`; nunca um listener de scroll novo num componente |
| Ilha React / floating UI | `graph-powers:astro` + `frontend.md` | Hoje não existe ilha nenhuma. Adicionar `.tsx` = reinstalar a integração React em `astro.config.mjs` na mesma mudança, com interatividade provada; preferir Astro puro |
| Content schema | `astro/references/content-collections.md` | `src/content.config.ts` + JSON em uma mudança |
| SEO meta / JSON-LD / canonical | `seo.md` + `graph-powers:astro` | `src/layouts/Layout.astro`, `src/pages/index.astro`, `astro.config.mjs` |
| Theme token / utility | `DESIGN.md` + `gpus-theme` | `src/styles/global.css` `@theme` / utilities |
| FAQ behavior | `frontend.md` + `DESIGN.md § Motion` | `src/components/landing/FAQ.astro`; `<details>` nativo ou disclosure animado (height/grid livre) |
| Performance / Lighthouse | `stability.md` + `graph-powers:performance-optimization` | hydration audit, image priority, fonts, bundle |
| Agent prompt / command | `graph-powers:senior-prompt-engineer` | `.claude/agents/*.md`, `.claude/commands/*.md` |
| Anywhere | `stability.md` | universal checklist |

### Skills externas de design — o que vale e o que é sobrescrito

Duas skills globais da elayadesign estão instaladas: `landing-page-design` (construir landing nova) e `redesign-existing-projects` (auditar/melhorar landing existente). Ambas têm `description` larga e disparam sozinhas em quase qualquer trabalho de UI. **Neste repo as duas valem só pela metade estratégica.** As duas carregam o mesmo bloco de valores visuais (Geist/Manrope, hex literais, Phosphor, spacing próprio, escala do Tailwind) — esse bloco está sobrescrito nas duas.

#### `landing-page-design` — Part A only

Origem: `github.com/elayadesign/ai-design-skills`.

| Metade | Status aqui |
|---|---|
| **Part A — estratégia e estrutura** (A1 intake · A2 estrutura de página · A3 seleção de layout · A4 regras de conversão · A5 copywriting · A6 ordem de build seção a seção · A7 SEO/AEO · A8 pitfalls) | **Usar.** Complementa `grupo-us` + `PRODUCT.md`. Copy resultante vai para `${content.productJson}`, nunca hardcoded. |
| **Part B — sistema visual** (B1 tipografia/fontes · B2 spacing · B3 radius · B4 borders/backgrounds · B5 hero · B6 ícones · B7 motion · B11 tagline reveal) | **Ignorar.** Sobrescrito por root `DESIGN.md` + `.claude/rules/DESIGN.md` + `Skill('gpus-theme')`. |

Part B é ignorada porque colide de frente com as cardinal rules e com o canon visual:

| Part B manda | Vale aqui |
|---|---|
| Geist/Manrope/Poppins; "never use Inter" | Sora (headings) + Inter (body), via `@theme` |
| Ícones Phosphor/Solar/Iconamoon | Lucide ou SVG inline (`DESIGN.md § 6`, uma lib só) |
| Hex literais (`#181818`, `#9B9B9B`, gradiente de heading) | Cardinal rule 7 — zero hex fora do `@theme` de `src/styles/global.css`; usar tokens semânticos |
| "Never use gradients in backgrounds" | Glow/glass/profundidade dramática liberados (`DESIGN.md § 9`) |
| Tabela de spacing própria (2/4/8/12/16/24…) | Grid de 8px (`DESIGN.md § 4`) |
| `IntersectionObserver` próprio por seção, `whileInView` do Framer | Runtime único `src/scripts/motion.ts` + `[data-reveal]`; componente não abre listener/observer próprio (`astro.md § 9`) |
| Escala de tipo do Tailwind (`text-4xl`…) | Escala clamp em `@theme` (`gpus-theme`) |

B8 (content realism), B9 (states), B10 (ship requirements) não conflitam e servem como checklist extra — mas a autoridade continua sendo `DESIGN.md` + `.claude/rules/frontend.md`.

#### `redesign-existing-projects` — diagnóstico only

Origem: `github.com/elayadesign/redesign-skill`. Skill de auditoria: cada bullet é "sintoma → substituto". **O diagnóstico vale; o substituto não.**

| Metade | Status aqui |
|---|---|
| **Lentes de diagnóstico** — hierarquia fraca, tudo centralizado e simétrico, três colunas iguais de card, medida de parágrafo larga demais, ritmo vertical desalinhado, sombra sem direção de luz única, estados faltando, dead link, div soup, `alt` ausente, `z-index: 9999`, omissões estratégicas (404, legal, skip link, validação de form), `100vh` → `min-height: 100dvh` | **Usar.** Bom checklist de audit; roda antes de `/design-fix`. |
| **`# Design values`** (fim do arquivo) + todo bullet que nomeia valor concreto | **Ignorar.** A SSOT de valor visual aqui é `src/styles/global.css @theme` + root `DESIGN.md` + `Skill('gpus-theme')`. |

O skill diz "Never invent a design value. If it is not in Design Values, ask" — **aqui `Design Values` lê-se `@theme` + `DESIGN.md`**, não a seção dele.

Colisões diretas, além das já listadas em Part B acima:

| `redesign-existing-projects` manda | Vale aqui |
|---|---|
| "Lucide, Feather, Material Icons — these are the default AI choices. Replace." | **Lucide é obrigatório** (cardinal rule 3 + `DESIGN.md § 6`). Este bullet é o oposto da regra do repo. |
| Remover gradiente de background "of any kind" | Glow/glass/profundidade dramática liberados (`DESIGN.md § 9`) |
| "Animating `top`, `left`, `width`, `height` → switch to transform" | Cardinal rule 8 permite animar qualquer propriedade; `transform`/`opacity` é preferência, não regra |
| Trocar o padrão de FAQ accordion | `FAQ.astro` usa `<details>` nativo por decisão de rota — mudar = decisão de produto, não item de audit |
| Navbar docked → floating glass pill obrigatória | Decisão de produto, não regra. `Header.astro` como está. |
| Saturação de accent < 80%, um accent só | Gold sem teto de cobertura (`AGENTS.md § Design philosophy`) |
| `IntersectionObserver`/`whileInView` por componente | Runtime único `src/scripts/motion.ts` (`astro.md § 9`) |

Fluxo correto: rodar as lentes de diagnóstico → relatar → aplicar fix **via `/design-fix`**, com os valores vindo de `DESIGN.md` + `gpus-theme`. O skill também manda "report the diagnosis before applying fixes" — isso bate com o repo, manter.

#### Precedência

`AGENTS.md § Authority precedence` já põe `.claude/rules/*.md` e `.claude/CLAUDE.md` acima de qualquer skill. Esta nota existe para tornar isso explícito antes que as skills disparem sozinhas.

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
- `Skill('graph-powers:astro')` — Astro static-only patterns.
- `Skill('landing-page-design')` — **Part A only** (estrutura, copy de conversão, SEO/AEO). Part B sobrescrita por `DESIGN.md` + `gpus-theme` — ver § Routing matrix.
- `Skill('redesign-existing-projects')` — **diagnóstico only** (lentes de audit). Seção `Design values` e todo substituto concreto sobrescritos por `DESIGN.md` + `gpus-theme` — ver § Routing matrix.
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
