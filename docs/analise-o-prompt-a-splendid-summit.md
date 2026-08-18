# OTB USA — Landing v2 (motion + narrativa de conversão)

## Context

O projeto Claude Design **"Melhoria landing page OTB USA"** (`d202d0db-72c0-471b-8927-edb193d4a0f2`)
contém um protótipo v2 (`OTB USA Landing v2.dc.html`, 1474 linhas) e o spec escrito
(`PROMPT-claude-code-v2.md`). A landing atual já está no direcionamento certo — Sora/Inter, Navy/Gold +
crimson, plaquetas numeradas, galeria com lightbox, parallax, contadores, zero islands. O que o v2
acrescenta são **duas camadas**:

1. **Narrativa de conversão** — seções que não existem hoje: "O ponto de virada" (tensão antes da oferta),
   formulário de aplicação inline e barra de transparência.
2. **Camada de movimento** — countdown ao vivo, entrada em cascata no hero, marquees, trilho horizontal
   fixado em Boston, shine nos CTAs, fade do hero, sticky CTA em todas as larguras.

Resultado esperado: mesma stack (Astro 6 static MPA, Tailwind v4 `@theme`, Bun, Vercel), mesmo design
system, mais superfície de conversão e um runtime de motion único, acessível e sem biblioteca externa.

> **Procedência do protótipo:** o conteúdo do `.dc.html` foi lido via `DesignSync`. O protótipo é um
> arquivo DC (`<x-dc>`, `sc-if`, `{{ }}`, `style-hover`) com **zero CSS custom properties** e ~1000
> atributos `style=` inline — ele é referência de comportamento e copy, **não** fonte de código. Também
> diverge do repo em pontos que **não** estão no escopo do spec (5 speakers vs 4, 11 itens em `#publico`
> vs 6, 10 fotos na galeria vs 6, fotos retiradas). Autoridade de implementação = `PROMPT-claude-code-v2.md`
> + o código atual do repo.

---

## Decisões travadas

| Tema | Decisão |
|---|---|
| Formulário `#inscricao` | Seção nova **reusa o pipeline existente**: `POST /api/leads` → `sessionStorage` → `/redirecionando` → `dataLayer.lead_submit` → WhatsApp. O "abre wa.me direto, nada armazenado" do protótipo **não** é implementado — seria regressão de captação e de tracking. |
| Profissão / Momento | Entram **só na mensagem do WhatsApp**, não no payload da API. Zero mudança em `LEAD_SHEET_HEADERS`, Apps Script ou planilha. |
| E-mail | **Opcional** no novo form — exige relaxar `normalizeEmail`/`validateLeadSubmission` em `src/lib/leads.ts` e atualizar `tests/leads-api.test.ts`. |
| Depoimentos (plaqueta 08) | **Adiada.** As 3 falas do protótipo são anônimas e não verificadas — o próprio spec proíbe publicá-las. |
| Escopo | v2 completo, em 5 fases commitáveis. |
| Branch | **main-only**, commits pequenos por fase, sem push/deploy até pedido explícito. |

---

## Divergências spec ↔ repo (adaptações obrigatórias)

