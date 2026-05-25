# Rules — Tier 2 Universal Guardrails

> Universal do/don't tier-2 rules. Portable to any project.
> Project-specific values resolve via `.claude/config.json` + tech-stack skills + project skills.
> Loaded on demand by `/prime` per the routing matrix in `.claude/CLAUDE.md`.

## Files

| File | Scope |
|---|---|
| `frontend.md` | Component placement, hydration philosophy, content-data SSOT, forms, external surfaces, performance budget, a11y plumbing |
| `DESIGN.md` | Color tokens, typography, components spec, layout, border radius, iconography, motion, imagery, depth, focus |
| `stability.md` | Universal A–L checklist, render-mode invariants, performance gates (CWV), smoke template, anti-patterns, debug triage, escalation triggers |
| `seo.md` | Locale, routes, sitemap, robots, OG/Twitter cards, JSON-LD, CWV thresholds, AI citation (GEO) |

## How rules are loaded

1. `/prime` (auto / backend / frontend / fullstack) reads `.claude/CLAUDE.md` § routing matrix
2. Routing matrix says "task type X loads rule Y"
3. Loader reads `.claude/rules/Y.md`
4. Stops once minimum-viable context loaded

## Cross-project portability

Drop `.claude/rules/` into any Claude Code project. Universal substance survives:

- Universal frontend do/don't (hydration, content SSOT, forms, perf, a11y)
- Universal design do/don't (color, typography, motion, imagery, focus)
- Universal stability checklist + smoke template
- Universal SEO + GEO patterns

Stack-specific syntax (Astro `client:*`, Next.js Server Components, SvelteKit `+page.svelte`, Tailwind v4 `@theme`) lives in tech-stack skills. Project values (canonical URL, brand voice, design tokens) live in project skills + `.claude/config.json`.

## Stack signals

When a task touches stack-specific patterns, the rule points to the matching tech-stack skill. Claude auto-loads via skill description match (Anthropic skills auto-trigger model). Common stacks:

| Stack | Skill |
|---|---|
| Astro (any version) | `astro` |
| React / React 19 | `react` (or composite stack skill) |
| Next.js (Pages / App Router) | `nextjs` |
| Remix | `remix` |
| SvelteKit | `sveltekit` |
| Vite + vanilla | `vite` |

## Project signals

When a task touches project-specific tokens / brand voice / SSOT helpers, the rule points to the matching project skill. Auto-triggers via skill description match. Examples:

- `<brand>-theme` skill — color palette + token canon
- `<brand>` skill — brand voice + product canon + WhatsApp / SDR contact SSOT
- Domain skills (e.g., `<product>-rules` overlay) — repo-specific conventions

## Cardinal rules

Per-project cardinal rules (the 8 / 12 / N non-negotiable invariants) live in `.claude/CLAUDE.md`. Rules in this folder support those cardinals universally — they don't override or duplicate them.
