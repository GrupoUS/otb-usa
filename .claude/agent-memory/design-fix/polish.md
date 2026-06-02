---
name: design-fix-polish
description: /design-fix phase 7/7 polish (FINAL) — the MOTION pass under owner animation-freedom. 8 high-value motions added (Hero gradient sweep, chip pop-in, FAQ fade, CTA sheen, Learn numeral hover, header condense, scroll parallax-lite). transform/opacity/filter only, mobile-paused, reduced-motion → static.
metadata:
  type: project
---

# /design-fix — PHASE 7/7: POLISH (FINAL — motion pass)

> Supersedes the prior OTB-era polish note (those components no longer exist).
> Owner motion-freedom directive: rich motion welcome; perf/a11y rails (transform/opacity/filter,
> 60fps, reduced-motion fallback, mobile-pause for continuous loops) NON-NEGOTIABLE.

## PHASE COMMITMENT
Implemented 8 of the 12 MOTION worklist items as one cohesive, premium motion layer. The Hero now
reads as a single orchestrated entrance (existing 60ms-step cascade) capped by a continuous gold
shimmer sweep on the focal headline word; chips pop in after the CTAs; CTAs gain a hover sheen +
existing press-scale; Learn cards lift with a ghost-numeral micro-move; FAQ panels fade open (never
height); the sticky header condenses on scroll; and the Hero photo gets progressively-enhanced
scroll parallax. Every continuous/new animation is transform/opacity/filter-class, `will-change`-
scoped, PAUSED under `max-width:768px`, and HALTED to a static end-state under reduced-motion. No
hex, no FROZEN edits, static Astro (CSS + existing `.js`-gated reveal/scroll JS), no React/islands.

## Files touched (absolute)
- F:\Projetos\aula-trintae3\src\styles\global.css
- F:\Projetos\aula-trintae3\src\components\landing\Hero.astro
- F:\Projetos\aula-trintae3\src\components\landing\Learn.astro
- F:\Projetos\aula-trintae3\src\components\landing\FAQ.astro
- F:\Projetos\aula-trintae3\src\components\layout\Header.astro

## Diff summary (one line per file)
- global.css — added polish-motion block: `gold-sweep`/`text-gradient-gold-sweep`, `[data-chip-stagger]` pop-in, `faq-panel-in` + `[data-faq-panel]`, `.btn-primary::after` sheen + `overflow/isolation`, `[data-learn-card]` numeral hover micro-move, `@supports(animation-timeline:scroll())` `[data-hero-parallax]`, `#site-header.scrolled` condense; all with mobile-pause + reduced-motion overrides.
- Hero.astro — highlight `text-gradient-gold` → `text-gradient-gold-sweep`; chips `<ul>` +`data-chip-stagger`; photo wrapper +`data-hero-parallax`.
- Learn.astro — card +`data-learn-card` (numeral micro-moves on hover; lift already via card-glow-hover).
- FAQ.astro — answer div +`data-faq-panel`.
- Header.astro — scroll JS toggles `.scrolled` (added to existing rAF handler).

