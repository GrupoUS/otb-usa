# React Doctor Remediation

Part of the `performance-core` pack. Use React Doctor to detect and fix React anti-patterns, bundle bloat, and render issues.

## Commands

```bash
# Full verbose audit
bunx react-doctor@latest . --yes --verbose

# Score-only mode (quick check)
bunx react-doctor@latest . --yes --score

# Monorepo: target a specific workspace package
bunx react-doctor@latest . --yes --project @<your-org>/<workspace-name> --verbose

# Auto-fix assistant mode (review all changes before keeping)
bunx react-doctor@latest . --yes --fix
```

## Remediation Loop (Steps 1-5)

1. Run `bunx react-doctor@latest . --yes --verbose` and capture diagnostics.
2. Fix `error` severity suggestions first (correctness/security/performance).
3. Fix high-impact `warning` suggestions (render churn, dead code, bundle bloat).
4. Re-run `bunx react-doctor@latest . --yes --score`.
5. Repeat until score reaches target for the sprint (recommended: `>= 75`).

After each batch of fixes, validate:

```bash
bunx react-doctor@latest . --yes --score
bunx astro check && ${tooling.packageManager} run lint && ${tooling.packageManager} run test
```

## Common React Doctor Fixes

- **`React Hook called conditionally`**: move hook calls to top-level and guard inside effect/body.
- **`Import "m" with LazyMotion`**: replace `motion` import with `LazyMotion` + `m` to reduce bundle size.
- **`heavy library (recharts)`**: lazy-load chart modules with `React.lazy` and `Suspense`.
- **`component too large`**: split into focused subcomponents and move logic to hooks/services.
- **`useState initialized from prop`**: derive value in render or sync explicitly with guarded effect.
- **`array index as key`**: use stable IDs (`id`, `slug`, `uuid`) to avoid list bugs.
- **`default [] prop`**: hoist default arrays/objects to module-level constants for stable references.

Use DevTools Performance/Memory and `react-scan` for render hotspots after fixes.
