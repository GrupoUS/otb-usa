---
name: design-fix-onboard
description: /design-fix phase 1/7 onboard — current-state snapshot of the Aula TRINTAE3 landing + per-phase worklists (harden/typeset/layout/adapt/optimize/polish) + a dedicated MOTION worklist under the owner motion-freedom directive.
metadata:
  type: project
---

# /design-fix — PHASE 1/7: ONBOARD (report-only)

> Supersedes the prior OTB-era onboard note (those components/routes no longer exist).
> Aha moment for THIS landing = visitor instantly grasps "free live class with Dra. Sacha,
> 24 jun, register now." Audience: habilitados de saúde estética, mobile-first, paid traffic / IG.
> Every phase = reduce friction to the inscription form + make the page feel premium/memorable.
> Owner motion-freedom directive: rich motion welcome; transform/opacity/filter only, 60fps,
> reduced-motion fallback MANDATORY.

## Current-state snapshot (post design-improve + /simplify + new gold logo/favicon)
- Page order: Hero → Audience(01) → Learn(02) → Authority → NextStep → RegistrationForm(03) → FAQ(04) → FinalCTA + MobileCTABar. One `<h1>` (Hero), `<h2>` per section.
- Hero: asymmetric 12-col 7/5, `lg:text-7xl` Playfair headline, focal `text-gradient-gold` highlight word, staggered `[data-reveal]` cascade (delays 1–5), photo `depth-5` + offset frame, `landing-mesh-bg` + static `landing-vignette` atmosphere. Photo hidden `<lg`.
- Shared primitives (post /simplify): `Eyebrow.astro` (gold hairline + tracked label, forwards attrs), `SectionHeading.astro` (editorial index numeral + accent bar), `Button.astro` (btn-base presets, min-h 44/48/56), `Logo.astro` (now `/images/products/trintae3-logo.webp` 598×96, eager+fetchpriority=high), `WhatsAppIcon`, `Card`. `lib/text`: `splitHighlight` + `formatEditorialIndex`.
- Motion system: `.js`-gated `[data-reveal]` IntersectionObserver (Layout), keyframes reveal-up/left/right/scale, stagger `[data-reveal-delay=1..6]`, `[data-numeral-reveal]`, ambient `mesh-drift`/`gold-pulse`/`float`/`shimmer`/`scroll-hint`. Global reduced-motion block + `<noscript>` reveal fallback. `max-width:768px` disables several infinite animations.
- glass-card-bright reserved for FinalCTA only (NextStep + form success on glass-card).
- Tokens: Navy/Gold `@theme`; depth-1..6, btn presets, glass utilities, text-gradient-gold, text-shimmer present.

## Per-phase worklists

### harden (a11y / edge / states)
- Header CTA `<a>` + MobileCTABar `<a>` are `bg-gold` and get the bare global gold focus ring → gold-on-gold = low-visibility focus. Add navy ring / ring-offset on gold surfaces.
- MobileCTABar duplicates FinalCTA's CTA at page bottom; recheck it doesn't obscure FinalCTA buttons on short screens (SC 2.4.11) — index pads bottom; verify.
- Authority portrait `loading="lazy"` — confirm it's not the mobile LCP; if it is, eager it (overlaps optimize).
- Re-verify form error/success focus mgmt + aria-live intact post-chain (no regression expected).
- Confirm visible `:focus-visible` on FAQ `<summary>`, nav links, footer social icons.

### typeset (structure/hierarchy/whitespace ONLY — copy FROZEN)
- Enforce comfortable measure (45–75ch): Authority paragraphs span col-span-3 wide on desktop — may exceed 75ch; cap with max-w.
- Audience intro left-aligned vs full-width items grid — verify line length.
- Learn card body line-height/measure vs `text-2xl` h3 rhythm.
- Uniform heading→accent→subtitle spacing via SectionHeading; consistent chip/pill tracking.

### layout (structure / rhythm)
- Section spacing rhythm (`py-20`) audit; tighter mobile vs generous desktop.
- Authority uses its own grid (not SectionHeading) — confirm it reads as part of the spine or intentionally distinct.
- NextStep + FinalCTA both centered glass cards in sequence (Form between) — differentiate rhythm so they don't feel repetitive.
- Learn grid col logic (4→2col / else 3col) balanced at real topic count.

