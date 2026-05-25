# design-fix · Phase 1/7 · onboard

## Phase commitment

Static marketing landing — onboarding ceremony (tooltips/tours/dismiss
nudges) is anti-pattern. Audited four candidates; only the scroll-hint
cue passes the "adds commercial signal without nagging" bar.

- ADDED: hero scroll-hint cue ("Role para descobrir" + bouncing chevron)
  on `md:` and up — invites scroll past 92vh hero without blocking.
- N/A: first-visit lote nudge (already lives in Investimento; would nag).
- N/A: progress indicator (overkill for single-page landing).
- N/A: WhatsApp tooltip — already labelled (`aria-label`), gold pill
  with icon + text on `sm:` and up; mobile icon-only adequate via SR.

## Files touched

- F:\Projetos\otb-usa\src\styles\global.css
- F:\Projetos\otb-usa\src\components\landing\Hero.astro

## Diff summary

- global.css: +`@keyframes scroll-hint` (transform/opacity only) +
  `@utility scroll-hint-bounce` + explicit `prefers-reduced-motion`
  override on the new utility.
- Hero.astro: +absolute-positioned `<a href="#programa">` scroll cue
  centered at bottom, `md:flex` only, `aria-label` for SR, chevron-down
  Lucide icon (no new dep), uses `text-gold` / `text-text-muted` tokens.

## Deferred to later phases

- a11y deep audit of touch targets / focus order across all sections → `audit` (2/7).
- WhatsApp button mobile discoverability (consider one-time tooltip on
  first scroll past hero) — only if `audit` flags it; otherwise drop.
- Reveal-on-scroll staggering review for new scroll cue interaction.

## Maestro 6-gate self-check

1. Cardinal rules — PASS (no hex; tokens only; transform/opacity; Bun; LF).
2. Astro static-only — PASS (no SSR/SPA; pure `.astro`; zero JS added).
3. Content SSOT — N/A (no copy added to product schema; cue label is
   chrome/affordance, not product copy — analogous to skip link).
4. WhatsApp SSOT — PASS (untouched).
5. Motion contract — PASS (`transform` + `opacity` only;
   `prefers-reduced-motion` honored explicitly on new keyframe).
6. Quality gates — PASS: `bunx astro check` 0/0/0;
   `bun run lint` 0 warnings / 0 errors. Build not re-run (no
   dependency/config change; lint+check sufficient at phase gate).

## Handoff hint to audit (2/7)

Hero now has a visible scroll affordance from `md:` upward. Audit phase
should verify: (a) cue does not collide with reveal-up animation on
slow networks, (b) anchor jump to `#programa` lands without sticky
header obscuring (WCAG 2.4.11), (c) cue stays hidden on `<md` where the
hero already compresses near the fold.
