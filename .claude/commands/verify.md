---
description: OTB USA post-implementation verification gate.
---

# /verify — OTB USA Verification Gate

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

## 2. OTB invariant smoke checks

```bash
rg -n "ClientRouter|prerender = false|prerender: false|output:.*server|output:.*hybrid" src astro.config.mjs
rg -n "wa\.me|api\.whatsapp\.com" src --glob "!src/lib/whatsapp.ts"
rg -n "transition:\s*all" src
# Legacy identity/product denylist: search active sources for any old project/product terms from the migration notes; exclude archives.
```

Expected result for smoke checks: no active-source matches except intentional rule text that forbids a pattern.

## 3. Review checklist

- Branch is not `main`.
- No dependency added without approval.
- No protected file changed unintentionally.
- OTB product copy remains in `src/content/products/otb.json` when applicable.
- Harvard legal guardrail preserved.
- WhatsApp message starts with `Olá, Laura!`.
- Canonical domain is `https://otb.drasacha.com.br`.

## 4. Verdict

Return one of:

- `VERIFIED` — all gates pass, no notes.
- `VERIFIED-WITH-NOTES` — gates pass, with non-blocking follow-ups.
- `NEEDS-WORK` — at least one gate failed or an invariant is violated.

Include exact commands run and the relevant output summary.
