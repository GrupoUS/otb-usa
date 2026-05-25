---
name: design-improve-bolder
description: Impeccable bolder (phase 2/5) of OTB USA landing — typographic hierarchy lifts and structural boldness on Trilho A blocks while LOWERING gold/glass surfaces flagged by audit.
metadata:
  type: project
---

# DESIGN-IMPROVE — PHASE 2/5 BOLDER

## Phase commitment

Bolded with restraint, premium register intact. Lifts:
- Pull-quote typography (WhyOTB + Programa) with serif scale jumps (xl→2xl) + structural left rules + a single gold opening-quote glyph.
- Persona block (TargetAudience) promoted with its own eyebrow, larger serif intro, and 2-column numbered serif markers (replaces flat check list of italic prose).
- BostonHarvard freshStats DEMOTED from glass-card-on-glass-card into bare typographic columns with a single gold rule per stat + numerals in primary text color (not gradient gold). Net effect: gold surface budget DOWN, scale UP — directly mitigates audit Glass + Glow warnings.
- Investimento beneficios (9 items) split into 2-col grid at sm+ (Hick's Law fix).
- One alternative section header (Programa "01" massive serif numeral) to break the 11x anaphora — only one variant, kept restrained.
- Turmas captions get cohort eyebrow + serif title (was muted afterthought).
- SectionDivider gains "dot" + "numeral" variants; applied 3 dot variants in index.astro to vary the 10-divider strip.

Intentionally kept restrained: did NOT add new gold halos, glows, or shimmers. Numerals on freshStats deliberately rendered in `text-text-primary` to LOWER the gold surface budget that overdrive will revisit. No motion changes (animate phase owns those). No color drift (colorize phase owns hex/color-mix consolidation).

## Files touched

- F:\Projetos\otb-usa\src\components\landing\SectionDivider.astro
- F:\Projetos\otb-usa\src\components\landing\WhyOTB.astro
- F:\Projetos\otb-usa\src\components\landing\TargetAudience.astro
- F:\Projetos\otb-usa\src\components\landing\Programa.astro
- F:\Projetos\otb-usa\src\components\landing\BostonHarvard.astro
- F:\Projetos\otb-usa\src\components\landing\Investimento.astro
- F:\Projetos\otb-usa\src\components\landing\Turmas.astro
- F:\Projetos\otb-usa\src\pages\index.astro

## Diff summary

- SectionDivider.astro — added `variant` ("line"|"dot"|"numeral") + optional `numeral` prop; default unchanged.
- WhyOTB.astro — positioningQuote refactored: `<figure>` with gold serif open-quote glyph (text-6xl→7xl) + `<blockquote>` text-xl→2xl→[1.75rem] tracking-tight, left-rule preserved at gold/45.
- TargetAudience.astro — persona block now has its own eyebrow ("Perfil do aluno"), personaIntro promoted to text-xl→2xl serif, personaBullets become `<ol>` 2-col grid with serif tabular numerals (01, 02, …) + thin gold left rule per item.
- Programa.astro — header gains massive serif "01" numeral lead-in (alt-pattern); descricao demoted to small-caps eyebrow + body; narrativa promoted to text-xl→2xl serif blockquote with 3px gold left rule (clear differentiation).
- BostonHarvard.astro — freshStats: glass-card removed; replaced by 3-col layout with `divide-x divide-gold/20`, single gold top hairline per stat, numerals text-6xl→7xl in `text-text-primary` (NOT gradient gold), label tracked uppercase gold/85.
- Investimento.astro — beneficios list converted to 2-col grid at sm+; check chip slightly smaller (h-5/w-5) to balance density.
- Turmas.astro — figcaption restructured: gold hairline + "Edição NN" eyebrow + serif title (was single muted line).
- index.astro — 3 of 10 SectionDividers switched to `variant="dot"` at strategic anchors (Programa→Turmas, Modulos→BostonHarvard, Speakers→Investimento).

## Deferred items by owning phase

- ANIMATE: #10 (hero float-gentle motion budget), #15 (FAQ reveal opacity fade)
- COLORIZE: #1 (Layout meta theme-color hex), #2 (inline color-mix consolidation into named utilities)
- OVERDRIVE: #6 overdrive side (further gold-tint demotion — already partially executed by bolder), #8 (gold surface audit & ~30% demotion), #11 (dead-utility cleanup), #12 (Speakers conic-ring redesign)

## Maestro 6-gate self-check

| Gate | Verdict | Notes |
|---|---|---|
| Safe Split | PASS | No new 50/50 splits introduced. Programa header stays 5/7; persona block remains nested in lg:col-span-7. |
| Glass Trap | PASS (improved) | Removed one `glass-card` instance (freshStats). Net glass surfaces dropped from 6 to 5. Audit WARN resolved at the section level. |
| Glow Trap | PASS (improved) | freshStats no longer uses `text-gradient-gold` for numerals. Numerals now `text-text-primary`; gold reserved for rule + label. One less large gold-gradient surface in viewport. |
| Bento Trap | PASS | No new grids; persona 2-col + beneficios 2-col are content-justified (not bento). |
| Blue Trap | PASS | Navy/Gold canon strictly preserved; no new tokens, no new colors. |
| Line Trap | PASS | New hairlines are functional (stat-divider, persona left-rule, divider-dot) — each carries information, not decoration. Divider variant introduces variation, reducing previous monotony. |

Overall Maestro: PASS. Two audit warnings (Glass + Glow) actively reduced by this phase.

## Notes for downstream phases

- Programa "01" numeral establishes a header-numeral system; if animate/overdrive want to extend, do so SPARINGLY (max 1 more section, e.g., BostonHarvard "02" or Investimento "03") — three is the maximum before re-anaphora.
- SectionDivider `numeral` variant exists but unused in index.astro; available for OVERDRIVE if more divider variety is desired without adding new components.
- All token usage strictly via `color-mix(in srgb, var(--color-gold) …%, transparent)` or named utilities. Zero new hex.
- LF line endings preserved by editor; no CRLF risk.
