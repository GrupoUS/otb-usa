# Astro Content Collections — OTB USA

## Project SSOT

- Collection: `products`.
- Entry: `src/content/products/otb.json`.
- Schema: `src/content.config.ts`.
- Reader page: `src/pages/otb.astro` and `src/pages/index.astro`.

## Pattern

```astro
---
import { getEntry } from "astro:content";
const otb = await getEntry("products", "otb");
if (!otb) throw new Error("Missing products/otb.json");
const { data } = otb;
---
```

Pass `data` or nested data objects to components. Do not pass the collection entry itself to React islands.

## Never hardcode product copy

Anti-pattern:

```astro
<h1>OTB Estados Unidos</h1>
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
2. Update `src/content/products/otb.json`.
3. Update components that read the field.
4. Run `bunx astro check` and `bun run build`.

## WhatsApp messages

CTA message strings live in `otb.json` and are validated by schema. URL construction remains in `src/lib/whatsapp.ts`.