### adapt (responsive 360 / 390 / 768 / 1280 / short-viewport)
- Hero `landing-vignette` (navy 55/65%) too heavy on short mobile viewports where top+bottom overlap (carried residual risk) — verify/soften.
- Hero `lg:-ml-6` overlap at exactly 1024px — headline/photo crowding check.
- `lg:text-7xl`→`text-5xl` at 360px — longest headline word no overflow.
- 4 event chips wrap gracefully at 360px.
- MobileCTABar height + safe-area on notched devices.
- 768px: sm/lg grid breakpoints transition cleanly.

### optimize (perf / CWV / bundle)
- Confirm zero framework JS shipped (static; @astrojs/react orphan client.js = deps/config, OUT of scope — note only).
- LCP likely Hero headline on mobile (Playfair preloaded) — verify. Logo eager+fetchpriority=high (598×96) competes with LCP — reconsider whether logo needs fetchpriority=high.
- All images have width/height (CLS=0) — re-verify after layout edits.
- Ambient infinite anims: `will-change` scoped, paused on mobile, 60fps; confirm reduced-motion halts all loops.

### polish (micro-interactions)
- Button hover/press richness + touch press feedback.
- FAQ chevron + panel open feel (opacity fade — see motion #8).
- card-glow-hover vs card-hover-lift consistency.
- Focus-ring polish on gold surfaces (ties to harden).
- Link underline-offset / hover transition consistency.

## MOTION worklist (owner freedom — transform/opacity/filter only, .js-gated, reduced-motion → static)
1. **Hero focal gradient sweep** — animate `background-position` on the `text-gradient-gold` highlight (one slow pass on load or subtle infinite). GPU-cheap on clipped text. Degrade: static gold fill (text-shimmer reduced-motion pattern).
2. **Hero photo parallax-lite** — `animation-timeline: scroll()` translateY behind `@supports`. Degrade: @supports-gated + reduced-motion → no transform.
3. **Section reveal upgrade** — add scale+`filter: blur()`→0 entrances (NextStep/FinalCTA); directional variety. Degrade: instant visible.
4. **Learn card hover richness** — lift + gold glow + numeral micro-translate/scale on hover. Degrade: base state fine.
5. **Spine numeral reveal** — extend `[data-numeral-reveal]` with scale-from. Degrade: existing override opacity:1.
6. **Event chips staggered pop-in** — nested per-chip delays, opacity+translateY/scale. Degrade: visible.
7. **CTA press + hover sheen** — btn-base `:active scale(.98)` exists; add hover sheen sweep via pseudo translateX + opacity. Degrade: base button.
8. **FAQ panel open fade** — `details[open] > div` opacity/translateY (NOT height). Degrade: instant.
9. **Sticky header condense** — scroll-past-hero: stronger blur/shadow + slight logo `transform: scale` (not height) via existing scroll class toggle. Degrade: static.
10. **MobileCTABar slide-up** — translateY(100%)→0 once scrolled past hero (transform+opacity). Degrade: simply present.
11. **Ambient hero depth** — slow second mesh/gradient drift or faint grain shimmer (filter/opacity) on aria-hidden layer. Degrade: mobile + reduced-motion → static.
12. **Authority portrait reveal sheen** — one-pass gold sheen across the frame on scroll-in (transient, NOT a persistent 2nd gold focal moment). Degrade: no sheen.

## Risks
- Motion budget above the fold: Hero gradient sweep + parallax + cascade + CTA pulse could compete. Sequence as ONE orchestrated entrance, not chaos.
- `animation-timeline: scroll()` Firefox = flag-only → MUST `@supports`-gate + static fallback.
- `filter: blur()` on large surfaces costs paint — small radius / bound to small elements; verify 60fps mid-device.
- Vignette heaviness on short mobile (adapt phase).
- Gold focus-on-gold visibility (harden) — real a11y gap, fix regardless of motion.
- FROZEN: no copy/JSON/schema/whatsapp/astro.config; typeset = structure/whitespace only.
- @astrojs/react orphan client.js = deps/config, OUT of design-fix scope.

## Trivial blockers found this phase
None requiring an edit. Report-only honored — no files changed.
