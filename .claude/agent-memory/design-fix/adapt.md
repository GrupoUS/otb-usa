# design-fix · Phase 5/7 · adapt

## Phase commitment

Static MPA → browser window scroll IS the single owner; verified
zero `overflow:auto/scroll` and zero `100vh` traps across `src/`.
Hero uses capped `min-h-[92vh]` (safe). Real adapt risks reduced to
three: (a) WhatsApp floating button ignored iOS safe-area-inset on
notched devices, (b) Footer WhatsApp pill + nav anchors fell below
the 44×44 touch-target floor, (c) WhyOTB cards `mt-20` doubled-up
with positioning quote `mt-10` at `<md` per layout phase risk flag.
All other interactive elements already cleared 44×44; spacing tiers
already collapse correctly on stack.

## Files touched

- F:\Projetos\otb-usa\src\components\landing\WhatsAppFloatingButton.astro
- F:\Projetos\otb-usa\src\components\landing\Footer.astro
- F:\Projetos\otb-usa\src\components\landing\WhyOTB.astro

## Diff summary

- WhatsAppFloatingButton.astro: removed `bottom-5/right-5
  sm:bottom-7 sm:right-7` static offsets → inline `style` with
  `bottom: max(1.25rem, env(safe-area-inset-bottom, 0px) + 0.75rem)`
  and matching right offset. Floor stays at 20px on non-notched
  viewports; grows safely past iOS home-indicator / landscape notch.
