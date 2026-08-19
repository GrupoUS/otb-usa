---
name: gpus-design-system
scope: all-gpus-projects
brand: Grupo US · Dra. Sacha Gualberto
mode: dark-first
palette:
  navy-950: "#10101F"   # hero deep
  navy-900: "#1A1A2E"   # fundo principal
  navy-800: "#24243A"   # seções alternadas
  surface-1: "#2A2A40"  # cards
  surface-2: "#34344F"  # cards destacados
  gold: "#D4AF37"
  gold-light: "#E8C96A"
  gold-deep: "#B8960C"
  text-primary: "#FAFAF9"
  text-secondary: "#B8C0D0"  # body em fundo escuro (sobe contraste)
  text-muted: "#8F9AAF"      # apenas metadados
  success: "#22C55E"
  warning: "#F59E0B"
  error: "#EF4444"
  whatsapp: "#25D366"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, serif"
    fontWeight: 700
    use: "Hero, títulos de seção, momentos institucionais"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontWeight: 400
    use: "Body, UI, parágrafos, captions"
icons: "Lucide (SVG inline)"
spacing-grid: "8px"
focus-ring: "2px solid var(--color-gold), offset 2px"
---

# GPUS Design System

> **Sistema de design da casa — Grupo US / Dra. Sacha Gualberto.** Vale para **todos os projetos GPUS** (landings, apps, portais), não para um produto específico.
>
> Os **tokens técnicos** (valores vivos) ficam no `@theme {}` de cada projeto (`src/styles/global.css`) e no `Skill('gpus-theme')`. Este arquivo é a **fonte de decisão**: princípios, hierarquia, do/don't, padrões de componente. O CSS é a fonte técnica.
>
> **Posicionamento, copy, funil, conversão e CRO** vivem em `PRODUCT.md`. **Voz/marca** em `Skill('grupo-us')`. Aqui é só o **como parece e se move**.
>
---

## 1. Overview — creative north star

**Autoridade premium com presença.** Todo produto GPUS deve parecer uma experiência sofisticada de saúde estética avançada — editorial, confiável, com peso de marca. Sofisticação **não** significa timidez: criatividade, drama visual e movimento são bem-vindos quando servem à hierarquia e à conversão.

Direção estética de referência (mix GPUS):

- base premium dark à la **Linear / BMW** (precisão, dark refinado, microinterações);
- cards e gradientes sutis à la **Stripe**;
- fotos humanas e reais à la **Apple / Airbnb** (especialmente topo de funil);
- copy clara e direta, sem exagero.

Palavras-guia:

- Grupo US / Dra. Sacha — autoridade clínica e de negócio;
- premium, editorial, estratégico;
- base escura institucional (navy na casa; **escala `ink` preta nesta landing**), gold como decisão e impacto;
- dark-first;
- ousar é o default — se parecer template genérico, redesenhar;
- **dinâmico forte:** profundidade em camadas, 3D, parallax, glow e motion orquestrado são encorajados (ver `§ 9. Motion` + `§ 10. Depth & elevation`; gotchas de runtime em `.claude/rules/stability.md § Debug triage matrix`).

---

## 2. Colors — palette de marca

### Palette (dark-first, escala expandida)

Canvas escuro navy, ênfase em gold. Light mode só quando um projeto exigir explicitamente, com tokens espelhados — nunca misturar tokens de modos diferentes (cross-mode bleed).

| Role | Token | Brand reference |
|---|---|---|
| Hero deep | `--color-navy-950` | `#10101F` |
| Canvas | `--color-navy-900` / `bg-navy` | `#1A1A2E` |
| Section alternate | `--color-navy-800` | `#24243A` |
| Surface (card) | `--color-surface-1` | `#2A2A40` |
| Surface destacada | `--color-surface-2` | `#34344F` |
| Primary / CTA | `--color-gold` | `#D4AF37` |
| Gold hover | `--color-gold-light` | `#E8C96A` |
| Gold deep | `--color-gold-deep` | `#B8960C` |
| Text primary | `--color-text-primary` | `#FAFAF9` |
| Text secondary | `--color-text-secondary` | `#B8C0D0` |
| Text muted | `--color-text-muted` | `#8F9AAF` |
| Success | `--color-success` | `#22C55E` |
| Warning / urgência | `--color-warning` | `#F59E0B` |
| Error | `--color-error` | `#EF4444` |
| WhatsApp | `--color-whatsapp` | `#25D366` |

