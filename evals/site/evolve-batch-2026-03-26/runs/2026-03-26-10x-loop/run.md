# Run agregado: 10 loops — `2026-03-26-10x-loop`

**Decision geral:** keep (todos os ciclos com patch mínimo e gates verdes).

Validação única ao fim do lote: `bun run lint && bunx astro check && bun run build`.

---

## Loop 1 — `products-grid`

- **Hipótese:** visitante entende o grid como **catálogo com destino explícito**; remove ruído de rede (debug fetch).
- **Arquivos:** `src/components/home/ProductsGrid.astro`
- **Decision:** keep

## Loop 2 — `cta-section`

- **Hipótese:** headline orientada a **momento na jornada** + copy de **indicação de trilha** aumenta clareza comercial antes do clique no WhatsApp.
- **Arquivos:** `src/components/home/CTASection.astro`
- **Decision:** keep

## Loop 3 — `about-preview`

- **Hipótese:** alinhar à narrativa “trilha + números” e remover **superlativo não provado** melhora confiança (E-E-A-T leve).
- **Arquivos:** `src/components/home/AboutPreview.astro`
- **Decision:** keep

## Loop 4 — `stats-section`

- **Hipótese:** números ganham contexto semântico para crawlers e leitores de tela com `h2` acessível.
- **Arquivos:** `src/components/home/StatsSection.astro`
- **Decision:** keep

## Loop 5 — `contato-seo`

- **Hipótese:** title/description refletem **canais + promessa de indicação de programa**.
- **Arquivos:** `src/pages/contato.astro`
- **Decision:** keep

## Loop 6 — `sobre-seo`

- **Hipótese:** SERP institucional com **missão/equipe** e keywords de formação.
- **Arquivos:** `src/pages/sobre.astro`
- **Decision:** keep

## Loop 7 — `footer-blurb`

- **Hipótese:** rodapé ecoa **mesma promessa** que Layout/home (consistência de marca).
- **Arquivos:** `src/components/layout/Footer.astro`
- **Decision:** keep

## Loop 8 — `product-meta-trintae3`

- **Hipótese:** description citando **MEC + público + resultado** fortalece snippet quando JSON alimenta OG/description em funis externos e consistência interna.
- **Arquivos:** `src/content/products/trintae3.json`
- **Decision:** keep

## Loop 9 — `product-meta-auriculo`

- **Hipótese:** description destaca **formato presencial + valor percebido + entrada**.
- **Arquivos:** `src/content/products/curso-auriculo.json`
- **Decision:** keep

## Loop 10 — `product-meta-neon` + `404`

- **Hipótese (10a):** meta da mentoria com **nome completo do produto + outcome de escala**. **(10b)** 404 com recovery path para programas.
- **Arquivos:** `src/content/products/mentoria-black-neon.json`, `src/pages/404.astro`
- **Decision:** keep
