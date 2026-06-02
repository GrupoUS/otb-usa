---
name: design-fix-optimize
description: /design-fix phase 6/7 optimize — verified 0 framework JS ships (~7.5KB inline only), downgraded Logo fetchpriority off the LCP path, pruned dead Aceternity CSS. CLS=0, ambient anim mobile-paused + reduced-motion-halted.
metadata:
  type: project
---

# /design-fix — PHASE 6/7: OPTIMIZE

> Supersedes the prior OTB-era optimize note (those components no longer exist).
> Static Astro; transform/opacity only; FROZEN untouched; @astrojs/react orphan = note only.

## PHASE COMMITMENT
Confirmed the page ships ZERO framework JS (the 190KB React `client.js` is emitted but never
referenced by the HTML — only ~7.5KB of inline scripts load). Took the Logo off the LCP priority path
(`fetchpriority="high"`→`auto`) so it stops competing with the Playfair font that paints the
LCP headline. Verified CLS=0 (all images keep width/height) and that every ambient infinite animation
is GPU-only (transform/opacity), mobile-paused, and reduced-motion-halted. Pruned dead Aceternity CSS
(`spotlight`/`aurora` keyframes + utilities — off-roadmap leftovers). No hex, no FROZEN edits.

## Files touched (absolute)
- F:\Projetos\aula-trintae3\src\components\shared\Logo.astro
- F:\Projetos\aula-trintae3\src\styles\global.css

## Diff summary (one line per file)
- Logo.astro — `fetchpriority="high"` → `fetchpriority="auto"` (stays `loading="eager"` above-fold chrome, but no longer steals priority from the LCP font/asset).
- global.css — removed dead `@keyframes spotlight`/`aurora` + `@utility animate-spotlight`/`animate-aurora` (Aceternity leftovers, referenced by no component, not on the polish motion roadmap).

## Perf findings
- **LCP element**: Hero headline (Playfair text) on mobile (photo hidden `<lg`); Hero photo is the
  desktop candidate (eager + fetchpriority=high). Playfair is `<Font preload>` in Layout → covers the
  text LCP. Logo no longer competes for early bandwidth (was high-priority, now auto).
- **Initial JS budget**: **~7.5KB inline, 0 framework JS** (well under 50KB). index.html has NO
  external `<script src>`, NO modulepreload, NO `_astro/*.js` reference. The 190KB
  `client.6ovyCpOH.js` is the orphan @astrojs/react chunk — emitted to dist but never loaded by the
  page. (Removing it = deps/config, OUT of scope — note only.)
- **CLS**: 0 — all `<img>` carry explicit width/height (Hero 800×1000, Authority 600×750, Logo
  598×96); only text/padding/priority utilities changed this chain. No layout injection.
- **Animation cost**: ambient infinite anims (`mesh-drift`, `gold-pulse` via `.gold-pulse-glow::after`,
  `float`) are all transform/opacity (GPU compositor), `will-change`-scoped, and paused under
  `@media (max-width:768px)` (mobile GPU save). The static `landing-vignette` has no animation. All
  halt under the global `prefers-reduced-motion` block. New `numeral-reveal` is a one-shot
  transform/opacity. INP risk negligible (no heavy JS handlers; scroll listener is rAF-throttled).
- **Dead CSS pruned**: spotlight/aurora removed. Kept `text-shimmer`, `card-hover-lift`,
  `data-glow-card`, `float-gentle`, `scroll-hint-bounce` — the polish phase MOTION worklist plans
  hover-richness / gradient-sweep that may reuse them (not "clearly unused" yet).

## Build / JS-budget evidence
- `bun run build` → 4 pages built in ~1.15s, no errors.
- `dist/_astro/*.js`: single `client.6ovyCpOH.js` = 193,540 B (orphan, **0 refs** in index.html —
  `grep -c "client.6ovyCpOH" dist/index.html` → 0; no `<script src>`, no `_astro/*.js` in HTML).
- Inline JS in index.html: 8 blocks, **7,631 B (~7.5KB)** total (Meta Pixel + reveal observer +
  header menu + form handler + WhatsApp button). index.html = 54.5KB total.
- Budget gate `<50KB initial JS on prerendered pages`: **PASS by wide margin** (7.5KB, framework chunk never loads).

## DEFERRED → polish (7/7)
- The 12 MOTION items (Hero gradient sweep, parallax-lite, card hover richness, FAQ panel fade,
  header condense, MobileCTABar slide-up, spine numeral scale, event-chip pop-in, CTA hover sheen,
  ambient depth, Authority reveal sheen) — kept the utilities they may reuse.
- @astrojs/react orphan client.js removal = deps/config (cardinal: confirm before dep change) — OUT of
  scope; flag for a future deps cleanup, would drop a 190KB dead build artifact (not shipped bytes).

## Maestro 6-gate self-check
- Safe Split: PASS — no layout change.
- Glass Trap: PASS — no glass change.
- Glow Trap: PASS — removed dead glow keyframes; no gold added.
- Bento Trap: N/A.
- Blue Trap: PASS — no hex; tokens only.
- Line Trap: PASS — no hairline added.

## astro check + build
- `bunx astro check` → 30 files, **0 errors, 0 warnings, 1 hint** (pre-existing ts(6385) in FROZEN
  src/content.config.ts:25 — not mine, ignored).
- `bun run build` → success, 4 pages, no errors.
