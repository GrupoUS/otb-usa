# Astro Islands Architecture — GPUS Astro landing

## Default

Static Astro markup first. Add React islands only when interactivity is required.

## Directive guidance

| Directive | Use |
|---|---|
| none | default for static sections |
| `client:load` | exceptional, persistent critical UI only |
| `client:idle` | non-critical visual/above-fold island |
| `client:visible` | below-fold interactive island |
| `client:only="react"` | last resort when SSR is impossible |

## FAQ behavior

Prefer native HTML or static interaction. If an animated accordion is needed, animate with CSS grid `grid-template-rows: 0fr ↔ 1fr` and transform-only chevron rotation. Do not animate `height`.

## Hydration budget

- Keep initial JS small.
- Avoid importing `motion` or icon bundles into page-level static components.
- Use Lucide icons through the existing wrapper/patterns.

## Validation

Search for unnecessary client load:

```bash
grep -rn "client:load" src
```

Each hit needs a clear reason.
