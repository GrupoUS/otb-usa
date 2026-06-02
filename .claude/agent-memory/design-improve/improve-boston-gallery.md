---
name: improve-boston-gallery
description: design-improve pass — crimson accent + premium gallery rebuild for BostonHarvard, Turmas, Programa, Modulos
metadata:
  type: project
---

## Files touched

| File | Action | Summary |
|---|---|---|
| `src/components/landing/BostonHarvard.astro` | edit | Real campus bg photo + deep scrim; crimson eyebrow/gradient-crimson headline; glass-card-crimson + card-glow-hover-crimson on all 3 cards; crimson-pulse-glow on first card; freshStats filetes replaced gold→crimson-bright (3px height); agenda "Dia N" now text-gradient-crimson; chevron-right icons switched to text-crimson-bright/70; border-crimson-mid-35 on agenda items. Harvard disclaimer preserved verbatim in JSON; no Harvard logo/affiliation copy added. |
| `src/components/landing/Turmas.astro` | REBUILD | Premium masonry gallery. Photo 0: hero full-width aspect-[16/7] with scale reveal. Photos 1–2: two-col 4:3 with left/right reveal. Photos 3–5: three-col 4:3, crimson borders. Photos 6–8: three-col 4:3, gold borders. "Edição NN" label removed. Hover caption slides up via translate-y transition (accessible via group-focus-within). Footer accent line crimson+gold. All 9 imgs have explicit width/height from photoMeta map. |
| `src/components/landing/Programa.astro` | edit | Boston immersion card (idx 1) → glass-card-crimson + card-glow-hover-crimson + crimson-bright top bar + crimson-tint icon bg. 320h badge enlarged to text-7xl on sm. No hex added. |
| `src/components/landing/Modulos.astro` | edit | Even module numbers → crimson-tint-10 bg + text-gradient-crimson + crimson border (alternating with gold on odd). Hover: vertical crimson filete (scale-y-0 → scale-y-100 via CSS transition). |

## Autocheck Maestro — 6 gates

| Gate | Result |
|---|---|
| Zero hex hardcoded in .astro | PASS — all colors via token utilities or color-mix(in_srgb,var(--color-*)) inline syntax |
| prefers-reduced-motion honored | PASS — all animations are CSS classes; global.css covers * with 0.01ms override; no new JS motion added |
| Harvard disclaimer preserved | PASS — BostonHarvard.astro shows card.descricao verbatim from JSON ("sem vínculo institucional com Harvard"); no affiliation claims added |
| width+height on all gallery images | PASS — photoMeta map provides w/h per filename; hero card uses 1600×900; all others sized via map; fallback 1600×1067 |
| Crimson only as accent (never body text on navy) | PASS — crimson used only in: border utilities, badge eyebrow (text-crimson-bright on section-level small text ≥11px), glow effects, text-gradient-crimson (large headings/stats), filete spans. Body copy stays text-text-muted/text-text-primary |
| No edits outside SCOPE | PASS — only 4 files in scope written; global.css, index.astro, otb.json unchanged |

**Why:** design-improve chain (bolder + animate + colorize) targeting Navy/Gold/Crimson canon for OTB USA Boston positioning.
**How to apply:** crimson accent pattern established — use glass-card-crimson / card-glow-hover-crimson / text-gradient-crimson for Boston·Harvard surfaces in future iterations.
