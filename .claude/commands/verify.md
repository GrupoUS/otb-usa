---
description: GPUS Astro landing post-implementation verification gate.
---

# /verify — ${project.displayName} Verification Gate

**ARGUMENTS**: $ARGUMENTS

Use before claiming completion of L3+ work or before handing work to review.

## 0. Context load

```typescript
Skill("astro");
Skill("debugger");
Skill("performance-optimization"); // if perf/SEO/a11y/security changed
```

## 1. Required gates for code/config changes

```bash
bun run lint
bunx astro check
bun run build
```

A gate is passing only if it was run and exited successfully in this session.

## 2. ${project.displayName} invariant smoke checks

```bash
rg -n "ClientRouter|prerender = false|prerender: false|output:.*server|output:.*hybrid" src astro.config.mjs
rg -n "wa\.me|api\.whatsapp\.com" src --glob "!src/lib/whatsapp.ts"
rg -n "transition:\s*all" src
# Legacy identity/product denylist: search active sources for any old project/product terms from the migration notes; exclude archives.
```

Expected result for smoke checks: no active-source matches except intentional rule text that forbids a pattern.

## 3. Review checklist

- Branch must be on `main`.
- No dependency added without approval.
- No protected file changed unintentionally.
- Product copy remains in `${content.productJson}` when applicable.
- LGPD consent + privacy link preserved on the registration form.
- Lead destination + tracking IDs stay in env (`DATABASE_URL`/`LEAD_WEBHOOK_URL`/`${lead.endpointEnv}`, `${tracking.ga4Env}`, `${tracking.pixelEnv}`), never committed.
- WhatsApp message starts with `${lead.whatsappGreeting}`.
- Canonical domain is `${project.productionUrl}`.

## 4. Verdict

Return one of:

- `VERIFIED` — all gates pass, no notes.
- `VERIFIED-WITH-NOTES` — gates pass, with non-blocking follow-ups.
- `NEEDS-WORK` — at least one gate failed or an invariant is violated.

Include exact commands run and the relevant output summary.
