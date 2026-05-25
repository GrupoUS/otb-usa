# Content Collections

## Overview

Content Collections organize, validate, and provide TypeScript type-safety for content in `src/content/`. Each subdirectory is a collection.

## Directory Structure

```
src/content/
  speakers/          ← "speakers" collection
    john-doe.json
    jane-smith.json
  faqs/              ← "faqs" collection
    general.json
    pricing.json
  testimonials/      ← "testimonials" collection
    maria.json
    carlos.json
```

## Astro 5/6: Schema-Free Collections

In Astro 5+, schemas are inferred from data files. No `src/content/config.ts` needed.

Each JSON file in a collection directory becomes an entry:

```json
// src/content/speakers/john-doe.json
{
  "name": "John Doe",
  "title": "CEO & Founder",
  "photo": "/images/speakers/john.jpg",
  "specialty": "Leadership",
  "bio": "20 years of experience..."
}
```

## Querying Collections

### getCollection() — All Entries

```astro
---
import { getCollection } from 'astro:content';

// All entries
const speakers = await getCollection('speakers');

// Filtered entries
const activeFaqs = await getCollection('faqs', ({ data }) => {
  return data.active !== false;
});
---
```

Returns array of `CollectionEntry` objects with:
- `id` — Entry identifier (filename without extension)
- `data` — The parsed content data
- `collection` — Collection name

### getEntry() — Single Entry

```astro
---
import { getEntry } from 'astro:content';

const speaker = await getEntry('speakers', 'john-doe');
// speaker.data.name → "John Doe"
---
```

### render() — For Markdown/MDX Content

```astro
---
import { getEntry, render } from 'astro:content';

const post = await getEntry('blog', 'my-post');
const { Content, headings } = await render(post);
---
<Content />
```

## Passing Data to React Islands

**Critical pattern**: React islands cannot receive Astro `CollectionEntry` objects. Map to `.data` first:

```astro
---
const testimonials = await getCollection('testimonials');
const testimonialData = testimonials.map(t => t.data);

const faqs = await getCollection('faqs');
const faqData = faqs.map(f => f.data);
---

<!-- Pass plain data objects, not CollectionEntry -->
<Testimonials client:visible data={testimonialData} />
<FAQAccordion client:visible items={faqData} />
```

## Content Collection with config.ts (Astro 4 / optional in 5+)

If explicit schema validation is desired:

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const speakers = defineCollection({
  type: 'data',        // JSON/YAML (no body)
  schema: z.object({
    name: z.string(),
    title: z.string(),
    photo: z.string(),
    specialty: z.string(),
    bio: z.string(),
  }),
});

const faqs = defineCollection({
  type: 'data',
  schema: z.object({
    question: z.string(),
    answer: z.string(),
  }),
});

export const collections = { speakers, faqs };
```

**Note**: In Astro 6, `config.ts` is optional. The framework infers schemas automatically.

## Collection Types

| Type | File Types | Has Body | Use Case |
|------|-----------|----------|----------|
| `content` | `.md`, `.mdx` | Yes | Blog posts, docs |
| `data` | `.json`, `.yaml` | No | Speakers, FAQs, configs |

## Sorting and Transforming

```astro
---
const posts = await getCollection('blog');

// Sort by date (newest first)
const sorted = posts.sort((a, b) =>
  new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
);

// Get unique categories
const categories = [...new Set(posts.map(p => p.data.category))];
---
```

## This repository (Na Mesa Certa)

Collections are registered in **`src/content.config.ts`** (at `src/` root) with `defineCollection` + `glob` loaders and Zod schemas in `astro:schema`. Data files live under `src/content/{speakers,faqs,testimonials}/`.

Do not assume "no config file" without opening the repo — Astro 5+ supports both inferred collections and explicit `content.config.ts`.

## Landing copy ↔ code (workflow)

When syncing an external sales script or persona doc to this landing:

1. **Map blocks → files** — Hero / dor / pilares / benefícios / vídeo / cronograma / ingressos / hostess / palestrantes / FAQ / CTA each map to named `.astro` sections or JSON under `src/content/`.
2. **Single source for "featured" speaker** — Copy in `src/content/speakers/<slug>.json` feeds `SpeakersGrid` and, when `revealed: true`, the **Event** JSON-LD `performer` array built in `index.astro`. Keep `bio` / `title` / `learn_text` aligned with the official script; product names must match legal/brand spelling (e.g. **Mentoria BLACK NEON**).
3. **Structured data** — After FAQ or pricing edits, re-check `faqSchema` and `eventSchema` in `index.astro` (`startDate`/`endDate`, `offers.lowPrice`/`highPrice`, performer list).
4. **React islands** — Still pass only **plain objects** (`map(e => e.data)`), never `CollectionEntry`.
5. **Persona tone vs UI rules** — Social copy may use emoji; the site uses **Lucide** for icons and typography for emphasis — translate "voice" into quotes/headings, not emoji in buttons or headings.

**Stakeholder docs:** Google Docs plain text is often available at  
`https://docs.google.com/document/d/<ID>/export?format=txt` for diffing against the repo.

## SSOT pattern — never hardcode landing copy

When a project has Content Collections, treat them as **single source of truth** for any field rendered on a page:

- Never write product / team / FAQ / testimonial / CTA copy as string literals in `.astro` or `.tsx`. Read from `getCollection()` / `getEntry()`.
- Component template = read `data` from collection, render JSX/Astro from data fields. No string literals from JSON in component file.
- Schema validation gate: `bunx astro check` (or `astro check`) re-runs Zod on every JSON edit. Run before commit.
- Adding a field: update Zod schema in `src/content.config.ts` + every JSON file + the component reading the field. All three move together.

### Component anti-pattern vs SSOT

```astro
<!-- ❌ Hardcoded — copy drifts from JSON; bypasses Zod -->
<section>
  <h1>Mentoria Black NEON</h1>
  <p>Para donas de clínica que querem escalar com estratégia.</p>
</section>

<!-- ✅ SSOT — single read; copy lives in JSON -->
---
import { getEntry } from 'astro:content';
const product = await getEntry('products', Astro.params.slug);
---
<section>
  <h1>{product.data.name}</h1>
  <p>{product.data.tagline}</p>
</section>
```

### Quick edit paths

| Task | File |
|---|---|
| Change product CTA copy | `src/content/<collection>/<slug>.json::cta.label` |
| Reorder grid | `<slug>.json::order` |
| Update FAQ | `<slug>.json::faqs[]` |
| Update hero headline | `<slug>.json::hero.headline` |

## Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Collection not found | Wrong directory name or empty directory | Ensure `src/content/<name>/` exists with at least one file |
| Type errors on `.data` | Schema mismatch | Check JSON matches expected structure |
| Passing entries to React | CollectionEntry is not serializable | Map to `.data` before passing as props |
| Schema validation fails | `content.config.ts` schema doesn't match data | Update schema or JSON to match |
| Hardcoded copy in component | Bypasses Zod + drifts from JSON | Refactor to read from `getEntry()` |
