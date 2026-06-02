---
description: Execute an approved GPUS Astro landing plan with focused code changes and validation.
---

# /implement — ${project.displayName} Plan Execution

**ARGUMENTS**: $ARGUMENTS

Use to execute an approved plan or a clearly scoped implementation request.

## 0. Pre-flight

1. Confirm branch is `main`.
2. Read `.claude/config.json` for package manager and paths.
3. Load relevant skills:

```typescript
Skill("planning"); // when executing a plan
Skill("astro");
Skill("grupo-us");
Skill("gpus-theme"); // if UI/styling is touched
```

## 1. Execution rules

- Touch only files required by the plan.
- Keep product copy in `${content.productJson}` unless it is UI chrome.
- Keep WhatsApp behavior centralized in `src/lib/whatsapp.ts`; messages start with `${lead.whatsappGreeting}`.
- Keep lead destination + tracking IDs in env (`DATABASE_URL`/`LEAD_WEBHOOK_URL`/`${lead.endpointEnv}`, `${tracking.ga4Env}`, `${tracking.pixelEnv}`); never hardcode or commit them.
- Keep Astro static: no SSR adapter, no `ClientRouter`, no `prerender = false`.
- Use Bun only.
- Do not add dependencies without explicit approval.
- Do not commit, push, open PRs, or deploy unless explicitly requested.

## 2. Decomposition

| Work type | Default executor |
|---|---|
| Single-file known fix | Direct edit |
| Astro/page/component/styling | `frontend-specialist` for L3+ |
| Build/type/runtime bug | `debugger` for L3+ |
| Performance/SEO/a11y/security | `performance-optimizer` for L3+ |
| Codebase discovery | `explorer-agent` |

## 3. Validation

Run the narrowest useful check first, then the full gate when code changed:

```bash
bun run lint
bunx astro check
bun run build
```

Report exact commands and results. If a gate fails, fix only failures caused by the current work; flag unrelated failures separately.
