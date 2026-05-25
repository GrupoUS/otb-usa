# GPUS Overlay — Grupo US Site Institutional (project-specific Astro rules)

> Loaded when working in the **Grupo US institutional site** repo (`grupous.com.br`).
> Project-specific Astro patterns that override or supplement generic Astro skill guidance.
> Generic Astro patterns: parent `SKILL.md` + sibling `references/*.md`.

---

## Render mode invariants

The site is **static-only Astro 6** (cardinal #4 in `.claude/CLAUDE.md`). These are non-negotiable:

| Forbidden | Why | Verify |
|---|---|---|
| `export const prerender = false` on any page | Breaks static build contract | `grep -rn "prerender = false\|prerender: false" src/pages` → empty |
| `output: 'server' \| 'hybrid'` in `astro.config.mjs` | Project deploys static HTML to Railway, no SSR | `grep -n "output:" astro.config.mjs` — only `'static'` or omitted |
| `@astrojs/node` / `@astrojs/vercel` / `@astrojs/cloudflare` adapter | No server runtime | `grep "@astrojs/(node\|vercel\|cloudflare)" package.json` → empty |
| `<ClientRouter />` from `astro:transitions` | No SPA — site is MPA with full reloads | `grep -rn "ClientRouter" src/` → empty |
| `astro:after-swap` event listeners | Implies SPA router | `grep -rn "astro:after-swap" src/` → empty |

> **Generic Astro skill notes** that View Transitions / `<ClientRouter />` are valid in Astro 5+/6. **The repo wins** — institutional site overrides this.

---

## Hydration (project rule)

Beyond generic guidance:

- **`client:load` is forbidden** outside `WhatsAppFloatingButton` in `Layout.astro`. Floating persistent UI across-route requires immediate hydration. Any other use needs written justification in PR description.
- **Hero islands** (`AuroraBackground`, `TextGenerateEffect`, etc.): `client:idle`. Text-first heroes (Mentoria Black NEON, Curso de Aurículo) SSR text first, hydrate visual island after browser idle. **Never** `client:load` on pure-visual islands.
- **Below-fold islands**: `client:visible` (default).
- **`client:only="react"`**: forbidden — every island in this site can SSR.

Verify:
```bash
grep -rn "client:load" src/
# expect: exactly 1 hit (Layout.astro WhatsAppFloatingButton)

grep -rn "client:idle" src/components/landing src/components/home
# expect: hero islands only
```

---

## External redirect tri-sync

Three places must move together when an external destination changes (or when a product becomes external):

**1. Product JSON** (`src/content/products/<slug>.json`):

```json
{
  "slug": "comunidade-us",
  "externalSiteUrl": "https://drasacha.com.br/pagina-de-inscricao-comu-us/",
  "cta": {
    "url": "https://drasacha.com.br/pagina-de-inscricao-comu-us/",
    "label": "Quero entrar para a Comunidade US",
    "type": "primary"
  }
}
```

When `externalSiteUrl` is set, `ProductsGrid` and `Header` link externally with `target="_blank" rel="noopener noreferrer"` and `sr-only` "(abre em nova guia)" affordance.

**2. `astro.config.mjs::redirects`**:

```js
redirects: {
  '/comunidade-us': { status: 301, destination: 'https://drasacha.com.br/pagina-de-inscricao-comu-us/' },
}
```

Astro emits static HTML stub with `meta refresh` + `noindex` + `canonical` to destination. Handles deep links (bookmarks, marketing).

**3. `astro.config.mjs::sitemap.filter`**:

```js
sitemap({
  filter: (page) => !['/comunidade-us', '/neon-dash', '/na-mesa-certa', '/otb', '/trintae3'].some((p) => page.endsWith(p)),
})
```

Excludes redirect-only paths from `dist/sitemap-*.xml`. Without this, search engines split-index `/<slug>` AND `<externalSiteUrl>`.

**Verification after sync**:

```bash
bun run check:external-urls   # destination reachable
bunx astro check              # types still valid
bun run build                 # static output regenerated
grep -E "/(comunidade-us|neon-dash|na-mesa-certa|otb|trintae3)" dist/sitemap-*.xml  # expect empty
```

External funnels (`drasacha.com.br`, Kiwify, `lovable.app`) are owned by other teams. If destination 404s in `bun run check:external-urls`, coordinate with marketing — don't silently change the URL.

---

## Layout.astro contracts

`src/layouts/Layout.astro` carries these contractual elements — touch carefully:

### Skip link
- Class `.skip-link` (defined in `src/styles/global.css`).
- Hidden by `transform: translateY(-200%)` until `:focus-visible`; slides in (transform-only, GPU-friendly).
- Target: `<main id="conteudo-principal" tabindex="-1">` (id is contractual — keep exact).
- **Position: first focusable element on every page** (rendered before `<Header />`).
- Copy: `"Pular para o conteúdo principal"` (pt-BR).

If you reorder elements in `Layout.astro`, skip link must remain first focusable.

### `<noscript>` reveal fallback
- Inline `<style>` block forces `[data-reveal]` `opacity: 1` + `transform: none` when JS off.
- **Never drop without like-for-like replacement** — JS-off users would see blank sections.

### `[data-reveal]` IntersectionObserver
- Inline script in `Layout.astro` adds `.revealed` class when section enters viewport.
- CSS handles `opacity 0→1` + `translateY(8px → 0)` (transform + opacity only, never height).
- Wrapped in try/catch + degrade silently if observer fails.

### Google Fonts preconnect
- `<link rel="preconnect" href="https://fonts.googleapis.com" />`
- `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />`
- `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&display=swap" />`
- `display=swap` mandatory — prevents FOIT.

---

## Content Collections SSOT

Project-specific addendum to generic Astro Content Collections (sibling `references/content-collections.md`):

- `src/content.config.ts` (project root) is SSOT — Zod schemas + glob loaders.
- **Cardinal #5: never hardcode product / team / landing copy** in `.astro` or `.tsx`. Always `getCollection()` / `getEntry()` from `src/content/`.
- Component template: read `data` from collection, render JSX/Astro from data fields. No string literals from JSON in component file.
- Schema validation is enforced by `bunx astro check` — Zod re-runs on type-check. JSON edits → run check before commit.
- Schema fields are documented in `src/content.config.ts`. Adding a field: update schema + JSON files + component reading the field.

**`cta.whatsappMessage` rule:** every product's `whatsappMessage` starts with `"Olá, Laura!"` — see `grupo-us` skill `references/whatsapp-ssot.md` for full WhatsApp SSOT.

---

## Image discipline

Already covered in sibling `references/performance.md`, but project rules:

- Hero / above-fold: Astro `<Image>` `loading="eager"` + `fetchpriority="high"`.
- Below-fold: `loading="lazy"` + `fetchpriority="low"`.
- Always explicit `width` + `height` (CLS = 0).
- Decorative: `alt=""` + `aria-hidden="true"`.
- Meaningful: descriptive `alt` in pt-BR (who + role + context).
- `NeonStory` image is **below-fold** on Mentoria Black NEON landing → keep `loading="lazy"` + `fetchpriority="low"` (per `docs/learnings-log.md` entry [2026-03-26]).

---

## Smoke commands (project)

```bash
# External destination reachability
bun run check:external-urls

# No hardcoded hex outside @theme
grep -rn "bg-\[#\|text-\[#\|border-\[#" src/

# Lucide-only icon enforcement
grep -rn "material-symbols\|<i class=\"fa\|font-awesome" src/ \
  --include="*.astro" --include="*.tsx" --include="*.ts"

# Static-only render mode
grep -rn "prerender = false\|prerender: false" src/pages
grep -rn "ClientRouter\|astro:after-swap\|@astrojs/node\|output: 'server'" src/ astro.config.mjs

# Hydration discipline
grep -rn "client:load" src/
# expect: 1 hit (WhatsAppFloatingButton in Layout.astro)

# Sitemap excludes redirects
grep -E "<loc>https?://[^<]+(/comunidade-us|/neon-dash|/na-mesa-certa|/otb|/trintae3)" dist/sitemap-*.xml
# expect: empty

# WhatsApp leak — see grupo-us/references/whatsapp-ssot.md
```

---

## Quality gates

Final before merge:

```bash
bun run lint
bunx astro check
bun run build
bun run check:external-urls
```

All must pass. Cardinal #2: never mark a task done without evidence.

---

## Cross-references

- Generic Astro patterns: parent `SKILL.md` + sibling `references/*.md`
- Brand voice + WhatsApp SSOT: `.claude/skills/grupo-us/references/whatsapp-ssot.md`
- Theme tokens: `.claude/skills/gpus-theme/`
- 8 cardinals + routing matrix: `.claude/CLAUDE.md`
- Universal stability checklist: `.claude/rules/stability.md`
