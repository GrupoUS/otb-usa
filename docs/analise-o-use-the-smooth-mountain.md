# OTB USA — fechar a v2 contra o protótipo do Claude Design

## Context

O projeto Claude Design **"Melhoria landing page OTB USA"** (`d202d0db-72c0-471b-8927-edb193d4a0f2`)
guarda dois artefatos: o spec escrito `PROMPT-claude-code-v2.md` e o protótipo
`OTB USA Landing v2.dc.html` (1474 linhas, lido via `DesignSync`). A v2 já foi implementada no repo
(`docs/analise-o-prompt-a-splendid-summit.md`, commits `6dea8b4`…`dbe6038`): runtime de motion único,
marquee, trilho fixado, countdown, shine, parallax, seções 01–11, fluxo de lead em quatro camadas.

Relendo o protótipo agora, a divergência que sobra tem **uma causa dominante**: o protótipo mudou de
paleta depois que o prompt foi escrito. O `PROMPT-claude-code-v2.md` especifica navy
(`#10101f · #1a1a2e · #24243a`) — e é isso que o repo implementou, fielmente. O `.dc.html` roda em
**preto** (`body{background:#000000}`, seções `#000000 / #080808 / #111111`). Daí a sensação de que
"a cor não veio": a landing está azul-escura onde o protótipo é preto.

O resto são deltas pequenos de fidelidade (dois scrims perderam o rabo de crimson, uma quebra na
rotação de faixas) e um endurecimento do runtime de motion que o protótipo não tinha e o repo ainda
não fez (reduced-motion lido só no boot, um handler fora do rAF, `resize` sem coalescência).

**Decisões do usuário nesta rodada:**

| Tema | Decisão |
|---|---|
| Paleta | **Fiel ao protótipo** — `#000000 / #080808 / #111111`. Navy sai da landing. |
| Depoimentos (plaqueta 08 do protótipo) | **Continua adiada** — falas anônimas, `PRODUCT.md` proíbe prova social fabricada. |
| Motion | **Fidelidade + endurecimento** (a11y e performance do runtime). |

Resultado esperado: a landing renderiza a mesma imagem do protótipo v2, com o motion mais robusto que
o protótipo, sem tocar em conteúdo, rotas, tracking ou no fluxo de lead.

> **Falso positivo já descartado:** uma varredura apontou `otb-ping` (`.live-dot`) e `gold-pulse`
> (`.gold-pulse-glow`) como animações infinitas sem `prefers-reduced-motion`. O bloco global em
> `src/styles/global.css:296-307` já cobre `*`, `*::before` e `*::after` com
> `animation-duration: .01ms !important` + `animation-iteration-count: 1 !important`. **Não há o que
> corrigir aí** — nenhuma regra nova por animação.

---

## Fase 1 — paleta: escala `navy` → escala `ink`

Trocar só os valores deixaria tokens chamados `navy` guardando preto, o que engana toda mudança
futura (e o `DESIGN.md` e a skill `gpus-theme` descrevem navy). Renomear é mecânico e verificável.

**`src/styles/global.css` `@theme` (linhas 9-17)** — mapa completo:

| Token hoje | Valor hoje | Token novo | Valor novo | Papel |
|---|---|---|---|---|
| `--color-navy-deep` | `#10101f` | `--color-ink-deep` | `#000000` | `band-deep`, header sólido, footer, sombras, texto sobre gold |
| `--color-navy` | `#1a1a2e` | `--color-ink` | `#080808` | `body`, `band-base` |
| `--color-navy-band` | `#24243a` | `--color-ink-band` | `#111111` | `band-alt` |
| `--color-navy-light` | `#2a2a40` | `--color-ink-raised` | `#141414` | superfície de card / glass (protótipo: `rgba(20,20,20,.94)`) |
| `--color-navy-lighter` | `#3d3d5c` | `--color-ink-edge` | `#1c1c1c` | 1 uso: mix de `landing-mesh-bg` |

Gold, crimson e a escala de texto **não mudam** — já batem com o protótipo hex a hex.

Call sites (todos mecânicos, `grep` fecha a conta):

- `src/styles/global.css` — 5 `var(--color-navy)`, 4 `var(--color-navy-deep)`, 2 `var(--color-navy-light)`,
  1 `var(--color-navy-band)`, 1 `var(--color-navy-lighter)`; utilities `band-base` (`:255`),
  `band-alt` (`:259`), `band-deep` (`:263`), `bg-navy-soft-70` (`:134` → renomear para `bg-ink-soft-70`,
  2 consumidores), `glass-card-bright` (`:498-510`), `landing-mesh-bg` (`:528`), `.site-header.is-solid`
  (`:186`), `.skip-link` (`:275`), `--shadow-panel/-rim` (`:99-101`), `body` (`:118`).
- 20 `var(--color-navy*)` em componentes: `Hero`, `Boston`, `Virada`, `Turmas`, `Lightbox`,
  `LeadFormDialog`, `StickyCta`, `Aplicacao`, `src/pages/redirecionando.astro`.
