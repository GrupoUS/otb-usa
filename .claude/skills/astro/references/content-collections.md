# Astro Content Collections — GPUS Astro landing

## Project SSOT

- Collection: `products`.
- Entry: `${content.productJson}`.
- Schema: `src/content.config.ts`.
- Reader page: `src/pages/index.astro`.

## Pattern

```astro
---
import { getEntry } from "astro:content";
const product = await getEntry("products", "${content.productSlug}");
if (!product) throw new Error("Missing ${content.productJson}");
const { data } = product;
---
```

Pass `data` or nested data objects to components. Do not pass the collection entry itself to React islands.

## Never hardcode product copy

Anti-pattern:

```astro
<h1>${project.displayName}</h1>
<p>Copy comercial escrita direto no componente.</p>
```

Preferred:

```astro
<h1>{hero.headline}</h1>
<p>{hero.subheadline}</p>
```

## Schema changes

When adding fields:

1. Update `src/content.config.ts`.
2. Update `${content.productJson}`.
3. Update components that read the field.
4. Run `bunx astro check` and `bun run build`.

## WhatsApp messages

CTA message strings live in `${content.productJson}` and are validated by schema. URL construction remains in `src/lib/whatsapp.ts`.
