---
description: GPUS Astro landing debugging protocol for Astro, styling, content, build, and runtime issues.
---

# /debug — ${project.displayName} Debugging

**ARGUMENTS**: $ARGUMENTS

Use for build failures, regressions, broken pages, content/schema errors, styling regressions, or suspicious behavior.

## 0. Context load

```typescript
Skill("debugger");
Skill("astro");
```

Add as needed:

- `Skill("gpus-theme")` for styling/design regressions.
- `Skill("performance-optimization")` for bundle, Lighthouse, CWV, or runtime performance.
- `Skill("grupo-us")` for product/legal/CTA copy issues.

## 1. Debug discipline

1. Reproduce or inspect the failing path first.
2. Identify the root cause before editing.
3. Make the smallest safe change.
4. Do not simplify meaningful code just to silence diagnostics.
5. Validate with evidence before claiming fixed.

## 2. ${project.displayName} invariants

- Astro static MPA only: no SSR, no `ClientRouter`, no `prerender = false`.
- Content source of truth: `${content.productJson}` + `src/content.config.ts`.
- WhatsApp source of truth: `src/lib/whatsapp.ts`; messages start with `${lead.whatsappGreeting}`.
- Package manager: Bun only (`bun`, `bunx`).
- Lead/legal guardrail: LGPD consent + privacy link required on the form; lead destination + tracking IDs stay in env (`DATABASE_URL`/`LEAD_WEBHOOK_URL`/`${lead.endpointEnv}`, `${tracking.ga4Env}`, `${tracking.pixelEnv}`), never committed.

## 3. Common checks

```bash
bun run lint
bunx astro check
bun run build
```

Targeted probes:

```bash
rg -n "ClientRouter|prerender = false|output:.*server|output:.*hybrid" src astro.config.mjs
rg -n "wa\.me|api\.whatsapp\.com" src --glob "!src/lib/whatsapp.ts"
rg -n "transition:\s*all" src
```

## 4. Recovery after 2+ failed attempts

Use `/recover`. Stop changing code, document attempts, clear only generated caches with user approval, then re-run validation.
