# Performance + SEO/GEO — OTB USA

## Context

A landing já passou por uma rodada de performance (commit `3a876c1`): a cascata de entrada
deixou de animar `opacity`, o wordmark foi reduzido, e o Lighthouse **desktop** saiu de 75 para
96/98 com LCP 2,0s e CLS 0. O que sobrou não é regressão — são lacunas nunca cobertas:

1. **O caminho crítico não é JS.** O bundle já é mínimo (~8KB gzip, zero ilha React, um único
   listener de scroll). O que disputa o primeiro paint é: 73,6KB de fontes com `preload`,
   63,6KB de CSS bloqueante e uma imagem LCP **sem preload**, com o GTM abrindo conexão para
   `googletagmanager.com` antes de qualquer um dos três ser descoberto pelo parser.
2. **O container GTM tem 453KB** (medido: `GTM-MVQW6VLD` carrega GA4 `G-4CCWNEG0EV` + Meta Pixel
   `fbevents.js`) e o loader é o **primeiro elemento do `<head>`**, antes de `<meta charset>`.
3. **SEO/GEO está no mínimo.** `robots.txt` tem 4 linhas e bloqueia uma rota que não existe
   (`/404`); o sitemap não tem `lastmod` e **indexa `/redirecionando`** — a página de hand-off do
   lead, que não tem `noindex` e ainda carrega GTM; o único structured data é `Organization` +
   `BreadcrumbList` quebrado (os dois `ListItem` apontam para a mesma URL) + `FAQPage` solto no
   `<body>`.
4. **Todo o material para GEO já existe no SSOT e não é usado**: datas ISO da imersão, 3 dias de
   agenda, 3 lotes com preço em USD, 10 módulos, 5 palestrantes com Instagram, 320 horas,
   certificações IESA/ASA. Nada disso vira `Course`, `Event`, `Offer` ou `Person` hoje — que é
   exatamente o que buscador e LLM leem para citar a página.

Resultado esperado: LCP mobile menor (imagem LCP com preload + GTM fora do caminho crítico),
INP/paint mais barato na dobra, e uma superfície de busca completa — robots + sitemap corretos,
grafo JSON-LD rico, `llms.txt`, `/404` próprio e a página de hand-off fora do índice.

> Escopo fechado com o usuário: liberar **todos** os crawlers de IA no `robots.txt` + `llms.txt`;
> criar `/404`; adiar a carga do GTM mantendo o mesmo container e os mesmos eventos.

---

## Parte A — Performance

Ordem de execução: cada item é independente e verificável isoladamente.

### A1. Preload da imagem LCP (`index.astro` + `Layout.astro`)

O plate do hero (`src/components/landing/Hero.astro:57-70`) já é `eager` + `fetchpriority="high"`,
mas só é descoberto quando o parser chega nele — depois de 63,6KB de CSS bloqueante. As variantes
AVIF são pequenas (19,7KB @640 · 54KB @1600), então o custo é latência de descoberta, não banda.

- `Layout.astro`: adicionar `<slot name="head" />` no fim do `<head>` (contrato novo do layout,
  documentar no comentário).
- `index.astro`: `const heroPlate = await getImage({ src: resolveImage(data.hero.background.image),
  widths: [640, 960, 1280, 1600], format: "avif", quality: 62 })` — os **mesmos** parâmetros do
  `<Picture>`, senão o browser baixa duas vezes.
- Emitir `<link slot="head" rel="preload" as="image" type="image/avif"
  imagesrcset={heroPlate.srcSet.attribute} imagesizes="100vw" fetchpriority="high" />`.
- **Verificação obrigatória:** no `dist/index.html`, o `imagesrcset` do preload tem de ser
  byte-a-byte igual ao `srcset` do `<source type="image/avif">`. Se divergir, a mudança piora em
  vez de melhorar.

### A2. Tirar o GTM do caminho crítico (`Layout.astro`)

Hoje o loader é o **primeiro elemento do `<head>`** (`Layout.astro:60-64`), antes de
`<meta charset>`. O container mede **453KB** e puxa GA4 + Meta Pixel.

- Novo prop `Props.gtmStrategy?: "lazy" | "eager"` (default `"lazy"`).
- `"lazy"`: o loader roda no primeiro de — `pointerdown`/`keydown`/`touchstart`/`scroll`
  (once, passive) ou `requestIdleCallback` com timeout de ~3500ms, o que vier antes. `dataLayer`
  continua sendo criado inline no `<head>` (fila preservada — nenhum push se perde).
