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

## Parte B — SEO / GEO

### B1. Correções de indexação (bug, prioridade máxima)

- **`/redirecionando` está no índice.** Adicionar prop `noindex?: boolean` ao `Layout.astro`
  emitindo `<meta name="robots" content="noindex, follow">`; a página de hand-off passa
  `noindex`. **Não** usar `Disallow` no robots — bloquear o crawl impede a leitura do próprio
  `noindex`.
- **Excluir `/redirecionando` do sitemap** (`astro.config.mjs`, arquivo protegido — razão
  explícita: página de hand-off não é conteúdo indexável):
  ```js
  sitemap({
    filter: (page) => !/\/(otb|redirecionando)\/?$/.test(page),
    lastmod: new Date(),
  })
  ```
  Com `/redirecionando` fora, sobra só `/` — e a divergência de trailing slash contra
  `vercel.json` (`trailingSlash: false`) desaparece junto.
- **`BreadcrumbList` quebrado** (`index.astro:71-88`): os dois `ListItem` apontam para a mesma
  URL. Position 2 passa a apontar para `${canonical}#programa`.

### B2. `robots.txt` — liberar IA explicitamente (`public/robots.txt`)

Arquivo estático em `public/` (não precisa de dado dinâmico; um endpoint `.ts` só adicionaria
superfície). Conteúdo final:

```txt
User-agent: *
Allow: /

# Crawlers de IA — acesso liberado (decisão de GEO: queremos ser citados).
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: Claude-Web
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Perplexity-User
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: CCBot
Allow: /
User-agent: Bytespider
Allow: /
User-agent: Amazonbot
Allow: /
User-agent: Meta-ExternalAgent
Allow: /
User-agent: cohere-ai
Allow: /

Sitemap: https://otb.gpus.com.br/sitemap-index.xml
```

Sai o `Disallow: /404` (rota que não existia; passa a existir com `noindex` + status 404, que já
resolve). **Não** entra `Disallow: /redirecionando` — ver B1.

### B3. `llms.txt` (`public/llms.txt`)

Formato llmstxt.org (H1 + blockquote + seções com links), em pt-BR, **só com fatos do SSOT**:
programa (320h, 10 módulos), imersão (19–21 abr 2027, Boston), certificações (MBA Instituto IESA
+ Grupo US, ASA Fresh Specimens), público, lote ativo (US$ 3.500), corpo docente, e o disclaimer
de `legal.disclaimer` — a nota de que Boston/Harvard são contexto geográfico, nunca vínculo, tem
de estar no arquivo. Sem número de vagas, sem depoimento, sem rating. Fora do sitemap.

### B4. Grafo JSON-LD (o item de maior retorno para GEO)

Hoje: `Organization` (com `sameAs: []`) + `BreadcrumbList` quebrado no `<head>`, `FAQPage` solto
no `<body>`. Nenhum `Course`, `Event`, `Offer` ou `Person` — que é justamente o que buscador e LLM
leem para responder "quanto custa", "quando é", "quem ensina".

**Arquitetura:** um único `<script type="application/ld+json">` no `<head>`, com
`{"@context": "https://schema.org", "@graph": [...]}` e nós ligados por `@id`. Construtor em
**`src/lib/structured-data.ts`**, alimentado por `data` da collection — nenhuma string de produto
nova em `.astro`.

`Layout.astro` passa a emitir sempre `@graph`, com o nó `#organization` definido uma vez; a página
contribui os demais nós via prop `jsonLd`. Nós propostos:

| `@id` | `@type` | Fonte no SSOT |
|---|---|---|
| `#organization` | `EducationalOrganization` | nome Grupo US, logo, `contactPoint` (WhatsApp SDR), `sameAs` |
| `#website` | `WebSite` | `publisher` → `#organization`, `inLanguage: pt-BR` |
| `#webpage` | `WebPage` | `isPartOf` → `#website`, `about` → `#course`, `primaryImageOfPage`, `dateModified` |
| `#course` | `Course` | `programa.horas` → `timeRequired: "PT320H"`, `modulos.lista` → `syllabusSections`, `certificacoes` → `educationalCredentialAwarded`, `instructor` → `#speaker-*` |
| `#courseinstance` | `CourseInstance` | `courseMode: ["online","onsite"]`, `startDate`/`endDate`, `location` → Boston, `subEvent` ← os 3 dias de `agenda`, `offers` → `#offer-lote-ativo` |
| `#offer-lote-1` | `Offer` | `lotes[]` ativo: `price: "3500"`, `priceCurrency: "USD"`, `availability: InStock`, `validFrom` |
| `#speaker-<slug>` | `Person` (×5) | `speakers.lista`: `name`, `description`, `image`, `sameAs` ← Instagram real |
| `#faq` | `FAQPage` | `faq[]` (10 Q&A) — **migra** do `<body>` para o grafo |
| `#breadcrumb` | `BreadcrumbList` | corrigido (B1) |

**Guardrails no schema** (invioláveis): `provider`/`educationalCredentialAwarded` citam apenas
**Instituto IESA, Grupo US e ASA**; Boston entra só como `location`/`Place`; **nenhuma**
`aggregateRating`, `review` ou contagem de vagas — não existe prova para nenhum dos três.

**Campos novos necessários** (`src/content.config.ts` + `otb.json`, arquivo protegido — razão:
sem eles não há `startDate`/`endDate`/`address` válidos em ISO):

```ts
edicao: z.object({
  // ...existentes
  inicio: z.string().datetime({ offset: true }),   // "2027-04-19T09:00:00-04:00"
  fim: z.string().datetime({ offset: true }),      // "2027-04-21T18:00:00-04:00"
  endereco: z.object({
    localidade: z.string(),   // "Boston"
    regiao: z.string(),       // "MA"
    pais: z.string(),         // "US"
  }),
})
lotes: z.array(z.object({ /* ...existentes */ validoDe: z.string().datetime({ offset: true }).optional() }))
seo: z.object({ /* ...existentes */ sameAs: z.array(z.url()).optional() })
```

`edicao.inicio` duplica `countdown.target` por necessidade (um alimenta o contador, o outro o
schema) — o construtor **lança erro em build** se os dois divergirem, para a duplicação não virar
drift.

### B5. Meta tags faltantes (`Layout.astro`)

Entram (retorno real): `og:site_name`, `og:image:width` / `og:image:height` (1200×630 já
confirmado no arquivo), `og:image:alt`, `<meta name="robots">` (via prop `noindex`).
Ficam de fora: `twitter:site`/`twitter:creator` (não há handle oficial no SSOT — não inventar),
`manifest` (não é PWA), `keywords` (ignorado). `apple-touch-icon` só se gerarmos o PNG 180×180 —
item opcional, não bloqueia nada.

### B6. `/404` (`src/pages/404.astro`)

Página própria com `noindex`, mensagem curta e CTA de volta para `/` + WhatsApp. Copy entra como
bloco `erro404` no `otb.json` + schema (mesma disciplina do resto da landing). Vercel serve
`dist/404.html` automaticamente com status 404.

### B7. Política de privacidade — **recomendação: não criar rota local**

`leadForm.consent.privacyUrl` já aponta para `https://www.gpus.com.br/politica-de-privacidade`,
**verificado agora: HTTP 200**. Criar uma cópia local significaria escrever texto jurídico novo
(que não temos e não pode ser fabricado) e criar duas versões da mesma política — risco de
divergência num documento LGPD. Recomendação: manter o link externo. Se o usuário quiser a rota
local mesmo assim, ela precisa vir com o texto jurídico fornecido por ele.

---

## Arquivos tocados

