---
name: design-improve-animate
description: Impeccable animate (phase 3/5) of OTB USA landing — kills hero motion saturation, adds restrained FAQ-reveal fade, audits stagger budget on bolder/Trilho A blocks.
metadata:
  type: project
---

# DESIGN-IMPROVE — PHASE 3/5 ANIMATE

## Phase commitment

Motion REMOVED: hero `float-gentle` on the bright-glass card — eliminates the Glow-Trap stacking flagged by audit #10 (above-the-fold had `float-gentle` + `gold-pulse-glow` badges + `text-shimmer` headline + reveal-scale all running simultaneously). Motion ADDED: a subtle `opacity + translateY(-4px → 0)` fade on FAQ `<details>` open via `.faq-item[open] > div` keyframe (audit #15). Motion LEFT ALONE on all Trilho A / bolder sections (WhyOTB positioningQuote, TargetAudience persona, Programa narrativa, BostonHarvard freshStats) — their stagger delays already cap at the existing 1–6 range (max 360ms cumulative, well under the 600/800ms budget), and they use the global `data-reveal` system which inherits the existing reduced-motion override. Did NOT animate the new "01" numeral on Programa or persona-bullet serial numerals — they remain typographic anchors per phase constraint. Did NOT add glow/shimmer on the bolder-demoted freshStats numerals — preserves the gold-budget reduction bolder achieved.

## Files touched

- F:\Projetos\otb-usa\src\components\landing\Hero.astro
- F:\Projetos\otb-usa\src\components\landing\FAQ.astro

## Diff summary

- `Hero.astro` — removed `float-gentle` utility class from the bright-glass hero card (line 99). The card keeps `glass-card-bright` (its bolder-era visual weight) and the entrance reveal-scale via `data-reveal="scale" data-reveal-delay="2"`. One infinite GPU animation killed; entrance choreography intact. Reasoning for choosing motion-removal over glass-removal: bolder phase intentionally promoted this card to bright-glass tier as a price-card analog; removing the surface would undermine that hierarchy. Float adds nothing after the reveal lands.
- `FAQ.astro` — added a `@keyframes faq-answer-in` (opacity 0→1, translateY -4px→0, 240ms ease-out-quint), scoped to `.faq-item[open] > div`. Wrapped in a `prefers-reduced-motion: reduce` override that disables the animation and clears `will-change`. The keyframe touches ONLY `opacity` + `transform` — never height/layout. Native `<details>` still owns disclosure; the inner panel just feels less abrupt.

## Stagger audit on new sections (no changes needed)

| Section | Element | Delay tokens | Cumulative cap | Verdict |
|---|---|---|---|---|
| WhyOTB | positioningQuote | `delay-1` (60ms) | 60ms | PASS |
| WhyOTB | cards (×3) | `delay-2/3/4` | 240ms | PASS |
| TargetAudience | persona block | `delay-2` | 120ms | PASS |
| TargetAudience | persona bullets (×N) | `(idx % 4) + 3` → 3/4/5/6 | 360ms | PASS |
| Programa | narrativa | `delay-1` | 60ms | PASS |
| Programa | cards (×3) | `delay-2/3/4` | 240ms | PASS |
| BostonHarvard | freshStats (×3) | `delay-2/3/4` | 240ms | PASS |
| BostonHarvard | agenda (×3) | `delay-2/3/4` | 240ms | PASS |
| FAQ | items (×N) | `min(idx+1, 6)` capped at 6 | 360ms | PASS |

Max cumulative observed: 360ms. Cap (800ms) respected with generous margin.

## Deferred items by owning phase

- COLORIZE: #1 (Layout meta theme-color hex), #2 (inline color-mix consolidation into named utilities).
- OVERDRIVE: #6 overdrive side (further gold demotion), #8 (gold surface audit & ~30% demotion), #11 (dead utilities `.gold-glow`, `.animate-spotlight`, `.animate-aurora` — note: `float-gentle` is still defined and used elsewhere; do NOT delete the utility, only its hero usage was removed), #12 (Speakers conic-ring redesign).

## Maestro 6-gate self-check

| Gate | Verdict | Notes |
|---|---|---|
| Safe Split | PASS | No layout changes. Hero 8/4 asymmetry intact. |
| Glass Trap | PASS (improved) | Hero card no longer stacks 4 simultaneous effects on glass. Net gold-glass motion-on-glass surfaces reduced. |
| Glow Trap | PASS (improved) | Removed one infinite-glow combination (float-gentle next to gold-pulse-glow badges + text-shimmer headline). Audit #10 root cause directly addressed. |
| Bento Trap | PASS | No grid changes. |
| Blue Trap | PASS | No color introduced. |
| Line Trap | PASS | No hairline added or removed. |

Overall Maestro: PASS. Audit warnings (Glass + Glow) further reduced from bolder baseline.

## prefers-reduced-motion verification

Explicit confirmation:

1. Global block at `global.css:99-112` already overrides `animation-duration` and `transition-duration` to `0.01ms` for ALL elements (`*, *::before, *::after`). This automatically covers the new `faq-answer-in` keyframe.
2. Defensive belt-and-suspenders override added inline in `FAQ.astro` `<style>`: `@media (prefers-reduced-motion: reduce) { .faq-item[open] > div { animation: none; will-change: auto; } }`. Two layers of safety.
3. Reveal data-attribute system has its own dedicated reduced-motion override at `global.css:250-258`.
4. Hero edit was purely subtractive (removed infinite animation) — strictly improves the reduced-motion experience.

All new motion respects the cardinal #8 transform/opacity-only rule. Zero layout-property animation introduced.

## Notes for downstream phases

- `float-gentle` utility still exists in `global.css` (used elsewhere if needed). If OVERDRIVE wants to nuke it as dead code, audit usages first with `grep -rn "float-gentle" src/`.
- FAQ animation duration (240ms) sits in the product-tier (150–300ms) per impeccable/animate.md guidance — appropriate for a feedback/disclosure motion. Easing `cubic-bezier(0.16, 1, 0.3, 1)` matches the rest of the reveal system for consistency.
- COLORIZE phase should verify the inline `color-mix()` reduction does not regress the global `prefers-reduced-motion` block.
