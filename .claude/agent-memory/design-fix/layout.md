# design-fix · Phase 4/7 · layout

## Phase commitment

Spatial rhythm was monotone — 9 of 11 sections shared `py-28 sm:py-32`,
flattening hierarchy. Introduced 3 vertical-rhythm tiers anchored to
content type: TIGHT (24/28) for modular/closing content, BASELINE
(28/32) for premium narrative, GENEROUS (32/36) reserved for the
centerpiece (BostonHarvard). Inside BostonHarvard, internal beat
separators (cards → freshStats → agenda) widened so each block reads
as its own intentional movement. Containers, asymmetric splits, card
padding parity, gap progression, and grid topologies kept INTACT —
they were already disciplined per the typeset + harden audits.

## Files touched

- F:\Projetos\otb-usa\src\components\landing\BostonHarvard.astro
- F:\Projetos\otb-usa\src\components\landing\Modulos.astro
- F:\Projetos\otb-usa\src\components\landing\FAQ.astro
- F:\Projetos\otb-usa\src\components\landing\WhyOTB.astro

## Diff summary

- BostonHarvard.astro: section padding `py-28 sm:py-32` → `py-32 sm:py-36` (centerpiece elevation); freshStats wrapper `mt-16` → `mt-20`; agenda wrapper `mt-20` → `mt-24` (internal beats separated).
- Modulos.astro: section padding `py-28 sm:py-32` → `py-24 sm:py-28` (modular content, tighter cadence — mirrors Parceiros pattern).
- FAQ.astro: section padding `py-28 sm:py-32` → `py-24 sm:py-28` (closing section before footer; releases tension).
- WhyOTB.astro: cards grid wrapper `mt-16` → `mt-20` (separates editorial positioning-quote block from utility 3-card row — they are different content beats).

## Section rhythm map (final)

| Section        | Padding         | Tier       | Rationale                                       |
| -------------- | --------------- | ---------- | ----------------------------------------------- |
| Hero           | 92vh isolate    | full-bleed | LCP / first impression                          |
| WhyOTB         | py-28 sm:py-32  | BASELINE   | Premium positioning + cards                     |
| TargetAudience | py-28 sm:py-32  | BASELINE   | Audience qualification                          |
| Programa       | py-28 sm:py-32  | BASELINE   | Program overview, asymmetric 5/7                |
| Turmas         | py-28 sm:py-32  | BASELINE   | Historical proof (photos)                       |
| Modulos        | py-24 sm:py-28  | TIGHT      | Modular online trail — denser cadence           |
| BostonHarvard  | py-32 sm:py-36  | GENEROUS   | Centerpiece — international immersion           |
| Speakers       | py-28 sm:py-32  | BASELINE   | Expert grid                                     |
| Investimento   | py-28 sm:py-32  | BASELINE   | Conversion / pricing                            |
| Parceiros      | py-24 sm:py-28  | TIGHT      | Operational context (already varied in repo)    |
| FAQ            | py-24 sm:py-28  | TIGHT      | Closing section before footer                   |

3 rhythm tiers across 11 sections. Hierarchy now signaled by space,
not borders or background shifts.

## Audit findings (no action required)

- **Container widths**: Hero/WhyOTB/Audience/Programa/Turmas/Modulos/BostonHarvard/Speakers use `max-w-7xl`; Investimento/Parceiros narrow to `max-w-6xl`; FAQ narrows to `max-w-4xl`; Modulos inner cards `max-w-5xl`. Variation is intentional and consistent with content function — no action.
- **Asymmetric splits**: Audience 5/7, Programa 5/7, Investimento 6/6 — 6/6 on Investimento is justified (CTA panel needs equal weight to drive conversion).
- **Card padding**: Premium glass-cards (WhyOTB, Programa, BostonHarvard, Parceiros) use `p-7`. Denser grids (Audience categorias, Modulos, lote rows) use `p-5/px-4 py-3`. Parity is disciplined — no action.
- **Card grid gaps**: WhyOTB `gap-6 md:gap-7`, Programa `gap-5`, BostonHarvard `gap-6`, Audience `gap-4`, Modulos `gap-4 md:gap-5`, Speakers `gap-8` (portraits — needs more air), Parceiros `gap-6`. All on the 4/5/6/7/8 progression — no monotone 4-everywhere; no action.
- **Vertical rhythm between heading elements**: eyebrow → h2 `mt-5` (consistent across WhyOTB, Audience, Turmas, Modulos, BostonHarvard, Speakers, Investimento, Parceiros, FAQ). Programa uses `mt-6` (intentional — preceded by oversized 01 numeral). h2 → body `mt-6` standard (WhyOTB positioning quote uses `mt-10` — editorial pause). Disciplined.
- **Container alignment**: all eyebrow + h2 + body in the same container parent — left edges align by inheritance. No drift detected.
- **SectionDivider pattern**: index.astro alternates `line` (default) and `variant="dot"` at 3 points (Turmas before, BostonHarvard before, Investimento before). Pattern signals: dot = transition to a beat shift (proof / centerpiece / commerce). Intentional cluster-boundary marker — no action.
- **Modulos grid topology**: 10 items in `md:grid-cols-2` inside `max-w-5xl` → 2-col 5-row at md+. Single column on mobile. Density is appropriate for short titles + optional subtitles (vs forcing 3-col which would shrink cards). No action.
- **Hero glass card column 8/4**: at `lg:` the 4-col card holds 3 metric rows + 1 headline → comfortable. No action.

## Maestro 6-gate self-check

1. Cardinal rules — PASS (no new hex; tokens only; transform/opacity untouched; Bun tooling; LF endings preserved per Edit semantics).
2. Astro static-only — PASS (no SSR/SPA; no client directive change; pure utility-class diffs).
3. Content SSOT — PASS (no copy added to `.astro`/`.tsx`; otb.json untouched per phase scope).
4. WhatsApp SSOT — PASS (untouched).
5. Motion contract — PASS (no animation property added; padding/margin changes are static layout, not transitions; no `transition: padding/margin` introduced).
6. Quality gates — PASS:
   - `bunx astro check` → 23 files: 0 errors / 0 warnings / 0 hints.
   - `bun run lint` (biome + oxlint) → 0 warnings / 0 errors.
   - Build not re-run (no dependency/config change; check + lint sufficient per phase convention).

## Handoff hint to adapt (5/7)

Vertical rhythm now has 3 intentional tiers. Adapt phase should verify
on real viewport breakpoints:
- (a) BostonHarvard at `py-36` doesn't create awkward whitespace on
  short viewports (`sm:` portrait) — confirm the centerpiece still
  reads as "elevated" not "stranded".
- (b) Modulos `mt-16` heading-to-grid gap inside the new tighter
  `py-24` shell still breathes — visually verify the eyebrow→h2→body
  → grid sequence keeps pace.
- (c) WhyOTB cards `mt-20` after `positioningQuote` — verify the
  serif quote's `mt-10` parent + cards `mt-20` doesn't create double
  pause at `< md` where cards stack vertically.
- (d) BostonHarvard agenda `mt-24` — at `lg:` the 3-col agenda
  separates well from freshStats; at `< lg` confirm the stacked
  agenda cards still feel attached to the section (not orphaned).
Open observation: index.astro `SectionDivider class="my-0"` means
section padding fully owns vertical spacing — adapt phase may want
to verify divider's intrinsic height (line vs dot variants) doesn't
break the 8px-grid math at the tier transitions.
