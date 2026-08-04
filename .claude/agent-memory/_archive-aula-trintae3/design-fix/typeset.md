---
name: design-fix-typeset
description: /design-fix phase 3/7 typeset — reading-measure caps (45–75ch), light-on-dark leading compensation, uppercase-label tracking consistency, text-pretty ragged-end polish. COPY FROZEN, structure/whitespace only.
metadata:
  type: project
---

# /design-fix — PHASE 3/7: TYPESET

> Supersedes the prior OTB-era typeset note (those components/copy no longer exist).
> COPY IS FROZEN — only structure/hierarchy/measure/whitespace/rhythm touched; zero string edits.

## PHASE COMMITMENT
Tightened reading measure into the 45–75ch comfort band on the wide body passages (Authority
paragraphs, Audience intro, SectionHeading subtitles, FAQ answers), applied light-on-dark leading
compensation (typography.md: bump leading on light text over dark), added `text-pretty` for cleaner
ragged endings on prose, and normalized uppercase-label tracking. All via Tailwind scale utilities
(8px grid) and `max-w-prose` (65ch). No hex, no copy rewrites, no layout-property animation,
reduced-motion net untouched.

## Files touched (absolute)
- F:\Projetos\aula-trintae3\src\components\shared\SectionHeading.astro
- F:\Projetos\aula-trintae3\src\components\landing\Audience.astro
- F:\Projetos\aula-trintae3\src\components\landing\Authority.astro
- F:\Projetos\aula-trintae3\src\components\landing\Learn.astro
- F:\Projetos\aula-trintae3\src\components\landing\NextStep.astro
- F:\Projetos\aula-trintae3\src\components\landing\FAQ.astro

## Diff summary (one line per file)
- SectionHeading.astro — subtitle `max-w-2xl`(~80ch) → `max-w-prose`(65ch) + `leading-relaxed` (dark-bg compensation) + `text-pretty`.
- Audience.astro — intro `max-w-2xl` → `max-w-prose` + `text-pretty`; note label `tracking-[0.06em]`→`[0.08em]` + `font-medium` (uppercase-label spacing consistency with Eyebrow family).
- Authority.astro — paragraphs container gained `max-w-prose` (was unbounded in `lg:col-span-3`, ran >75ch) + `text-pretty` on each `<p>`.
- Learn.astro — card body `+text-pretty`.
- NextStep.astro — paragraphs `+text-pretty`.
- FAQ.astro — answer `+max-w-prose +text-pretty`.

## Typographic fixes (typeset / typography / ux-writing)
- **Measure 45–75ch** (typography.md "Readability & Measure"): Authority paragraphs were unbounded
  on a wide desktop column → capped to `max-w-prose` (65ch). Audience intro + SectionHeading
  subtitle + FAQ answer brought from ~80–90ch into band.
- **Light-on-dark leading** (typography.md "light text on dark needs compensation"): SectionHeading
  subtitle gained `leading-relaxed`; body passages already had it. (Letter-spacing/weight axes left
  as-is — body is `text-text-muted` Inter at comfortable size.)
- **Uppercase-label tracking** (typography.md ALL-CAPS tracking 0.05–0.12em): Audience `note`
  metadata label 0.06em→0.08em + medium weight, aligning with the Eyebrow primitive convention.
- **Ragged-end polish**: `text-pretty` (text-wrap: pretty) on all multi-line prose to reduce orphans
  — pairs with the existing `text-balance` on headings (kept on h2/h1).
- **Hierarchy/rhythm**: NextStep h2 (`text-3xl md:text-4xl`) intentionally subordinate to the
  spine's `text-4xl→6xl` (it's a bridge card, not a numbered section) — left as designed. Learn
  numeral→h3 (`mt-4`) > h3→body (`mt-3`) keeps subordinate spacing correct.

## UX-writing note (ux-writing.md reference not present on disk)
- COPY FROZEN this chain — no microcopy edits. Pre-existing in-component literals ("Perguntas
  frequentes", "Quem conduz a aula") were NOT touched (touch copy/schema → out of scope). ux-writing
  reference file absent at `.claude/skills/impeccable/reference/ux-writing.md`; applied the
  structure-only subset of typeset guidance.

## DEFERRED
- layout (4/7): section `py-20` rhythm (tighter mobile vs generous desktop); differentiate NextStep vs FinalCTA centered cards; Authority own-grid vs spine.
- adapt (5/7): verify `max-w-prose` body wraps cleanly at 360/390; soften `landing-vignette` on short mobile; Hero `lg:-ml-6` crowd at 1024px; 360px headline no overflow.
- optimize (6/7): confirm Hero-headline LCP; Logo `fetchpriority=high`; ambient-anim 60fps.
- polish (7/7): the 12 MOTION items (gradient sweep, parallax-lite, card hover richness, FAQ panel fade, header condense, MobileCTABar slide-up, etc.).

## Maestro 6-gate self-check
- Safe Split: PASS — no layout change.
- Glass Trap: PASS — no glass change.
- Glow Trap: PASS — no gold added (tracking/measure only).
- Bento Trap: N/A.
- Blue Trap: PASS — no hex/color; tokens only.
- Line Trap: PASS — no decorative hairline added.

## astro check
`bunx astro check` → 30 files, **0 errors, 0 warnings, 1 hint** (pre-existing ts(6385) in FROZEN
src/content.config.ts:25 — not mine, ignored per task).
