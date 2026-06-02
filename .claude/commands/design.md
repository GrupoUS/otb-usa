---
description: GPUS Astro landing design workflow for Astro landing pages and components.
---

# /design — ${project.displayName} Design Workflow

**ARGUMENTS**: $ARGUMENTS

Use this command for new or revised ${project.displayName} page sections, landing components, visual hierarchy, motion, or copy/design alignment.

## 0. Context load

Load, in order:

```typescript
Skill("grupo-us");      // product, audience, CTA, LGPD/consent guardrails
Skill("gpus-theme");    // Navy/Gold design canon
Skill("astro");         // static MPA + Content Collections
Skill("ui-ux-pro-max"); // creative execution layer when visual work is non-trivial
```

Relevant rules:

- `AGENTS.md`
- `.claude/rules/DESIGN.md`
- `.claude/rules/frontend.md`
- `.claude/rules/astro.md`

## 1. Design commitment

Before coding, state a short commitment:

- Scope: exact section/component/page.
- Hierarchy: what is primary, secondary, muted.
- Tokens: how Navy/Gold will be used.
- Motion: only `transform` + `opacity`; respect `prefers-reduced-motion`.
- Content: ${project.displayName} product copy belongs in `${content.productJson}` unless it is UI chrome.

## 2. Implementation rules

- Astro static MPA only: no `ClientRouter`, no SSR adapter, no `prerender = false`.
- Use Content Collections (`getEntry("products", "${content.productSlug}")`) for product data.
- Keep WhatsApp URLs centralized in `src/lib/whatsapp.ts`.
- Use Tailwind v4 `@theme` tokens from `src/styles/global.css`; no hardcoded hex in components.
- Gold is hierarchy, not decoration.
- Avoid generic template layouts; the landing should feel premium, restrained, and built around Dra. Sacha's authority.

## 3. Routing by scope

| Scope | Agent |
|---|---|
| Single known component | Direct edit |
| New section/page or multi-file UI | `frontend-specialist` |
| Performance-sensitive design | `performance-optimizer` after implementation |
| Ambiguous product/legal copy | `explorer-agent` + `librarian` only if needed |

## 4. Validation

Run, at minimum:

```bash
bun run lint
bunx astro check
bun run build
```

If visual behavior changed, also inspect the affected route (`/` or any of `${content.legalRoutes}`) manually or with a browser tool when available.

## Anti-patterns

| Don't | Do |
|---|---|
| Start coding without a design commitment | State hierarchy/tokens/motion first |
| Add SPA/router behavior | Keep Astro static MPA |
| Hardcode commercial product copy in components | Move to `${content.productJson}` |
| Use gold everywhere | Use gold for hierarchy and decisive accents |
| Animate layout properties | Animate `transform`/`opacity` only |
| Inline `wa.me` URLs | Use `src/lib/whatsapp.ts` |
