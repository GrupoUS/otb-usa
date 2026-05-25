# OTB USA — landing plan

## Product

OTB USA is a Grupo US program positioned as an MBA in Business Aesthetic Health with international immersion in Boston/EUA.

## Pages

- `/` — entry landing using OTB content.
- `/otb` — full OTB USA landing.

## Content source

`src/content/products/otb.json` stores SEO, hero, audience, program, modules, Boston/Harvard section, speakers, investment, FAQ and legal disclaimer.

## Legal guardrail

Harvard references are descriptive only. The page must not imply sponsorship, endorsement, affiliation or certification by Harvard University.

## Implementation notes

- Astro static-only.
- Tailwind v4 tokens in `src/styles/global.css`.
- Components in `src/components/landing/`.
- WhatsApp via `src/lib/whatsapp.ts` only.

## Validation

```bash
bun run lint
bunx astro check
bun run build
```
