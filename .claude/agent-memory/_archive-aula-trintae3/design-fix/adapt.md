---
name: design-fix-adapt
description: /design-fix phase 5/7 adapt — responsive fixes at 360/390/768/1024/1280/short-viewport: fluid hero headline, lg→xl photo-overlap, viewport-gated vignette, FinalCTA mobile padding. Tokens only.
metadata:
  type: project
---

# /design-fix — PHASE 5/7: ADAPT

> Supersedes the prior OTB-era adapt note (those components no longer exist).
> Responsive utilities only; static Astro; no CLS; reduced-motion net intact.

## PHASE COMMITMENT
Rethought the breakpoint behavior (not just scaled): the Hero headline smallest step is now fluid so
it never overflows at 360px; the photo overlap defers from `lg` to `xl` so it can't crowd the
headline at the tight 1024px grid; the atmospheric vignette is intensity-gated by viewport HEIGHT so
short mobile screens (where top+bottom gradients overlap) stay clean while tall screens get the full
depth; FinalCTA padding steps down on the smallest screens. Tokens only, no hex, no CLS (image
width/height untouched), reduced-motion net intact.

## Files touched (absolute)
- F:\Projetos\aula-trintae3\src\styles\global.css
- F:\Projetos\aula-trintae3\src\components\landing\Hero.astro
- F:\Projetos\aula-trintae3\src\components\landing\FinalCTA.astro

## Diff summary (one line per file)
- global.css — `landing-vignette` base mix lightened (55/65%→40/45%, transparent stop earlier); fuller depth (55/65%) moved into a `@media (min-height:800px)` enhancement.
- Hero.astro — h1 smallest step `text-5xl` → `text-[clamp(2.25rem,11vw,3rem)]` (36–48px fluid) + `break-words` + `leading-[1.05]`, then `sm:text-5xl md:text-6xl lg:text-7xl`; photo overlap `lg:-ml-6` → `xl:-ml-6`.
- FinalCTA.astro — card padding `p-10 md:p-14` → `p-8 sm:p-10 md:p-14` (more button room at 360px).

## Responsive fixes per breakpoint
- **360 / 390 (small mobile):** headline now fluid `clamp(2.25rem,11vw,3rem)` → ~36px at 360 (fits;
  was a fixed 48px `text-5xl` that risked horizontal overflow on long PT words) + `break-words` safety
  net. FinalCTA card base padding 40px→32px gives the two stacked CTAs more width. Event chips already
  `flex-wrap justify-center gap-2` → wrap to 2 rows cleanly (verified, no change).
- **768 (tablet):** Learn `sm:grid-cols-2`, Footer `sm:grid-cols-2`, Authority single-column (portrait
  stacks above text) — all transition cleanly; verified, no change.
- **1024 (lg start):** photo overlap `-ml-6` deferred to `xl` so at the tight 1024px 7/5 grid
  (gap-8 + text `lg:pr-8`) the photo no longer pulls into the headline column. Overlap depth returns
  at ≥1280px where there's room.
- **1280 (xl):** photo overlap restored (`xl:-ml-6`) — layered-depth intent preserved on wide screens.
- **Short viewport (height <800px, incl. landscape mobile):** vignette uses the lighter 40/45% mix so
  the overlapping top+bottom gradients don't read muddy behind hero content; ≥800px tall gets the full
  55/65% depth.

## Confirmed OK (no change)
- **MobileCTABar safe-area:** bar has `padding-bottom: env(safe-area-inset-bottom)`; index.astro
  wrapper pads `pb-[calc(5rem+env(safe-area-inset-bottom,0px))] md:pb-0`. Notch-safe.
- **Event chips at 360:** `flex-wrap` + centered + gap-2 → clean 2-row wrap.
- **768 grids:** Learn/Authority/Footer transition cleanly (single→2-col→3-col / 5-col).
- **CLS:** all images keep width/height; only text/padding/positioning utilities changed.

## DEFERRED
- optimize (6/7): confirm Hero-headline LCP (now fluid — verify Playfair preload covers first paint);
  Logo `fetchpriority=high` competing with LCP; ambient-anim 60fps + mobile pause; @astrojs/react
  orphan client.js (deps/config — note only, OUT of scope).
- polish (7/7): the 12 MOTION items (gradient sweep, parallax-lite, card hover richness, FAQ panel
  fade, header condense, MobileCTABar slide-up, etc.).

## Maestro 6-gate self-check
- Safe Split: PASS — Hero asymmetry intact; overlap now xl-only (still asymmetric at lg).
- Glass Trap: PASS — no glass change.
- Glow Trap: PASS — no gold added.
- Bento Trap: N/A.
- Blue Trap: PASS — tokens only; navy-mix vignette, no new hex.
- Line Trap: PASS — no hairline added.

## astro check
`bunx astro check` → 30 files, **0 errors, 0 warnings, 1 hint** (pre-existing ts(6385) in FROZEN
src/content.config.ts:25 — not mine, ignored per task).
