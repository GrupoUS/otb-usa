---
name: design-improve-audit
description: Impeccable audit (phase 1/5) of OTB USA landing focusing on Trilho A additions and pre-existing flagged defects. Report only — no file edits.
metadata:
  type: project
---

# DESIGN-IMPROVE — PHASE 1/5 AUDIT

## Phase commitment

Ran the impeccable audit checklist across the entire OTB USA landing surface (Hero, WhyOTB, TargetAudience, Programa, Turmas, Modulos, BostonHarvard, Speakers, Investimento, Parceiros, FAQ, Footer, Layout, global.css). Paid extra attention to the freshly added Trilho A blocks: `WhyOTB.positioningQuote`, `TargetAudience.personaIntro + personaBullets`, `Programa.narrativa`, `BostonHarvard.freshStats`, and the `Investimento.beneficios` extension to 9 items. Did NOT change any files: no audit-class blocker (markup, a11y, contrast) found that requires in-phase repair. All polish-class defects are deferred to the correct downstream phase with explicit ownership. Did NOT re-explore otb.json (READ-ONLY in this phase) and did NOT touch tokens.

## Maestro 6-gate self-check

| Gate | Verdict | Notes |
|---|---|---|
| Safe Split (forbidden 50/50 hero, no symmetric split) | PASS | Hero is asymmetric 8/4; Programa 5/7; Investimento 6/6 but content-asymmetric (price card vs benefits list — visually distinct, not mirrored). No symmetric clones. |
| Glass Trap (over-reliance on backdrop-blur + thin border) | WARN (P2) | `glass-card` used in 6 sections (WhyOTB, Programa, BostonHarvard cards, BostonHarvard freshStats, Parceiros, Investimento card-bright). Within tolerance but freshStats new block reusing `glass-card` adds a 5th gold-bordered glass surface inside ONE section (Boston) — risk of glass fatigue. Reassign in BOLDER phase. |
| Glow Trap (gold halo/shadow overused) | WARN (P2) | `card-glow-hover` + `gold-pulse-glow` + `text-shimmer` + `text-gradient-gold` + `glass-card-bright` shadow all coexist. Hero CTA + Investimento CTA + Investimento price card + freshStats numbers all glow gold simultaneously. Audit count of glowing surfaces exceeds 10% gold-budget. Reassign in OVERDRIVE phase. |
| Bento Trap (uniform grid sameness) | PASS | Grids are varied: 1×3, 5/7, 6/6, 2-col with one full-width spanner (Programa idx===2), 3-col stats, 2-col modulos. No bento monotony. |
| Blue Trap (drift to fintech blue/cyan) | PASS | Strict Navy/Gold canon; no blue/cyan/violet leaks. |
| Line Trap (decorative hairlines crutch) | PASS | Eyebrow hairline (`h-px w-10 bg-gold/60`) is consistent and intentional — repeated as a signature, not as a crutch. |

Overall Maestro: PASS with 2 warnings (Glass + Glow) — both downstream-fixable.

## Defect catalog

### P1 (must fix in chain, blockers if shipped to overdrive)

1. **Hardcoded hex `#1a1a2e` in meta theme-color** — `src/layouts/Layout.astro:60`. Cardinal #7 violation outside `@theme`. → COLORIZE phase. Fix: `<meta name="theme-color" content="var(--color-navy)" />` won't work for meta; correct fix is to either inline via JS at runtime OR move the literal to be auto-synced with `--color-navy`. Simplest acceptable: replace with `<meta name="theme-color" data-token="navy">` + tiny inline script reading the computed CSS var — OR document explicit token-mirror exception. Decision punt: COLORIZE.

2. **Inline `color-mix()` in Tailwind class attributes (24+ occurrences across 8 components)** — files & lines: `Modulos.astro:33,37` · `Turmas.astro:30` · `Programa.astro:35–36,45,60` · `TargetAudience.astro:45,49,71` · `WhyOTB.astro:49` · `BostonHarvard.astro:48,61,72(implicit at freshStats line 79 via glass-card),105` · `Investimento.astro:56,75–79,87,128` · `Parceiros.astro:53,75,87` · `FAQ.astro:40,51` · `Footer.astro:15,63,71`. Not technically a hex violation (uses tokens via `var(--color-gold)`), but flagged in handoff as COLORIZE-phase work to consolidate into named utility classes for readability + auditability. → COLORIZE.

### P2 (polish, hands off to bolder/animate/overdrive)

3. **Trilho A — WhyOTB.positioningQuote typography weight** (`WhyOTB.astro:32`) — uses `font-serif text-lg sm:text-xl italic` at `text-text-primary/85`. Quote reads light against navy mesh background; lacks visual anchor (no leading mark, no decorative rule, no quote glyph). → BOLDER (typography hierarchy lift: add `before:` content quote glyph in gold, or wrap in a decorated blockquote pattern).

