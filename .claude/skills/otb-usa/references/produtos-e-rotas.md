# OTB USA — rotas e URLs

## Rotas do repo

| Rota | Arquivo | Uso |
|---|---|---|
| `/` | `src/pages/index.astro` | entrada/canonical landing ou fallback para OTB |
| `/otb` | `src/pages/otb.astro` | landing principal OTB USA |

## URLs

| Tipo | URL |
|---|---|
| Canonical | `https://otb.drasacha.com.br` |
| Local dev | `http://localhost:4321` |

## Regras

- Não adicionar rotas de produtos fora do OTB USA.
- Não adicionar redirects de produtos paralelos.
- Se a URL canônica mudar, atualizar em conjunto: `astro.config.mjs`, `.claude/config.json`, `README.md`, `PRODUCT.md`, `Layout.astro` fallbacks e qualquer JSON-LD/canonical hardcoded.
- Sitemap deve refletir apenas rotas OTB válidas.
