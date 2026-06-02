---
name: design-improve-overdrive
description: Impeccable overdrive (phase 5/5, FINAL) of the Aula Gratuita TRINTAE3 landing — static hero vignette atmosphere + glass-card-bright reserved for the single FinalCTA climax. Restraint held; all 6 Maestro gates re-pass.
metadata:
  type: project
---

# design-improve — PHASE 5/5: OVERDRIVE (impeccable, FINAL)

> Read F:\Projetos\aula-trintae3\.claude\skills\impeccable\reference\overdrive.md (installed).
> Polish/atmosphere pass — NOT a redesign. Did not undo bolder's de-flood, animate's Hero
> cascade, or colorize's single Hero-highlight focal moment.

## PHASE COMMITMENT
Two restrained elevations, zero new hex, transform/opacity discipline intact: (1) added a STATIC
atmospheric vignette layer to the Hero so content floats on a framed canvas (deepens edges with a
navy token mix — no animation, no gold, no CLS); (2) fixed glass-fatigue by reserving
`glass-card-bright` for the SINGLE strongest climax (FinalCTA) and demoting the other two bright
surfaces (NextStep bridge card + RegistrationForm success panel) to regular `glass-card` — now the
bright variant actually means "this is the close." Skipped the optional Authority gilded frame on
purpose: it would create a second competing gold focal moment vs the Hero highlight (Glow/gold-budget
risk). Restraint over ambition — the Template Test still passes.

## Files touched (absolute)
- F:\Projetos\aula-trintae3\src\styles\global.css
- F:\Projetos\aula-trintae3\src\components\landing\Hero.astro
- F:\Projetos\aula-trintae3\src\components\landing\NextStep.astro
- F:\Projetos\aula-trintae3\src\components\landing\RegistrationForm.astro

## Diff summary (one line per file)
- global.css — added `@utility landing-vignette` (two navy-mix radial gradients, static, no animation, no hex).
- Hero.astro — added a second aria-hidden `landing-vignette` layer above the mesh, below content (`pointer-events-none absolute inset-0`).
- NextStep.astro — bridge card `glass-card-bright` → `glass-card` (demoted so bright stays rare).
- RegistrationForm.astro — success panel `glass-card-bright` → `glass-card` (demoted).

## What elevated + why restraint held
- **Hero atmosphere:** the existing `landing-mesh-bg` (animated, gold-tinted, subtle) now sits under
  a static navy vignette that darkens top/bottom edges → the headline + photo read as floating on a
  deliberate canvas instead of a flat fill. Depth via tonal contrast (DESIGN §9 level-1), not shadow
  spam. Static = no FPS cost, reduced-motion irrelevant, CLS=0 (absolute inset-0, no layout).
- **Glass meaning restored:** bright glass count 3 → 1. FinalCTA (the closing conversion moment) is
  the only bright surface on the page now; everything else is regular glass-card. The bright variant
  earns its place. Gold budget unaffected (vignette adds no gold; demotion reduces gold-tinted glass).
- **Restraint:** no WebGL/shader/scroll-timeline ambition — wrong register for a premium medical
  authority landing (overdrive.md "particle system on a settings page is embarrassing"). The
  extraordinary here is quiet depth + disciplined hierarchy, true to Dra. Sacha "sofisticação sem
  excesso". One focal moment (Hero gradient) + one climax surface (FinalCTA) = focus, not noise.

## Maestro 6-gate self-check (RE-RUN, full page after all 5 phases)
- Safe Split: **PASS** — Hero is asymmetric 7/5 with an oversized typographic lead (broken in bolder; untouched here).
- Glass Trap: **PASS (resolved)** — glass-card-bright reduced 3→1 (FinalCTA only); regular glass-card used elsewhere. No backdrop-blur over-reliance; bright variant now meaningful.
- Glow Trap: **PASS** — gold ≤10%: one Hero text-gradient highlight + one persona dot glow + primary-CTA glows only. Vignette is navy (no gold). No new halos.
- Bento Trap: **N/A** — no bento grid on this landing.
- Blue Trap: **PASS** — Navy/Gold only; no new hex; no fintech blue/cyan; no purple/indigo.
- Line Trap: **PASS** — no 4–8px safe-boredom radius reliance; no side-stripe accents; vignette is a gradient wash, not a hairline.
- **Template Test: PASS** — asymmetric editorial Hero + numbered spine + single gold focal word + quiet vignette depth + Playfair authority ≠ a generic Vercel/Stripe template.

## Residual risk for final /verify
- **Vignette intensity** (navy 55%/65% mixes): could feel heavy on very short viewports where top
  and bottom vignettes overlap behind the content. Mitigation: gradients start transparent at
  40–45% radius; verify visually at ~700px height in /verify browser pass. Low risk.
- **glass-card vs glass-card-bright contrast** on NextStep/success panel: text was already
  `text-text-primary`/`text-text-muted` on both variants — demotion only changes the surface tint,
  not text contrast. No a11y regression expected.
- No CLS/motion/hex/layout-animation introduced. prefers-reduced-motion: vignette is static (nothing
  to neutralize); Hero cascade + numeral-reveal degradation already verified in animate phase.

## astro check
`bunx astro check` → 29 files, **0 errors, 0 warnings, 1 hint** (pre-existing ts(6385) in FROZEN
src/content.config.ts:25 — not mine, ignored per task).

## Chain summary (audit → overdrive)
- audit: fixed 44px touch targets + bad MobileCTABar landmark.
- bolder: Hero Safe Split → asymmetric 7/5; numbered editorial spine; gold de-flooded from headlines.
- animate: orchestrated Hero staggered page-load + numeral-reveal accent (reuses existing reveal system).
- colorize: ONE focal text-gradient-gold on Hero highlight; Audience ideal-persona lift.
- overdrive: static Hero vignette atmosphere; glass-card-bright reserved for FinalCTA alone.
All phases: 0 astro-check errors, no new hex, no layout-property animation, Navy/Gold canon preserved.
