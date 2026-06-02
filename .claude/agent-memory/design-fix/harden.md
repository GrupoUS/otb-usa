---
name: design-fix-harden
description: /design-fix phase 2/7 harden — fixed gold-on-gold focus visibility (WCAG 2.4.11/2.4.13) on all gold-background CTAs, verified SC 2.4.11 overlap, form/FAQ/nav focus. Tokens only, no hex.
metadata:
  type: project
---

# /design-fix — PHASE 2/7: HARDEN

> Supersedes the prior OTB-era harden note (those components no longer exist).
> a11y/robustness phase — decorative motion deferred to polish (7/7).

## PHASE COMMITMENT
Hardened focus visibility on every gold-background interactive (the one real a11y gap from onboard):
a plain gold focus ring on a gold fill is gold-on-gold and fails WCAG 2.4.11 (focus not obscured) /
2.4.13 (focus appearance). Introduced a token-only `focus-ring-on-gold` utility (navy ring + gold
outer halo) and a central `.btn-primary:focus-visible` override so every primary CTA, header CTA and
sticky bar gets a high-contrast indicator against the gold itself. Verified SC 2.4.11 bar/FinalCTA
clearance, form focus/aria-live/consent, and FAQ/nav/social focus. No new hex, static Astro, no
layout-property animation, reduced-motion net untouched.

## Files touched (absolute)
- F:\Projetos\aula-trintae3\src\styles\global.css
- F:\Projetos\aula-trintae3\src\components\layout\Header.astro
- F:\Projetos\aula-trintae3\src\components\landing\MobileCTABar.astro

## Diff summary (one line per file)
- global.css — added `@utility focus-ring-on-gold` (navy 2px outline + 4px gold halo) + a global `.btn-primary:focus-visible` with the same treatment; changed `.skip-link:focus-visible` ring gold→navy (skip-link has a gold bg → same gold-on-gold issue).
- Header.astro — desktop CTA + mobile-menu CTA (both `bg-gold`) gained `focus-ring-on-gold`.
- MobileCTABar.astro — sticky gold CTA `<a>` gained `focus-ring-on-gold`.

## a11y fixes + WCAG SC refs
- **Gold-on-gold focus invisibility → FIXED** (SC 2.4.11 Focus Not Obscured AA, SC 2.4.13 Focus
  Appearance AAA, SC 1.4.11 Non-text Contrast): all gold-bg CTAs now show a navy ring + gold halo
  (navy #1a1a2e vs gold #d4af37 ≈ 8:1; halo separates ring from page bg). Primary form submit button
  (`btn-primary`) covered centrally via the new global rule.
- **Skip-link focus** (SC 2.4.7): ring switched gold→navy on its gold background — now visible.
- **MobileCTABar vs FinalCTA overlap → VERIFIED, no change needed** (SC 2.4.11): bar is `md:hidden`
  fixed bottom; `index.astro` wrapper applies `pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0`,
  giving FinalCTA content/buttons clearance to scroll above the bar on mobile. Focused FinalCTA
  buttons are not obscured.

## Investigated — NOT a defect (no edit)
- **Authority portrait `loading="lazy"`** — on mobile the Hero photo is hidden (`<lg`), but the
  Authority portrait sits far below the fold (after Hero text + Audience + Learn). Mobile LCP is the
  Hero headline (text, Playfair preloaded), NOT the portrait. Eager-loading it would waste mobile
  bandwidth on a below-fold image. Correct to keep lazy. (Re-confirm LCP element in optimize 6/7.)
- **Form** — real `<label for>`, `aria-required`, per-field `aria-describedby` errors (color+text),
  `aria-live="polite"` status + `role="status"` success panel, consent checkbox required + privacy
  link, submit disabled-on-send, WhatsApp fallback on network/endpoint failure. Intact.
- **FAQ / nav / social** — native `<details>/<summary>`, nav `<a>`, footer icon links sit on navy →
  global gold focus ring is visible (gold vs navy ≈ 8:1). No change.
- **Form inputs** — gold focus ring on `bg-navy-light/50` dark inputs → visible. No change.

## DEFERRED
- typeset (3/7): cap Authority paragraph + Audience intro measure to 45–75ch; Learn h3↔body rhythm.
- layout (4/7): section `py-20` rhythm (tighter mobile); differentiate NextStep vs FinalCTA cards.
- adapt (5/7): soften `landing-vignette` on short mobile; Hero `lg:-ml-6` crowd at 1024px; 360px headline/chips overflow.
- optimize (6/7): confirm Hero-headline LCP; reconsider Logo `fetchpriority=high` competing; ambient-anim 60fps + mobile pause; @astrojs/react orphan client.js (deps/config — note only, OUT of scope).
- polish (7/7): the 12 MOTION items from onboard.md (gradient sweep, parallax-lite, card hover richness, FAQ panel fade, header condense, MobileCTABar slide-up, etc.).

## Maestro 6-gate self-check
- Safe Split: PASS — no layout change.
- Glass Trap: PASS — no glass change; halo is a focus indicator, not a surface effect.
- Glow Trap: PASS — gold halo appears ONLY on `:focus-visible` (keyboard), not ambient; no persistent gold added.
- Bento Trap: N/A.
- Blue Trap: PASS — Navy/Gold tokens only; no new hex (white 10% mix in the halo is a token-relative tint, not a raw brand hex).
- Line Trap: PASS — no decorative hairline/side-stripe added.

## astro check
`bunx astro check` → 30 files, **0 errors, 0 warnings, 1 hint** (pre-existing ts(6385) in FROZEN
src/content.config.ts:25 — not mine, ignored per task).
