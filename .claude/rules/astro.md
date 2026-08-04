---
globs: src/**, astro.config.mjs, src/content.config.ts, .claude/**
---

# Astro Invariants — GPUS Astro Landing

> Astro overlay portável para landings GPUS. Valores de instância em `.claude/config.json` (`${...}`). Framework deep-dive em `Skill('astro')`.
> Stack: Astro 6 + React 19 islands (preferir zero) + Tailwind v4 + Bun, static-only MPA, deploy Vercel.

## 1. Render-mode invariant

- Projeto entrega HTML estático via `bun run build` → `dist/` (Vercel).
- Never add `export const prerender = false`.
- Never install SSR adapters.
- Never introduce `ClientRouter` / SPA routing.

## 2. Hydration directive routing

| Directive | When | Use case |
|---|---|---|
| none | default | Static `.astro`, zero JS — **estado atual da página** |
| `client:load` | só interatividade crítica de primeiro paint | raríssimo; preferir Astro puro + script inline |
| `client:idle` | island não-crítico above-fold | island decorativo após paint |
| `client:visible` | below-fold interativo | carousel/reveal que realmente precise de JS |
| `client:only="react"` | last resort | lib que não SSR por browser API no módulo |

Default = sem directive. Astro puro primeiro; **ilha React só quando a interatividade for provada**. (O botão WhatsApp flutuante é Astro puro + script vanilla justamente por isso.)

## 3. Content Collections SSOT

- Copy da landing vive em `${content.productJson}`.
- Schema em `src/content.config.ts` (slug `${content.productSlug}`).
- Página carrega via `getCollection("products")` + `find(slug === "${content.productSlug}")`.
- Componentes recebem `.data` (sub-objetos: `seo`, `hero`, `why`, `audience`, `programa`, `turmas`, `modulos`, `bostonHarvard`, `speakers`, `investimento`, `faq`, `edicao`, `lotes`, `agenda`, `parceiros`, `legal`), nunca a entry completa.
- Adicionar campo = schema + JSON + leitor numa só mudança.

## 4. Rotas

Rotas públicas hoje: **`/` apenas**, mais o redirect `/otb` → `/` (excluído do sitemap via `filter`). `${content.legalRoutes}` está vazio — não existem `/termos`, `/politica-de-privacidade` nem `/404` neste repo; criar qualquer uma delas = decisão de escopo, não efeito colateral. Âncoras internas: `${content.anchors}`. Não adicionar rotas/redirects de outros produtos. Mudança de rota/redirect = atualizar `astro.config.mjs` + sitemap + `robots.txt` numa só mudança.

## 5. WhatsApp SSOT

- Never inline `wa.me/...`.
- Número/helper: `${lead.whatsappHelper}` (`whatsappUrlWithText`, `whatsappUrlBase`, `WHATSAPP_SDR_E164`).
- Toda mensagem começa com `${lead.whatsappGreeting}` (enforce em runtime + refine no schema).
- Texto das mensagens vive nos campos `whatsapp.message` / `whatsappFallback.message` do JSON.

## 6. Layout contracts

`src/layouts/Layout.astro` owns:

- `<html lang="pt-BR">`, `<html class="js">` (inline, progressive enhancement);
- SEO meta, OG/Twitter, canonical, robots (prop `noindex`);
- `EducationalOrganization` JSON-LD + payload de página (`jsonLd` prop, array-merge);
- `Header` + `<main id="conteudo-principal">` + `Footer` + `WhatsAppFloatingButton`;
- skip link, `<noscript>` reveal fallback, IntersectionObserver reveal hardened;
- default OG image (`${content.ogImage}`).

Páginas passam `title`, `description`, `ogImage`, `whatsappMessage`, `hasBottomBar`, opcional `canonical`/`breadcrumbs`/`noindex`/`jsonLd`.

## 7. Tailwind v4 `@theme`

- Tokens em `src/styles/global.css` `@theme` (Navy/Gold, fonts, escala clamp, motion, depth).
- Sem hex hardcoded em `.astro`/`.tsx` (exceção: `<meta theme-color>` espelhando `--color-navy`).
- Token canon: `Skill('gpus-theme')`.

## 8. Conversão + tracking

- **Fluxo atual: WhatsApp-only** (`lead.leadFlow`). Não existe formulário, endpoint nem banco. CTA primário único = "Falar com Laura no WhatsApp"; mensagens por intenção vivem no JSON (`hero.cta.whatsappMessage`, `investimento.cta.whatsappMessage`).
- Introduzir formulário de lead = **aprovação prévia**: exige `<label>` reais, validação, estados de erro/sucesso acessíveis, consent LGPD + link de privacidade (que hoje não existe como rota) e endpoint em env.
- Tracking GA4/Meta Pixel: nomes de env declarados (`${tracking.ga4Env}`, `${tracking.pixelEnv}`) mas **não instrumentados** — `import.meta.env` não é lido em `src/`. Instrumentar = aprovação.

## Anti-patterns

| Don't | Why |
|---|---|
| `client:only="react"` sem browser API no módulo | JS/client-only desnecessário |
| `client:load` para island decorativo | rouba main-thread budget |
| copy da aula hardcoded em componente | fura o SSOT de conteúdo |
| `prerender = false` | quebra contrato estático |
| `<ClientRouter />` | SPA banido |
| `wa.me` hardcoded fora do helper | fura WhatsApp SSOT |
| hex fora de `global.css @theme` | fura token canon |
| `site`/redirect/sitemap dessincronizados | SEO split / canonical errado |

## Pointers

- Astro framework: `Skill('astro')`.
- Copy/funil/voz: `Skill('grupo-us')`.
- Theme/tokens: `Skill('gpus-theme')`.
- Cardinal rules: `.claude/CLAUDE.md`.
