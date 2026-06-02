# Performance Optimization

## Astro Performance Defaults

Astro achieves **40% faster load times** and **90% less JavaScript** compared to React SPAs by:
- Rendering to static HTML by default
- Zero client-side JS unless explicitly opted in
- Automatic asset optimization via Vite

## Core Web Vitals Targets

> Advisory — medir & anotar, não bloquear merge. CLS é higiene de layout (mantém hard). O único hard floor de motion é `prefers-reduced-motion`.

| Metric | Target | How Astro Helps |
|--------|--------|----------------|
| LCP (Largest Contentful Paint) | < 2.5s | Static HTML, preloaded assets |
| CLS (Cumulative Layout Shift) | 0 | Explicit image dimensions |
| INP (Interaction to Next Paint) | ~200ms | Minimal JS, deferred hydration |
| FCP (First Contentful Paint) | < 1.8s | No JS blocking render |
| TTFB (Time to First Byte) | < 800ms | Static files from CDN |

## Image Optimization

### Astro Image Component

```astro
---
import { Image } from 'astro:assets';
import heroImage from '../assets/hero.jpg';
---

<!-- Optimized: auto-format, responsive, explicit dimensions -->
<Image
  src={heroImage}
  alt="Hero image description"
  width={1200}
  height={630}
  loading="eager"           <!-- Above fold: eager -->
  fetchpriority="high"      <!-- LCP candidate -->
  format="avif"             <!-- Modern format -->
/>

<!-- Below fold: lazy (default) -->
<Image
  src={speakerPhoto}
  alt="Speaker name"
  width={400}
  height={400}
  loading="lazy"
/>
```

### Image Rules

1. **Always set `width` and `height`** — Prevents CLS
2. **`loading="eager"` + `fetchpriority="high"`** — Only for LCP image (hero)
3. **`loading="lazy"`** — Default for below-fold images
4. **Use `astro:assets`** — Auto-optimization (format, size, quality)
5. **`public/` images** — Not optimized, use for external/dynamic URLs only

### Picture Component (Multiple Formats)

```astro
---
import { Picture } from 'astro:assets';
import hero from '../assets/hero.jpg';
---
<Picture
  src={hero}
  formats={['avif', 'webp']}
  alt="Hero"
  width={1200}
  height={630}
/>
```

## Font Optimization

### Google Fonts Best Practice

```astro
<!-- In Layout.astro <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&display=swap"
  rel="stylesheet"
/>
```

Key: `display=swap` prevents Flash of Invisible Text (FOIT).

### Self-Hosted Fonts (Better Performance)

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-v13-latin-regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}
```

## JavaScript Budget

> Advisory. Libs de animação vivem dentro do seu island — nunca no entry da landing.

| Category | Target |
|----------|--------|
| Initial JS bundle | ~< 50KB (advisory; libs de animação dentro do island) |
| Per-island JS | As small as possible |
| Total page JS | < 100KB |

### Reducing JS

1. **Default to `.astro`** — Zero JS components
2. **`client:visible`** over `client:load` — Defer hydration
3. **Avoid large libraries** in islands — Tree-shake or use lighter alternatives
4. **`client:idle`** for non-critical widgets
5. **Code splitting** — Vite auto-splits per island

## CSS Performance

1. **Inline critical CSS** — Astro auto-inlines small stylesheets
2. **Purge unused CSS** — Tailwind v4 auto-purges
3. **Avoid `@import` chains** — Use single entry point
4. **Minimize custom CSS** — Prefer Tailwind utilities

## Build Analysis

```bash
# Check bundle sizes
ANALYZE=true bun run build

# Lighthouse audit (with local preview running)
bunx lighthouse http://localhost:4321 --preset=desktop
```

## Preloading & Prefetching

```astro
<head>
  <!-- Preload critical assets -->
  <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/images/hero.avif" as="image" />

  <!-- Prefetch next likely navigation -->
  <link rel="prefetch" href="/about" />
</head>
```

## Animation Performance

Motion é ferramenta de design de primeira classe (3D tilt, parallax, glow, profundidade em camadas são incentivados — ver `docs/motion-depth-playbook.md`). Prefira `transform`/`opacity` (GPU-composited) quando o efeito for equivalente, por performance; layout props / 3D / parallax são permitidos quando o efeito pedir. Único hard floor: degradar sob `prefers-reduced-motion`.

```css
/* Preferido quando equivalente — GPU composited */
.animate { transition: transform 0.3s, opacity 0.3s; }

/* OK quando o efeito pedir (layout/paint) — honrar prefers-reduced-motion */
.animate { transition: width 0.3s, height 0.3s, top 0.3s; }
```

### Accordion / expand panels

FAQ (e similares): `<details>` nativo, CSS `grid-template-rows: 0fr` ↔ `1fr`, OU `height`/`AnimatePresence` animado — todos OK desde que honrem `prefers-reduced-motion` (ver `references/islands-architecture.md` → *Known case: FAQ accordion*).

## Checklist

- [ ] LCP image has `loading="eager"` + `fetchpriority="high"`
- [ ] All images have explicit `width` and `height`
- [ ] Below-fold images use `loading="lazy"` (default)
- [ ] Fonts use `display=swap`
- [ ] Only necessary islands use `client:load`
- [ ] Below-fold islands use `client:visible`
- [ ] Initial JS ~< 50KB (advisory; libs de animação dentro do island, não no entry)
- [ ] Motion prefere `transform`/`opacity` quando equivalente; layout/3D/parallax/`height` OK quando o efeito pedir
- [ ] `prefers-reduced-motion` handled for all animations (hard floor)
