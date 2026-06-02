---
name: design-improve-animate
description: Impeccable animate (phase 3/5) of the Aula Gratuita TRINTAE3 landing — orchestrated Hero staggered page-load + numeral-reveal accent on the editorial spine. transform/opacity only, degrades cleanly under reduced-motion and JS-off.
metadata:
  type: project
---

# design-improve — PHASE 3/5: ANIMATE (impeccable)

> Supersedes the prior OTB-era animate record (those components no longer exist post-rebuild).
> Read F:\Projetos\aula-trintae3\.claude\skills\impeccable\reference\animate.md (installed).

## PHASE COMMITMENT
One signature moment: an orchestrated Hero page-load where eyebrow → headline → sub → chips →
CTAs → note cascade in sequence (left column), with the photo column landing mid-cascade. Plus a
restrained delight accent: the editorial-spine numerals (SectionHeading index 01–04 + Learn card
numbers) settle in AFTER their reveal ancestor, via a transform/opacity keyframe. Both reuse the
EXISTING `[data-reveal]` + `[data-reveal-delay]` IntersectionObserver system (gated by `.js`,
`<noscript>` fallback, global reduced-motion neutralize) — nothing replaced. No new hex/tokens, no
JS framework, no client directives, no layout-property animation, no `transition: all`, no
bounce/elastic easing. CLS-safe (transform/opacity; image width/height kept).

## Files touched (absolute)
- F:\Projetos\aula-trintae3\src\components\landing\Hero.astro
- F:\Projetos\aula-trintae3\src\components\landing\Learn.astro
- F:\Projetos\aula-trintae3\src\components\shared\SectionHeading.astro
- F:\Projetos\aula-trintae3\src\styles\global.css

## Diff summary (one line per file)
- Hero.astro — removed the single block `data-reveal` on the text column; moved reveal to each child (eyebrow, h1, sub, chips, CTAs, note) with `data-reveal-delay` 0/1/2/3/4/5 for a staggered entrance; photo column gains `data-reveal-delay="2"`.
- Learn.astro — card numeral span marked `data-numeral-reveal` (settles in after the card's scale-reveal).
- SectionHeading.astro — index numeral span marked `data-numeral-reveal` (settles in after the heading's up-reveal).
- global.css — added `@keyframes numeral-reveal` (opacity 0→1, translateY 10px→0) + `.js`-gated rules that fire only when the `[data-reveal]` ancestor is `.revealed`, with a `prefers-reduced-motion` override forcing opacity:1/no-animation.

## Motion added + how it degrades
- **Hero staggered load** — uses existing `reveal-up` keyframe (0.5s ease-out) + existing
  `[data-reveal-delay]` tokens (60ms steps). Entrance cascade ~0–300ms after the observer fires.
  Degradation: JS-off → `.js` class never added → existing `<noscript>` style sets
  `[data-reveal]{opacity:1}`; reduced-motion → existing `global.css` block forces opacity:1 +
  animation:none. Above-the-fold so the observer fires on load = it reads as a page-load sequence.
- **Numeral-reveal accent** — new `numeral-reveal` keyframe (0.45s, 0.18s delay) plays only under
  `.js [data-reveal].revealed [data-numeral-reveal]`. Degradation: without `.js` the
  `.js [data-numeral-reveal]{opacity:0}` rule never applies → numeral fully visible (JS-off safe);
  reduced-motion override forces opacity:1/no-animation. If the IntersectionObserver fails, Layout's
  `revealAll()` catch still adds `.revealed` to every `[data-reveal]`, so the numeral never sticks
  at opacity:0. Numerals are `aria-hidden` (SectionHeading) / decorative — no AT impact.

## DEFERRED — colorize
- One focal `text-gradient-gold` moment on a single Hero highlight or FinalCTA headline (pick ONE).
- Bolder Audience ideal-persona highlight (`bg-gold/10`).

## DEFERRED — overdrive
- Hero `landing-mesh-bg` is subtle → atmosphere/grain/texture depth layer (mesh already animates
  `mesh-drift`; overdrive could intensify or add grain — verify FPS).
- Reserve glass-card-bright for 1–2 focal CTAs (glass-fatigue across Learn/NextStep/FinalCTA/form/FAQ).
- Possible delight: Learn numeral shimmer on scroll-in (deferred — would add gold motion; keep budget).
- Pre-existing content-drift literals (FAQ "Perguntas frequentes", Authority "Quem conduz a aula")
  remain — out of scope for visual phases (touches copy/schema).

## Maestro 6-gate self-check
- Safe Split: PASS — no layout change; Hero 7/5 asymmetry intact.
- Glass Trap: PASS — no new glass; no motion stacked on glass surfaces.
- Glow Trap: PASS — no new glow/shimmer; numeral accent is opacity/translate only, no gold halo added.
- Bento Trap: N/A — no bento grid.
- Blue Trap: PASS — no color introduced; Navy/Gold only.
- Line Trap: PASS — no hairline added/removed.

## prefers-reduced-motion verification
1. Global `global.css` reduced-motion block neutralizes ALL `animation/transition-duration` to 0.01ms.
2. Dedicated `.js [data-reveal]` reduced-motion override forces opacity:1/no-animation (covers Hero cascade).
3. New dedicated `[data-numeral-reveal]` reduced-motion override forces opacity:1/no-animation.
4. JS-off: `.js` class absent → all `[data-reveal]` + `[data-numeral-reveal]` render fully visible
   (no opacity:0 stuck state), reinforced by `<noscript>` style in Layout.
All new motion is transform/opacity only — zero layout-property animation (cardinal #8 honored).

## astro check
`bunx astro check` → 29 files, **0 errors, 0 warnings, 1 hint** (pre-existing ts(6385) in FROZEN
src/content.config.ts:25 — not mine, ignored per task).