> **Contraste:** body em fundo escuro usa `text-secondary` (`#B8C0D0`); `text-muted` (`#8F9AAF`) só para metadados (data, label pequeno). Isso resolve o baixo contraste de texto secundário detectado em mobile na pesquisa.
>
> Os valores acima são a **referência de marca**. A SSOT técnica é o `@theme {}` de cada projeto. **Hex inline em componente é proibido** — cor nova = token novo no `@theme`. Nem todo projeto precisa dos 950/800/surface-2 de imediato; adotar conforme a página ganhe profundidade.

### Tokens vivos deste projeto (OTB) — `src/styles/global.css @theme`

SSOT técnica. Estes são os tokens que existem hoje; qualquer cor nova entra aqui antes de aparecer num componente.

> **Esta landing roda em preto, não em navy.** A escala `ink` vem do protótipo v2
> aprovado no Claude Design (`OTB USA Landing v2.dc.html`), que trocou o navy pelo
> preto depois que o prompt de implementação foi escrito. É uma **divergência
> deliberada do canon Navy/Gold** da tabela de marca acima e da skill `gpus-theme`:
> gold e crimson precisam do piso mais escuro possível para ler como metal e como
> bandeira. Não "corrigir" de volta para navy sem decisão de produto.

| Role | Token | Valor |
|---|---|---|
| Piso / faixa profunda (`band-deep`) | `--color-ink-deep` | `#000000` |
| Canvas / faixa base (`band-base`, `body`) | `--color-ink` | `#080808` |
| Faixa alternada (`band-alt`) | `--color-ink-band` | `#111111` |
| Surface (card / glass) | `--color-ink-raised` | `#141414` |
| Surface destacada / mesh | `--color-ink-edge` | `#1C1C1C` |
| Primary / CTA / foco | `--color-gold` | `#D4AF37` |
| Gold hover | `--color-gold-light` | `#E8C96A` |
| Gold deep | `--color-gold-dark` | `#B8960C` |
| Acento USA (principal) | `--color-crimson` | `#A51C30` |
| Acento USA (realce/gradiente) | `--color-crimson-bright` | `#C8102E` |
| Acento USA (profundidade) | `--color-crimson-dark` | `#6E1423` |
| Text primary | `--color-text-primary` | `#FAFAF9` |
| Text secondary (body) | `--color-text-secondary` | `#B8C0D0` |
| Text muted (metadado) | `--color-text-muted` | `#94A3B8` |
| Display font | `--font-display` | Sora → system-ui → sans-serif |
| Body font | `--font-sans` | Inter → system-ui → sans-serif |

**Contraste medido na escala ink** (AA em todos os pares em uso): `text-secondary`
10.1–11.5:1 · `text-muted` 7.2–8.2:1 · `gold` 8.8–10:1 · texto do botão
(`--color-ink-deep`) sobre gold 10:1 · `text-primary` sobre a faixa crimson 7.2:1.
`--color-crimson-bright` como **texto** fica em ~3.4:1 — só display grande, nunca body.

**Rotação de faixas.** A troca de banda é o separador entre seções e **nunca se
repete em sequência**: `deep → base → alt → base → deep → base → alt → base →
deep → alt → deep → base → deep → alt → deep`.

**Crimson (bandeira norte-americana) é acento de posicionamento desta landing, não substituto do gold.** Gold permanece primário de CTA e de anel de foco; crimson marca a narrativa Boston/Estados Unidos (badges, filetes, realces de seção, gradientes de profundidade). Nunca usar crimson como cor de CTA primário nem como cor de estado de erro.

