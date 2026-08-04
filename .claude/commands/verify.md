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
# static-MPA contract
rg -n "ClientRouter|prerender = false|prerender: false|output:.*server|output:.*hybrid" src astro.config.mjs
# WhatsApp SSOT
rg -n "wa\.me|api\.whatsapp\.com" src --glob "!src/lib/whatsapp.ts"
# token canon (hex only inside @theme)
rg -n "#[0-9a-fA-F]{3,8}" src --glob "!src/styles/global.css"
# emoji-as-icon / production noise
rg -n "console\.log|debugger" src
# reduced-motion honored wherever motion was added
rg -n "prefers-reduced-motion" src/styles/global.css
# legacy identity denylist (this repo is OTB — no aula-trintae3 / TRINTAE3 surfaces)
rg -n "aula-trintae3|RegistrationForm|MobileCTABar|FinalCTA|NextStep" src
```

Expected result: no active-source matches except intentional rule text that forbids a pattern. The `<meta theme-color>` literal mirroring `--color-navy` is the one documented hex exception.

> **Não** rodar smoke check contra `transition: all`, animação de propriedade de layout, glow, glass ou 3D — cardinal rule 8 permite explicitamente. O único gate duro de motion é `prefers-reduced-motion`.

## 3. Review checklist

- Branch must be on `main`.
- No dependency added without approval.
- No protected file changed unintentionally.
- Product copy remains in `${content.productJson}` when applicable.
- Conversion path intact: one primary CTA, WhatsApp-only, message starts with `${lead.whatsappGreeting}`.
- No lead form / endpoint / database introduced without approval.
- Tracking IDs stay in env (`${tracking.ga4Env}`, `${tracking.pixelEnv}`), never committed.
- No fabricated product facts (dates, prices, credentials, partners) — everything factual traces to `${content.productJson}` or `PRODUCT.md`.
- Canonical domain is `${project.productionUrl}`; `/otb` redirect stays excluded from the sitemap.

## 4. Verdict

Return one of:

- `VERIFIED` — all gates pass, no notes.
- `VERIFIED-WITH-NOTES` — gates pass, with non-blocking follow-ups.
- `NEEDS-WORK` — at least one gate failed or an invariant is violated.

Include exact commands run and the relevant output summary.
