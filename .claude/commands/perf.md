---
description: OTB USA performance, SEO, accessibility, and build optimization workflow.
---

# /perf — OTB USA Performance

**ARGUMENTS**: $ARGUMENTS

Use for Lighthouse, Core Web Vitals, bundle size, render cost, static asset, SEO, or accessibility work.

## 0. Context load

```typescript
Skill("performance-optimization");
Skill("astro");
Skill("otb-theme"); // when visual/styling changes affect performance
```

## 1. OTB performance contract

- Static Astro output only.
- Initial JS should stay minimal; avoid unnecessary islands.
- Decorative motion must not steal main-thread budget.
- Prefer optimized images with dimensions and stable layout.
- Preserve SEO canonical domain: `https://otb.drasacha.com.br`.
- Respect Lighthouse targets from `.claude/config.json`.

## 2. Build validation

```bash
bun run lint
bunx astro check
bun run build
```

## 3. Lighthouse / route scope

Primary routes:

- `/`
- `/otb`

Use the local script when available:

```bash
bun run lighthouse:audit
```

If running Lighthouse directly, start a preview separately and use Bun tooling:

```bash
bunx lighthouse http://localhost:4321 --preset=desktop
```

## 4. Fix priorities

1. Broken build/static output.
2. Layout shift and image dimensions.
3. Unnecessary JS/islands.
4. Render-blocking CSS/fonts.
5. A11y/SEO metadata regressions.
6. Decorative motion cost.

Do not introduce new dependencies unless the performance benefit is clear and approved.