### Regras de cor

- Tokens semânticos sempre; hex inline em componente é proibido (exceção documentada: `<meta theme-color>` espelhando `--color-ink`).
- Validar todo par foreground/background contra WCAG AA antes de commit.
- Gold é hierarquia focal, sem teto de cobertura — ver `§ 3. Color usage`.
- Estado nunca é comunicado só por cor.

---

## 3. Color usage

### Do
- Tokens semânticos (`bg-navy`, `text-gold`, `text-text-secondary`) ou utilitárias de marca. Tokens carregam significado.
- Validar todo par foreground/background contra WCAG antes de commit.
- Status (success/warning/error) = **cor + ícone + texto**, nunca cor sozinha. `warning` com moderação; `error` só em form/validação.
- Intercalar fundos: alternar `navy-900` ↔ `navy-800` (e blocos claros quando o produto pedir) para quebrar a monotonia de páginas longas escuras.

### Don't
- Hex hardcoded fora do token source.
- `#000` puro / `#fff` puro para body sobre fundo colorido — descer um passo na escala neutra.
- Gold em parágrafo longo (é hierarquia, não corpo de texto).
- Cor como **único** sinal de estado/foco.
- Sequências longas de cards idênticos sem variação de peso — o olho cansa e perde o ponto importante.

### Contrast minimums (WCAG AA)

| Surface | Ratio |
|---|---|
| Body text | ≥ 4.5:1 |
| Large text (18pt / 14pt bold) | ≥ 3:1 |
| Non-text UI (ícones, bordas, focus rings) quando informativo | ≥ 3:1 |

### Gold — sem teto, com intenção focal

Gold é **hierarquia e impacto** — **sem teto fixo de cobertura**. A disciplina não é percentual, é **focal**:

- idealmente **um momento de gold dominante por bloco** (título parcial, número, CTA ou selo) — quando tudo é dourado, nada vira destaque;
- cards padrão **neutros** (`surface-1`); card prioritário pode receber **borda dourada** / glow;
- **CTA primário = gold**; **WhatsApp = verde subordinado** quando a meta do bloco é inscrição/formulário (verde não rouba o foco do CTA principal);
- onde gold ganha atenção, deixar ganhar — ousar é permitido, desde que guie o olho até o que converte.

---

## 4. Typography & Iconography

### Famílias

- **Playfair Display** (`--font-serif`) — hero, headlines, momentos de autoridade.
- **Inter** (`--font-sans`) — body, navegação, UI, captions.
- Hierarquia por peso / tamanho / spacing. **Nunca** uma terceira família (monospace para código é exceção).

### Iconography

- **Lucide** (SVG inline) — uma única biblioteca por projeto.
- Named imports (tree-shaking). Decorativo: `aria-hidden="true"`. Icon-only button: `aria-label`.
- Cor via `currentColor`. **Nunca emoji como ícone.**

### Do
- Uma família display + uma body (máx. duas).
- **Escala + peso como autoridade:** headline grande no desktop (ex.: `lg:text-7xl`) + `font-bold` + `tracking-tight` carrega autoridade sem depender de cor.
- `text-balance` + leading apertado (`leading-[1.05]`) em headlines editoriais.
- **Sentence case** em headlines. UPPERCASE só em badges/pills com letter-spacing ≥ 0.04em.
- `tabular-nums` em moeda, contadores, datas, qualquer coluna alinhada.
- Razão heading/body ≥ 2× no maior viewport.
- Serifada (Playfair) **só** em títulos e frases editoriais; sans (Inter) em body, listas, botões, FAQ, formulários.
- **Mobile:** reduzir tamanho de título (evita quebra estranha) e **subir line-height de body** em páginas longas. Tamanho mínimo: 12px.

### Don't
- Mais de duas famílias.
- ALL CAPS em body ou heading (só badges).
- Fonte < 12px em qualquer viewport.
- Texto justificado (cria rios).
- Texto secundário pequeno demais em fundo escuro.

