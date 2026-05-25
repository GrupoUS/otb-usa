# Produtos — IDs, slugs, rotas e URLs

**Site institucional (Astro):** `https://grupous.com.br` — ver `site` em [astro.config.mjs](../../../../astro.config.mjs).  
**Content Collections:** [src/content/products/](../../../../src/content/products/)  
**Schema:** [src/content.config.ts](../../../../src/content.config.ts)

Rotas entre parênteses são paths relativos ao domínio do site (ex.: `https://grupous.com.br/trintae3`).

| ID manual (quando existir) | Nome no JSON | Slug | Rota / comportamento no site institucional | `externalSiteUrl` ou redirect | `cta.url` (JSON) |
|----------------------------|--------------|------|---------------------------------------------|------------------------------|------------------|
| `produto_trintae3` | TRINTAE3 | `trintae3` | Página [`/trintae3`](../../../../src/pages/trintae3.astro) | — | `https://drasacha.com.br/trintae3` |
| `produto_mentoria_black_neon` | Mentoria BLACK NEON | `mentoria-black-neon` | [`/mentoria-black-neon`](../../../../src/pages/mentoria-black-neon.astro) | — | `https://drasacha.com.br/mentoria-black-neon` |
| `produto_otb_mba` | OTB (título no JSON) | `otb` | **Sem** `.astro` dedicado: redirect [`/otb`](../../../../astro.config.mjs) → `https://ota-dubai.lovable.app/` | `https://ota-dubai.lovable.app/` | mesmo |
| `produto_comunidade_us` | Comunidade US | `comunidade-us` | [`/comunidade-us`](../../../../src/pages/comunidade-us.astro) | — | `https://drasacha.com.br/comunidade-us` |
| `produto_curso_auriculoterapia` | Curso Aurículo (nome no JSON) | `curso-auriculo` | [`/curso-auriculo`](../../../../src/pages/curso-auriculo.astro) | — | `https://drasacha.com.br/curso-auriculo` |
| `produto_na_mesa_certa` | Na Mesa Certa | `na-mesa-certa` | Redirect [`/na-mesa-certa`](../../../../astro.config.mjs) → `https://namesacerta.com.br/` | `https://namesacerta.com.br/` | mesmo |
| *(manual: pendente)* | Neon Dash | `neon-dash` | [`/neon-dash`](../../../../src/pages/neon-dash.astro) | — | `https://drasacha.com.br/neon-dash` |

## LP / hub adicionais (manual Google Doc)

- TRINTAE3: `https://trintae3.drasacha.com.br/`  
- OTB: `https://otb.drasacha.com.br/`  
- Na Mesa (exemplo no doc): `https://drasacha.com.br/na-mesa/` — pode diferir de `namesacerta.com.br`; validar campanha.

## Manutenção

Ao trocar destino externo: atualizar `externalSiteUrl`, `cta.url` no JSON, `redirects` em `astro.config.mjs` e o `filter` do sitemap se aplicável — ver learnings em [AGENTS.md](../../../../AGENTS.md).
