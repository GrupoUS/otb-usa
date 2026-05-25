# Configuration & Build

## astro.config.mjs

```js
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Site URL (used for canonical URLs, sitemaps)
  site: "https://example.com",

  // Base path (for subdirectory deployments)
  base: "/",

  // Trailing slash behavior
  trailingSlash: "ignore", // "always" | "never" | "ignore"

  // Framework integrations
  integrations: [react()],

  // Vite configuration
  vite: {
    plugins: [tailwindcss()],
  },

  // Output mode
  output: "static",  // Default: static site generation
  // output: "server",  // For SSR with adapter

  // Build options
  build: {
    assets: "_astro",  // Asset directory name
    inlineStylesheets: "auto",  // "always" | "auto" | "never"
  },

  // Dev server
  server: {
    port: 4321,
    host: false,  // Set true to expose on network
  },

  // Image optimization
  image: {
    service: { entrypoint: 'astro/assets/services/sharp' },
  },
});
```

## Integrations

### Adding Integrations

```bash
bunx astro add react        # React support
bunx astro add vue          # Vue support
bunx astro add svelte       # Svelte support
bunx astro add mdx          # MDX support
bunx astro add sitemap      # Auto sitemap generation
bunx astro add partytown    # Third-party script optimization
```

### Manual Integration Setup

```js
// astro.config.mjs
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  integrations: [
    react(),
    sitemap(),
  ],
});
```

## TypeScript Configuration

```json
// tsconfig.json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"]
    }
  }
}
```

Use path aliases in components:
```astro
---
import Layout from '@layouts/Layout.astro';
import Button from '@components/Button.astro';
---
```

## Build & Deploy

### Build Command

```bash
bun run build     # Outputs to dist/
bun run preview   # Preview production build locally
```

### Static Site (Default)

All pages pre-rendered at build time. Output is plain HTML + CSS + minimal JS.

### SSR Mode (On-Demand Rendering)

```js
// astro.config.mjs
import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
});
```

### Hybrid Rendering

Mix static and server-rendered pages:

```js
export default defineConfig({
  output: "static",  // Default static
});
```

Then opt-in per page:
```astro
---
export const prerender = false; // This page renders on-demand
---
```

Or default to server and opt-in to static:
```astro
---
export const prerender = true; // This page is pre-rendered
---
```

## Environment Variables

```bash
# .env
PUBLIC_API_URL=https://api.example.com  # Available in client + server
SECRET_KEY=abc123                       # Server-only
```

Access:
```astro
---
// Server-only (frontmatter)
const secret = import.meta.env.SECRET_KEY;

// Public (available everywhere)
const apiUrl = import.meta.env.PUBLIC_API_URL;
---
```

Built-in variables:
- `import.meta.env.MODE` — `development` or `production`
- `import.meta.env.PROD` — boolean
- `import.meta.env.DEV` — boolean
- `import.meta.env.BASE_URL` — from config
- `import.meta.env.SITE` — from config

## Deploy Adapters

| Platform | Adapter |
|----------|---------|
| Node.js | `@astrojs/node` |
| Vercel | `@astrojs/vercel` |
| Netlify | `@astrojs/netlify` |
| Cloudflare | `@astrojs/cloudflare` |
| Railway | No adapter needed (static) |
| Static hosting | Default (no adapter) |

### Railway Deployment (This Project)

No adapter needed. Railway builds with:
```bash
bun run build
```
Output: `dist/` directory served as static site.