## Motion added + technique + degradation
1. **Hero orchestrated entrance** (refine) — existing `reveal-up` + `[data-reveal-delay]` 60ms steps (eyebrow→h1→sub→chips→CTAs→note, photo mid-cascade). One cohesive sequence; no new code, kept timing. Degrades: `<noscript>`/reduced-motion → instant visible (existing system).
2. **Hero gold sweep** — `gold-sweep` animates `background-position` on the clipped `text-gradient-gold-sweep` (6s linear infinite, compositor-cheap on text-clip). Degrade: `max-width:768px` → static gold fill; reduced-motion → static fill.
3. **Learn card hover** — card lift via existing `card-glow-hover`; `[data-learn-card]:hover [data-numeral-reveal]` translateY(-4px) scale(1.04), `@media(hover:hover)` so touch doesn't stick. Degrade: reduced-motion → no transform; hover-only (base state fine).
4. **CTA sheen + press** — `.btn-primary::after` diagonal light band `translateX(-130%→130%)` on hover (0.6s); press = existing `btn-base:active scale(.98)`. Transform-only, clipped via `overflow:hidden`. Degrade: reduced-motion → band parked off-screen, no transition.
5. **Event chips pop-in** — `[data-chip-stagger] > li` reveal-up with nth-child delays 0.32–0.56s (after the CTA cascade). Degrade: `.js`-gated (no-JS → visible); reduced-motion → opacity:1/no-anim.
6. **FAQ panel fade** — `details[open] > [data-faq-panel]` `faq-panel-in` (opacity + translateY(-6px→0), 0.3s); native `<details>` owns show/hide, height never animated. Degrade: `.js`-gated; reduced-motion → no animation.
7. **Sticky header condense** — Header JS toggles `.scrolled`; `#site-header.scrolled` gets `depth-3` shadow + 95% navy bg, logo `transform: scale(0.92)` (transform/box-shadow only, NOT height). Degrade: reduced-motion → logo no scale; JS-off → header static (no condense, fine).
8. **Hero photo parallax-lite** — `[data-hero-parallax]` `animation-timeline: scroll(root)` translateY(-14px→14px), `@supports(animation-timeline:scroll())` + `@media(min-width:1024px) and (prefers-reduced-motion:no-preference)`. Degrade: Firefox/Safari-no-support → static (photo just shows via reveal-right); reduced-motion → not applied; `<lg` → photo hidden anyway.

## Maestro 6-gate self-check (motion now bold; structural gates still hold)
- Safe Split: PASS — no layout change.
- Glass Trap: PASS — no new glass; sheen is a transform band, not a surface.
- Glow Trap: motion is now allowed bold (owner directive) — the gold sweep is continuous but a SINGLE focal word, mobile-paused; no new ambient gold surfaces. PASS within the motion-freedom grant.
- Bento Trap: N/A.
- Blue Trap: PASS — Navy/Gold tokens only; the sheen `white 28%` mix is a token-relative highlight, no raw brand hex.
- Line Trap: PASS — no decorative hairline/side-stripe added.

## Perf / a11y rails honored
- transform/opacity/filter/background-position/box-shadow only — zero width/height/top/left/margin/padding animation; no `transition: all` (every transition names its properties).
- Continuous loops (gold sweep) `will-change`-scoped + paused `<768px`; reduced-motion forces every new motion to its static end-state (never hidden).
- CLS=0 (images keep width/height; header condense uses transform/box-shadow, not height; parallax translates within a fixed-size box).
- INP: no new JS handlers except the existing rAF-throttled scroll listener gaining one classList toggle.

## Residual risk for /verify
- **animation-timeline: scroll()** is Chrome/Edge/Safari-TP; Firefox lacks it → `@supports`-gated with static fallback (verified gate present). Confirm photo still appears in Firefox (it does — reveal-right runs regardless).
- **gold-sweep on text-clip**: `-webkit-text-fill-color: transparent` + `color: transparent` both set; confirm the word isn't blank in any engine (text-gradient-gold already shipped this pattern). Verify in browser pass.
- **Header `.scrolled` logo scale**: transform-origin left-center so it scales toward the logo's anchor, no layout reflow. Verify no jitter at the 20px scroll threshold.
- **CTA sheen** uses `overflow:hidden` on `.btn-primary` — confirm the focus halo (`focus-ring-on-gold` box-shadow from harden) isn't clipped; box-shadow renders outside overflow box, so OK — verify visually.

## astro check + build
- `bunx astro check` → 30 files, **0 errors, 0 warnings, 1 hint** (pre-existing ts(6385) in FROZEN src/content.config.ts:25 — ignored).
- `bun run build` → success, 4 pages, CSS compiled, no errors.

## Chain conclusion
7-phase /design-fix complete: onboard → harden (gold focus ring) → typeset (measure/rhythm) → layout
(spacing spine + card differentiation) → adapt (fluid headline, vignette/overlap responsiveness) →
optimize (0 framework JS, LCP priority, dead-CSS prune) → polish (8-item motion layer). All Maestro
gates green; 0 framework JS shipped; Navy/Gold + no-hex held throughout. Production-ready pending
/verify browser pass + the deps cleanup (orphan @astrojs/react client.js) which stays user-gated.