---

## 5. Components

### Buttons
- Hierarquia: **primary** (um por view, dirige a conversão), **secondary** (caminho alternativo), **ghost** (nav/utilitário), **destructive** (confirma antes).
- CTA primário GPUS: fundo gold, texto navy escuro. WhatsApp: verde só para ação de contato, subordinado ao CTA primário.
- Touch target ≥ 44×44px mobile / ≥ 36×36px desktop.
- Focus ring `:focus-visible`: 2px solid + 2px offset.
- Icon-only → `aria-label`. Press feedback: `transform: scale(0.98)` ou qualquer efeito tátil.

### Cards
- Padding escala por viewport (menor mobile, maior desktop).
- Base `surface-1`; hover `surface-2`. Hover lift via `transform` + sombra (suave ou ousada) — pode coreografar mais.
- Bordas ghost por padrão; **borda dourada / glow só em card prioritário** ou foco.
- Glass card é acento de destaque, não padrão de fundo; evitar cards aninhados.

### Inputs
- Padding `px-4 py-3` (≥ 12px / ≥ 16px).
- `:focus-visible` ring (2px solid + 2px offset, cor de foco).
- Placeholder ≤ 0.6 opacity vs body — nunca cor primária.
- Disabled: `opacity 0.5` + `cursor-not-allowed`.
- Form de lead: campos curtos, máscara WhatsApp, validação amigável, autofill. Pedir só o necessário antes da conversão (qualificação vem depois).

### Badges / pills
- `rounded-full`, 11–12px, weight 500, letter-spacing 0.04em, UPPERCASE.
- Padding `px-3 py-1`.

---

## 6. Layout

- **8px spacing grid** — toda margin/padding/gap múltiplo de 8 (ou 4 em UI densa).
- Container max-width (`max-w-7xl mx-auto px-6 lg:px-8` ou equivalente).
- **Quebrar o 50/50:** splits assimétricos (7/5, 8/4) no hero; 50/50 é visualmente estático. Adicionar intenção estrutural (overlap, profundidade).
- **Spine editorial:** numeração estrutural (`01–04`) cria F-pattern e mata anáfora; alternar alinhamento esquerda/centro entre blocos.
- Espaçamento vertical de seção: generoso desktop (≥ 96px), comprimido mobile (≥ 64px).

### Responsive

| Breakpoint | Comportamento |
|---|---|
| Mobile (< 640px) | Coluna única, hamburger, **sticky CTA bar** (Inscrever + WhatsApp) |
| Tablet (640–1024px) | Grids 2-col, nav condensada |
| Desktop (≥ 1024px) | Layout completo, grids 3-col, hero assimétrico |
| Wide (≥ 1280px) | Edge-to-edge `max-w-7xl`, gutters generosos |

---

## 7. Shapes — border radius

- Escala discreta (`sm` / `md` / `lg` / `xl` / `2xl` / `full`) — nunca `border-radius: <px>` inline.
- Pills / avatars / icon buttons: `rounded-full`. Inputs / botões: `rounded-md`. Cards: `rounded-lg`/`rounded-xl`. Modais: `rounded-2xl`.

---

## 8. Component catalog (feature-rich)

Padrões reutilizáveis para landings GPUS. Cada projeto implementa conforme necessidade — todos puramente visuais/interativos (Astro estático + script vanilla quando preciso; ilha só se a interatividade for provada). A estratégia de **quando/por que** usar vive em `PRODUCT.md § Conversion playbook`.