- **14 `text-navy`** — todos são texto sobre botão gold (`Hero:175,203`, `Header:84`, `Boston:228`,
  `FinalCta:82,108`, `Investimento:245,272`, `Aplicacao:276,293,323`, `StickyCta:96,108`,
  `WhatsAppFloatingButton:28`) → `text-ink-deep` (`#000000`, exatamente o `color:#000000` do protótipo).
  A `.skip-link` (`global.css:275`) segue junto.
- `src/layouts/Layout.astro:70` — `<meta name="theme-color" content="#1a1a2e">` → `#080808`
  (única exceção de hex literal documentada; o comentário no arquivo precisa passar a citar `--color-ink`).

## Fase 2 — deltas de fidelidade contra o `.dc.html`

1. **Scrim do hero** (`src/components/landing/Hero.astro:76`) — hoje `105deg` em três paradas de navy,
   terminando em `navy 74%`. O protótipo termina em crimson:
   `linear-gradient(102deg, #000 .97, #000 .9 @46%, #080808 .66 @74%, rgba(165,28,48,.24) 100%)`.
   Reescrever com `color-mix` sobre `--color-ink-deep` / `--color-ink` / `--color-crimson`.
   Revalidar contraste do lede sobre a foto depois da troca (era o elemento de LCP — ver
   `docs/learnings-log.md`).
2. **Plate full-bleed de Boston** (`src/components/landing/Boston.astro:107`) — termina em `navy-deep 32%`;
   protótipo termina em `rgba(110,20,35,.34)` (`--color-crimson-dark`). Mesmo tratamento.
3. **Rotação de faixas** — `Speakers.astro:31` e `Investimento.astro:45` são ambos `band-base`, dois
   fundos iguais em sequência. Investimento passa a `band-deep`; a sequência fica
   `Boston(alt) → Speakers(base) → Investimento(deep) → Aplicação(alt) → Parceiros(deep)`, sem repetição
   em nenhuma adjacência da página. O glow radial de Investimento ganha contraste no piso mais escuro.
4. **Superfícies de card** — alinhar `glass-card-bright` (`global.css:498-510`) e os gradientes de card de
   `Boston.astro:204` e `LeadFormDialog.astro` ao protótipo: `linear-gradient(180deg, ink-raised 94%,
   ink 92%)`, borda gold 36%, `backdrop-filter: blur(20px) saturate(135%)`.
5. **CSS morto** — remover `@keyframes reveal-scale` + a regra `[data-reveal="scale"]`
   (`global.css:353,408`, zero consumidores) e `.crimson-pulse-glow` (`global.css:488`, zero
   consumidores). Remover `data-marquee-pause` / `data-marquee-resume` de `Certificacoes.astro:44-45`:
   o runtime lê os rótulos do botão (`data-label-pause` / `data-label-resume`), não do trilho.

## Fase 3 — endurecimento do runtime (`src/scripts/motion.ts`)

1. **`prefers-reduced-motion` reativo** — hoje a media query é amostrada uma vez no boot (`:640-642`),
   então alternar a preferência do SO exige recarregar. Extrair o que hoje roda em
   `initDecorative()`/`teardownDecorative()` (enter, counters, parallax, tilt, marquee, shine, hero fade,
   hpin) e assinar `matchMedia(...).addEventListener("change", …)`: ao ligar `reduce`, limpar transforms
   inline, remover `.is-marquee`, despinar o trilho e remover os spans `.cta-shine`; ao desligar,
   re-inicializar. Progresso de leitura, header, chrome inferior e countdown continuam rodando nos dois
   estados (regra já registrada em `docs/learnings-log.md`).
2. **Handler do trilho fixado fora do rAF** (`:582-601`) — o listener de `scroll` do viewport chama
   `runScrollTasks()` de forma síncrona, furando o gate de `requestAnimationFrame`. Passar por
   `scheduleScroll()`. Mesmo tratamento no caminho de `focusin` (`:628`).
3. **`resize` sem coalescência** (`:693`) — cada evento força `offsetHeight`/`clientHeight` por plate de
   parallax e `getComputedStyle` + `scrollWidth` por pin. Coalescer numa rAF (um remedimento por frame),
   mantendo o `load` `once` que já remede depois de fontes/imagens.
4. **Tilt escrevendo por `pointermove`** (`:317-341`) — acumular a última posição e escrever as custom
   properties dentro de uma rAF. Somar `pointercancel` e `blur` ao `pointerleave` para não deixar o card
   preso na inclinação.
5. **Countdown** (`:147-190`) — `setInterval` nunca é limpo e só o **primeiro** `data-cd-target` da página
   é honrado (`querySelector`), embora existam três (`Hero:237`, `Investimento:182`, `StickyCta:67`).
   Hoje as três datas são iguais, então não há bug visível; passar a resolver o alvo por wrapper
   (`closest("[data-cd-target]")`) e limpar o intervalo em `pagehide` fecha a armadilha.

