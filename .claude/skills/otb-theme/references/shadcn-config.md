# OTB Theme — optional shadcn notes

The OTB USA landing is Astro-first and does not require shadcn/ui by default. Use this reference only if a future React island needs shadcn primitives.

## Defaults

- Style: `new-york`.
- Icons: Lucide.
- CSS variables: enabled.
- Prefer colocated, minimal components over broad UI-kit imports.

## Guardrails

- Do not introduce a component library for static sections.
- Do not add a third icon set.
- Do not add theme switching; the OTB landing is dark-only.
- Keep initial JS budget in `.claude/config.json`.

## Current repo aliases

| Alias | Path |
|---|---|
| `@/components` | `src/components` |
| `@/lib` | `src/lib` |
| `@/components/ui` | `src/components/ui` |
