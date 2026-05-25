# Performance — compound (GPUS static site)

## Padrões deste lote (performance-optimizer)

| # | Tema | Aplicar quando |
|---|------|----------------|
| 1 | Sem `fetch` para `127.0.0.1` em `astro.config`, libs compartilhadas ou UI | Qualquer build de produção |
| 2 | Hero visual-only: `client:idle` em vez de `client:load` onde o SSR já entrega conteúdo legível | Ilhas Aceternity acima da dobra sem interação crítica imediata |
| 3 | `preconnect` Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com` + `crossorigin`) | `Layout` global com `<Font />` |
| 4 | Remover `astro:after-swap` se **não** há `ClientRouter` (MPA) | Evita listeners mortos e alinha à regra anti-SPA |
| 5 | Logo header: `fetchpriority="high"` + `loading="eager"` | Candidato a LCP em páginas sem hero imagem |
| 6 | Primeira imagem grande pós-hero (ex.: NeonStory): `eager` + `fetchpriority="high"` | Landings com texto hero + foto grande em seguida |
| 7 | Avatares / fotos below-fold: `fetchpriority="low"` com `loading="lazy"` | Grid equipe, fundadores, preview sobre |

## Medir depois

- Lighthouse (mobile): LCP, TBT, CLS  
- `ls -lhS dist/_astro/ | head` para chunks grandes

## Backlog

- Auditar outras ilhas `motion/react` para tree-shake / LazyMotion se o bundle crescer.  
- Corrigir aviso de minify CSS `[file:lines]` se a classe vier de conteúdo externo (GSD/workflows), não do `src/`.
