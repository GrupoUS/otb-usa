---
name: design-improve-colorize
description: Impeccable colorize (phase 4/5) of OTB USA landing — consolidates 9 highest-frequency inline color-mix tokens into 3 named utilities, deletes 3 dead utilities, annotates the meta theme-color exception. Pure semantic-token tightening; zero new hex, zero new motion.
metadata:
  type: project
---

# DESIGN-IMPROVE — PHASE 4/5 COLORIZE

## Phase commitment

Restrained consolidation. Picked the THREE highest-frequency inline `color-mix()` tokens across 7 components and promoted them to named `@utility` helpers in `src/styles/global.css`. Deleted three confirmed-dead utilities (`gold-glow`, `animate-spotlight`, `animate-aurora`) plus their orphan `@keyframes`. Annotated the meta theme-color literal in `Layout.astro` as the documented exception (HTML meta tags cannot read CSS vars; literal MUST mirror `--color-navy`). Did NOT invent new color roles, did NOT touch palette anchors, did NOT consolidate the long tail of one-off tints (12%, 15%, 18%, 22%, 25%, 30%, 45%, 55%, 60%) — those stay inline by intent to avoid 12 micro-utilities. Did NOT touch `src/content/products/otb.json` or `src/pages/index.astro`.

## Files touched

- F:\Projetos\otb-usa\src\styles\global.css
- F:\Projetos\otb-usa\src\layouts\Layout.astro
- F:\Projetos\otb-usa\src\components\landing\WhyOTB.astro
- F:\Projetos\otb-usa\src\components\landing\Programa.astro
- F:\Projetos\otb-usa\src\components\landing\Parceiros.astro
- F:\Projetos\otb-usa\src\components\landing\Modulos.astro
- F:\Projetos\otb-usa\src\components\landing\BostonHarvard.astro
- F:\Projetos\otb-usa\src\components\landing\Hero.astro
- F:\Projetos\otb-usa\src\components\landing\TargetAudience.astro

## Diff summary

- `global.css` — added 3 utilities; deleted 3 dead utilities (`gold-glow`, `animate-spotlight`, `animate-aurora`) and their exclusive keyframes (`spotlight`, `aurora`); biome auto-reformat applied.
- `Layout.astro` — added Astro comment annotating the meta theme-color literal as the navy-token mirror exception.
- `WhyOTB.astro` — icon chip: `border-gold-mid-35 bg-gold-tint-10`.
- `Programa.astro` — icon chip + horas pill: 2 substitutions (`border-gold-mid-35 bg-gold-tint-10`, `bg-navy-soft-70`).
- `Parceiros.astro` — partner icon chip: `border-gold-mid-35 bg-gold-tint-10`.
- `Modulos.astro` — number chip: `bg-gold-tint-10` (border 30% one-off kept).
- `BostonHarvard.astro` — boston card icon + datas pill: 2 substitutions (`border-gold-mid-35 bg-gold-tint-10`, `bg-navy-soft-70`).
- `Hero.astro` — badge bg: `bg-navy-soft-70` (gold 25% border one-off kept).
- `TargetAudience.astro` — categoria li bg: `bg-navy-soft-70` (gold 18% border one-off kept).

## New utilities added to global.css

| Utility | CSS property | Token | Purpose | Replaced occurrences |
|---|---|---|---|---|
| `bg-gold-tint-10` | `background-color` | `color-mix(in srgb, var(--color-gold) 10%, transparent)` | Icon-chip backgrounds (gold-on-navy chips) | 5 (WhyOTB, Programa card, Parceiros, Modulos, BostonHarvard card) |
| `bg-navy-soft-70` | `background-color` | `color-mix(in srgb, var(--color-navy-light) 70%, transparent)` | Panel/badge/pill backgrounds (translucent navy surface) | 4 (Programa horas, BostonHarvard datas, Hero badge, TargetAudience li) |
| `border-gold-mid-35` | `border-color` | `color-mix(in srgb, var(--color-gold) 35%, transparent)` | Icon-chip borders matched with `bg-gold-tint-10` | 4 (WhyOTB, Programa card, Parceiros, BostonHarvard card) |

