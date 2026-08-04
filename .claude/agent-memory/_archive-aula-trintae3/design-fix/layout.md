---
name: design-fix-layout
description: /design-fix phase 4/7 layout — unified responsive section-spacing spine (py-16 md:py-24 lg:py-28, 8px grid) + NextStep vs FinalCTA card differentiation. Authority asymmetric grid + Learn col logic confirmed intentional.
metadata:
  type: project
---

# /design-fix — PHASE 4/7: LAYOUT

> Supersedes the prior OTB-era layout note (those components no longer exist).
> Structure/spacing only; no layout-property ANIMATION (static layout changes are fine).

## PHASE COMMITMENT
Replaced the monotone uniform `py-20` (80px, identical on every breakpoint, every section) with a
single responsive spacing spine — `py-16 md:py-24 lg:py-28` (64 / 96 / 112px, all 8px-grid) — so the
page compresses on mobile and breathes generously on desktop with one consistent rhythm. Differentiated
the two adjacent centered glass cards (NextStep vs FinalCTA) by size + emphasis so they read as
distinct beats, not duplicates. Confirmed Authority's asymmetric 2/3 grid and Learn's 4→2col logic as
intentional (no change). Tokens only, no hex, no CLS (image width/height untouched), reduced-motion net
intact.

## Files touched (absolute)
- F:\Projetos\aula-trintae3\src\components\landing\Audience.astro
- F:\Projetos\aula-trintae3\src\components\landing\Learn.astro
- F:\Projetos\aula-trintae3\src\components\landing\Authority.astro
- F:\Projetos\aula-trintae3\src\components\landing\RegistrationForm.astro
- F:\Projetos\aula-trintae3\src\components\landing\FAQ.astro
- F:\Projetos\aula-trintae3\src\components\landing\NextStep.astro
- F:\Projetos\aula-trintae3\src\components\landing\FinalCTA.astro

## Diff summary (one line per file)
- Audience / Learn / Authority / RegistrationForm / FAQ — section padding `py-20` → `py-16 md:py-24 lg:py-28` (responsive spine; other classes incl. scroll-mt-24 / bg / id preserved).
- NextStep — `py-20`→spine; card `max-w-3xl`→`max-w-2xl`, `p-8 md:p-12`→`p-8 md:p-10` (quieter, smaller bridge card).
- FinalCTA — `py-20`→spine; card `p-8 md:p-12`→`p-10 md:p-14` (larger, climax; stays `max-w-3xl` + glass-card-bright).

## Layout fixes
- **Vertical-rhythm spine** (layout.md "tight grouping / generous separation", DESIGN ≥96px desktop /
  ≥64px mobile): all 7 sections now share `py-16 md:py-24 lg:py-28`. Mobile 64px keeps the funnel
  compact (faster scroll to form); desktop 112px gives premium air. Uniform = an intentional beat, not
  monotony (the variety now lives between mobile↔desktop, and in card sizing).
- **NextStep vs FinalCTA differentiation** (layout.md "vary card sizes / break repetition"): they were
  near-identical centered cards (both `max-w-3xl p-8 md:p-12`). Now NextStep is the smaller/quieter
  bridge (`max-w-2xl`, `p-8 md:p-10`, plain `glass-card`) and FinalCTA is the larger/brighter climax
  (`max-w-3xl`, `p-10 md:p-14`, `glass-card-bright`). Size + padding + surface tier all signal the
  hierarchy — they no longer read as duplicates with the form between them.
- **Hero** kept its bespoke `pt-32 pb-20 lg:pt-40 lg:pb-28` (it owns the top of the page; the spine is
  for in-flow sections).

## Confirmed intentional (no change)
- **Authority 5-col grid** (`lg:grid-cols-5`, portrait col-span-2 / text col-span-3): an asymmetric
  2/3 split using an Eyebrow (not the numbered spine `index`). Per layout.md, asymmetry reads as
  designed; deliberately distinct from the 01–04 spine sections. Correct as-is.
- **Learn grid logic** (`length===4 ? lg:grid-cols-2 : lg:grid-cols-3`): 4 topics in a 3-col grid
  would orphan one; 2×2 is the right call. Other counts get 3-col. Sound.
- **Container widths / gutters**: Audience `max-w-5xl` (3-col grid), Learn/Authority `max-w-7xl`,
  FAQ `max-w-3xl`, form `max-w-2xl` — content-appropriate; gutters uniform `px-4 sm:px-6 lg:px-8`.

## DEFERRED
- adapt (5/7): verify spine at 360/390/768/1280 + short viewport; confirm `lg:py-28` doesn't strand
  short content; FinalCTA `md:p-14` not cramped on 360; soften `landing-vignette` on short mobile;
  Hero `lg:-ml-6` crowd at 1024px.
- optimize (6/7): Hero-headline LCP; Logo `fetchpriority=high`; ambient-anim 60fps.
- polish (7/7): the 12 MOTION items (gradient sweep, parallax-lite, card hover richness, FAQ panel
  fade, header condense, MobileCTABar slide-up, etc.).

## Maestro 6-gate self-check
- Safe Split: PASS — Hero asymmetry intact; Authority asymmetric split confirmed intentional.
- Glass Trap: PASS — glass-card-bright still FinalCTA-only; NextStep stays plain glass-card.
- Glow Trap: PASS — no gold added (spacing/size only).
- Bento Trap: N/A.
- Blue Trap: PASS — tokens only, no hex.
- Line Trap: PASS — no decorative hairline/side-stripe added.

## astro check
`bunx astro check` → 30 files, **0 errors, 0 warnings, 1 hint** (pre-existing ts(6385) in FROZEN
src/content.config.ts:25 — not mine, ignored per task).
