---
name: design-improve-bolder
description: Impeccable bolder (phase 2/5) of the Aula Gratuita TRINTAE3 landing — Hero Safe Split broken to asymmetric editorial, numbered section spine, gold demoted from headline-flood to accent. Navy/Gold preserved.
metadata:
  type: project
---

# design-improve — PHASE 2/5: BOLDER (impeccable)

> Supersedes the prior OTB-era bolder record (those components no longer exist post-rebuild).
> NOTE: `C:\Users\Mauri\.claude\skills\impeccable\reference\bolder.md` is NOT installed on this
> machine (also no impeccable skill dir / load-context). Proceeded on the bolder principles in the
> agent contract: typographic boldness via Playfair scale/weight/tracking + structural asymmetry,
> gold ≤10% surface, no a11y/CLS regression, no layout-property animation.

## PHASE COMMITMENT
Bolded with a premium/restrained register. Three structural moves: (1) broke the Hero 50/50 Safe
Split into an asymmetric 7/5 editorial split with an oversized Playfair headline; (2) gave the page
a numbered editorial spine via SectionHeading `index` + alternating left/center alignment, killing
the near-identical-header anaphora; (3) reclaimed gold as hierarchy by demoting headline/numeral
gold-floods to high-contrast `text-text-primary`, keeping gold for accents (rule, numeral ghost,
eyebrow). Gold surface DOWN, type scale + contrast UP. No new hex, no new tokens, no motion changes
(animate phase owns those), no color-system changes (colorize owns those).

## Files touched (absolute)
- F:\Projetos\aula-trintae3\src\components\shared\SectionHeading.astro
- F:\Projetos\aula-trintae3\src\components\landing\Hero.astro
- F:\Projetos\aula-trintae3\src\components\landing\Audience.astro
- F:\Projetos\aula-trintae3\src\components\landing\Learn.astro
- F:\Projetos\aula-trintae3\src\components\landing\RegistrationForm.astro
- F:\Projetos\aula-trintae3\src\components\landing\FAQ.astro
- F:\Projetos\aula-trintae3\src\components\landing\FinalCTA.astro
- F:\Projetos\aula-trintae3\src\components\landing\Authority.astro

## Diff summary (one line per file)
- SectionHeading.astro — added optional `index` (oversized Playfair ghost numeral, gold/35) + `kicker`; title now `text-text-primary` (was gold) at `lg:text-6xl` tracking-tight text-balance; accent bar `h-1 w-16` (was timid `h-0.5 w-15`); flex column honors align.
- Hero.astro — Safe Split 50/50 → asymmetric 12-col 7/5; headline up to `lg:text-7xl` leading-[1.02] tracking-tight; eyebrow pill → inline gold-rule label; photo column overlaps (`-ml-6`) with `depth-5` for layered depth.
- Audience.astro — SectionHeading `index={1}` `align="left"`; intro un-centered to match left editorial header.
- Learn.astro — SectionHeading `index={2}` `align="left"`; card numeral → ghost gold/30 text-6xl; card `h3` gold → `text-text-primary` text-2xl (gold de-flooded).
- RegistrationForm.astro — SectionHeading `index={3}` (centered).
- FAQ.astro — SectionHeading `index={4}` (centered).
- FinalCTA.astro — headline gold → `text-text-primary` `md:text-5xl` leading-[1.05] tracking-tight text-balance.
- Authority.astro — eyebrow → inline gold-rule editorial label; name `h2` up to `lg:text-6xl` tracking-tight text-balance.

## What got bolder + why it stays on-brand
- **Editorial spine (01–04):** structural numerals (derived from DOM order, NOT product copy) give
  scannable rhythm; left-aligned Audience/Learn vs centered Form/FAQ breaks anaphora. F-pattern +
  left-side bias friendly. Gold numeral at /35 is a ghost accent, not a flood.
- **Hero asymmetry:** 7/5 + 7xl Playfair = a typographic statement, not a template split. The photo
  overlap + depth-5 adds Z-axis depth. Avoids the #1 forbidden "Standard Hero Split".
- **Gold reclaimed as hierarchy:** moving headlines/h3 to text-primary keeps gold ≤10% (Ouro raro);
  Playfair weight/scale now carries authority, color stays restrained. On-brand for Dra. Sacha
  "sofisticação sem excesso".
- A11y: all titles now text-primary #fafaf9 on navy (≈14:1) — improved over gold headings. Gold
  ghost numeral is `aria-hidden`. Heading order unchanged (one h1, h2 per section). Images keep
  width/height → no CLS. No layout-property animation added.

## DEFERRED — animate
- Orchestrate Hero staggered page-load (eyebrow → headline → chips → CTAs → photo) instead of two reveals.
- Learn ghost numerals could count-up / shimmer on scroll-in.
- SectionHeading index numeral could fade/slide with its title (transform/opacity).

## DEFERRED — colorize
- A single richer gold-gradient (text-gradient-gold) focal moment on ONE hero highlight or FinalCTA — pick one, not many.
- Audience highlight item (`bg-gold/10`) could get a slightly bolder ideal-persona treatment.

## DEFERRED — overdrive
- Hero `landing-mesh-bg` is subtle → atmosphere/grain/texture depth layer.
- glass-card still used in Learn/NextStep/FinalCTA/form/FAQ → reserve glass-card-bright for 1–2 focal CTAs (glass-fatigue).
- Pre-existing content-drift smells out of bolder scope (do NOT fix here — touches copy/schema):
  FAQ title literal "Perguntas frequentes" + Authority "Quem conduz a aula" live in components, not JSON.

## Maestro 6-gate self-check
- Safe Split: **PASS** — Hero is now asymmetric 7/5 with an oversized typographic lead; 50/50 split removed. (Was NOTED in audit, now resolved.)
- Glass Trap: PASS — no new glass introduced; over-use catalogued for overdrive.
- Glow Trap: PASS (improved) — removed gold-flood headlines/h3; gold surface budget reduced. No new glow.
- Bento Trap: N/A — no bento grid.
- Blue Trap: PASS — Navy/Gold only; no new hex/tokens; no fintech blue, no purple/indigo.
- Line Trap: PASS — accent bar bolded to h-1 w-16 (intentional motif) + gold eyebrow rules carry structure; no 4–8px geometry reliance.

## astro check
`bunx astro check` → 29 files, **0 errors, 0 warnings, 1 hint** (pre-existing ts(6385) in FROZEN
src/content.config.ts:25 — not mine, ignored per task).