| Spec / protótipo | Repo | Ação |
|---|---|---|
| `pnpm build`, Cloudflare Pages | Bun + Vercel (`vercel.json`, `api/leads.ts` runtime node) | Gates: `bun run lint && bunx astro check && bun run build` |
| branch `feat/v2-motion-conversao` + PR | main-only (`.claude/CLAUDE.md` #9) | commits diretos em `main` |
| Tokens listados como hex literal | Idênticos já em `src/styles/global.css @theme` | **nunca** hex novo em `.astro`; usar `var(--color-*)` / utilities |
| `wa.me/556294705081` hardcoded no protótipo | `src/lib/whatsapp.ts` (SSOT, arquivo protegido) | script da seção nova é `<script>` bundled que **importa** `whatsappUrlWithText`; o arquivo protegido não muda |
| Fotos `networking-1`, `pratica-2`, `turma-harvard-outono`, `aula-2`, `turma-completa-boston` | retiradas / inexistentes (`src/assets/images/_retired/README.md` — wordmark HARVARD legível, issue WS-73, e uma retirada a pedido do cliente) | **não reintroduzir**. Acervo: `aula-1`, `networking-3`, `pratica-1`, `pratica-3`, `turma-evento-1/2/3` |
| 5 speakers (inclui Kassyo) | 4 speakers no JSON | fora de escopo; não mexer |
| "320 horas" / "10 módulos" em texto fixo | `programa.horas`, `modulos.lista` | ler do SSOT |
| `_scan()` a cada 350ms por 12s | — | workaround do editor DC; substituir por um passe pós-mount + IntersectionObserver |

---

## Ordem final e numeração

Numeração **contígua 01–11** (sem buraco): com Depoimentos adiada, pular o `08` deixaria um furo visível.
`SectionHeader.astro` já recebe `numeral` como prop — renumerar é trocar a string.

| # | Seção | Componente | Estado |
|---|---|---|---|
| — | Header + ScrollProgress | `Header.astro`, `ScrollProgress.astro` | + link "Aplicação" no nav |
| — | Hero `#topo` | `Hero.astro` | **modificar** — countdown, cascata, 2º glow parallax, fade |
| — | Certificações | `Certificacoes.astro` | **modificar** — marquee infinito |
| 01 | O ponto de virada `#virada` | `Virada.astro` **novo** | novo |
| 02 | Por que o OTB | `WhyOTB.astro` | renumerar |
| 03 | Para quem é | `TargetAudience.astro` | renumerar |
| 04 | Programa completo | `Programa.astro` | renumerar |
| 05 | Trilha online / módulos | `Modulos.astro` | renumerar |
| 06 | Imersão Boston `#boston` | `Boston.astro` | **modificar** — trilho horizontal fixado + 4º card CTA |
| 07 | Histórico / galeria | `Turmas.astro` | renumerar |
| 08 | Especialistas | `Speakers.astro` | renumerar |
| 09 | Investimento | `Investimento.astro` | **modificar** — countdown no card, parallax no glow |
| 10 | Aplicação `#inscricao` | `Aplicacao.astro` **novo** | novo |
| 11 | FAQ | `FAQ.astro` | renumerar |
| — | Parceiros | `Parceiros.astro` | mantém (sem numeral) |
| — | Barra de transparência | `Transparencia.astro` **novo** | novo |
| — | CTA final | `FinalCta.astro` | + `data-shine` |
| — | Footer | `Footer.astro` | + link Aplicação |
| — | Sticky + WhatsApp | `StickyCta.astro`, `WhatsAppFloatingButton.astro` | **modificar** |

Âncoras novas: `#virada`, `#inscricao` — entram em `header.nav`, `footer.nav` e em `.claude/config.json`
(`content.anchors` + `content.sections`).

---

## Fase 0 — conteúdo (SSOT primeiro)

Toda copy nova entra em `src/content/products/otb.json` **e** no schema `src/content.config.ts` na mesma
mudança (cardinal #5). `content.config.ts` é arquivo protegido: razão explícita = campos novos do v2.

Blocos novos:

- `virada{ kicker, headline, highlight, paragrafo, quote, listaTitulo, lista[4]{ titulo, descricao } }`
- `aplicacao{ kicker, headline, highlight, descricao, passos[3], formTitulo, profissoes[6], momentos[4],
  submitLabel, microcopy, sucesso{ titulo, texto, ctaLabel, resetLabel }, whatsappPrefacio }`
  → reusa `leadForm.fields` / `leadForm.consent` / `leadForm.validationError` / `genericError`
  em vez de duplicar copy de formulário.
- `transparencia[3]{ icone, titulo, texto }` — `shield-check`, `graduation-cap`, `message-circle` **já
  existem** em `src/components/icons/icon-paths.ts`.
- `countdown{ target: "2027-04-19T09:00:00-04:00", heroKicker, investimentoKicker, stickyPrefixo }`.
- `header.nav` + `footer.nav`: `{ label: "Aplicação", href: "#inscricao" }`.

Copy verbatim do spec §3 (virada), §7 (aplicação) e §8 (transparência) — mantendo intactos os textos de
compliance existentes (sem vínculo/patrocínio/endosso; MBA IESA/Grupo US + ASA).

## Fase 1 — runtime de motion

Hoje há **quatro** listeners de scroll independentes: `src/scripts/motion.ts` (parallax),
`ScrollProgress.astro`, `Header.astro`, `StickyCta.astro`. O v2 exige um só.

1. Consolidar em `src/scripts/motion.ts`: **um** `scroll {passive:true}` com throttle por
   `requestAnimationFrame` + um `resize` que remede. Os scripts inline dessas 3 seções viram atributos
   (`data-progress`, `data-header`, `data-sticky-cta`, `data-float-wa`) lidos pelo runtime.
2. Comportamentos novos: `data-enter="n"` (cascata no load, 700ms, delay `n×0.06s`), `data-marquee`
   (+`data-marquee-dur`, duplica filhos com `aria-hidden`, pausa no `pointerenter`), `data-shine`,
   `data-hpin`/`-vp`/`-track`/`-rail`/`-bar`, `data-cd`/`data-cd-mini`/`data-cd-wrap`, `data-hero-fade`,
   e os reveals `mask`/`wipe` (`clip-path: inset(0 0 100% 0)` → `inset(0)`).
3. `prefers-reduced-motion: reduce` desliga **tudo** — `initMotion()` já faz early-return; garantir que
   cada fallback é o estado estático correto: marquee vira `flex-wrap`, pin vira carrossel `scroll-snap`,
   reveals ficam visíveis. **Exceção:** o countdown continua rodando — é informação, não enfeite.
4. Sem GSAP/Framer/Lenis, sem `scrollIntoView`, sem `will-change` persistente.
5. `@keyframes` novos em `global.css`: `otbMarquee`, `otbShine`, `otbPing` (os `reveal-*`, `gold-pulse`,
   `shimmer` existentes ficam; `otbHalo` já tem equivalente em `.gold-pulse-glow`).

Arquivos: `src/scripts/motion.ts`, `src/styles/global.css`, `ScrollProgress.astro`, `Header.astro`,
`StickyCta.astro`, `src/layouts/Layout.astro`.

## Fase 2 — seções novas

**`src/components/landing/Virada.astro`** — `#virada`, `band-deep`, 2 colunas (`flex-wrap`,
gap `clamp(40px,5vw,80px)`). Foto `aula-1.jpg` via `<Picture>` + `resolveImage`, `opacity .15`,
`grayscale(1) contrast(1.1)`, wrapper com `data-parallax data-speed="0.09"` (o wrapper transforma, a
imagem não — `stability.md § triage`). `SectionHeader numeral="01"`, H2 com `data-reveal="mask"`,
blockquote com borda gold 2px, e `<ol>` de 4 travas com o mesmo hover de `Modulos.astro`.

**`src/components/landing/Aplicacao.astro`** — `#inscricao`, `band-alt`, 2 colunas; card usando
`glass-card-bright`. Campos: **Nome** (required), **E-mail** (opcional), **WhatsApp** (required, máscara
progressiva `(00) 00000-0000`), **Profissão** (select required), **Momento** (select required) + consent
LGPD (o mesmo de `leadForm.consent`) + honeypot + `form_started_at`.
Submit: extrair o handler compartilhado de `LeadFormDialog.astro` para `src/lib/lead-client.ts` (que já
existe e já hospeda `createSubmissionGate`/`isCompleteLeadName`) em vez de duplicar ~300 linhas.
Fluxo: valida → `POST /api/leads` com o payload **atual** (sem profissão/momento) → compõe a mensagem do
WhatsApp com os 4 campos → grava o handoff em `sessionStorage` → `/redirecionando`.
Estado de sucesso in-place para o caso de `sessionStorage` indisponível. Registrar `"aplicacao"` em
`LEAD_CTA_ORIGINS` (`src/lib/leads.ts`) — o Apps Script tem a mesma allowlist e precisa do mesmo valor.

**`src/components/landing/Transparencia.astro`** — sem id, `band-deep`, `border-top` gold 14%,
3 itens em `grid auto-fit minmax(260px,1fr)`, ícone Lucide 18px gold + título + linha muted.

## Fase 3 — seções modificadas

- **Hero** — countdown `<dl aria-label="Tempo restante para a imersão">` (sem `aria-live`) com ponto
  crimson + anel `otbPing`; `data-enter="1..8"` na cascata; segundo glow crimson `data-speed="0.1"`;
  `data-hero-fade` no wrapper de conteúdo; `data-shine` no CTA primário.
- **Certificações** — grid → `<ul data-marquee data-marquee-dur="30">`, seção `overflow:hidden`.
- **Boston** — os 3 dias de `agenda` + um 4º card de CTA passam para trilho `data-hpin` (≥900px,
  `position:sticky; height:100svh; max-height:820px`), com barra de progresso; fallback mobile/reduced =
  `overflow-x:auto` + `scroll-snap-type:x mandatory`. Plate "19–21" e a foto grande revelam com
  `data-reveal="wipe"`. Card 4 usa mensagem WhatsApp própria no JSON (prefixo `Olá, Laura!`).
- **Investimento** — glow ganha `data-parallax data-speed="0.05"` com `inset:-8% 0`; countdown de 3
  unidades acima de "Parcelamento"; `data-shine` no CTA.
- **Sticky / WhatsApp** — sticky em todas as larguras (remover `lg:hidden`), `body{padding-bottom}`
  reservado desde o primeiro paint em **todas** as larguras (CLS 0); float WhatsApp recolhe no mesmo
  limiar (`scrollY > 0.8 × innerHeight`) com `pointer-events:none`; `data-cd-mini` no formato `244d 07h 12m`.
- **FinalCta / Footer / Header** — `data-shine` no botão final; nav com "Aplicação".

## Fase 4 — backend, a11y, gates e docs

- `src/lib/leads.ts`: e-mail opcional (`normalizeEmail` aceita `""`; guard deixa de exigir `email`) +
  `"aplicacao"` em `LEAD_CTA_ORIGINS`. Espelhar a allowlist em
  `integrations/google-apps-script/otb-leads/Code.js` (não muda `HEADERS_`, então a planilha fica intacta).
  Atualizar `tests/leads-api.test.ts` e `tests/apps-script-writer.test.ts`.
- Contraste AA em toda copy nova; foco `2px solid var(--color-gold)` (já global); alvos ≥ 44px.
- Marquees e camadas decorativas `aria-hidden="true"`; imagens decorativas `alt=""`.
- Form: `<label>` real por campo, `required` nativo, erro legível, placeholder nunca como única label.
- Sem escassez numérica inventada. Urgência permitida: countdown para 19 abr 2027, lote ativo,
  "Lote 2 liberado por volume ou data".
- Atualizar `DESIGN.md` (nova ordem de seções + tabela de atributos de motion + regra de urgência),
  `.claude/config.json` (âncoras/seções/componentes novos, `lead.leadFlow`) e `docs/learnings-log.md`.

---

## Verificação

```bash
bun run lint
bunx astro check
bun run build
bun test            # tests/leads-api.test.ts, tests/apps-script-writer.test.ts
```

Manual, com `bun run dev`:

1. Hero: cascata visível no load, countdown correto em `America/New_York`, dois glows em parallax, fade ao rolar.
2. Boston: 4 cards percorridos no scroll a ≥1024px com a barra acompanhando, sem salto na entrada/saída do
   pin; carrossel com snap a 390px.
3. Marquees rodando e pausando no hover; `document.scrollWidth === document.documentElement.clientWidth`
   em 1440×900, 1024×768 e 390×844.
4. `#inscricao`: validação nativa bloqueia envio vazio; envio válido chama `/api/leads`, grava o handoff e
   chega em `/redirecionando` com `dataLayer.lead_submit`; mensagem do WhatsApp traz Nome, WhatsApp,
   Profissão e Momento.
5. Sticky aparece a 80% da viewport em todas as larguras; flutuante recolhe junto; footer não fica coberto.
6. DevTools → Rendering → `prefers-reduced-motion: reduce`: página 100% legível e estática (countdown segue).
7. Console limpo nos 3 viewports.
8. `bun run lighthouse:audit` — Performance ≥ 85 mobile, A11y ≥ 95, CLS < 0.05.
9. Gate manual (`.claude/rules/commit.md`): nenhum hex fora de `global.css`, nenhum `wa.me/` fora de
   `src/lib/whatsapp.ts`, nenhuma copy hardcoded em `.astro`, nenhum `console.log`.

## Fora de escopo

- Seção de depoimentos (aguarda copy real autorizada, com nome e edição).
- Reintrodução das fotos retiradas em `src/assets/images/_retired/` e das que não existem no repo.
- Alterações em `#publico`, `#speakers` e `#turmas` além da renumeração.
- Novos IDs ou eventos de tracking além do `lead_submit` já instrumentado.
- Push, deploy e PR.
