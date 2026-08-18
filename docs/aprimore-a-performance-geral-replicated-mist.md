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

*(seções de execução em construção — aguardando o desenho do grafo JSON-LD)*
