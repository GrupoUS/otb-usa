---
description: Failure recovery protocol for post-failure handling. Use after 2+ failed fix attempts.
---

# /recover - Structured Failure Recovery

**ARGUMENTS**:$ARGUMENTS

<command-instruction>
Execute Phase 2C Failure Recovery protocol:

## Step 1: STOP

- Halt all current fix attempts immediately
- Do not make any more changes

## Step 2: DOCUMENT

Output a structured failure report:

- What was the original bug/error?
- What fixes were attempted? (list each)
- Why did each fail?
- Current state of the codebase

## Step 3: REVERT (if applicable)

- If changes made the codebase worse, revert to last clean state
- Run `git diff HEAD` to show what changed
- Confirm with user before reverting if uncertain

## Step 3.5: CLEAR CACHES (Astro-specific)

Before retrying, clear stale state that may cause phantom errors:

```bash
rm -rf node_modules/.vite dist .astro    # Vite cache + build artifacts
bun install                               # Reinstall deps
bunx astro check && bun run build         # Verify clean state
```

Common Astro recovery patterns (from `astro` skill → troubleshooting.md):
- **Content Collection not found** → Check `src/content/<name>/` exists with at least one file
- **Hydration mismatch** → Guard browser-only APIs with `typeof window !== 'undefined'`
- **Tailwind classes not working** → Verify `@import "tailwindcss"` in global.css + `@tailwindcss/vite` in astro.config.mjs
- **ViewTransitions error** → Replace with `ClientRouter` from `astro:transitions` (Astro 6)
- **config.ts errors** → Astro 6 infers schemas, delete `src/content/config.ts`

## Step 4: CONSULT oracle

- Delegate the failure report to oracle agent
- Prompt format:
  "Here is a failure I cannot resolve: [DOCUMENT output]. Analyze root cause and recommend approach."

## Step 5: REPORT TO USER

- Present oracle analysis
- Present options with effort estimates
- Reference relevant `astro` skill sections if Astro-related
- Ask user how to proceed

## Astro-Specific Recovery Checklist

Before declaring unrecoverable, verify:
- [ ] Vite cache cleared (`rm -rf node_modules/.vite .astro`)
- [ ] `bunx astro check` passes (TypeScript + Content Collections)
- [ ] `bun run build` succeeds (full static build)
- [ ] No `ViewTransitions` usage (must be `ClientRouter`)
- [ ] Using `src/content.config.ts` (project uses explicit Zod schemas, NOT inference)
- [ ] React island props are plain objects (`.data`, not `CollectionEntry`)
- [ ] `client:*` directives only on `.tsx` files, never `.astro`
- [ ] Fonts via Astro 6 Fonts API (`<Font />` component) — no Google CDN links
- [ ] `bun run lint` passes (Biome + oxlint)
  </command-instruction>