## Fase 4 — documentação e portas

- `DESIGN.md` — tabelas de paleta (linhas 7-20 e 76-110) reescritas para a escala `ink`, com uma nota
  explícita de que **esta landing diverge do canon Navy/Gold da skill `gpus-theme` por decisão de
  produto**, e a tabela de faixas por seção atualizada (Investimento em `band-deep`).
- `docs/learnings-log.md` — entrada nova: o protótipo evoluiu depois do prompt escrito; quando os dois
  divergem, o artefato renderizado ganha, e a troca de paleta é uma mudança de `@theme`, não de componente.
- `.claude/CLAUDE.md` / `.claude/rules/*` — nenhuma regra muda (tokens-only continua valendo; só os nomes
  dos tokens mudam).

---

## Arquivos críticos

| Arquivo | Papel na mudança |
|---|---|
| `src/styles/global.css` | `@theme`, utilities de faixa, glass, mesh, CSS morto |
| `src/scripts/motion.ts` | as 5 correções da Fase 3 |
| `src/layouts/Layout.astro` | `theme-color`; o observer de `data-reveal` vive aqui (`:133-161`) e não muda |
| `src/components/landing/Hero.astro` | scrim + `text-navy` → `text-ink-deep` |
| `src/components/landing/Boston.astro` | scrim do plate, card CTA, `text-navy` |
| `src/components/landing/Investimento.astro` | `band-base` → `band-deep`, `text-navy` |
| `src/components/landing/{Speakers,Virada,Turmas,Aplicacao,StickyCta,FinalCta,Header,WhatsAppFloatingButton,Certificacoes,LeadFormDialog,Lightbox}.astro`, `src/pages/redirecionando.astro` | renomeação de token / `text-navy` |
| `DESIGN.md`, `docs/learnings-log.md` | registro |

Reusar o que já existe: `@utility band-base|band-alt|band-deep` para faixa (nunca cor inline de seção),
`color-mix(in srgb, var(--color-*) N%, transparent)` para toda transparência, `SectionHeader.astro` para
plaqueta/eyebrow, `src/lib/whatsapp.ts` para qualquer `wa.me`, e o contrato de atributos de
`src/scripts/motion.ts` — nenhum listener de scroll novo em componente.

## Fora de escopo

- **Depoimentos** (plaqueta 08 do protótipo) — adiada por decisão desta rodada.
- **Reordenação/renumeração de seções** — o protótipo numera até 12 com Depoimentos; o repo usa 01–11
  contíguo justamente porque a seção não existe. Mantido.
- **Fotos retiradas** (`src/assets/images/_retired/`) que o protótipo ainda referencia — não reintroduzir.
- **Fluxo de lead, payload, Apps Script, tracking** — intocados.
- **`public/og/otb-default.jpg`** — é um JPEG navy; depois da troca ele fica fora da paleta. Regerar a
  arte é trabalho de asset, fica registrado como pendência, não entra aqui.
- Push, deploy, PR.

## Verificação

```bash
bun run lint
bunx astro check
bun run build
bun test
```

Gate manual (`.claude/rules/commit.md`): nenhum hex fora de `global.css` (exceto o `theme-color`),
nenhum `wa.me/` fora de `src/lib/whatsapp.ts`, nenhuma copy hardcoded, nenhum `console.log`,
`grep -rn "navy" src` → só comentários, se algum.

Com `bun run dev`:

1. **Cor** — as 18 faixas na ordem de `index.astro` alternam sem repetir; nenhuma superfície azul
   sobra; hero e plate de Boston terminam em crimson à direita.
2. **Contraste (AA)** — medir `text-secondary` (`#b8c0d0`), `text-muted` (`#94a3b8`) e `gold`
   (`#d4af37`) sobre `#000000`, `#080808`, `#111111`; texto do botão (`#000000`) sobre gold; faixa
   crimson `#a51c30` com `text-primary`. Corpo ≥ 4.5:1, display ≥ 3:1.
3. **Reduced motion reativo** — DevTools → Rendering → alternar `prefers-reduced-motion: reduce`
   **sem recarregar**: marquee vira linha estática, trilho vira carrossel, parallax zera, countdown e
   barra de progresso continuam. Alternar de volta: tudo religa.
4. **Trilho de Boston** ≥1024px — 4 cards percorridos, barra acompanhando, sem salto na entrada/saída;
   a 390px vira carrossel com snap. `document.scrollWidth === document.documentElement.clientWidth` em
   1440×900, 1024×768 e 390×844.
5. **Tilt** — sair do card com o botão do mouse pressionado / trocar de aba não deixa o card inclinado.
6. **Console limpo** nos três viewports.
7. `bun run lighthouse:audit` — Performance ≥ 85 mobile, A11y ≥ 95, CLS < 0.05. LCP é o lede do hero
   (`docs/learnings-log.md`): confirmar que continua ≈2,0s depois do scrim novo.
