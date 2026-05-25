---
globs: src/pages/**, src/components/**, src/layouts/**, src/styles/**, src/content/**
---

# Frontend — Universal Tier 2 Rules

> Universal frontend do/don't. Portable to any project.
> Stack-specific patterns (Astro, Next.js, Remix, SvelteKit, etc.) live in the matching tech-stack skill — Claude auto-loads via skill description match.
> Project-specific tokens / brand voice / SSOT helpers live in project skills.
> Visual canon: `.claude/rules/DESIGN.md`.

---

## Do

### Component placement

- Layout shells (header, footer, page wrappers) live separately from feature components — never co-located with product-specific code.
- Feature components live in a single domain folder per feature, not split across the tree.
- Shared primitives (Button, Card, SectionHeading) live in a `shared/` folder consumed everywhere — never duplicated per route.
- Page files only compose; logic + markup belong in components.

### Hydration philosophy

- **Default to static / server rendering.** Hydrate islands only when interactivity is genuinely required.
- Below-fold islands hydrate on visibility (intersection-based directive).
- Above-fold pure-visual islands hydrate when browser is idle — never block first paint.
- Persistent floating UI (chat widget, sticky CTA) is the only justified case for immediate hydration.
- Every island must be able to SSR — avoid `client-only` directives unless component literally references `window` / `document` at module-top scope.

> Exact directive names + escape hatches → load matching tech-stack skill.

### Content data SSOT

- Content (product copy, FAQ, testimonials, team bios, pricing) lives in a typed data layer — JSON / YAML / MD with schema validation, or a CMS.
- Components read fields from the data layer, never as string literals.
- Schema validation is a build gate — type-check / framework check re-runs validation on data edits.
- Adding a content field: update schema + data files + component reading the field. All three move together.

### Forms

- Every input has `<label for="...">` (or wraps the input).
- Required fields visually marked **and** `aria-required="true"`.
- Error messages use color **+ icon + text** — never color alone.
- Loading state via local pending flag (or pure CSS) — never block input.
- Submit handler in try / catch with user-facing fallback (toast, redirect). Never silently swallow.
- Validate at the boundary (Zod / Yup / Valibot) — never trust un-validated input.

### External surfaces

- HTTPS only. Reject mixed-content.
- `target="_blank"` always pairs with `rel="noopener noreferrer"`.
- Treat external URLs as untrusted UI text — author copy via data fields, never raw URLs in components.
- Build-time secrets via deploy env. No `.env` committed.
- Never hardcode provider versions / base URLs in components — extract to config or service module.

### Performance

- Hoist static arrays, objects, regex, formatters (`Intl`, `Date.format`) to module scope — never re-create per render.
- Memoize hot list items only when rendering > 30 items.
- `Set` / `Map` over repeated `.find()` / `.includes()` on hot paths.
- No heavy libraries (>50KB) in main bundle. Per-island imports only.
- Initial JS budget: < 50KB on prerendered pages.
- LCP / above-fold images: explicit priority hint (`fetchpriority="high"`, eager loading).
- Below-fold images: lazy loading + low priority.
- Always set explicit `width` + `height` on images (CLS = 0).

### Accessibility plumbing

- Skip link is the **first focusable element** on every page. Targets `<main>` with `tabindex="-1"`.
- Semantic landmarks: one `<h1>` per page, `<main>`, `<nav>`, `<footer>`. No skipped heading levels.
- Focus rings always visible on `:focus-visible` (never `outline: none` without replacement).
- Icon-only buttons require `aria-label`. Decorative icons: `aria-hidden="true"`.
- `prefers-reduced-motion` honored on every animation (CSS + JS islands).
- `<noscript>` fallback when reveal-on-scroll patterns hide content via opacity / transform.
- FAQ / disclosure: native `<details>` or CSS grid `0fr ↔ 1fr` rows pattern. **Never** animate height.

---

## Don't

| Don't | Why |
|---|---|
| `href="#"` for actions | Use `<button type="button">` for actions, real `<a href="...">` for navigation |
| Mix icon libraries | One library per project — choose and stick with it |
| `import * as Icons from '<lib>'` | Defeats tree-shaking — named imports only |
| Emoji as UI icons | Inconsistent rendering; not accessible. SVG icons only |
| Animate layout properties (`width`, `height`, `top`, `left`, `padding`, `margin`) | Forces layout / paint; janks INP. Use `transform` + `opacity` only |
| `transition: all` | Animates unintended properties; perf overhead. Name properties explicitly |
| Hardcode landing copy in components | Bypasses schema validation; drifts from data |
| Inline secrets / API keys / auth tokens | Use deploy env, never commit |
| Initial JS bundle > 50KB on prerendered pages | LCP / INP regression. Audit and split |
| Skip link removed or repositioned past first focusable | Breaks keyboard navigation |
| `<noscript>` reveal fallback dropped | JS-off users see blank sections |
| FAQ panel height tween | Use CSS grid `0fr/1fr` or native `<details>` |
| `client-only` directive on SSR-able islands | Pre-render every island that can be pre-rendered |
| `setState` / mutation in render path | Re-render loops, hydration mismatch |

---

## Stack signals

When the task touches framework-specific patterns, **load the matching tech-stack skill** (Claude auto-triggers via skill description match):

| Surface | Load |
|---|---|
| `*.astro` files, Astro Content Collections, `client:*` directives, `astro.config.mjs`, View Transitions, Astro `<Image>` | `astro` skill |
| `*.tsx` / `*.jsx` (React), hooks, JSX patterns, React 19+ features | `react` skill (or stack skill if present) |
| Next.js App Router, Server Components, route handlers | `nextjs` skill |
| Remix loaders / actions, `app/routes/`, Remix conventions | `remix` skill |
| SvelteKit `+page.svelte`, `+layout.svelte`, load functions | `sveltekit` skill |

When the task touches **project-specific** tokens / brand voice / SSOT helpers, **load the matching project skill**.

---

## When to load more

| Need | Load |
|---|---|
| Universal stability checklist + smoke tests + anti-patterns + debug triage | `.claude/rules/stability.md` |
| Tokens, typography, glass / glow, motion | `.claude/rules/DESIGN.md` |
| SEO + JSON-LD + sitemap | `.claude/rules/seo.md` |
| Cardinal rules + routing matrix + project layer chain | `.claude/CLAUDE.md` + root `AGENTS.md` |
| Framework-specific patterns | matching tech-stack skill (auto-triggers) |
| Project tokens / brand voice / SSOT helpers | matching project skill |