| Arquivo | Mudança |
|---|---|
| `src/layouts/Layout.astro` | `slot="head"`, prop `noindex`, prop `gtmStrategy`, `@graph` único, og extras |
| `src/pages/index.astro` | preload da LCP, grafo via `buildLandingGraph`, breadcrumb corrigido |
| `src/pages/redirecionando.astro` | `noindex` + `gtmStrategy="eager"` |
| `src/pages/404.astro` | **novo** |
| `src/lib/structured-data.ts` | **novo** — construtor do grafo |
| `src/content.config.ts` 🔒 | `edicao.inicio/fim/endereco`, `lotes[].validoDe`, `seo.sameAs`, `erro404` |
| `src/content/products/otb.json` | os mesmos campos, com os valores reais |
| `astro.config.mjs` 🔒 | filtro do sitemap + `lastmod` |
| `public/robots.txt` | reescrito |
| `public/llms.txt` | **novo** |
| `vercel.json` | headers de cache |
| `src/scripts/motion.ts` | duas passadas no parallax e no hpin |
| `src/components/landing/Investimento.astro` | `pointermove` com rAF + passive |
| `src/components/landing/Header.astro` · `Footer.astro` | logo via `astro:assets` |
| `src/styles/global.css` | `backdrop-filter` fora da transição; shimmer finito |
| `scripts/lighthouse-audit.mjs` | mobile + desktop, mediana, rotas corretas |

🔒 = arquivo protegido em `.claude/config.json::protectedFiles` — o hook avisa, a mudança exige
razão explícita (registrada acima).

---

## Verificação

Gate padrão depois de **cada** bloco (A e B são independentes):

```bash
bun run lint && bunx astro check && bun run build && bun test
```

Checagens específicas sobre o `dist/`:

```bash
# 1. preload da LCP bate com o srcset do <source avif> (senão = download duplo)
grep -o 'imagesrcset="[^"]*"' dist/index.html
grep -o '<source srcset="[^"]*" type="image/avif"' dist/index.html

# 2. /redirecionando fora do sitemap e com noindex
cat dist/sitemap-0.xml
grep -o '<meta name="robots"[^>]*>' dist/redirecionando/index.html dist/404.html

# 3. JSON-LD válido e completo
grep -o '"@type":"[^"]*"' dist/index.html | sort | uniq -c
#    → esperado: EducationalOrganization, WebSite, WebPage, Course, CourseInstance,
#      Offer, Person ×5, FAQPage, BreadcrumbList. Zero AggregateRating/Review.

# 4. sem FAQPage duplicado (um só bloco ld+json na página)
grep -c 'application/ld+json' dist/index.html   # → 1

# 5. GTM saiu do topo do <head>
head -c 300 dist/index.html
```

Validação externa (manual, depois do deploy):
- Rich Results Test + Schema Markup Validator sobre `https://otb.gpus.com.br/`.
- `curl -I https://otb.gpus.com.br/robots.txt` e `/llms.txt` → 200 `text/plain`.
- `bun run lighthouse:audit` (já com mobile) contra `bun run preview`, comparando com a linha de
  base atual: desktop 96/98, LCP 2,0s, CLS 0, a11y 100.
- GA4 tempo real: confirmar que `lead_submit` continua chegando depois da mudança de GTM.

---

## Resultado (19/08/2026)

Executado. Gates: `bun run lint` · `bunx astro check` · `bun run build` · `bun test` (49 pass).

Lighthouse **mediana de 3**, contra o build servido por `bun run preview`:

| | performance | a11y | best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| mobile | 95 | 100 | 96 | 100 | 2,18s | 0 | 0,23s |
| desktop | 96 | 100 | 96 | 100 | 2,03s | 0 | 0,18s |

Grafo JSON-LD: **18 nós**, um único bloco `ld+json`, zero `@id` pendurado, zero `aggregateRating`/`review`,
`Offer` = `3500 USD / Paid / validFrom 2026-05-01`. Sitemap: uma `<loc>` com `<lastmod>`. Head passou de
8,5KB para 24,4KB (HTML gzip 27,1KB → 30,6KB), com o preload da LCP ainda no offset ~6,3KB, antes do grafo.

### Onde a execução divergiu do plano — e por quê

1. **Logo não passou por `astro:assets`** (A6). Medido: webp 2x = 15,5KB, avif 2x = 17,8KB, PNG
   full-color = 14,5KB, contra 8,96KB do arquivo que se queria otimizar. Codec com perdas engorda arte
   chapada. Entrou PNG-8 quantizado em 1x/2x (2,1KB / 5,6KB) — melhor que o estado anterior em qualquer DPR.
2. **`llms.txt` é gerado** (`src/pages/llms.txt.ts`), não estático. Um arquivo em `public/` seria uma
   segunda cópia da oferta fora do SSOT: no dia em que o Lote 2 abrir, ele seguiria anunciando US$ 3.500
   para todo LLM que o lesse, sem nada quebrar.
