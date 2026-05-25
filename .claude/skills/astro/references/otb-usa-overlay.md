# OTB USA Overlay — Astro project rules

Loaded when working in the **OTB USA** repo.

## Render mode invariants

| Forbidden | Why | Verify |
|---|---|---|
| `export const prerender = false` | breaks static build | search in `src/pages` |
| `output: "server"` or `"hybrid"` | introduces server runtime | inspect `astro.config.mjs` |
| SSR adapters | no server runtime | inspect `package.json` |
| `<ClientRouter />` | SPA behavior banned | search in `src` |

## Content Collections

- Product entry: `src/content/products/otb.json`.
- Schema: `src/content.config.ts`.
- Page reader: `src/pages/otb.astro`.
- Product copy stays in JSON; components render props.

## Routes

Current routes:

- `/`
- `/otb`

No redirects or route tables for non-OTB products.

## Layout contracts

`src/layouts/Layout.astro` owns:

- lang `pt-BR`;
- canonical URL;
- OG/Twitter meta;
- Organization JSON-LD;
- skip link and main landmark;
- no-JS reveal fallback.

## Hydration policy

- Static Astro by default.
- React islands only when interactivity is necessary.
- `client:load` is exceptional.
- Decorative/visual work should not block LCP.

## Harvard/Boston legal guardrail

When mentioning Harvard as context, preserve the no-affiliation disclaimer from `src/content/products/otb.json`.

Do not claim Harvard partnership, sponsorship, endorsement or certification.

## Smoke commands

```bash
bun run lint
bunx astro check
bun run build
```

Additional targeted checks:

```bash
# no SPA router
grep -rn "ClientRouter" src astro.config.mjs

# no SSR override
grep -rn "prerender = false\|prerender: false\|output:.*server\|output:.*hybrid" src astro.config.mjs

# no inline WhatsApp URL outside helper
grep -rn "wa\.me/" src --exclude="src/lib/whatsapp.ts"
```

Expected: no matches for targeted anti-pattern searches.