Net: 9 inline `color-mix()` instances → 3 single-source utilities. Compiled CSS (verified in `dist/_astro/index*.css`) emits both progressive-enhancement `color-mix()` and `#RRGGBB+alpha` fallback — visual output is byte-equivalent to pre-refactor.

## Utilities deleted

| Utility | Lines | Consumers | Action |
|---|---|---|---|
| `@utility gold-glow` | global.css:45–47 | 0 (Grep src/) | Deleted |
| `@utility animate-spotlight` + `@keyframes spotlight` | global.css:299–312 | 0 (Grep src/) | Deleted |
| `@utility animate-aurora` + `@keyframes aurora` | global.css:314–329 | 0 (Grep src/) | Deleted |

Did NOT delete `float-gentle` (still defined; used by mobile-disable media query and potentially elsewhere — animate phase noted it is no longer used in Hero but the utility was kept intentionally).

## Meta-tag exception annotation

`src/layouts/Layout.astro` line 60–61:

```astro
{/* meta theme-color cannot read CSS variables; literal MUST mirror --color-navy in src/styles/global.css @theme. Keep in sync if the navy token changes. */}
<meta name="theme-color" content="#1a1a2e" />
```

Justification: HTML meta tag attributes are static strings parsed before the CSS engine; they cannot consume `var(--color-navy)`. Two alternatives were available: (a) keep the literal with an explicit token-mirror comment, (b) inject via a runtime script that reads the computed style. Option (a) was chosen per phase guidance — pragmatic, zero runtime cost, zero hydration concern, fail-loud if the navy token ever changes (developer reads the comment and updates both sites). This is the SINGLE documented cardinal #7 exception.

## Hex scan result

`Grep("#[0-9a-fA-F]{3,8}", src/, glob !global.css)` → **1 match: `src\layouts\Layout.astro:61` (the documented meta-tag exception only).**

Zero hex outside the documented exception and the canonical `@theme` block. Cardinal #7 satisfied.

## Deferred items by owning phase

- **OVERDRIVE**: #6 overdrive side (further gold-tint demotion), #8 (gold surface audit & ~30% demotion), #12 (Speakers conic-ring redesign). The 3 newly-named utilities make the upcoming gold-budget audit easier — overdrive can count gold-utility occurrences directly instead of grepping `color-mix` patterns.

## Maestro 6-gate self-check

| Gate | Verdict | Notes |
|---|---|---|
| Safe Split | PASS | No layout/structure changes. |
| Glass Trap | PASS | No new glass surfaces. Glass utility unchanged. |
| Glow Trap | PASS | No new gold halos/shadows. Three gold-effect utilities DELETED (gold-glow, animate-spotlight, animate-aurora). |
| Bento Trap | PASS | No grid changes. |
| Blue Trap | PASS | Navy/Gold canon strictly preserved. No new hex anywhere. |
| Line Trap | PASS | No hairlines added/removed. |

Overall Maestro: **PASS** (6/6).

## Notes for overdrive

- The 3 new utilities are also the cleanest probe for "how often does each gold/navy tint appear in the wild?" — `bg-gold-tint-10` count = gold-chip count; `bg-navy-soft-70` count = soft-panel count. Use this to drive the gold-budget audit without re-grepping color-mix patterns.
- If overdrive demotes some gold surfaces (per audit #8), the SAFEST channel is editing component classes (swap `bg-gold-tint-10` → `bg-navy-soft-70`, drop `border-gold-mid-35` entirely on N% of cards) rather than mutating the utility definitions. The utilities themselves are correct; the question is dosage.
- `float-gentle` utility still exists in global.css but is no longer used in Hero (animate phase removed it). Overdrive may choose to delete it if no other consumer surfaces; verify with `Grep("float-gentle", src/)` before nuking — Hero is the only known consumer per repo history.
- LF line endings preserved (biome auto-format respected the existing convention).
