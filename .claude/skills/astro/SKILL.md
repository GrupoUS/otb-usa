---
name: astro
description: Use when implementing, debugging, or reviewing Astro components, pages, Content Collections, islands architecture, client directives, astro.config.mjs, Tailwind v4 integration, static generation, hydration, build errors, and performance optimization.
---

# Astro Framework Reference

Astro renders static HTML by default and hydrates interactive islands only when explicitly requested through `client:*` directives.

## Repository overlay (GPUS Astro landing)

When working in this repo:

- Static MPA only.
- No `ClientRouter`.
- No `prerender = false`.
- No SSR adapter.
- Product copy SSOT: `${content.productJson}`.

If generic Astro docs conflict with `AGENTS.md` or `.claude/CLAUDE.md`, the repo rules win.

## When to use

- New or changed `.astro` pages/components/layouts.
- `src/content.config.ts` or Content Collections.
- React islands and hydration directives.
- `astro.config.mjs` changes.
- Tailwind v4 `@theme` integration.
- Build, type or hydration errors.
- SEO/canonical/JSON-LD changes in Astro files.

## Quick reference

### Component anatomy

```astro
---
import Component from "../components/Component.astro";
interface Props { title: string }
const { title } = Astro.props;
---

<section>
  <h1>{title}</h1>
  <Component />
</section>
```

### Client directives

| Directive | Usage |
|---|---|
| none | default for static `.astro` |
| `client:load` | only critical persistent UI |
| `client:idle` | non-critical above-fold island |
| `client:visible` | below-fold interactive island |
| `client:only="react"` | last resort when SSR is impossible |

### Content Collections

```astro
---
import { getEntry } from "astro:content";
const product = await getEntry("products", "${content.productSlug}");
if (!product) throw new Error("Missing ${content.productJson}");
const { data } = product;
---
```

Map data before passing to framework islands; do not pass collection entries directly.

### Project structure

```text
src/
  pages/
  components/
  layouts/
  content/
  content.config.ts
  styles/global.css
astro.config.mjs
```

## Detailed references

| Reference | Content |
|---|---|
| `references/core-concepts.md` | Components, pages, layouts, slots, props |
| `references/content-collections.md` | Schemas, querying, JSON data, SSOT |
| `references/islands-architecture.md` | Hydration, React islands, FAQ accordion |
| `references/styling-tailwind.md` | Scoped CSS, Tailwind v4, `@theme` |
| `references/configuration.md` | `astro.config.mjs`, integrations, static hosting |
| `references/performance.md` | LCP, CLS, INP, images, fonts, bundle |
| `references/view-transitions.md` | Generic Astro transitions; disabled here unless explicitly requested |
| `references/troubleshooting.md` | Build/hydration/content errors |

## Common mistakes

| Mistake | Fix |
|---|---|
| Hardcoding product copy in components | Move to `${content.productJson}` |
| Adding `client:*` to `.astro` components | Client directives apply to framework islands only |
| Passing full collection entries to React | Pass plain `.data` |
| Using `ClientRouter` | This is a static MPA |
| Setting `prerender = false` | Keep static generation |
| Adding an SSR adapter | Not needed and forbidden |
| Using npm/yarn/pnpm | Use Bun only |
| Hardcoding hex in components | Add/use tokens in `src/styles/global.css` |
| Animating layout properties | OK quando o efeito pedir; preferir `transform`/`opacity` por performance; honrar `prefers-reduced-motion` |