| Componente | Propósito | Nota a11y |
|---|---|---|
| **Hero com prova lateral** | Headline + CTA + card/foto/vídeo de resumo ou prova ao lado | `<h1>` único; imagem com `alt` + dims |
| **Barra de qualificação / trust** | Faixa no topo: edição, data, público elegível, números | landmark/`role` adequado; contraste AA |
| **Sticky offer summary** | Desktop: card lateral com preço/data/CTA enquanto rola. Mobile: sticky CTA bar | foco navegável; não cobrir conteúdo no zoom |
| **Timeline interativa (tabs)** | Etapas/fases do programa sem reload | tabs com `role="tablist"`, setas no teclado |
| **Comparativo** | "sem método vs com método GPUS" | tabela semântica com headers |
| **Depoimentos segmentados** | Filtro por profissão (enfermeira, biomédica, dentista…) | filtro operável por teclado; foto com `alt` |
| **FAQ por objeção** | `<details>` nativo ou disclosure animado | expand por Enter/Space; ver `.claude/rules/DESIGN.md` |
| **Galeria / lightbox de prova** | Fotos reais de turma/lab/aula/evento | trap de foco no lightbox; Esc fecha |
| **Barra de progresso de scroll** | Orientação em página longa | decorativa: `aria-hidden` |
| **WhatsApp por intenção** | Botões diferentes → mensagens pré-preenchidas ("sou elegível?", "condições", "próxima turma") | sempre via `src/lib/whatsapp.ts`; `aria-label` nomeia a SDR |
| **Calculadora educativa (ROI/carreira)** | Simulador simples — ferramenta educativa, **nunca promessa de resultado** (disclaimer obrigatório) | inputs com `<label>`; resultado em `role="status"` |
| **Estado de sucesso rico** | Pós-inscrição: confirmar + lembrete WhatsApp + add-to-calendar + falar com SDR | foco move para o sucesso; `role="status"` |

---

## 9. Motion

**Movimento é incentivado — ousado, dinâmico, expressivo. Anime à vontade.**

### Permitido (qualquer coisa)
- `transform` (translate, scale, rotate, skew, 3D), `opacity`, `filter` (`blur`, `brightness`, `drop-shadow`), `clip-path`, gradientes animados.
- Propriedades de layout — `width`, `height`, `top`, `left`, `padding`, `margin`, `border-width` — permitidas quando o efeito pedir.
- `transition: all` permitido.
- Accordion / disclosure: `height`, CSS grid `0fr ↔ 1fr` ou `<details>` nativo — escolha do autor.

### Contrato de atributos (implementado)

Todo o movimento da landing é declarado em markup e executado por **um único runtime**,
`src/scripts/motion.ts`, importado uma vez em `Layout.astro`. Ele registra **um** listener de `scroll`
(`{passive:true}`) e drena as tarefas dentro de um `requestAnimationFrame`. Nenhum componente deve abrir
o seu próprio listener de scroll.

| Atributo | O que faz | Onde |
|---|---|---|
| `data-reveal="up\|left\|right\|mask\|wipe"` + `data-reveal-delay="1..10"` | reveal na entrada em viewport; `mask`/`wipe` usam `clip-path` (não movem o elemento) | CSS + IntersectionObserver em `Layout.astro` |
| `data-enter="1..8"` | cascata no load, 700ms, delay `n × 0.06s`; **só `transform`** — sem opacity, para não segurar o LCP nem deixar a dobra em branco se o script falhar | Hero |
| `data-count` (+ `data-count-format="pt"`) | count-up ao entrar em viewport | Programa, Boston |
| `data-parallax` + `data-speed` (+ `data-parallax-slack="<px>"`) | translada o wrapper contra o scroll; `slack` declara a folga quando a camada é decorativa e não tem overscan | Hero, Virada, Boston, Investimento, Aplicação |
| `data-tilt` | escreve `--tilt-x/--tilt-y/--tilt-lift`; o `transform` vive no CSS | cards |
| `data-marquee` + `data-marquee-dur` | duplica os filhos e roda `otb-marquee` infinito | Certificações |
| `data-marquee-toggle` (+ `data-label-pause` / `data-label-resume`) | botão de pausa do marquee — **sem ele o runtime não anima** (WCAG 2.2.2: hover não é mecanismo para teclado nem toque) | Certificações |
| `data-shine` | injeta `.cta-shine` sobre o CTA (nunca no markup — não entra na a11y tree) | CTAs primários |
| `data-hpin` / `-vp` / `-track` / `-rail` / `-bar` | trilho horizontal fixado ≥900px; abaixo disso é carrossel `scroll-snap` | Boston |
| `data-cd-target` + `data-cd="d\|h\|m\|s"` / `data-cd-mini` | contagem regressiva de 1s | Hero, Investimento, StickyCta |
| `data-cd-wrap` | gate `.js` do bloco de contagem — o HTML estático traz `000`/`00`, que sem JS anunciaria um evento de 2027 como encerrado | Hero, Investimento, StickyCta |
| `data-hero-fade` | opacidade/translate do conteúdo do hero conforme a dobra sai | Hero |
| `data-scroll-progress`, `data-header`, `data-sticky-cta`, `data-float-wa` | chrome de leitura e de conversão | Layout, Header, StickyCta, WhatsApp |

