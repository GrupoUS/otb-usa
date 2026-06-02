---
name: improve-hero-identity
description: Design-improve chain (bolder+animate+colorize) — Hero identity pass, SectionDivider tone prop, WhyOTB crimson card, TargetAudience photo + crimson chips
metadata:
  type: project
---

## Files touched

| File | Change summary |
|---|---|
| `src/components/landing/Hero.astro` | Photo scrim (two-layer dark navy gradient), landing-mesh-usa, crimson badge + pulsing dot, 5 micro-star USA motif (aria-hidden), gold+crimson filete, taller min-h-[94vh], stronger heading hierarchy (4.5rem @lg), scroll-hint preserved |
| `src/components/landing/SectionDivider.astro` | Added `tone?: "gold" \| "crimson"` prop (default "gold"); crimson tone changes via/dot/numeral color to `--color-crimson-bright`; zero structural change to default behaviour |
| `src/components/landing/WhyOTB.astro` | Card[1] (Branding internacional/Boston) now `glass-card-crimson card-glow-hover-crimson glow-crimson` with crimson icon badge + filete; card-hover-lift added to all cards; pointer-glow JS preserved |
| `src/components/landing/TargetAudience.astro` | Photo background (`aula-1.jpg`) with deep navy overlay (96%→78%); 6 chips alternate gold/crimson border+icon accent; crimson radial glow bottom-left |

## Overlay contrast reasoning (WCAG)

- Hero scrim: `navy 94% → 85% → 72%` covers the main text column fully. At navy ~94% opacity over the campus photo, estimated contrast ratio for `--color-text-primary` (#fafaf9) is ≥7:1 (body passes 4.5:1; h1 at 4.5rem passes 3:1 easily).
- TargetAudience scrim: `navy 96% → 88% → 78%` — same conservative floor. Text column (left 5 cols) sits inside the 96%+ zone.
- Crimson is NEVER used as body text color — only borders, icon badges, decorative filetes, glow, and the `text-gradient-crimson` (crimson-bright→gold, only on large display text).

## Autocheck Maestro

| Gate | Status | Note |
|---|---|---|
| Safe Split | PASS | No bento grid introduced — grid-cols-12 asymmetric layout preserved |
| Bento | PASS | No bento pattern used — deliberate hero split + chip grid |
| Blue Trap | PASS | Zero blue/cyan/fintech introduced; Navy/Gold remains base |
| Line Trap | PASS | Radius: rounded-full (pills/badges), rounded-2xl/3xl (cards) — no 4-8px "safe boredom" zone used |
| Glass | PASS | glass-card-bright / glass-card-crimson used intentionally for depth; not "glassmorphism as trend" but layered elevation |
| Glow | PASS | gold-pulse-glow, crimson-pulse-glow, card-glow-hover, card-glow-hover-crimson all from existing utilities; JS pointer-glow guarded by prefers-reduced-motion |

## Zero-hex / motion / CTA / contrast confirmation

- **zero hex hardcoded**: confirmed — all color values use `var()`, `color-mix(in srgb,...)`, Tailwind utility classes referencing tokens, or `bg-crimson-tint-10` / `border-crimson-mid-35` / `border-crimson-mid-45` utilities.
- **prefers-reduced-motion**: global.css universal rule collapses all CSS animations; JS pointer-glow has explicit `matchMedia('prefers-reduced-motion: reduce')` guard; micro-star and filete decorations are purely visual HTML with no JS.
- **gold CTA preserved**: primary CTA button remains `bg-gold text-navy` with gold shadow — crimson never touches the CTA.
- **overlay contrast ok**: two-layer scrim approach (bg photo -z-20, navy gradient -z-10) replaces the single combined background-image trick; gives stronger, more predictable contrast on the text column.

## Linked memories

- [[colorize]] — crimson token set and utility inventory
- [[bolder]] — hierarchy and motion guidance applied here
- [[animate]] — reveal/stagger patterns preserved
