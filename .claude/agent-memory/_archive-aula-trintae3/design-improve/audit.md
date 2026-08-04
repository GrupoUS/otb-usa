---
name: design-improve-audit
description: Impeccable audit (phase 1/5) of the Aula Gratuita TRINTAE3 landing — a11y/touch/landmark defects fixed in-scope; bolder/animate/colorize/overdrive deferred.
metadata:
  type: project
---

# design-improve — PHASE 1/5: AUDIT (impeccable)

> Supersedes the prior OTB-era audit (those components no longer exist post-rebuild).

## PHASE COMMITMENT
Visual-quality audit of the Aula Gratuita TRINTAE3 landing with the two new Dra. Sacha photos
(Hero `/images/sacha-hero.webp`, Authority `/images/sacha-about.webp`) and confirmed event data
(24 jun 2026, 19h, ~2h). Scope = fix correctness-level defects only (a11y, touch targets,
landmark semantics) within SCOPE files using semantic Navy/Gold tokens. NO bolder / animation /
color / depth changes — those belong to later phases and are catalogued below. Navy/Gold anchors,
motion canon, copy SSOT, and FROZEN files untouched.

## Files touched (absolute)
- F:\Projetos\aula-trintae3\src\components\layout\Header.astro
- F:\Projetos\aula-trintae3\src\components\landing\MobileCTABar.astro

## Diff summary (one line per file)
- Header.astro — hamburger open + mobile-close buttons `h-10 w-10` (40px) → `h-11 w-11` (44px) touch target.
- MobileCTABar.astro — removed incorrect `role="complementary"` + `aria-label` from the sticky single-CTA bar.

## Defects found + fixed
1. **Touch target < 44px (SC 2.5.8 / gpus-theme ≥44px)** — Header mobile menu open + close
   buttons were 40×40px. Primary one-handed mobile nav controls (thumb-zone, top-corner reach).
   Fixed → 44×44px. (Header.astro:62, :111)
2. **Incorrect landmark semantics** — MobileCTABar used `role="complementary"`, exposing a
   tangential-content landmark to AT for what is just a sticky primary-action button. Removed the
   role + redundant aria-label; the `<a>` is self-describing. (MobileCTABar.astro)

## Investigated, NOT a defect (evidence)
- Contrast: `text-text-muted` #94a3b8 on navy #1a1a2e ≈ 6.9:1 (PASS body). `text-gold` #d4af37 on
  navy ≈ 8:1 (PASS even as heading). `text-gold/80` registrationNote ≈ 5.5:1 (PASS). No defects.
- `btn-base:focus-visible` = 2px gold outline + 2px offset → ring sits on navy around gold
  buttons, visible. Header CTA + MobileCTABar `<a>` (bare global `:focus-visible`) also offset to
  navy → visible. No focus-on-gold-invisible defect.
- Form (RegistrationForm): real `<label for>`, `aria-required`, per-field color+text errors,
  `aria-live` status, consent checkbox + privacy link, WhatsApp fallback. Sound.
- FAQ: native `<details>` (no height tween) + FAQPage JSON-LD. Sound.
- Reveal: `.js`-gated, hardened IntersectionObserver, `<noscript>` fallback, reduced-motion. Sound.
- Heading order: single `<h1>` (Hero), `<h2>` per section, `<h3>` in cards/footer. No skips.
- MobileCTABar obscuring (SC 2.4.11): `index.astro` wrapper bottom-padding clears it. OK.

## DEFERRED — bolder
- Hero is a textbook left-text / right-image Safe Split → consider asymmetry / layered depth /
  larger typographic statement. (Maestro Safe Split — noted, not fixed in audit.)
- SectionHeading accent `w-15 h-0.5` is timid; could become a stronger repeating motif.
- 11 structurally identical section headers (eyebrow + h2) risk anaphora fatigue → vary 1–2.

## DEFERRED — animate
- Orchestrate one staggered Hero page-load (photo + chips + CTAs) instead of separate reveals.
- Learn number badges (01/02/...) static → count-reveal / shimmer on scroll-in.
- MobileCTABar could slide-up (transform/opacity) on scroll-past-hero.

## DEFERRED — colorize
- Single richer gold-gradient / text-gradient-gold focal moment on Hero highlight or FinalCTA.
- Audience highlight item (`bg-gold/10`) could differentiate the ideal persona more boldly.

## DEFERRED — overdrive
- Hero `landing-mesh-bg` subtle → atmosphere/grain/texture depth layer candidate.
- glass-card used in Learn, NextStep, FinalCTA, form, FAQ → glass-fatigue risk; reserve
  glass-card-bright for 1–2 focal CTAs (Glass Trap watch).

## Maestro self-check (6 gates)
- Safe Split: **NOTED** — Hero is a classic split; flagged for bolder phase, not fixed in audit. PASS (audit scope).
- Glass Trap: PASS — glass used as accent; over-use catalogued, none introduced.
- Glow Trap: PASS — gold glow on primary CTAs only; none added.
- Bento Trap: N/A — no bento grid on this landing.
- Blue Trap: PASS — Navy/Gold only; no fintech blue/cyan, no purple/indigo.
- Line Trap: PASS — crisp geometry (rounded-2xl cards / rounded-xl buttons / rounded-sm chrome); no 4–8px reliance; none added.

## astro check
`bunx astro check` → 29 files, **0 errors, 0 warnings, 1 hint** (pre-existing ts(6385) in FROZEN
src/content.config.ts:25 — not mine, ignored per task).
