# OTB Theme — CSS variables

Canonical runtime tokens live in `src/styles/global.css`.

## Core tokens

| Role | CSS variable | Utility | Value |
|---|---|---|---|
| Canvas | `--color-navy` | `bg-navy` | `#1a1a2e` |
| Surface | `--color-navy-light` | `bg-navy-light` | `#2a2a40` |
| Surface hover | `--color-navy-lighter` | `bg-navy-lighter` | `#3d3d5c` |
| Gold | `--color-gold` | `text-gold`, `bg-gold` | `#d4af37` |
| Gold hover | `--color-gold-light` | `text-gold-light` | `#e8c96a` |
| Gold deep | `--color-gold-dark` | `text-gold-dark` | `#b8960c` |
| Primary text | `--color-text-primary` | `text-text-primary` | `#fafaf9` |
| Muted text | `--color-text-muted` | `text-text-muted` | `#94a3b8` |
| WhatsApp | `--color-whatsapp` | `bg-whatsapp` | `#25d366` |

## Usage rules

- Add new colors only as named semantic roles in `global.css`.
- Do not use inline hex in `.astro` / `.tsx`.
- Gold should stay rare and decision-oriented.
- Body text uses `text-text-primary` or `text-text-muted`, not `text-gold`.

## Motion utilities

- Reveal and hover effects must use `transform` + `opacity`.
- Do not animate layout properties.
- Keep `prefers-reduced-motion` support.
