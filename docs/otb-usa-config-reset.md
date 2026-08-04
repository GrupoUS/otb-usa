# OTB USA — configuration reset plan

## Goal

Align the Astro app and `.claude/` orchestration layer with the OTB USA product only.

## Scope

- Project identity: OTB USA — Grupo US.
- Canonical URL: `https://otb.gpus.com.br`.
- Public route: `/` (`/otb` is a compatibility redirect to `/`).
- Content SSOT: `src/content/products/otb.json`.
- Theme SSOT: `src/styles/global.css` and `.claude/skills/otb-theme/`.
- Product/CTA/legal SSOT: `.claude/skills/otb-usa/`.

## Non-goals

- Add new dependencies.
- Add checkout flow.
- Add non-OTB product routes.
- Change WhatsApp number/name without stakeholder confirmation.

## Completion checklist

- No stale project names in active docs/config.
- `bun run lint` passes.
- `bunx astro check` passes.
- `bun run build` passes.
