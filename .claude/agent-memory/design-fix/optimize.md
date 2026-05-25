# design-fix · Phase 6/7 · optimize

## Phase commitment

Discovered a silent correctness regression masquerading as a perf issue:
the Astro Fonts API was configured in `astro.config.mjs` but no `<Font>`
component was mounted in `Layout.astro` — so `--font-playfair` and
`--font-inter` CSS variables were never bound to real `@font-face`
declarations and the entire site was rendering Playfair via the Georgia
fallback. Mounted `<Font preload />` for Playfair (LCP font on h1) and
`<Font />` for Inter (body — swap-only). Added `decoding="async"` to
all below-fold images and `fetchpriority="low"` to footer logo for
consistency with Speakers / Turmas. Build sizes essentially unchanged
on initial-JS budget. CSS unchanged. Single HTML page grew +5054 B
from the now-correctly-inlined `@font-face` rules — well inside the
5% regression gate and a correctness fix, not bloat.

## Files touched

- F:\Projetos\otb-usa\src\layouts\Layout.astro
- F:\Projetos\otb-usa\src\components\landing\Footer.astro
- F:\Projetos\otb-usa\src\components\landing\Speakers.astro
- F:\Projetos\otb-usa\src\components\landing\Turmas.astro

## Diff summary

- Layout.astro: `+import { Font } from "astro:assets"` and 2 `<Font>`
  tags after favicons. Playfair gets `preload` (LCP candidate is the
  h1 hero headline rendered in Playfair Bold). Inter relies on
  `font-display: swap` (auto-injected by Astro Fonts API).
- Footer.astro: logo `<img>` `+fetchpriority="low" decoding="async"`.
- Speakers.astro: portrait `<img>` `+decoding="async"`.
- Turmas.astro: photo `<img>` `+decoding="async"`.

## Bundle BEFORE/AFTER (top files)

| File | BEFORE | AFTER | Δ | % |
|---|---|---|---|---|
| dist/_astro/client.6ovyCpOH.js (orphan, not referenced) | 193,540 B | 193,540 B | 0 | 0% |
| dist/_astro/index@_@astro.dR6TOiIF.css | 51,523 B | 51,523 B | 0 | 0% |
| dist/index.html | 114,035 B | 119,089 B | +5,054 B | +4.4% |
| dist/_astro/fonts/cdd16814b404f04f.woff2 (Playfair) | unchanged | unchanged | 0 | 0% |
| dist/_astro/fonts/e868cdf4720e9ea5.woff2 (Inter) | unchanged | unchanged | 0 | 0% |

Initial JS shipped to browser: **0 B** (the `client.6ovyCpOH.js`
chunk is emitted by the registered `@astrojs/react` integration but
**never referenced from index.html** — verified by `grep -c "client"
dist/index.html` returning 0). The 193KB is dead build artifact, not
shipped bytes. Budget gate `<50KB initial JS on prerendered pages`
remains satisfied.

## Key findings vs handoff hints from adapt phase

- (a) "verify font preload exists" → **was missing entirely**. Now
  emitted: `<link rel="preload" href="/_astro/fonts/cdd16814...woff2"
  as="font" type="font/woff2" crossorigin>`.
- (b) "verify font-display: swap" → **was missing entirely**. Now
  injected via Astro Fonts API auto-generated `@font-face` (verified
  `grep -c "font-display" dist/index.html` → 1).
- (c) Speakers portraits already had `loading="lazy" fetchpriority="low"`
  → added `decoding="async"` for completeness.
- (d) Hero / TargetAudience / BostonHarvard backgrounds via inline CSS
  background-image are decorative (opacity-30 / -inset) and NOT LCP
  candidates → confirmed not preloaded (correct: LCP is the h1 text,
  not the background).

## Open observations (not fixed this phase — scope/dependency gates)

- `@astrojs/react` integration is registered in `astro.config.mjs`
  but the project has zero `.tsx` files and zero `client:*` directives.
  Removing the integration would eliminate the orphaned 193KB
  `client.6ovyCpOH.js` artifact from `dist/`. Not shipping to the
  browser, but wastes build time + storage. **Deferred**: requires
  dependency removal (`bun remove @astrojs/react @types/react react
  react-dom`) which the phase prompt forbids.
