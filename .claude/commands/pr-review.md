---
description: GPUS Astro landing pull request review checklist and report template.
---

# /pr-review — ${project.displayName} PR Review

**ARGUMENTS**: $ARGUMENTS

Use for read-only PR review or local diff review. Do not approve, merge, auto-merge, push, or deploy.

## 0. Context load

```typescript
Skill("debugger");
Skill("astro");
Skill("grupo-us");
Skill("gpus-theme"); // if UI/styling changed
Skill("performance-optimization"); // if perf/SEO/a11y/security changed
```

## 1. Read-only collection

Use read-only git/gh commands only:

```bash
git --no-pager status --short --branch
git --no-pager diff --stat
git --no-pager diff
```

If reviewing a PR and the user explicitly provided the PR number, `gh pr view` and `gh pr diff` are allowed as read-only commands.

## 2. Risk signals

Check whether the diff touches:

- `${content.productJson}` — product/copy/legal SSOT.
- `src/content.config.ts` — schema contract.
- `src/lib/whatsapp.ts` — CTA/WhatsApp SSOT.
- `${lead.formComponent}` + `api/inscricao.js` — lead capture path (form → NeonDB → WhatsApp fallback).
- `astro.config.mjs` / `vercel.json` — static/canonical/sitemap/deploy contract.
- `src/layouts/Layout.astro` — SEO/meta/JSON-LD shell + Meta Pixel/GA4 tracking.
- `src/styles/global.css` — token canon and motion utilities.
- `public/robots.txt` — SEO sitemap/crawl contract.

## 3. Required validation suggestions

For code/config PRs, require evidence for:

```bash
bun run lint
bunx astro check
bun run build
```

For performance/SEO changes, also suggest `bun run lighthouse:audit` when a local preview is available.

## 4. Report template

```markdown
## /pr-review — ${project.displayName}

### Verdict
PASS | PASS WITH NOTES | REQUEST CHANGES

### Summary
- ...

### Blocking issues
- [file:line] issue + recommended fix

### Notes
- ...

### Validation evidence
- `bun run lint`: pass/fail/not run
- `bunx astro check`: pass/fail/not run
- `bun run build`: pass/fail/not run

### ${project.displayName} guardrails
- Single-product scope (no cross-project bleed): pass/fail
- LGPD consent + privacy link: pass/fail/N/A
- Lead destination + tracking IDs kept in env: pass/fail/N/A
- WhatsApp SSOT: pass/fail/N/A
- Astro static contract: pass/fail
```

Never merge or approve the PR yourself.
