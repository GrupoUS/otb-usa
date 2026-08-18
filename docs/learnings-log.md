# OTB USA — Learnings log

> Append-only chronological project decisions. New entries on top.

---

### [2026-08-18] O protótipo renderizado ganha do prompt que o descreve

**Problem:** A v2 tinha dois artefatos no mesmo projeto do Claude Design: o spec escrito
(`PROMPT-claude-code-v2.md`), que fixa a paleta em navy (`#10101f · #1a1a2e · #24243a`), e o protótipo
(`OTB USA Landing v2.dc.html`), que roda em preto (`#000000 · #080808 · #111111`). A implementação
seguiu o texto — corretamente, à época — e a landing ficou azul-escura onde a referência aprovada é
preta. O relato do cliente foi "as cores não vieram", e a leitura errada seria procurar componente por
componente.

**Solution:** A escala virou `ink` no `@theme` (`--color-ink-deep/-ink/-ink-band/-ink-raised/-ink-edge`),
com renomeação dos ~55 call sites de `navy`. Renomear em vez de só trocar valores: um token chamado
`navy` guardando `#000000` engana toda mudança futura, e a divergência em relação ao canon Navy/Gold da
skill `gpus-theme` ficou registrada em `DESIGN.md` para não ser "corrigida" de volta.

**Pattern:** Quando o spec escrito e o artefato renderizado divergem, o artefato ganha — ele é o que foi
aprovado olhando. E paleta é mudança de `@theme`: se a troca exigir editar componente, o componente
tinha cor hardcoded. Renomeação de token é mecânica e verificável (`grep -rn "navy" src` volta vazio).

**Validation:** `bun run lint && bunx astro check && bun run build && bun test`; contraste recalculado
(body 10,1–11,5:1, muted 7,2–8,2:1, gold 8,8–10:1, texto do botão sobre gold 10:1); rotação de faixas
conferida no HTML construído, sem duas faixas iguais em sequência.

---

### [2026-08-18] Reduced motion é uma sessão, não uma leitura de boot

**Problem:** O runtime lia `prefers-reduced-motion` uma vez no boot. Quem ligasse a preferência no
sistema no meio da leitura continuava com parallax, marquee e trilho fixado até recarregar a página —
exatamente o momento em que a preferência mais importa.

**Solution:** O decorativo virou uma sessão com `AbortController` + lista de undos. `initMotion` assina
`change` da media query: ao ligar `reduce`, aborta todos os listeners decorativos, esvazia o canal
decorativo de tasks de scroll/resize, remove clones do marquee e spans de shine e limpa os `transform`
inline; ao desligar, reabre a sessão. As tasks de chrome (progresso, header, barra sticky, contagem)
vivem num canal separado e nunca são desmontadas. O que roda uma vez por página — a cascata do hero,
cada contador — é marcado e não repete no religar.

**Pattern:** Todo efeito decorativo precisa saber se desfazer. Se um init só sabe ligar, a preferência
de acessibilidade vira dependente de reload. Registrar o undo junto com o efeito, não depois.

**Validation:** Probe CDP sobre o build: `Emulation.setEmulatedMedia` com `reduce` sem reload derruba
`is-marquee` (8 filhos → 4), `is-pinned`, os 6 `.cta-shine` e os `transform` de parallax, mantendo a
contagem viva; desligar restaura os três. Zero erro de console em 1440×900 e 390×844.

---

### [2026-08-18] Uma cascata com fade segura o LCP da página inteira

**Problem:** Depois da v2 o Lighthouse mobile marcava performance 75 e LCP 6,7s. Medindo o elemento de
LCP direto no navegador (`PerformanceObserver` sobre `largest-contentful-paint`), não era a fotografia do
hero (29KB) — era o parágrafo lede, que a cascata de entrada mantinha em `opacity: 0` até o módulo rodar
e a animação chegar a um frame visível. O Chrome não pinta o que está em `opacity: 0`, então o LCP
esperava a coreografia inteira. Os 545KB de GTM + GA4 + Meta Pixel atrasavam o módulo, o que amplificava
o efeito, mas a causa era a animação.

**Solution:** A cascata (`[data-enter]`) passou a animar **só `transform`**. O texto é pintado com força
total no primeiro frame e ainda desliza. Como consequência o pré-estado em CSS deixou de existir — não há
mais o risco de um módulo que não carrega deixar a dobra em branco. No mesmo passo, o wordmark de 822×453
(43KB servido a 44px) virou 360×198 com paleta (8,9KB).

**Pattern:** Nunca colocar o maior bloco de texto acima da dobra atrás de uma animação de `opacity`.
Mover é de graça; apagar custa o LCP inteiro. Antes de otimizar imagem ou rede, medir **qual** elemento é
o LCP — a intuição erra.