**Superfícies que só funcionam com JS não são renderizadas sem JS.** O formulário de `#inscricao` e os
blocos de contagem existem apenas sob `html.js`; sem script o leitor recebe o link do WhatsApp no
`<noscript>` em vez de um formulário que faria um GET nativo com nome, telefone e e-mail na barra de
endereços.

**Informação não é enfeite.** Sob `prefers-reduced-motion: reduce` o runtime desliga tudo que é
decorativo (parallax, tilt, cascata, marquee, shine, fade, trilho fixado) e **mantém** o que carrega
informação: barra de progresso, barra sticky e contagem regressiva. Cada fallback é o estado estático
correto — marquee volta a ser linha que quebra, trilho volta a ser carrossel, reveals ficam visíveis.

**A preferência é lida ao vivo, não no boot.** O decorativo é uma sessão que abre e
fecha: o runtime assina `change` da media query e, ao ligar `reduce`, aborta os
listeners, descarta as tasks de scroll, remove os clones do marquee e os spans de
shine e limpa os `transform` inline — sem reload. Ao desligar, reabre. Comportamento
que roda **uma vez por página** (a cascata do hero, cada contador) não repete no
religar.

### Padrões "dinâmico forte" (encorajados)
- **Cascade orquestrado no hero** no page-load: eyebrow → headline → sub → chips → CTAs, stagger (~60ms). Ritmo coeso > microinterações espalhadas.
- **Mouse-glow** radial (`[data-glow-card]`), **hover-lift** (`card-hover-lift`), gradiente/shimmer animado nos 1–2 headlines hero-level.
- **3D tilt** (`[data-tilt]`) e **scroll parallax** (`[data-parallax]`) estão implementados e com gate de `pointer:fine` / `prefers-reduced-motion`. Reusar o atributo, não reimplementar.
- Microinterações: hover-lift generoso, glow em card prioritário, accordion suave, counters quando visíveis.
- **Evitar** só o que prejudica de fato: vídeo autoplay com som, popup agressivo, motion travado sem fallback de reduced-motion.

> **Gotchas de runtime** (reveal com `animation: … forwards` mascara hover/tilt; dois `transform` na mesma regra brigam; `[data-glow-card]::before` precisa de `z-index: -1`) estão em `.claude/rules/stability.md § Debug triage matrix`.

> **A dobra não pode desaparecer para animar.** O lede do hero é o elemento de LCP no telefone, e o
> Chrome não pinta o que está em `opacity: 0` — animar a entrada com fade empurra o LCP pelo tempo da
> coreografia inteira (medido: 6,7s → 2,0s ao trocar por `transform` puro). Vale para qualquer entrada
> acima da dobra: mova, não apague.

> **Altura da dobra e CLS.** O hero é mais alto que a viewport no telefone, então a altura dele vem do
> conteúdo — e qualquer reflow tardio arrasta a foto full-bleed atrás dele. Por isso as duas famílias têm
> `preload` em `Layout.astro` e a linha da contagem é `flex-nowrap` com célula numérica em `ch`. Ao
> acrescentar texto ao hero, medir CLS antes de commitar.

