---
globs: src/**, astro.config.mjs, src/content.config.ts, .claude/**
---

# Astro Invariants — OTB USA

> Project-specific Astro overlay for **OTB USA**. Framework deep-dive lives in `Skill('astro')`; repo overlay lives in `references/otb-usa-overlay.md`.
> Stack: Astro 6 + React 19 islands + Tailwind v4 + Bun, static-only MPA.

## 1. Render-mode invariant

- Project ships static HTML via `bun run build`.
- Never add `export const prerender = false`.
- Never install SSR adapters.
- Never introduce `ClientRouter` / SPA routing.

## 2. Hydration directive routing

| Directive | When | Use case |
|---|---|---|
| none | default | Static `.astro`, zero JS |
| `client:load` | only critical first-paint interactivity | persistent floating/contact UI if required |
| `client:idle` | non-critical above-fold island | decorative/visual island after paint |
| `client:visible` | below-fold interactive | carousel/reveal that truly needs JS |
| `client:only="react"` | last resort | library cannot SSR due module-top browser APIs |

Default = no directive. Pure Astro first; React island only when interactivity is proven.

## 3. Content Collections SSOT

- Product copy lives in `src/content/products/otb.json`.
- Schema lives in `src/content.config.ts`.
- Pages load with `getEntry("products", "otb")` or equivalent.
- Components receive plain `.data`, never the full collection entry.
- Adding a field means updating schema + JSON + reader in one change.

## 4. OTB routes

Current public routes are `/` and `/otb`. Do not add redirects or pages for non-OTB products. If a future external redirect is required, update `astro.config.mjs`, sitemap behavior and content references in one change.

## 5. WhatsApp SSOT

- Never inline `wa.me/...`.
- Phone/helper source: `src/lib/whatsapp.ts`.
- Message text: `src/content/products/otb.json` CTA fields.
- Detail: `Skill('otb-usa')` → `references/whatsapp-ssot.md`.

## 6. Layout contracts

`src/layouts/Layout.astro` owns:

- `<html lang="pt-BR">`;
- SEO meta, OG/Twitter, canonical;
- Organization JSON-LD + page JSON-LD payload;
- skip link + `<main id="conteudo-principal">`;
- default OG image;
- `<noscript>` reveal fallback.

Pages pass `title`, `description`, `ogImage`, optional `canonical` and JSON-LD payload.

## 7. Tailwind v4 `@theme`

- Tokens live in `src/styles/global.css` `@theme`.
- No hardcoded hex in `.astro` / `.tsx`.
- Token canon: `Skill('otb-theme')`.

## Anti-patterns

| Don't | Why |
|---|---|
| `client:only="react"` without module-top browser API | unnecessary JS/client-only render |
| `client:load` for decorative islands | steals main-thread budget |
| hardcoded landing copy in components | bypasses OTB content SSOT |
| `prerender = false` | breaks static contract |
| `<ClientRouter />` | SPA behavior banned |
| hardcoded `wa.me` outside helper | breaks WhatsApp SSOT |
| hardcoded hex outside `global.css @theme` | breaks token canon |

## Pointers

- Astro framework: `Skill('astro')`.
- OTB overlay: `Skill('astro')` → `references/otb-usa-overlay.md`.
- OTB product/copy: `Skill('otb-usa')`.
- OTB theme/tokens: `Skill('otb-theme')`.
- Cardinal rules: `.claude/CLAUDE.md`.
