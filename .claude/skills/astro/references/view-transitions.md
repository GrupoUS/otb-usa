# View Transitions — GPUS Astro landing policy

This reference is intentionally project-specific.

This is an Astro static MPA. Do **not** add Astro's page-transition router in this repo.

## Forbidden

- Importing `ClientRouter` from `astro:transitions`.
- Adding transition-router components to `src/layouts/Layout.astro`.
- Adding SPA-style navigation to solve animation or routing issues.

## Preferred approach

- Use normal document navigation for pages.
- Use CSS/JS micro-interactions scoped to the current page.
- Keep motion limited to `transform` and `opacity`.
- Re-run reveal/interaction scripts on normal page load only; no router lifecycle hooks.

## Recovery note

If a transition-related error appears, remove transition-router usage and keep the static-MPA contract. Do not replace old `ViewTransitions` snippets with `ClientRouter` in this project.