3. **`Organization`, não `EducationalOrganization`.** O segundo tipo lê como instituição de ensino
   acreditada — exatamente o que `legal.disclaimer` e a primeira FAQ existem para negar.
4. **Imersão virou `EducationalEvent` próprio**, com `superEvent` apontando para o `CourseInstance`. Um nó
   só não pode ser `blended` (10 módulos online + 3 dias) e `OfflineEventAttendanceMode` ao mesmo tempo.
5. **Credenciais viraram campo explícito** (`credenciais[]` no JSON) em vez de fatia de `certificacoes`:
   aquela marquee tem 4 itens e dois deles não são credenciais. Um `slice(0,2)` publicaria
   "10 módulos · 320 horas" como certificação no dia em que alguém reordenasse por motivo de design.
6. **`edicao.inicio` não foi criado.** `countdown.target` já é o instante da imersão com o offset de Boston;
   um segundo campo com a mesma data seria drift esperando acontecer.
7. **Breadcrumb item 2 sem `item`.** Uma âncora não é uma página; o último item do rastro é a página atual.
8. **Lighthouse audita só `/`.** `/otb` é 301 e `/redirecionando` devolve o visitante para `/` quando não há
   lead no `sessionStorage` — auditar qualquer um dos dois é medir a home através de um redirect.
9. **`/politica-de-privacidade` não foi criada.** `leadForm.consent.privacyUrl` já aponta para
   `https://www.gpus.com.br/politica-de-privacidade` (verificado: HTTP 200). Uma cópia local exigiria texto
   jurídico novo — que não temos e não pode ser fabricado — e criaria duas versões do mesmo documento LGPD.
10. **`backdrop-blur` da barra de fatos do hero mantido** (A5, terceiro item). É custo real de paint sobre um
    plate com parallax, mas a troca por fundo sólido altera a composição aprovada e os números já passam.
    Fica registrado como oportunidade, não como dívida silenciosa.

### Oportunidades que sobraram (medidas, não aplicadas)

- **552KB de terceiros** (GTM 151KB + GA4 172KB + Pixel 111KB + config 124KB) — hoje fora do caminho crítico,
  mas ainda respondem por quase todo o TBT de 230ms. Só encolhem dentro do container do GTM.
- **CSS bloqueante**: `Layout.css` 11,9KB gz (451ms em 3G lento emulado) + `index@_@astro.css` 2,2KB gz.
  Inline via `build.inlineStylesheets: "always"` tiraria dois round-trips e engordaria o HTML em ~14KB gz.
- **21KB** economizáveis na imagem da seção Virada (below-fold, `quality` mais baixa).
- **`favicon.ico` de 8,9KB** buscado com prioridade alta; o `.svg` já cobre navegador moderno.

### Revisão adversarial do diff (19/08/2026)

26 achados brutos em quatro lentes independentes, cada um submetido a um refutador com acesso aos
arquivos: **24 refutados, 2 confirmados** — ambos corrigidos:

1. **`EducationalEvent` não é tipo do schema.org** (404; a classe real é `EducationEvent`). O nó da
   imersão estava sem tipo válido, o que derruba a elegibilidade a rich result de Event e deixa os três
   dias da agenda pendurados num `superEvent` sem tipo. Corrigido, com asserção de teste fixando o tipo.
   No mesmo passo saiu `instructor` do nó `Course` — a propriedade tem domínio `CourseInstance`.
2. **Índice divergindo da árvore de trabalho.** `tests/structured-data.test.ts`, `public/images/` e o
   rewrite do `lighthouse-audit.mjs` estavam fora do índice enquanto o `git mv` do logo já estava dentro:
   um commit naquele estado publicaria um `Organization.logo` apontando para arquivo deletado, sem o
   teste que pega exatamente isso. Índice realinhado com a árvore (`git add`, sem commit).

Gate final: lint · `astro check` · build · `bun test` **51 pass**. Grafo: 18 nós, um bloco `ld+json`,
zero `@id` pendurado, `EducationEvent` com `startDate 2027-04-19T09:00:00-04:00` e `endDate 2027-04-21`.