4. **Trilho A — TargetAudience.personaIntro+personaBullets visual ranking** (`TargetAudience.astro:57–79`) — the persona block sits BELOW a 3-col category grid in the same `lg:col-span-7` column. Hierarchy is unclear — persona is currently styled as plain prose with check bullets, while the categorias grid above commands visual weight. The persona narrative is arguably MORE important (defines the buyer) but ranks visually weaker. → BOLDER (promote personaBullets with a left-side accent or larger leading; consider lifting personaIntro into its own row above the grid).

5. **Trilho A — Programa.narrativa redundancy with descricao** (`Programa.astro:31–43`) — `descricao` (regular para) and `narrativa` (italic blockquote) sit back-to-back, both at similar size. Visually they fight. → BOLDER (collapse OR strongly differentiate: descricao → small caps eyebrow lead-in; narrativa → larger pull-quote with gold rule).

6. **Trilho A — BostonHarvard.freshStats glass duplication** (`BostonHarvard.astro:72–92`) — uses `glass-card` reused identically right after `glass-card card-glow-hover` cards above. Two consecutive glass-on-glass rows in one section. Stats deserve a more typographic treatment (numerals are already the hero — let them breathe without a glass shell, use a thin gold underline instead). → BOLDER + OVERDRIVE.

7. **Trilho A — Investimento.beneficios extended to 9 items** (`Investimento.astro:53–62`) — single-column 9-item check-list is long and scans slowly. Hick's Law: 9 sibling items at the same weight degrades scannability. → BOLDER (split into 2 columns at `sm:` OR group into 3 themed clusters with mini-headers — e.g., "Conteúdo / Experiência / Suporte"). Also consider promoting 1–2 top items as starred/emphasized.

8. **Gold accent budget (>10% surface)** — counted gold-tinted surfaces on a single scroll: hero CTA + price card + Investimento CTA + Investimento price card + 9 check bullets + freshStats numerals + every eyebrow + every gradient highlight + glass-card border. Exceeds 10% surface budget by ~3–5%. → OVERDRIVE (audit gold usage; demote ~30% of gold tints to text-muted or border-only).

9. **Heading hierarchy — section H2 sameness** — every section uses identical pattern: eyebrow + h2 (3xl→5xl) + optional `text-gradient-gold` highlight. 11 sections in a row with structurally identical headers creates "anaphora fatigue". → BOLDER (introduce 2 alternative section-header patterns: e.g., one section with center-staggered title, one with massive numeral lead-in for the agenda section).

10. **Float-gentle on hero card competes with reveal animations** (`Hero.astro:99` → `float-gentle`) — infinite float animation runs alongside scroll-reveal staggered entrance + shimmer headline + gold-pulse-glow badges. Above-the-fold motion budget is saturated. → ANIMATE (kill float-gentle on desktop OR delay it until reveal animations complete; reduced-motion already handled).

### P3 (nice-to-have, OVERDRIVE candidates)

11. **Unused utilities in global.css**: `.gold-glow` (lines 45–47), `.animate-spotlight` (310–312), `.animate-aurora` (327–329). Dead code in tokens file. → OVERDRIVE (cleanup pass).

12. **Speakers conic-gradient avatar ring** (`Speakers.astro:46`) — blur-sm conic gradient on every speaker portrait reads as a "premium template" cliché. → OVERDRIVE (consider a more distinctive ring: thin double-stroke, gold corner brackets, or static gilded frame).

13. **Turmas 2-col photo grid lacks captioning hierarchy** (`Turmas.astro:27–50`) — figcaption is `text-text-muted` against a navy gradient; reads as afterthought. → BOLDER (caption deserves an eyebrow label like "Edição 1 — Boston 2025" with date/cohort number).

14. **SectionDivider uniformity** — same gold-fade hairline 10× in a row between sections. Functional but monotonous. → BOLDER (vary 2–3 divider styles: e.g., one with a centered gold dot, one with a sectional numeral, one as the current hairline).

15. **FAQ chevron rotation is the only motion in the section** (`FAQ.astro:51`) — answer reveal is instant (correct per cardinal #8) but the abrupt content appearance reads as flat. → ANIMATE (add `opacity` fade on the answer div via `details[open] > div` selector with `animation: reveal-up 0.3s`; layout properties untouched).

## Deferred items by owning phase

- **BOLDER**: #3, #4, #5, #6 (bolder side), #7, #9, #13, #14
- **ANIMATE**: #10, #15
- **COLORIZE**: #1, #2
- **OVERDRIVE**: #6 (overdrive side), #8, #11, #12

## Files touched

None — phase is report-only and no blocker requires in-phase repair.

## Diff summary

- no changes
