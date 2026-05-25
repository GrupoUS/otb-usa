# Astro configuration — OTB USA

## `astro.config.mjs`

Current project configuration:

- `site`: `https://otb.drasacha.com.br`.
- Integrations: `@astrojs/react`, `@astrojs/sitemap`.
- Vite plugin: `@tailwindcss/vite`.
- Fonts: Playfair Display + Inter via Astro font providers.
- Output: default static output.

## Static hosting

No adapter is required for static output. Build command:

```bash
bun run build
```

Output directory: `dist/`.

## Forbidden in this repo

- `output: "server"` or `"hybrid"`.
- SSR adapters.
- `ClientRouter`.
- `prerender = false`.

## Validation

```bash
bunx astro check
bun run build
```