**Validation:** Lighthouse mobile no build: performance 75 → 96/98 (duas execuções), LCP 6,7s → 2,0s,
CLS 0, acessibilidade 100.

---

### [2026-08-18] O fluxo de lead tem quatro camadas e elas precisam mudar juntas

**Problem:** Tornar o e-mail opcional na seção de aplicação parecia uma mudança de duas camadas
(`src/lib/leads.ts` + o input). Eram quatro: o Apps Script valida o mesmo campo, e
`src/pages/redirecionando.astro` — a página de hand-off que dispara o `lead_submit` — exigia
`lead_email` não vazio. Com as três primeiras ajustadas, um lead da seção nova era aceito pela API,
gravado na planilha, e então a página de hand-off descartava o payload e mandava o visitante de volta
para a home. Conversão perdida depois de já ter sido registrada.

**Solution:** As quatro camadas alinhadas na mesma mudança, com um teste de aceitação end-to-end
(servidor stub que roda o `validateLeadSubmission` real) cobrindo formulário → API → hand-off →
`dataLayer` → WhatsApp, nas duas superfícies de captura.

**Pattern:** Campo de lead = `src/lib/leads.ts` + `api/leads.ts` + `integrations/google-apps-script/...`
+ `src/pages/redirecionando.astro` + `tests/`. Se mexer em `LEAD_SHEET_HEADERS`, a planilha também migra.
Dado de qualificação que só a SDR lê (profissão, momento) viaja na mensagem do WhatsApp e não toca
nenhuma dessas camadas.

---

### [2026-08-18] A content-driven hero turns a font swap into CLS

**Problem:** The v2 hero grew past the fold on a phone (1368px against an 823px viewport), so its height
became content-driven. When the webfonts landed, the text reflowed by ~48px and dragged the full-bleed
photograph behind it — CLS went from 0 to 0.06 on mobile. Astro's Fonts API already emits metric-matched
fallbacks (`size-adjust`, `ascent-override`), which hold line *height* stable but not line *count*:
per-glyph advances still differ, so a wrapped line can appear or disappear on swap.

**Solution:** Preload both families in `Layout.astro` (Inter, the body face of everything above the fold,
was previously swap-only), and pin the countdown row with `flex-nowrap` plus `ch`-sized numeric cells so
it can never reflow on its own. CLS back to 0; FCP improved 1.5s → 1.3s; LCP unchanged within noise.

**Pattern:** A section whose height is content-driven and which sits behind a full-bleed plate is a CLS
amplifier. Either keep the section inside a fixed height (`min-h` that actually contains the content) or
remove the font swap. Measure before assuming the fallback metrics cover it.

**Validation:** `scratchpad/probe.mjs` — a CDP probe that renders the built page under Lighthouse-like
throttling and records `layout-shift` entries with their sources, plus hero geometry over time. Lighthouse
mobile: accessibility 92 → 100, CLS 0.06 → 0.

---

### [2026-08-18] One scroll listener, and information is not decoration

**Problem:** Four components each opened their own `scroll` listener with their own rAF token
(`ScrollProgress`, `StickyCta`, the parallax in `motion.ts`, and the header's observer), which is four
layout passes per frame and no shared notion of scroll state.

**Solution:** `src/scripts/motion.ts` now owns a single passive `scroll` listener that drains registered
tasks inside one frame, plus a `resize`/`load` re-measure. Components declare attributes
(`data-scroll-progress`, `data-sticky-cta`, `data-float-wa`, `data-hero-fade`, `data-hpin`, `data-cd`)
instead of scripting.

**Pattern:** Under `prefers-reduced-motion: reduce` the runtime disables everything decorative but keeps
what carries information — reading progress, the sticky conversion bar and the countdown. Switching those
off would remove content, not motion. Every other behaviour degrades to a correct static state: the
marquee is a wrapped row, the pinned rail is a snap carousel, reveals are visible.

**Validation:** Probe at 412×823 and 1440×900, with and without reduced motion: no horizontal overflow,
countdown alive in both modes, rail pinned only ≥900px.

---

### [2026-05-25] OTB USA-only repository context

**Problem:** The repository inherited agent docs, skills, routes and historical notes from non-OTB contexts, which made agents route work through unrelated products and stale deployment assumptions.

**Solution:** Re-scoped root docs and `.claude/` to OTB USA. Project skills are now `otb-usa` and `otb-theme`; Astro overlay is `otb-usa-overlay.md`; evolution profile is `otb-profile.md`; canonical project metadata points to OTB USA.

**Pattern:** Grupo US remains parent brand context. Product work in this repo must stay OTB-only: no unrelated routes, CTAs, product journeys or examples.

**Validation:** Search residual terms, then run `bun run lint && bunx astro check && bun run build`.
