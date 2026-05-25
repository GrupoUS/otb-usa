---
name: otb-theme
description: Use when applying the OTB USA visual system: dark-only Navy/Gold palette, Playfair Display + Inter hierarchy, premium landing aesthetics, Tailwind v4 @theme tokens, and no-template UI guardrails.
---

# OTB Theme

Visual system for **OTB USA — Grupo US**.

## Identity

- Dark-only canvas.
- Navy base, rare gold emphasis.
- Premium international authority.
- Playfair Display for editorial authority; Inter for dense readability.
- Lucide SVG icons only.

## Canonical tokens

Technical source: `src/styles/global.css` `@theme {}`.

| Role | Token | Value |
|---|---|---|
| Canvas | `--color-navy` | `#1a1a2e` |
| Surface | `--color-navy-light` | `#2a2a40` |
| Surface hover | `--color-navy-lighter` | `#3d3d5c` |
| Gold | `--color-gold` | `#d4af37` |
| Gold hover | `--color-gold-light` | `#e8c96a` |
| Gold deep | `--color-gold-dark` | `#b8960c` |
| Text primary | `--color-text-primary` | `#fafaf9` |
| Text muted | `--color-text-muted` | `#94a3b8` |
| WhatsApp | `--color-whatsapp` | `#25d366` |

## Rules

- Gold is hierarchy, not decoration.
- No hardcoded hex in components.
- No layout-property animation.
- No emoji icons.
- No third type family.
- No generic template layouts.
- Prefer static Astro markup over JS.

## Motion

- Allowed: `transform`, `opacity`, color/background/border-color when explicit.
- Avoid: `transition: all`.
- Forbidden: animating `width`, `height`, `top`, `left`, `margin`, `padding`.
- Respect `prefers-reduced-motion`.

## References

| File | Purpose |
|---|---|
| `references/css-variables.md` | Token reference and usage |
| `references/shadcn-config.md` | Optional component registry config notes |
| `assets/theme-tokens.css` | Portable token artifact |
| `assets/tailwind-theme.ts` | Optional TS token export |
| `assets/components.json` | Optional shadcn config artifact |
