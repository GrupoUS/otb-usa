# Plano — Issue #1: redesign premium do OTB EUA + remoção de "Harvard"

> **STATUS — implementado em 04/08/2026.** Fases 1 a 5 entregues; gates rodados (`bun run lint`, `bunx astro check`, `bun run build` verdes). `grep -ri harvard` = zero em `src/`, `public/` e `dist/`.
> **Não verificado nesta máquina:** Lighthouse (`bun run lighthouse:audit` falha com `ChromeNotInstalledError` — Chrome não instalado) e o smoke visual/responsivo em navegador. Ambos continuam pendentes do critério de aceite.
> **Fora do escopo escolhido:** limpeza de `PRODUCT.md`, `DESIGN.md`, `README.md` e `.claude/**`, que ainda instruem agentes a tratar Harvard como contexto válido — vetor real de regressão (§ Riscos).


## Contexto

A [issue #1](https://github.com/GrupoUS/otb-usa/issues/1) (`WS-73`) pede duas coisas ao mesmo tempo:

1. **Remoção obrigatória do nome "Harvard"** de toda a experiência pública. Motivo confirmado pelo cliente: *o Grupo US apenas aluga espaço em Boston — o curso não é um curso da instituição*, logo qualquer menção implica vínculo que não existe e que a lei não permite afirmar. A remoção não pode ser substituída por disclaimer, comparação ou grafia alternativa: a narrativa se reposiciona **somente em Boston**, imersão internacional, experiência acadêmica e prática anatômica, com alegações verificadas.
2. **Redesign premium e mobile-first de todas as seções**, elevando percepção internacional e conversão, preservando a identidade reconhecível do OTB.

Baseline auditada neste repo: **21 arquivos / 100 linhas** com "Harvard", sendo **13 linhas no `otb.json`**, a âncora pública `#boston-harvard`, o `legal.disclaimer` (6×) e o `faq[0]` inteiro — que é emitido como **JSON-LD `FAQPage`**, ou seja, é dado estruturado indexável.

### Decisões já tomadas pelo usuário

| Tema | Decisão |
|---|---|
| Checkout | Construir a hierarquia dupla **gated em `checkoutUrl`**. Enquanto for `null`, WhatsApp segue primário. Link oficial virá do WS-73. |
| Referências da Andressa | Indisponíveis — traduzir os **6 princípios escritos na própria issue**. Nada de terceiros é copiado. |
| Token crimson | **Manter `#a51c30` como está.** A cor é permitida; só o *nome* é proibido. Remover a palavra dos comentários do CSS. |
| Alcance da remoção | Público + âncora (obrigatório) **+** renomear a chave `bostonHarvard` e o componente. Docs/`.claude` **fora** desta rodada (ver § Riscos). |

---

## Achados que mudam o escopo

Levantados na auditoria, não pedidos na issue, mas bloqueantes ou de alto valor:

| # | Achado | Onde | Gravidade |
|---|---|---|---|
| 1 | **Claim "Certificação MEC" hardcoded** — o `PRODUCT.md` lista MEC como claim sensível sem documentação; as certificações reais são **Instituto IESA + ASA** | `src/components/landing/Hero.astro:189` | Legal/veracidade — corrigir junto |
| 2 | Card direito do hero é **100% copy hardcoded** (fura o SSOT de conteúdo), incl. o "Harvard" visível | `Hero.astro:174-206` | Cardinal rule #5 |
| 3 | `Footer.astro:33` também tem "Harvard" hardcoded, fora do JSON | `Footer.astro:33` | Issue |
| 4 | `hero.badges.slice(1)` **descarta silenciosamente o badge[0]** ("3ª Edição — Boston, abr 2027") | `Hero.astro:126` | Bug — a primeira dobra perde edição/local |
| 5 | Zero `astro:assets`. 1 retrato de **1,29 MB** renderiza num círculo de 128px; ~5 MB de imagens órfãs em `public/` | `Speakers.astro`, `public/images/otb/` | Mobile/premium |
| 6 | Hero usa `background-image` inline → **LCP sem `<img>`, sem preload, sem srcset** | `Hero.astro:20-25` | CWV / primeira dobra |
| 7 | `Speakers` é `lg:grid-cols-5` com 4 palestrantes → célula vazia permanente | `Speakers.astro:34` | Layout quebrado |
| 8 | Sem `@theme` para spacing/motion/depth: `cubic-bezier(0.16,1,0.3,1)` repetido 7×, sombra do CTA duplicada 3× | `src/styles/global.css` | Débito de sistema |
| 9 | Não existe header/nav; a única navegação é o `<nav>` do footer, e `#parceiros` nem está lá | `Layout.astro`, `Footer.astro:41-54` | Navegação/mobile |
| 10 | 3 imagens "Boston" são **o mesmo arquivo** (md5 idêntico) e não são usadas | `public/images/otb/` | Placeholder — remover |

---

## Fase 1 — Remoção de "Harvard" (bloqueante, entra primeiro)

Objetivo: zero ocorrência case-insensitive em conteúdo renderizado, âncoras, dados estruturados, SEO/metadados e textos acessíveis. Sem disclaimer substitutivo.

### 1.1 Copy no SSOT — `src/content/products/otb.json`

Todas as strings novas entram como **PROPOSTA** e precisam de OK do usuário antes do commit (regra: copy comercial não confirmada = proposta).

| Path | Ação |
|---|---|
| `programa.cards[1].descricao` | trocar "Visita guiada ao campus de Harvard" por atividade verificada de abertura em Boston |
| `bostonHarvard.highlight` / `.descricao` | reposicionar em Boston + imersão internacional + prática anatômica |
| `bostonHarvard.cards[0].descricao` | remover a cláusula "sem vínculo institucional com Harvard" (a negação também cita o nome) |
| `faq[0].pergunta` + `.resposta` | reescrever a objeção sem nomear a instituição; a resposta afirma o que **é**: programa do Grupo US, atividades em espaços contratados em Boston, certificações IESA + ASA |
| `faq[2].resposta` | idem — descrever o Anatomy Review pelo perfil do palestrante, sem a negação nominal |
| `faq[6].resposta` | Dia 1 sem citar campus nomeado |
| `agenda[0].titulo` / `.descricao` / `.atividades[1]` | reposicionar o Dia 1 em Boston |
| `legal.disclaimer` | **reescrever inteiro.** Sai a nota de marca registrada; entra o positivo verificável: programa oferecido pelo Grupo US; atividades presenciais em espaços contratados em Boston; certificações MBA Instituto IESA / Grupo US e prática anatômica Fresh Specimens pela ASA; sem vínculo, patrocínio, endosso ou certificação por instituições de ensino locais |

> `seo.title`, `seo.description` e `seo.ogImage` **já estão limpos** — não têm "Harvard". Nada a fazer em meta/OG.

### 1.2 Copy hardcoded em componente

- `Hero.astro:174-206` — o card lateral inteiro migra para o JSON (campo novo `hero.card`: `eyebrow`, `titulo`, `itens[{icone, texto}]`). **"Certificação MEC" sai** e é substituída pelas certificações reais (IESA / ASA).
- `Footer.astro:33` — parágrafo de posicionamento migra para `legal` ou `footer` no JSON, sem "Harvard".
- Demais labels hardcoded catalogadas (eyebrows, "Conhecer o programa", "Role para descobrir", nav do footer) migram junto na Fase 3 — não bloqueiam a Fase 1.

### 1.3 Âncora, chave e componente

Uma só mudança atômica:

- `id="boston-harvard"` → `id="boston"` (`BostonHarvard.astro:18`)
- `href="#boston-harvard"` → `#boston` (`Footer.astro:49`)
- `.claude/config.json` — `content.anchors[]` e `content.sections.bostonHarvard`
- `bostonHarvard` → `boston` no `otb.json`, em `src/content.config.ts` (**arquivo protegido — edição aprovada pelo usuário**), na prop e no import de `src/pages/index.astro:3,78`
- `src/components/landing/BostonHarvard.astro` → `Boston.astro` (+ `.claude/config.json::content.components`)

### 1.4 Comentários de CSS

`src/styles/global.css:20, 23, 365, 433` — remover a palavra dos comentários. **Os valores dos tokens não mudam.**

### 1.5 Gate da fase

```bash
grep -ri "harvard" src/ public/ --exclude-dir=node_modules   # esperado: vazio
bun run build && grep -ri "harvard" dist/                     # esperado: vazio
```

---

## Fase 2 — Sistema de design (tokens antes de pixels)

Consolidar em `src/styles/global.css @theme` o que hoje é valor mágico repetido. Sem isso, o redesign multiplica o débito em vez de reduzi-lo.

- Escala de tipografia fluida (`clamp()`) para display/heading/body — hoje `text-[3.75rem]`, `text-[4.5rem]`, `text-[11px]` estão espalhados inline.
- Tokens de motion: easing assinatura (`cubic-bezier(0.16,1,0.3,1)`, repetido 7×) + durações.
- Tokens de profundidade: sombra do CTA gold (duplicada em `Hero`, `Investimento`, `WhatsAppFloatingButton`), tiers de glow e de card.
- Ritmo de espaçamento vertical de seção (hoje `py-28 sm:py-32` copiado, com exceções não intencionais em `Modulos`, `Parceiros`, `FAQ`).

Limpeza junto: remover `float-gentle` e `.glow-crimson` (definidos e nunca usados), `SectionDivider variant="numeral"` (código morto), e as 8 imagens órfãs (~5 MB) incluindo o trio placeholder byte-idêntico.

---

## Fase 3 — Redesign visual

> Direção detalhada em § Direção visual (abaixo), derivada dos 6 princípios da issue.

---

## Fase 4 — Fotografia e performance

- Migrar todas as imagens para `astro:assets` (`<Image>` / `<Picture>`): WebP/AVIF, `srcset`, `width`/`height` explícitos (CLS 0).
- Hero passa de `background-image` inline para `<img>` real com `loading="eager"` + `fetchpriority="high"` (candidato a LCP).
- Retratos de palestrantes: servir em ~256px reais em vez de 1,29 MB.
- Legendas da galeria hoje só aparecem em `:hover` → invisíveis em touch. Tornar legíveis em mobile.

---

## Fase 5 — Conversão (dois caminhos)

- `Investimento.astro:161-170` já tem o branch de checkout gated em `checkoutUrl`. Estender o mesmo padrão ao Hero e inverter a hierarquia **quando** `checkoutUrl` existir: checkout vira gold primário, WhatsApp vira secundário consultivo. Enquanto for `null`, WhatsApp permanece primário — nenhuma URL provisória é inventada.
- CTA bar sticky no mobile e presença consistente de checkout + WhatsApp nas seções de decisão.

---

## Fase 6 — Validação

```bash
bun run lint
bunx astro check
bun run build
node .claude/skills/impeccable/scripts/detect.mjs --json <arquivos alterados>
```

Smoke manual obrigatório (`.claude/rules/stability.md`):

- `grep -ri "harvard"` em `src/`, `public/` e `dist/` → vazio;
- primeira dobra em 360×640, 390×844, 768×1024 e 1440×900 — edição/local, proposta de valor e CTA visíveis, sem corte nem sobreposição;
- sem scroll horizontal do body em nenhum breakpoint;
- Tab a partir do topo → skip link primeiro; anéis de foco visíveis;
- DevTools → Rendering → `prefers-reduced-motion: reduce` → toda animação parada;
- JS desligado → todo conteúdo `[data-reveal]` visível (gate `.js`);
- contraste AA validado em cada novo par foreground/background;
- `bun run lighthouse:audit` com preview local.

---

## Arquivos críticos

| Arquivo | Papel na mudança |
|---|---|
| `src/content/products/otb.json` | SSOT de toda a copy. 13 linhas com "Harvard" + campos novos (`hero.card`, labels migradas). |
| `src/content.config.ts` | **Protegido.** Rename `bostonHarvard` → `boston` + campos novos. Edição aprovada. |
| `src/styles/global.css` | `@theme` (tokens novos), 4 comentários com "Harvard", limpeza de `float-gentle` / `.glow-crimson`. |
| `src/components/landing/Hero.astro` | Maior reescrita: foto LCP, ficha técnica, copy para o JSON, claim MEC, bug do `badges.slice(1)`. |
| `src/components/landing/BostonHarvard.astro` → `Boston.astro` | Rename + timeline da agenda. |
| `src/components/landing/Footer.astro` | "Harvard" hardcoded, nav (`#boston`, `#parceiros`), copy para o JSON. |
| `src/components/landing/Turmas.astro` | Clímax fotográfico + legendas em mobile + remoção do `photoMeta` hardcoded. |
| `src/components/landing/Speakers.astro` | Grid 5→4, retratos editoriais, peso de imagem. |
| `src/layouts/Layout.astro` | Header novo, preload da imagem LCP. |
| `src/pages/index.astro` | Import/prop do componente renomeado. |
| `.claude/config.json` | `anchors[]`, `sections{}`, `components{}`. |

**Reutilizar (não recriar):** `src/lib/whatsapp.ts` (`whatsappUrlWithText`, `whatsappPartnerUrl`, `defaultWhatsAppUrl`) · o sistema `[data-reveal]` + `[data-reveal-delay]` já existente · as utilities `glass-card*`, `card-glow-hover*`, `landing-mesh-*` · o branch de checkout gated já presente em `Investimento.astro:161-170` · o `Icon.astro` + `icon-paths.ts` (20 ícones Lucide inline).

---

## Riscos e guardas

| Risco | Guarda |
|---|---|
| **Regressão do termo "Harvard"** — `PRODUCT.md:54,109,136,180`, `DESIGN.md:116`, `README.md`, `.claude/rules/*` e `.claude/agents/*` ainda instruem agentes a tratar Harvard como contexto válido. Ficaram **fora** do escopo escolhido. | Rodar `grep -ri harvard src/ public/ dist/` em todo gate. Recomendo aprovar uma passada nesses docs numa rodada seguinte — sem ela, o próximo agente reintroduz o termo. |
| Reveal com `animation: … forwards` mascara hover/parallax — é exatamente o que `.js [data-reveal].revealed` faz hoje | Reveal no **wrapper externo**, parallax/lift no elemento **interno** — nunca o mesmo nó |
| Dois `transform` na mesma regra brigam (tilt × hover-lift) | Um único dono de `transform` por elemento |
| Overflow horizontal no mobile por causa do full-bleed | `overflow-x: clip` em `html, body`; full-bleed por wrapper com `max-w-none`, **não** por aritmética de `100vw` (erro de 1px do scrollbar) |
| Sticky bar × botão flutuante colidindo | FAB vira `hidden lg:inline-flex`; a barra é dona do mobile |
| Perder o "premium" ao tirar o glass | Compensar com banda tonal + disciplina de filete + um pedestal verdadeiro. Se uma seção ficar chapada, ganhar profundidade por banda e régua — nunca restaurando um card |
| Crimson perder significado ao sair dos cards | Restrito aos 3 papéis documentados; escrever a regra no comentário do token |
| `[data-glow-card]::before` tinge o texto | Manter `z-index: -1` |
| CLS ao trocar backgrounds por `<img>` | `width`/`height` explícitos + `aspect-ratio` |
| Contraste sobre foto | Manter as camadas de scrim navy; revalidar AA a cada crop novo |
| Copy inventada | Toda string nova entra como PROPOSTA e depende de OK; nada de data, preço, credencial ou parceiro fora do `otb.json` / `PRODUCT.md` |
| Editar arquivo protegido (`src/content.config.ts`) | Aprovado explicitamente para o rename; validar com `bunx astro check` |

---

## Direção visual — "Dossiê Boston"

**Compromisso.** A landing deixa de ser uma sequência de cards de vidro dourados e passa a ler como um **dossiê editorial de uma imersão internacional**: fotografia do acervo como elemento dominante, tipografia editorial com hierarquia agressiva, e blocos de dado objetivo (data · local · duração · certificação · investimento) tratados como ficha técnica, não como decoração.

**A decisão que mata o "cara de template": inverter a lógica do raio.** Hoje toda foto é `rounded-2xl/3xl` e todo bloco de conteúdo é card de vidro — essa combinação *é* a assinatura Vercel/infoproduto. Inverte-se: **fotografia fica retilínea** (`--radius-plate: 2px`, canto duro, filete dourado no lugar de borda) e **só o chrome interativo continua redondo** (pills, botões, chips = `rounded-full`). Blocos de conteúdo perdem a caixa e passam a ser separados por filetes e **bandas tonais**.

**Banda tonal substitui o `SectionDivider`.** Entram `--color-navy-deep` (#10101F) e `--color-navy-band` (#24243A): a troca de banda vira o separador primário entre seções, em vez de 10 filetes decorativos numa página de navy chapado.

**Crimson: 3 papéis, e só.** Hoje inunda 3 cards + 3 stats + 3 cards de agenda (vira papel de parede). Passa a marcar exatamente: (1) o marcador de data/local, (2) a espinha da timeline dos 3 dias em Boston, (3) o badge do lote ativo. Valores dos tokens não mudam.

**Rejeita explicitamente:** grid de bento, glass como decoração padrão, split 50/50, eyebrow dourado idêntico em toda seção, gradiente dourado em todo headline, cartão de vidro flutuante genérico no hero, foto com canto arredondado, stagger por card, estética de infoproduto.

### O problema central a resolver

Hoje **8 das 11 seções** usam a mesma receita: eyebrow `text-[11px] uppercase tracking-[0.32em] text-gold` + filete `h-px w-10 bg-gold/60` + h2 serif com `text-gradient-gold` no highlight + grid de 3 cards `glass-card` arredondados. O olho não distingue Programa de WhyOTB de Boston. **Gold está floodado** — quando tudo é dourado, nada é destaque (`DESIGN.md § 3`).

Regra nova: **um momento dourado dominante por bloco.** Eyebrow passa a `text-text-muted` com apenas o filete em gold; o `text-gradient-gold` fica reservado a **um** elemento por seção.

### Dispositivo estrutural por seção (para pararem de se parecer)

| Seção | Dispositivo | O que muda |
|---|---|---|
| **Header (novo)** | Barra fixa 56/68px | Não existe hoje. Transparente sobre o hero; ao sair o sentinel vira `navy-deep/92` + blur + filete dourado (IntersectionObserver, sem ilha). Desktop: marca · 4 âncoras (Programa · Boston · Investimento · FAQ) · CTA pill. **Mobile sem hambúrguer** — marca à esquerda, chip `19–21 abr 2027 · Boston` à direita. É assim que o princípio "data e local com destaque objetivo" é atendido sem roubar altura de dobra. Todas as âncoras ganham `scroll-margin-top`. |
| **Hero** | Plate full-bleed + fact rail | Foto vira `<Picture>` real (LCP eager + `fetchpriority="high"`), não `background-image`. `min-h-[100svh]` (o `94vh` atual corta sob a barra do iOS). Sai o card de vidro 8/4; entra uma **fact rail** na base da dobra — 4 células separadas por filete (Data · Local · Duração · Formato) em numerais tabulares, vinda do JSON. Restaura o `badges[0]` hoje descartado. |
| **WhyOTB** | Tríptico de filetes | 3 pilares sem chrome de card: colunas divididas por filete vertical dourado, numeral serif grande por pilar; a `positioningQuote` sobe para pull-quote editorial de largura total. |
| **TargetAudience** | Tipográfico em banda | **Perde a foto de fundo** — hoje duplica o tratamento do hero e dilui o papel da galeria. Vira a seção quieta da página sobre `navy-band`: 6 profissões como fila de pills (não 6 cards), bullets de persona como lista numerada em gold tabular. |
| **Programa** | Espinha numérica + spec list | Mantém o `01` e a estatística de 320h (ampliada, é o momento dourado da seção). Os 3 cards viram **lista de especificação** — linhas rótulo/valor separadas por filete. Lê como ementa, não como grade de features. |
| **Turmas** | **Clímax fotográfico full-bleed** | O acervo de 9 fotos é a prova social (não há depoimentos e não se pode fabricar). Escapa o `max-w-7xl`: mosaico editorial com variedade de crop intencional (uma plate 21:9 + retratos 4:5 misturados com paisagens 3:2 — não nove tiles 4:3). Canto duro. **Legendas sempre visíveis** abaixo de cada plate, nunca só em `:hover` (hoje invisíveis em touch). Ganha linha de crédito do acervo e a maior alocação vertical da página. |
| **Modulos** | Índice numerado | 10 cards com borda → **índice tipo sumário**: linhas de largura total, `01`–`10` em gold tabular, título Inter semibold, subtítulo em secondary, filete entre linhas, hover = tint + régua dourada à esquerda. Lê em um terço do tempo e não parece nada do que está ao redor. |
| **Boston** (ex-`BostonHarvard`) | Plate + timeline única | Hoje empilha 3 grids consecutivos (cards + stats + agenda). **Cards e agenda fundem numa timeline de 3 dias** com espinha crimson; `freshStats` vira faixa de três figuras abaixo. Plate full-bleed com a data composta tipograficamente por cima: `19–21` em numeral tabular gigante + kicker `ABR 2027 · BOSTON, EUA`. Sem imagem de campus, sem brasão, sem lockup institucional. |
| **Speakers** | Retratos editoriais 4:5 | Corrige `lg:grid-cols-5` → 4 (célula vazia permanente hoje). Círculo com anel cônico duplo → retrato 4:5 de canto duro com filete dourado — é onde o retrato de 1,29 MB finalmente justifica os bytes. Nome + área + bio sob filete; Instagram vira link de texto rotulado (≥44px), não o alvo do card inteiro (hoje vaza tráfego do funil). |
| **Investimento** | Pedestal | O único `glass-card-bright` + halo dourado da página (`DESIGN.md § 10`). Benefícios em duas colunas de filete; lotes como escada com o degrau ativo visivelmente elevado. |
| **Parceiros** | Apêndice utilitário | De cards de vidro para bloco compacto sobre `navy-deep`: duas linhas, nome · papel · link de WhatsApp, tipo meta. É apêndice e deve parecer apêndice. |
| **FAQ** | Linhas sem caixa | Sai a caixa externa. Linhas de largura total sobre filete, **pergunta em Inter medium** (serifada hoje compete com os headlines de seção), resposta em `max-w-prose` e `text-secondary`, chevron → mais/menos, altura de linha ≥56px. |
| **CTA de fechamento (novo)** | Banda de conversão | A página hoje **termina no FAQ**. Entra uma banda de CTA antes do footer. |
| **Footer** | Navegação completa | Adiciona `#parceiros` (hoje ausente) e `#boston`; copy migra para o JSON; disclaimer preservado em medida legível — é requisito legal, não estético. |

### Tokens novos em `@theme` (Fase 2)

Conjunto enxuto, cada um matando repetição existente:

- **Cor (3)** — `--color-navy-deep` #10101F (header sólido, footer, piso de banda) · `--color-navy-band` #24243A (banda alternada) · `--color-text-secondary` #B8C0D0 para body sobre escuro. O `DESIGN.md § 2` já manda usar `text-secondary` em body e reservar `text-muted` a metadado — o projeto simplesmente não tem o token.
- **Escala de tipo fluida (7)** — `display / h1 / h2 / h3 / lede / body / meta` com `clamp()` e line-height pareado. Mata `text-[3.75rem]`, `text-[4.5rem]` e as cadeias `md:text-5xl lg:text-6xl`, e dá comportamento real em tablet. **Body sobe de 14px para 16px/1.65** — página escura longa em 14px é imposto de leitura.
- **Kicker (1)** — `--text-kicker` **12px** + `--tracking-kicker: 0.28em`. Mata a receita `text-[11px] uppercase tracking-[0.32em]` duplicada 8× e corrige a violação do mínimo de 12px do `DESIGN.md § 4`.
- **Ritmo (4)** — `--space-section: clamp(4rem, 2rem + 7vw, 9rem)`, `--space-section-tight`, `--space-block`, `--space-gutter`. Hoje `py-28 sm:py-32` / `py-32 sm:py-40` / `py-24 sm:py-28` derivam por arquivo.
- **Motion (5)** — `--ease-editorial` (`cubic-bezier(0.16,1,0.3,1)`, reescrito 7×), `--ease-exit`, `--duration-hover` 160ms, `--duration-reveal` 520ms, `--stagger-step` 70ms. O stagger passa a usar a custom property `--reveal-delay` inline — **acaba o teto de 6 e o `!important`** que hoje força `Math.min(idx, 6)` nos componentes.
- **Profundidade (5)** — `--shadow-panel`, `--shadow-lift`, `--shadow-halo-gold` (a receita do CTA duplicada em 3 arquivos), `--shadow-rim`, `--shadow-plate-inset`.
- **Forma (1)** — `--radius-plate: 2px`. O token que carrega a tese anti-genérica.

Três tiers de profundidade, não seis: **plate** (foto sobre banda, só filete) · **panel** (surface + filete + sombra ambiente, uso escasso) · **pedestal** (o card de investimento — o único `glass-card-bright` da página).

### Mobile-first

- **Primeira dobra (390×844):** header 56 · plate 34svh (crop 4:5 art-directed, `object-position` mirando rostos) · kicker 12px · h1 34px/1.06 em no máx. 3 linhas · lede 16px/1.6 · uma linha de fato `19–21 abr 2027 · Boston, EUA` em tabular · CTA dourado de largura total 52px — tudo dentro de `100svh` menos a barra de 64px. Os chips descem para baixo da dobra no mobile.
- **Sticky CTA bar:** fixa embaixo, 64px + `env(safe-area-inset-bottom)`, `navy-deep/95` + blur + filete no topo. Esquerda: `Lote 1 · US$ 3.500` em tabular. Direita: pill dourado "Falar com Laura", ≥44px de altura e ≥160px de largura. Aparece quando o sentinel do hero sai. **O botão redondo flutuante some abaixo de `lg`** para os dois nunca colidirem. O `padding-bottom` do `<body>` é reservado desde o primeiro paint — nunca injetado no scroll (CLS).
- **Tipo:** kicker 12px (era 11), body 16px/1.65, legenda e meta 13px. Nada de `text-sm` como body.
- **Crop:** campo opcional `focus` por foto no schema, para `object-position` vir do dado. Foto de grupo corta 4:5 no mobile, 3:2 no tablet, 16:9+ no desktop via `<Picture>` com `widths` + `sizes`.
- **Alvos táteis:** linhas de FAQ ≥56px; nav e footer mantêm `min-h-11`; figuras da galeria continuam **não interativas** enquanto não houver lightbox (nada de affordance falsa); links de palestrante ≥44px.

### Fotografia (Fase 4)

- Migrar `public/images/otb/**` para `src/assets/` e consumir por `astro:assets`. Como os caminhos são strings no JSON, mapear com `import.meta.glob` eager (path do JSON → `ImageMetadata`) — **não** exige mexer no schema protegido.
- Ganhos diretos: WebP/AVIF, `srcset`, dimensões reais. Isso elimina o mapa `photoMeta` hardcoded por nome de arquivo em `Turmas.astro:16-26` (hoje um palpite de aspect ratio que pode causar CLS).
- Retratos servidos em ~256px reais (hoje `speaker-rosana.jpg` = 1,29 MB para um disco de 128px).
- Seções tipográficas por decisão (Modulos, FAQ, Parceiros, Investimento) ficam **sem** foto — é o contraste que faz a fotografia parecer dominante.

### Ordem de execução e o que se verifica em cada etapa

| Fase | Entrega | Verificação |
|---|---|---|
| 1 | Remoção de "Harvard" + correção do claim MEC + rename de âncora/chave/componente | `grep -ri harvard src/ public/ dist/` vazio; `bunx astro check` passa após o rename do schema |
| 2 | Tokens + limpeza de código e assets mortos | `bun run build` passa; diff de CSS mostra redução de repetição |
| 3 | Redesign seção a seção (hero primeiro, depois de cima para baixo) | Screenshot em 4 breakpoints por seção; Maestro Template Test |
| 4 | `astro:assets` + fotografia | Lighthouse antes/depois; CLS 0; LCP do hero |
| 5 | Conversão dupla gated | CTA visível e funcional em todas as dobras; checkout aparece só quando `checkoutUrl` existir |
| 6 | Gates finais | § Fase 6 |