### Nota de performance (advisory, não regra)
- `transform` + `opacity` animam no compositor (sem layout/paint) — preferir quando o resultado visual for o *mesmo*, por INP mais suave. Não obrigatório; usar animação de layout/3D/parallax quando desbloquear o efeito. **CWV são advisory** (medir & anotar, não travar merge; INP ~200ms) — ver `.claude/rules/stability.md`. Piso duro único: a11y (`prefers-reduced-motion`).

### Requerido (acessibilidade — único requisito)
- `prefers-reduced-motion` honrado em toda animação:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- Ilhas React / Framer envolvem animação no hook de reduced-motion do framework.
- Reveal-on-scroll que esconde conteúdo precisa de fallback `<noscript>` (JS-off vê tudo).

### Durações sugeridas (ajuste livre)
- Hover / focus: ~150ms
- Reveal on scroll: ~300–600ms
- Coreografia de página / hero: o que o momento merecer.

---

## 10. Depth & elevation

Camadas com o que ler melhor — contraste tonal, sombra, glow, glass. **Profundidade dramática é bem-vinda.**

| Level | Surface | Effect |
|---|---|---|
| 0 | Page background | none |
| 1 | Section alternate | tonal step (`navy-900` ↔ `navy-800`) |
| 2 | Card | border + glow opcional |
| 3 | Glass / blur | translúcido + backdrop-blur (usar à vontade) |
| 4 | Hover lift | translate + sombra (suave ou ousada) |
| 5 | CTA halo | brand-color glow — onde ganha atenção |
| 6 | Modal | radius grande + sombra pesada + overlay |

- **Vinheta atmosférica estática:** uma camada radial/mesh de navy tonal adiciona presença e enquadra o conteúdo sem custo de FPS nem CLS — preferível a partículas animadas.
- **Glass bright reservado:** o nível mais brilhante de glass fica para **1 clímax** por página (o CTA mais forte); demais superfícies em glass regular. Raridade = significado. (Nota de craft, não cap duro.)

Sombras e glows: suaves **ou** dramáticos — sua escolha. Glows coloridos grandes valem quando servem ao design.

**Vocabulário de profundidade.** O `@theme` de `src/styles/global.css` já carrega quatro tokens de sombra — `--shadow-panel`, `--shadow-lift`, `--shadow-halo-gold`, `--shadow-rim` — e o resto da profundidade vem por utility (`card-hover-lift`, `[data-glow-card]`, `glass-card-bright`, `landing-mesh-bg`). **Não existem** `--perspective-card` nem `--tilt-max-deg`: o tilt fixa ±5deg no runtime. Ao subir o nível de profundidade, criar a escala como token no `@theme` antes de usar (glow em tiers, rim 3D). Nunca sombra/glow inline no componente. "Premium **com** profundidade": evitar o anel solitário sem camadas de apoio.

---

## 11. Imagery

- **Fotos reais sempre que possível.** Hero aspiracional: Dra. Sacha, turma, laboratório, evento, contexto. Topo de funil ganha com rosto humano forte.
- **Zero placeholder escuro / imagem que não carrega** — destrói a percepção premium.
- Tratamento padronizado: vinheta leve, borda dourada sutil, sombra premium, crop consistente.
- Hero / above-fold: `loading="eager"` + `fetchpriority="high"`. Below-fold: `loading="lazy"` + `fetchpriority="low"`.
- Formato **WebP/AVIF**; variantes mobile otimizadas.
- Sempre `width` + `height` explícitos (CLS = 0).
- Decorativo: `alt=""` + `aria-hidden="true"`. Significativo: `alt` descritivo (quem + papel + contexto, em pt-BR).
- Aspect ratios: hero 16:9 ou 21:9; card 4:3; avatar 1:1. SVG para conteúdo vetorial.

---

## 12. Focus & keyboard

- `:focus-visible` ring: 2px solid gold + 2px offset. Nunca `outline: none` sem substituto.
- `<button>` para ações, `<a href>` para navegação. Nunca `href="#"`.
- Skip link como primeiro focável; landmarks semânticos; um `<h1>` por página.