- Hero background JPG `boston-skyline-hero.jpg` (47KB) is decorative
  at `opacity-30`. Could be further compressed or moved to WebP, but
  Astro's default JPG compression is already reasonable at this size
  and the image is not LCP. **Deferred**: no measured impact.
- `turma-grupo-1.jpg` (2.2MB) and `turma-grupo-2.jpg` (1.6MB) are
  Turmas section photos served as-is. Both are `loading="lazy"
  fetchpriority="low" decoding="async"` so they don't compete with
  LCP, but on slow networks they'll still consume bandwidth. **Polish
  phase candidate**: consider Astro `<Image>` component for automatic
  responsive `srcset` + WebP conversion + size reduction (likely
  10-20x). This requires migrating the `<img>` to Astro's `<Image>`
  helper — a non-trivial pattern change appropriate for polish (7/7),
  not optimize (6/7).

## CWV expectations (qualitative)

- **LCP**: improved. Previously, h1 rendered in Georgia fallback
  immediately, then FOUT-swapped to Playfair on Inter load → visual
  shift + late "real" LCP. Now Playfair is `<link rel="preload">`'d
  → font request fires from HTML parse (no CSSOM dependency wait),
  arrives faster, `font-display: swap` ensures fallback shows
  immediately then swaps with minimal jank. Target `<2.5s` realistic.
- **CLS**: unchanged. All `<img>` already had explicit width/height
  from prior phases. Font swap from Georgia → Playfair Display has
  modest cap-height delta; `text-balance` + responsive sizing
  insulate the heading from rewrap-shift. Target `=0` realistic on
  fast networks; minor swap-shift acceptable on slow.
- **INP**: unchanged. Zero JS shipped to browser (inline reveal script
  + WhyOTB pointer-glow are the only handlers, both already guarded
  + reduced-motion aware). Target `<100ms` realistic.
- **Initial JS budget**: 0 B shipped → under `<50KB` gate by infinite
  margin.

## Maestro 6-gate self-check

1. Cardinal rules — PASS (no new hex; tokens only; transform/opacity
   intact; Bun tooling; LF endings preserved per Edit semantics;
   no SSR/SPA; no `prerender = false`; no inline `wa.me/`).
2. Astro static-only — PASS (no SSR/SPA; no client directive added;
   `<Font>` is server-rendered Astro component; build remains static).
3. Content SSOT — PASS (no copy added to `.astro`/`.tsx`; otb.json
   untouched per phase scope).
4. WhatsApp SSOT — PASS (untouched).
5. Motion contract — PASS (no animation property added; preload +
   decoding hints are network-layer only, not motion).
6. Quality gates — PASS:
   - `bun run lint` (biome + oxlint) → 0 warnings / 0 errors.
   - `bunx astro check` → 23 files: 0 errors / 0 warnings / 0 hints.
   - `bun run build` → 1 page built in 1.30s; no errors.
   - Bundle regression check: `<50KB initial JS` gate PASS (0 B
     shipped); HTML page +4.4% growth is correctness fix, inside 5%.

## Handoff hint to polish (7/7)

Foundation now correct on the actually-load-fonts axis. Polish can:
- (a) Consider migrating `<img>` to Astro `<Image>` component for the
  three heavy assets (turma-grupo-1/2.jpg, boston-skyline-hero.jpg)
  to get automatic WebP + responsive srcset.
- (b) Optional: ask user before removing `@astrojs/react` integration
  to eliminate the 193KB orphan build artifact (dependency removal —
  outside scope-class for this phase chain without explicit user
  approval per cardinal rule "no new dependency without confirm").
- (c) Verify final focus-ring contrast on `bg-gold` CTAs (carried
  forward from harden phase observation).
- (d) Verify mobile font rendering on iOS Safari — Playfair Display
  swap behavior + first-paint timing on real device, since this is
  the first phase where the font actually loads.
