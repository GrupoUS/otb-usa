# 2026-03-26-mentoria-copy-dedup

**Area:** mentoria-black-neon copy clarity
**Decision:** keep
**Commit:** 4a7933c

## Reasoning

Quality review of phase 2 copy surfaced significant internal echo in `mentoria-black-neon.json`:
- "escalar com estratégia" appeared 4x across tagline, audience, description, bio
- "sem abrir mão da sua essência" duplicated verbatim between bio and story.highlight
- `benefits[]` (10 string items) was a dead-data copy of `deliverables[]` — the page renders deliverables when present, so benefits never displayed

## Baseline

| Metric | Value |
|--------|-------|
| "escalar com estratégia" count | 4 |
| "sem abrir mão da sua essência" count | 2 |
| Dead benefits[] items | 10 (copying deliverables) |
| Unique phrasing per section | 4/7 |
| Build | green |

## Experiment

- **Hypothesis:** Reducing phrase repetition and eliminating dead data makes each landing section read with a distinct voice, improving perceived offer depth.
- **Files:** `src/content/products/mentoria-black-neon.json`
- **Patch:**
  - `benefits[]`: 10 dead strings → 6 unique outcome-focused bullets (distinct from deliverables)
  - `description`: "escalar com estratégia" → "crescer com método, inteligência de negócio"
  - `audience`: "escalar com estratégia" → "estruturar o negócio para crescer"
  - `bio.paragraphs[2]`: "escalar com estratégia" → "construir um negócio sólido"
  - `story.highlight`: removed "sem abrir mão da sua essência" (kept in bio only)

## Validation

| Gate | Result |
|------|--------|
| `bun run lint` | 0 errors |
| `bunx astro check` | 0 errors |
| `bun run build` | 8 pages, 3.56s |
| "escalar com estratégia" count | 4 → 2 |
| "sem abrir mão" count | 2 → 1 |
| Dead data removed | 10 items → 0 |
| Unique phrasing per section | 4/7 → 7/7 |

## Pattern

When copy fields are consumed by different components (benefits vs deliverables), they should carry distinct content even if the schema allows overlap. Dead data creates maintenance debt and confuses future editors.

## Next suggested

- Audit other product JSONs for similar benefits/deliverables shadow patterns
- Consider `z.enum()` for `type` and `icon` fields to prevent stringly-typed drift