---

## 13. Anti-genérico (anti-AI-slop)

Se parece template ou saída de IA genérica, **redesenhar**. Sinais a evitar:

- cara de default **Inter/Roboto/system** sem intenção tipográfica;
- **gradiente roxo** clichê de IA / "SaaS landing scaffold";
- **CTA laranja/vermelho agressivo** de infoproduto — não combina com navy + gold premium;
- blocos vazios, assets quebrados, contraste de botão ruim (texto escuro em fundo escuro);
- excesso de espaço vazio sem propósito; layouts só centralizados/simétricos;
- prova social sem contexto jurídico (logos sem autorização).

Princípio: **restraint = premium**. "Sofisticação com presença" (escala, peso, depth tonal, gold focal, vinheta) > WebGL/partículas/ruído. Variar a estética entre projetos GPUS — nada de scaffold repetido.

---

## 14. Do's and Don'ts

| Do | Don't |
|---|---|
| Tokens semânticos + utilitárias de marca | Hex hardcoded em componente |
| Escala + peso como autoridade | Depender de cor pra criar hierarquia |
| Sentence case em headline | UPPERCASE fora de badge |
| `tabular-nums` em números | `#000` / `#fff` puro em body |
| Lucide, named imports | Misturar bibliotecas de ícone / emoji |
| 8px spacing grid + splits assimétricos | 50/50 estático · CSS inline furando tokens |
| Gold focal (1 destaque/bloco), sem teto | Gold floodado (tudo dourado, nada destaca) |
| Sombras/glow/glass suaves **ou** dramáticos | Superfícies chapadas quando profundidade ajudaria |
| Motion expressivo (qualquer propriedade) | Motion travado sem fallback de reduced-motion |
| `prefers-reduced-motion` honrado | Ignorar `prefers-reduced-motion` |
| Fotos reais, tratadas, com dims | Placeholder escuro / asset quebrado |
| `<button>` ação / `<a>` nav | `href="#"` placeholder |
| Validar contraste antes do commit | Cross-mode bleed (light/dark) |
| Redesenhar se parecer template | Gradiente roxo / CTA laranja de infoproduto |

---

## 15. Adaptação por projeto

Este doc define a **casa GPUS**. Cada projeto sobrepõe:

- **Tokens vivos** → `src/styles/global.css` `@theme {}` + `Skill('gpus-theme')`.
- **Posicionamento / conversão / CRO / guardrails** → `PRODUCT.md`.
- **Copy / conteúdo** → SSOT do projeto (Content Collection / CMS / JSON tipado). Nunca hardcoded em componente.
- **Voz / funil / CTA** → `Skill('grupo-us')`.
- **Stack / hidratação / SEO** → skill da tech-stack do projeto (ex.: `Skill('astro')`) + regras universais em `.claude/rules/`.

Não importar rota, produto, credencial ou copy de um projeto para outro.

---

## 16. Pointers

| Need | Open |
|---|---|
| Posicionamento, conversão, CRO, guardrails | `PRODUCT.md` |
| Tokens Navy/Gold + tema | `Skill('gpus-theme')` |
| Copy, público, voz Dra. Sacha | `Skill('grupo-us')` |
| Do/don't universal portável (qualquer stack) | `.claude/rules/DESIGN.md` |
| Frontend / hidratação / a11y | `.claude/rules/frontend.md` |
| Stability / smoke / anti-patterns | `.claude/rules/stability.md` |
| SEO / JSON-LD / CWV | `.claude/rules/seo.md` |
| Pesquisa de conversão / UX comportamental | `Skill('uxmaster')` → `references/conversion-and-landing.md` |
| Motion/depth: gotchas de runtime | `.claude/rules/stability.md § Debug triage matrix` |
| Tokens vivos (valores reais) | `src/styles/global.css @theme` |
| Metodologia de design (shape/new-work/craft floor) | `Skill('impeccable')` |
| Stack patterns (Astro etc.) | matching tech-stack skill |
