# Styling & Tailwind CSS v4

## Scoped Styles in Astro

`<style>` tags in `.astro` files are automatically scoped:

```astro
<style>
  h1 { color: red; }  /* Only affects THIS component's h1 */
</style>
```

Astro adds unique `data-astro-cid-*` attributes to scope CSS.

### Global Styles

```astro
<!-- Method 1: is:global attribute -->
<style is:global>
  body { margin: 0; }
</style>

<!-- Method 2: :global() selector -->
<style>
  :global(.nav-link) { color: blue; }
</style>

<!-- Method 3: Import CSS file -->
---
import '../styles/global.css';
---
```

### class:list Utility

Conditionally apply classes:

```astro
---
const { isActive, size = 'md' } = Astro.props;
---
<div class:list={[
  'card',                    // Always applied
  { active: isActive },      // Applied if truthy
  `size-${size}`,            // Dynamic string
  ['extra', 'classes'],      // Array (flattened)
]}>
```

### define:vars

Pass server variables to CSS:

```astro
---
const accentColor = '#D4AF37';
const spacing = '2rem';
---
<style define:vars={{ accentColor, spacing }}>
  .card {
    border-color: var(--accentColor);
    padding: var(--spacing);
  }
</style>
```

## Tailwind CSS v4 Integration

### Setup (Vite Plugin — Recommended)

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

**No `tailwind.config.js` needed.** Tailwind v4 uses CSS-first configuration.

### CSS-First Configuration with @theme

All custom tokens go in your CSS file:

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* Colors */
  --color-navy: #1a1a2e;
  --color-navy-light: #2A2A40;
  --color-navy-lighter: #3D3D5C;
  --color-gold: #D4AF37;
  --color-gold-light: #E8C96A;
  --color-gold-dark: #B8960C;
  --color-text-primary: #FAFAF9;
  --color-text-muted: #94A3B8;

  /* Fonts */
  --font-sans: 'Inter', sans-serif;
  --font-serif: 'Playfair Display', serif;

  /* Custom spacing, shadows, etc. */
  --shadow-gold-glow: 0 0 20px hsl(39 44% 65% / 0.3);
}
```

Use in templates:

```html
<div class="bg-navy text-gold font-serif">
<p class="text-text-muted font-sans">
<button class="bg-gold text-navy hover:bg-gold-light">
```

### Custom Utilities via @utility

```css
@utility glass-card {
  background: rgba(42, 42, 64, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

@utility gold-glow {
  box-shadow: var(--shadow-gold-glow);
}

@utility bg-mesh {
  background:
    radial-gradient(ellipse at 20% 50%, rgba(212, 175, 55, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(26, 26, 46, 0.9) 0%, transparent 50%);
}
```

### Tailwind v4 Key Differences from v3

| Feature | v3 | v4 |
|---------|----|----|
| Config | `tailwind.config.js` | `@theme {}` in CSS |
| Plugin | `@astrojs/tailwind` | `@tailwindcss/vite` |
| Import | `@tailwind base/components/utilities` | `@import "tailwindcss"` |
| Custom colors | `theme.extend.colors` in JS | `--color-*` in `@theme` |
| Custom utilities | `plugin()` in JS | `@utility` in CSS |
| Arbitrary values | `bg-[#123456]` | Still works, but prefer `@theme` tokens |

### Responsive Design

```html
<!-- Mobile-first breakpoints -->
<div class="px-4 md:px-8 lg:px-16">
<h1 class="text-2xl md:text-4xl lg:text-6xl">

<!-- Container queries (v4) -->
<div class="@container">
  <div class="@md:flex @lg:grid">
```

### Dark Mode (Not Applicable — Single Theme)

This project uses a single dark navy theme. No light/dark toggle. All colors defined in `@theme`.

## CSS Best Practices for Astro

1. **Use `@theme` tokens** — Never hardcode hex values
2. **Prefer utility classes** — Over custom CSS when possible
3. **Scoped styles for component-specific CSS** — Astro auto-scopes
4. **Global CSS for base styles only** — `global.css` imported in layout
5. **`class:list` for conditional classes** — Cleaner than ternaries
6. **Avoid `!important`** — Use specificity or scoping instead