- **`/redirecionando` passa `gtmStrategy="eager"`.** A página empurra `lead_submit` e redireciona
  em 2s (`redirecionando.astro:108-117`); com carga adiada o evento morreria na fila. Esta é a
  única página de conversão e ela não tem LCP a defender.
- Mover o loader para **depois** de `charset`/`viewport`/`title`/preloads, e adicionar
  `<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>` **apenas** no modo
  `eager` (em `lazy`, o preconnect na dobra desperdiça a conexão).
- O `<noscript><iframe>` do GTM permanece como está.
- **Risco aceito:** sessões que saem sem nenhuma interação e antes do idle timeout não contam
  pageview. Medir antes/depois no GA4 em tempo real.

### A3. Corrigir o layout thrash do parallax (`src/scripts/motion.ts:348-365`)

O loop lê `getBoundingClientRect()` e escreve `style.transform` **alternando** por elemento
(9 elementos) — cada escrita invalida o layout e a leitura seguinte força reflow. Separar em duas
passadas: ler todos os rects para um array, depois escrever todos os transforms. Mesma correção no
`hpin` (`motion.ts:712-721`), que hoje lê rect e escreve transform + `width` da barra por iteração.

### A4. `pointermove` sem gate de frame (`src/components/landing/Investimento.astro:304-308`)

É o único handler do codebase que escapa do frame gate: chama `getBoundingClientRect()` e escreve
duas custom properties **a cada evento**, sem rAF e sem `{ passive: true }`. Envolver num token de
rAF (guardar só a última posição) e registrar como passivo. Cachear o rect e reinvalidar em
`pointerenter`/`resize`.

### A5. Custo de paint na dobra

- `global.css:182-185`: `backdrop-filter` está na lista de `transition` do `.site-header` — animar
  blur força re-blur do fundo inteiro a cada frame dos 160ms. Remover `backdrop-filter` da
  transição (mantendo `background-color` e `border-color`); o blur passa a ser instantâneo.
- `global.css:562-574` + `Hero.astro:139`: `text-shimmer` é `background-clip: text` com
  `animation: shimmer 3s linear infinite` **no H1 acima da dobra** — repinta texto para sempre.
  Limitar a iterações finitas (ex.: `animation-iteration-count: 3`) mantendo o estado final legível.
  Decisão de design: se o usuário preferir o loop, manter e registrar o custo.
- `Hero.astro:360`: `backdrop-blur-sm` numa barra full-width acima da dobra. Avaliar substituir por
  fundo sólido com `color-mix` (o scrim já garante contraste). Verificar visualmente antes.

### A6. Logo do header via `astro:assets` (`Header.astro:37-45`)

PNG de 8.960B servido cru para renderizar a ~44px de altura. Mover o arquivo para
`src/assets/images/otb/` e consumir por `<Image>`/`<Picture>` (webp, `widths` adequados,
`width`/`height` explícitos, `fetchpriority="high"` — é chrome acima da dobra). O `Footer.astro:23`
usa o mesmo arquivo com `loading="lazy"` e deve migrar junto.

### A7. Headers de cache (`vercel.json`)

Hoje só `/_astro/*` (immutable) e favicons (1 dia). Adicionar:
- `/images/(.*)` e `/og/(.*)` → `public, max-age=604800` (arquivos versionados por conteúdo raramente,
  mas estáveis).
- HTML: `public, max-age=0, must-revalidate` explícito para não depender do default.
- `/robots.txt` e `/llms.txt` → `public, max-age=3600`.

### A8. Gate de Lighthouse mais honesto (`scripts/lighthouse-audit.mjs`)

Hoje audita `["/", "/otb"]` em **preset desktop** e reporta o **máximo** de 3 execuções
(`:16,:58`) — não mede mobile e esconde variância.
- Rotas: `["/", "/redirecionando"]` (`/otb` é um redirect `noindex`, não tem o que auditar).
- Rodar mobile **e** desktop; usar a **mediana** das execuções, não o máximo.
- Manter `THRESHOLD = 95` como advisory (`gates.advisory: true` em `.claude/config.json`).

---

*(Parte B — SEO/GEO — em construção, aguardando o desenho do grafo JSON-LD)*
