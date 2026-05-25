---
name: astro
description: Use when implementing features, fixing bugs, or making architectural decisions in Astro projects. Triggers on Astro components, Content Collections, islands architecture, client directives, View Transitions, astro.config.mjs, getCollection, getEntry, Astro.props, slots, scoped styles, @theme directive, Tailwind v4 integration, static site generation, build errors, hydration issues, and performance optimization for Astro sites.
---

# Astro Framework Reference

Comprehensive Astro knowledge base for building fast, content-driven static sites with islands architecture.

## Overview

Astro renders pages to static HTML by default with zero client-side JavaScript. Interactive components ("islands") opt-in via `client:*` directives. Server-first rendering ensures fast performance and excellent SEO.

## Repository override — Grupo US institutional site (`gpus`)

When this repo is the **Grupo US** static site (see root `AGENTS.md` and `.claude/CLAUDE.md`):

- **Routing:** Multi-page app — normal `<a>` links and full page reload. **Do not** add `<ClientRouter />`, client-side app routers, or SPA-style navigation unless the user **explicitly** overrides `AGENTS.md`.
- **Islands:** Prefer `.astro` and zero JS; add React (or other) islands only with clear justification and minimal `client:*` usage. `client:load` is forbidden outside `WhatsAppFloatingButton`.
- **Conflict rule:** If generic Astro documentation (including sections below on View Transitions / `ClientRouter`) conflicts with `AGENTS.md`, **the repo wins**.

> **Full project rules:** `references/gpus-overlay.md` — render-mode invariants, redirect tri-sync (`externalSiteUrl` ↔ `redirects` ↔ sitemap `filter()`), Layout.astro contracts (skip link, `<noscript>` reveal, IntersectionObserver, Google Fonts preconnect), Content Collections SSOT, smoke commands.

## When to Use

- Implementing new Astro components, pages, or layouts
- Working with Content Collections (define, query, render)
- Adding or modifying React/Vue/Svelte islands
- Configuring `astro.config.mjs`, TypeScript, or Vite plugins
- Debugging build errors, hydration mismatches, or Content Collection issues
- Optimizing performance (LCP, CLS, bundle size, image optimization)
- Setting up View Transitions with `<ClientRouter />`
- Integrating Tailwind CSS v4 via `@tailwindcss/vite`

When NOT to use:
- Pure React/Vue component logic (use framework-specific docs)
- General CSS questions unrelated to Astro scoping or Tailwind v4

## Quick Reference

### Component Anatomy

```astro
---
// Frontmatter: runs on server only, never sent to browser
import MyComponent from '../components/MyComponent.astro';
interface Props { title: string; }
const { title } = Astro.props;
const data = await fetch('API_URL').then(r => r.json());
---
<!-- Template: HTML + JSX-like expressions -->
<h1>{title}</h1>
<MyComponent />
<slot />  <!-- child content placeholder -->
```

### Client Directives (Islands)

| Directive | When JS Loads | Use Case |
|-----------|--------------|----------|
| `client:load` | Immediately on page load | Critical interactive UI (countdown, auth) |
| `client:idle` | When browser becomes idle | Non-critical above-fold widgets |
| `client:visible` | When entering viewport | Below-fold interactive content |
| `client:hover` | On mouse hover | Tooltips, previews |
| `client:only="react"` | Client only, skip SSR | Components that can't SSR |
| `server:defer` | Server island, deferred render | Personalized/dynamic server content |

### Content Collections

```astro
---
import { getCollection, getEntry } from 'astro:content';

// Get all entries
const allFaqs = await getCollection('faqs');

// Filter entries
const published = await getCollection('blog', ({ data }) => !data.draft);

// Get single entry
const speaker = await getEntry('speakers', 'john-doe');
---
```

**Data flow to React islands:**
```astro
---
const testimonials = await getCollection('testimonials');
const testimonialData = testimonials.map(t => t.data);
---
<TestimonialsCarousel client:visible data={testimonialData} />
```

**Na Mesa Certa:** Collections use `src/content.config.ts` (glob + Zod). For marketing copy sync (speakers → JSON-LD, FAQ JSON, section mapping), see `references/content-collections.md` → *Landing copy ↔ code*.

### Project Structure

```
src/
  pages/         → File-based routing (index.astro → /)
  components/    → .astro (static) + .tsx/.vue (islands)
  layouts/       → Page shells with <slot />
  content/       → Content Collections (JSON/MD/MDX)
  styles/        → Global CSS, Tailwind @theme tokens
public/          → Static assets (copied as-is to dist/)
astro.config.mjs → Framework configuration
```

