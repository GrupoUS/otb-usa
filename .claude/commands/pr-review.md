---
description: OTB USA pull request review checklist and report template.
---

# /pr-review — OTB USA PR Review

**ARGUMENTS**: $ARGUMENTS

Use for read-only PR review or local diff review. Do not approve, merge, auto-merge, push, or deploy.

## 0. Context load

```typescript
Skill("debugger");
Skill("astro");
Skill("otb-usa");
Skill("otb-theme"); // if UI/styling changed
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

- `src/content/products/otb.json` — product/copy/legal SSOT.
- `src/content.config.ts` — schema contract.
- `src/lib/whatsapp.ts` — CTA/WhatsApp SSOT.
- `astro.config.mjs` — static/canonical/sitemap contract.
- `src/layouts/Layout.astro` — SEO/meta/JSON-LD shell.
- `src/styles/global.css` — OTB token canon and motion utilities.
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
## /pr-review — OTB USA

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

### OTB guardrails
- OTB-only context: pass/fail
- Harvard legal guardrail: pass/fail/N/A
- WhatsApp SSOT: pass/fail/N/A
- Astro static contract: pass/fail
```

Never merge or approve the PR yourself.
