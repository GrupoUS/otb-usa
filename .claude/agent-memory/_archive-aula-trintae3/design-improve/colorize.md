---
name: design-improve-colorize
description: Impeccable colorize (phase 4/5) of the Aula Gratuita TRINTAE3 landing — ONE focal text-gradient-gold moment on the Hero highlight + a structural/color lift on the Audience ideal-persona item. Existing tokens only, no new hex.
metadata:
  type: project
---

# design-improve — PHASE 4/5: COLORIZE (impeccable)

> Supersedes the prior OTB-era colorize record (those components no longer exist post-rebuild).
> Read F:\Projetos\aula-trintae3\.claude\skills\impeccable\reference\colorize.md (installed).

## PHASE COMMITMENT
Restrained strategy (gpus Ouro raro, gold ≤10% surface) — colorize is NOT re-goldenizing what
bolder de-flooded. Exactly TWO purposeful touches: (1) ONE focal gold-gradient moment on the single
highest-impact spot — the Hero headline highlight (above-fold, 7xl, first thing seen) — reusing the
existing `text-gradient-gold` utility; (2) the Audience `highlight:true` ideal-persona item lifted
to read clearly as "this is you" via stronger border + elevation + accent dot, color carrying
meaning (wayfinding), not decoration. Existing tokens/utilities ONLY, zero new hex, zero new tokens,
no motion changes (phase 3 owns motion), no layout-property animation, no CLS.

## Files touched (absolute)
- F:\Projetos\aula-trintae3\src\components\landing\Hero.astro
- F:\Projetos\aula-trintae3\src\components\landing\Audience.astro

## Diff summary (one line per file)
- Hero.astro — headline highlight span `text-gold` → `text-gradient-gold` (the one focal gold-gradient moment).
- Audience.astro — `highlight:true` item: border `gold/40`→`gold/50` + `depth-2` elevation; accent dot enlarged `h-2 w-2`→`h-2.5 w-2.5` with `gold-glow` (regular items unchanged).

## Focal color decision + contrast check
- **Chosen spot: Hero highlight (NOT FinalCTA).** Highest impact: above-the-fold, largest type on
  the page (lg:text-7xl), the literal headline focal word, seen before any scroll. FinalCTA is
  below-fold and a full headline — gradienting it would re-flood gold and undo the bolder de-flood.
  One signature gold moment, exactly as the brief specified (pick one, not both).
- **Utility reused:** `text-gradient-gold` (global.css:554) — clips a static
  `linear-gradient(135deg, var(--color-gold), var(--color-gold-light))` onto the text. Static (not
  the animated `text-shimmer`), so no motion introduced and no reduced-motion concern.
- **Contrast:** gradient spans gold #d4af37 (≈8:1 on navy) → gold-light #e8c96a (≈10:1 on navy).
  Both endpoints exceed the WCAG large-text minimum (≥3:1) with large margin; the highlight is
  display-scale (5xl–7xl), so large-text rules apply. PASS. (`-webkit-text-fill-color: transparent`
  is the clip mechanism, not a contrast concern — the painted color IS the gradient.)
- **Audience persona lift:** color is reinforced by non-color signals (border weight, depth-2
  elevation, larger dot) — not color-alone (a11y). The `text-gold-light` label was already present
  and unchanged (≈9:1 on the gold/10 tint over navy). No regression.

## Missing token?
NONE. Both touches used pre-existing utilities/tokens (`text-gradient-gold`, `depth-2`, `gold-glow`,
`border-gold/50`, `bg-gold/10`, `bg-gold`). No color role was missing; nothing invented. (Per
constraint: had a role been missing I would have STOPPED and reported rather than add a hex/token.)

## DEFERRED — overdrive
- Hero `landing-mesh-bg` is subtle → atmosphere/grain/texture depth layer (mesh already animates
  `mesh-drift`; overdrive could intensify carefully — verify FPS, keep gold within budget).
- Glass fatigue: glass-card used in Learn/NextStep/FinalCTA/form/FAQ → reserve glass-card-bright for
  1–2 focal CTAs.
- Optional: a single richer surface tint or gilded-frame treatment on the Authority portrait (only
  if it stays within the gold budget — colorize deliberately left it alone to avoid a second gold
  focal moment competing with the Hero).
- Possible Learn-numeral shimmer (deferred from animate) — overdrive call; would add gold motion.
- Pre-existing content-drift literals (FAQ "Perguntas frequentes", Authority "Quem conduz a aula")
  remain — out of scope for all visual phases (touches copy/schema).

## Maestro 6-gate self-check
- Safe Split: PASS — no layout change.
- Glass Trap: PASS — no new glass; over-use catalogued for overdrive.
- Glow Trap: PASS — only addition is a single small `gold-glow` on the persona dot (one item per
  grid); the Hero gradient is text-clip, not a halo. Gold surface stays ≤10%.
- Bento Trap: N/A — no bento grid.
- Blue Trap: PASS — Navy/Gold only; no new hex; no fintech blue, no purple/indigo.
- Line Trap: PASS — no side-stripe borders (persona uses a full hairline border + tint + dot, per
  colorize.md ban on >1px left/right accent stripes); no decorative hairline added.

## astro check
`bunx astro check` → 29 files, **0 errors, 0 warnings, 1 hint** (pre-existing ts(6385) in FROZEN
src/content.config.ts:25 — not mine, ignored per task).