### Configuration (astro.config.mjs)

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://example.com",
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
});
```

### View Transitions (Astro 5+/6)

```astro
---
import { ClientRouter } from 'astro:transitions';
---
<head>
  <ClientRouter />  <!-- Replaces deprecated ViewTransitions -->
</head>
```

**Grupo US institutional repo:** Do **not** add `ClientRouter` or SPA-style transitions unless the user explicitly overrides the no-SPA rule in `AGENTS.md`. The pattern above is for **other** Astro projects only.

### Styling

- **Scoped by default**: `<style>` in `.astro` files is auto-scoped
- **Global styles**: Use `is:global` or `<style is:global>`
- **class:list**: `class:list={['base', { active: isActive }]}`
- **define:vars**: Pass server vars to CSS: `<style define:vars={{ color }}>`
- **Tailwind v4**: Via Vite plugin, tokens in `@theme {}` in CSS

### Common Patterns

```astro
<!-- Conditional rendering -->
{showBanner && <Banner />}

<!-- List rendering -->
{items.map(item => <Card title={item.title} />)}

<!-- Dynamic HTML (escaped by default, use set:html for raw) -->
<div set:html={rawHtmlString} />

<!-- Named slots -->
<Layout>
  <h1 slot="header">Title</h1>
  <p>Default slot content</p>
  <footer slot="footer">Copyright</footer>
</Layout>
```

## Detailed References

| Reference | Content |
|-----------|---------|
| `references/core-concepts.md` | Components, pages, layouts, slots, props, expressions |
| `references/content-collections.md` | Defining, querying, schemas, JSON data, Astro 5/6 changes, SSOT pattern |
| `references/islands-architecture.md` | Client directives, React islands, hydration, server islands, FAQ accordion (grid `0fr`/`1fr`) |
| `references/styling-tailwind.md` | Scoped CSS, global styles, Tailwind v4, @theme, class:list |
| `references/configuration.md` | astro.config.mjs, TypeScript, integrations, Vite plugins |
| `references/performance.md` | LCP, CLS, INP, images, fonts, bundle optimization |
| `references/view-transitions.md` | ClientRouter, transition directives, persist, animations |
| `references/troubleshooting.md` | Common errors, build failures, hydration, Content Collections |
| `references/gpus-overlay.md` | **GPUS site only** — render-mode invariants, hydration project rules, redirect tri-sync, Layout.astro contracts, smoke commands |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Adding `client:*` to `.astro` components | Only framework components (React/Vue/Svelte) accept client directives |
| Passing Astro collection entries to React | Map to `.data` first: `collection.map(e => e.data)` |
| Using `ViewTransitions` in Astro 6 | Use `ClientRouter` from `astro:transitions` |
| Hardcoding hex in Tailwind v4 | Define tokens in `@theme {}` in global.css |
| Using `tailwind.config.js` with v4 | Tailwind v4 uses CSS-first config via `@theme {}` |
| Using npm/yarn instead of bun | Project uses bun exclusively |
| Assuming no content config in Astro 6 | **This repo** uses `src/content.config.ts`; other projects may infer schemas only — always check the filesystem |
| Using wrong path `src/content/config.ts` when the project has root `content.config.ts` | Align with Astro version + repo: Na Mesa Certa → `src/content.config.ts` |
| Forgetting `width`/`height` on images | Always set dimensions to prevent CLS |
| Framer Motion animating accordion **panel height** | Use CSS grid `grid-template-rows: 0fr` ↔ `1fr`; Motion only for chevron (`rotate`/`opacity`). See `references/islands-architecture.md` → *Known case: FAQ accordion* |
| `client:load` on pure-visual hero islands (steals LCP from text-first hero) | Use `client:idle` so SSR text paints first; `client:load` only for persistent floating UI (e.g., chat widget) |
| Setting `prerender = false` in static-only project | Static projects: never override; cardinal in repo overlay |
| Adding `<ClientRouter />` to MPA repo | Static MPA: no SPA router; full reload on navigation. See `references/gpus-overlay.md` |
| Hardcoding landing copy in `.astro` / `.tsx` instead of Content Collection | Move strings to `src/content/<collection>/<slug>.json` and Zod-validate via `src/content.config.ts` |
| Below-fold hero image with `loading="eager"` + `fetchpriority="high"` | Confirm position vs fold; below-fold → `lazy` + `low`. Wrong priority steals LCP from text hero |
| Adding redirect to `astro.config.mjs::redirects` without sitemap `filter()` exclusion | Tri-sync: JSON `externalSiteUrl` + `redirects` + `filter()` move together. See `references/gpus-overlay.md` |