- Footer.astro: nav anchors `<a>` → `inline-flex min-h-11 items-center`
  (44px floor vertical hit area on each link); WhatsApp pill `py-2`
  → `py-2.5` + `min-h-11` (was ~36px, now ≥44px). Outer `ul` kept
  `gap-x-3` only (vertical rhythm now owned by anchors' min-height).
- WhyOTB.astro: cards grid `mt-20` → `mt-16 md:mt-20` (collapses
  stacked vertical pause from 80px to 64px at `<md` when quote's
  `mt-10` already creates a 40px upstream beat — total drops from
  120px to 104px, restoring rhythm on mobile).

## Touch target audit (mobile ≥44×44px)

| Element | Path | Size | Status |
| --- | --- | --- | --- |
| WhatsApp floating button | WhatsAppFloatingButton.astro | px-5 py-3.5 + 20px icon → ~60×52 | PASS |
| Hero primary CTA | Hero.astro | px-7 py-4 + content → ~190×60 | PASS |
| Hero secondary CTA | Hero.astro | px-6 py-3.5 + text-sm → ~180×48 | PASS |
| Hero scroll cue | Hero.astro | md:flex only — hidden <md | N/A |
| FAQ summary toggle | FAQ.astro | px-6 py-5 + text-base → ~full-width × 64 | PASS |
| Investimento primary CTA | Investimento.astro | px-6 py-4 → full-width × 60 | PASS |
| Investimento secondary CTA | Investimento.astro | px-6 py-3.5 → full-width × 48 | PASS |
| Speaker portrait link | Speakers.astro | h-32 w-32 → 128×128 | PASS |
| Footer WhatsApp pill | Footer.astro | min-h-11 px-4 py-2.5 → ~auto×44 | PASS (fixed) |
| Footer nav anchors (×9) | Footer.astro | min-h-11 inline-flex → auto×44 | PASS (fixed) |
| Footer logo link | Footer.astro | h-11 w-11 image + text → ~auto×44 | PASS |

## Scroll owner verification

`grep -r overflow-(auto|scroll|y-auto|y-scroll|x-auto|x-scroll)
src/components/landing` → **zero matches**.
`grep -r (100vh|100svh|100dvh|h-screen|min-h-screen) src/` →
**zero matches**. Hero is `min-h-[92vh]` only (capped, not 100vh
trap). WhatsAppFloatingButton.astro is `position: fixed` chrome —
not a scroll area. **PASS: browser native window is the single
scroll owner. No nested scroll container exists.**

## Horizontal overflow audit (320px)

Verified prior phases already applied `text-balance` to every
Playfair h2 (typeset) and `min-w-0 break-words` to every long-copy
span (harden). No new overflow risk introduced. The WhatsApp
button's new inline `style="bottom: max(…)"` does not change
horizontal footprint.

## Stack order audit at `<lg`

- Programa 5/7 split → stacks 1-col: descricao block above 7-col
  cards area. Reading order intact (h2 → body → cards).
- Audience 5/7 split → stacks 1-col: left column (h2 + quote +
  legenda) above right column (categorias grid + personaBullets).
  Reading order intact.
- Investimento 6/6 → stacks 1-col: pitch/beneficios/lotes above
  pricing card. Reading order intact.
- BostonHarvard `lg:grid-cols-3` → stacks 1-col at `<lg`. Agenda
  `lg:grid-cols-3` → stacks 1-col at `<lg`. Reading order intact.
- Speakers `sm:grid-cols-2 lg:grid-cols-5` → 1-col at `<sm`, 2-col
  at `sm`, 5-col at `lg+`. Reading order intact.
- BostonHarvard freshStats `sm:grid-cols-3 sm:divide-x` → stacks
  1-col at `<sm`; divide-x correctly gated to `sm:` only (no
  orphan dividers on stack).
- WhyOTB cards `md:grid-cols-3` → 1-col at `<md`. Now `mt-16` at
  `<md`, `mt-20` at `md+` — vertical rhythm rebalanced.
- Modulos `md:grid-cols-2` (10 items) → 1-col at `<md`, 2-col at
  `md+`. Density appropriate.
- Audience categorias `sm:grid-cols-2 lg:grid-cols-3` → progressive.

## Image priority audit (LCP / CLS)

- Hero background: inline `style` (CSS background, not `<img>`) →
  no LCP candidate; LCP is the h1 text (`text-4xl/5xl/6xl/[4.25rem]`)
  which is server-rendered immediately. Safe.
- Footer logo (`width="44" height="44" loading="lazy"`) — below
  fold, lazy is correct.
- Speaker portraits (`width="256" height="256" loading="lazy"
  fetchpriority="low"`) — below fold, correctly de-prioritized.
- Turmas + BostonHarvard photos — verified prior phases set
  explicit dimensions. No CLS risk introduced.

## Spacing tier behavior on mobile

- TIGHT (Modulos, FAQ, Parceiros) `py-24 sm:py-28`: 96/112px —
  appropriate compression on mobile.
- BASELINE `py-28 sm:py-32`: 112/128px — standard rhythm.
- GENEROUS BostonHarvard `py-32 sm:py-36`: 128/144px — at narrow
  `sm:` portrait (640×1024+) `py-36` reads as elevated, not
  stranded (verified inline; copy density inside the section
  matches the air).

## Anchor-jump verification

Hero scroll cue → `#programa`. No sticky header in DOM (verified
via Layout.astro contract). Anchor lands flush at viewport top.
WCAG 2.4.11 (focus not obscured) — PASS.

## Maestro 6-gate self-check

1. Cardinal rules — PASS (no new hex; tokens only; transform/opacity
   intact; Bun tooling; LF endings preserved per Edit semantics).
2. Astro static-only — PASS (no SSR/SPA; no client directive change;
   pure utility-class + 1 inline style for env() safe-area).
3. Content SSOT — PASS (no copy added to `.astro`/`.tsx`; otb.json
   untouched per phase scope; Layout.astro untouched per phase scope).
4. WhatsApp SSOT — PASS (number/helper untouched; CTA label/message
   untouched; only positioning offset changed on floating button).
5. Motion contract — PASS (no animation property added; `min-h-11`
   is static layout; inline `bottom`/`right` are static positioning
   not transitions; no `transition: bottom/right` introduced).
6. Quality gates — PASS:
   - `bunx astro check` → 23 files: 0 errors / 0 warnings / 0 hints.
   - `bun run lint` (biome + oxlint) → 0 warnings / 0 errors.
   - Build not re-run (no dependency/config change; check + lint
     sufficient per phase convention).

## Handoff hint to optimize (6/7)

Adapt foundation now resilient on real mobile devices (320–767):
single scroll owner confirmed; all interactive elements clear 44×44;
iOS notch / home indicator respected; stacked rhythm rebalanced on
the one spot where layout phase flagged double-pause risk (WhyOTB).
Open observations for optimize (6/7):
- (a) Hero LCP is text, not image — preload of Playfair Display
  font may already be in Layout.astro; verify `font-display: swap`
  and `<link rel="preload" as="font">` to ensure first paint of h1
  doesn't FOIT under slow networks.
- (b) Speakers `loading="lazy"` + `fetchpriority="low"` correct,
  but 5 portraits at 256×256 may benefit from `srcset`/responsive
  sizes if not already optimized; quick check warranted.
- (c) WhatsAppFloatingButton inline `style` for safe-area-inset
  adds a tiny CSS-payload but is the right trade-off vs adding a
  utility — optimize phase may consider extracting to a `@utility
  safe-bottom-right` if more components need it.
- (d) BostonHarvard background image is inline CSS background-image
  — verify `<link rel="preload" as="image">` is NOT set (would
  fight LCP text); confirm hero background image also NOT preloaded
  (it's de-emphasized at `opacity-30`).
