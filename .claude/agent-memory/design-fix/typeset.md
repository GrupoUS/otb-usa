# design-fix · Phase 3/7 · typeset

## Phase commitment

Audited typographic hierarchy and microcopy across all landing
sections. Adjustments stayed minimal: `text-balance` on every Playfair
Display h2 to neutralize orphan/widow risk; footer legal disclaimer
constrained to `max-w-3xl` to land within 65–75ch optimal measure;
agenda date receives `tabular-nums` to align with numeral system
established on prices/stats/horas. One microcopy upgrade (Investimento
secondary CTA) — all stakeholder-gated strings preserved verbatim.

## Files touched

- F:\Projetos\otb-usa\src\components\landing\Hero.astro — NOT touched (already had text-balance)
- F:\Projetos\otb-usa\src\components\landing\WhyOTB.astro
- F:\Projetos\otb-usa\src\components\landing\Investimento.astro
- F:\Projetos\otb-usa\src\components\landing\TargetAudience.astro
- F:\Projetos\otb-usa\src\components\landing\BostonHarvard.astro
- F:\Projetos\otb-usa\src\components\landing\Speakers.astro
- F:\Projetos\otb-usa\src\components\landing\Modulos.astro
- F:\Projetos\otb-usa\src\components\landing\Turmas.astro
- F:\Projetos\otb-usa\src\components\landing\Programa.astro
- F:\Projetos\otb-usa\src\components\landing\FAQ.astro
- F:\Projetos\otb-usa\src\components\landing\Parceiros.astro
- F:\Projetos\otb-usa\src\components\landing\Footer.astro
- F:\Projetos\otb-usa\src\content\products\otb.json

## Diff summary

- WhyOTB / Investimento / TargetAudience / BostonHarvard / Speakers /
  Modulos / Turmas / Programa / FAQ / Parceiros .astro: `+text-balance`
  on the `<h2>` Playfair display heading — neutralizes orphaned final
  word at sm/md viewports where 3-line headlines were prone to "Estados/
  Unidos" or "Saúde/Estética" widows.
- BostonHarvard.astro: `+tabular-nums` on the agenda `d.data` span
  (19 abr 2027 / 20 abr 2027 / 21 abr 2027) — consistent with the
  prices/stats/horas numeral discipline.
- Footer.astro: `+max-w-3xl` on legal disclaimer paragraph + creditos
  imagens paragraph. Previously the disclaimer spanned the full
  `max-w-7xl` container at lg+ (≈110ch), violating the 65–75ch optimal
  measure. `max-w-3xl` resolves to ~768px → ~70ch for `text-xs`.
- otb.json: `investimento.cta.secondaryLabel` microcopy upgrade.

## Microcopy diffs

| Path | Before | After | Rationale |
| --- | --- | --- | --- |
| `investimento.cta.secondaryLabel` | "Saber mais sobre o programa" | "Conhecer o programa" | Tighter, more confident verb; echoes Hero secondary CTA ("Conhecer o programa") establishing a single repeated phrase — premium repetition over redundant variation. Saves 3 words / aligns CTA voice. |

## Stakeholder-gated items NOT touched

- `audience.legenda` — "conselho de classe" wording preserved.
- `audience.quote` + FAQ — "íntima" preserved verbatim.
- `investimento.escassez` — "Lote 1 ativo. Lote 2 (US$ 4.000) liberado
  por volume ou data — confirmar disponibilidade." preserved verbatim
  (stakeholder gate on Lote/disponibilidade wording).
- `investimento.parcelamento[1]` — "taxa de 5% sobre o número de
  parcelas" preserved verbatim.
- `bostonHarvard.cards[0]` + `faq[2]` — "Anatomy Review com
  correspondente americano" preserved.
- `legal.disclaimer` — full Harvard non-affiliation block preserved.
- `freshStats[2]` — "ASA — Anatomy Society of America" preserved.
- All `hero.cta.whatsappMessage` + `investimento.cta.whatsappMessage`
  WhatsApp strings — preserved (start "Olá, Laura!" zod refine intact).
- FAQ datas online ("19 a 21 de abril de 2027, em Boston…") preserved.
- Partner contacts (Gabriela Souza / Raquel Fleury) preserved.

## Audit findings (no action required)

- Type scale: all sizes resolve to the discrete Tailwind scale or
  intentional bracket sizes (eyebrows `text-[11px]`, scroll cue
  `text-[10px]`, eyebrow tracking `[0.32em]`). No arbitrary 11.5px.
- Heading-to-body ratio: h2 `text-5xl` (md) ≈ 48px vs body `text-base`
  16px → 3x — satisfies ≥ 2x DESIGN.md rule.
- Weight: Playfair Display always `font-bold` on display heads;
  `font-semibold` on h3 subheads; body `font-medium` only on small
  badges/CTAs. No `font-bold` on body copy.
- Line length: persona bullets in 2-col grid → each cell ~480px →
  ~65ch at `text-sm`. WhyOTB positioning quote `max-w-3xl` at
  `text-2xl` → ~50ch (intentional editorial measure). Programa
  descricao / narrativa `max-w-xl` → ~55ch. Boston / Speakers /
  Audience body `max-w-2xl` → ~70ch. All within band.
- Tabular-nums: prices, stats, hero metrics, módulo numero, hora
  count, audience bullet numerals, agenda data — verified.
- Italic + serif blockquotes: WhyOTB positioning, Audience quote,
  Programa narrativa, Investimento tagline — rhythm consistent.
- Hero h1 already carries `text-balance` (no change needed).
- All eyebrow labels share `text-[11px] font-semibold uppercase
  tracking-[0.32em] text-gold` (single exception: footer/scroll cue
  on 0.22em — intentional smaller-tracking context).

## Maestro 6-gate self-check

1. Cardinal rules — PASS (no new hex; tokens only; transform/opacity
   preserved; Bun tooling; LF endings preserved per Edit semantics).
2. Astro static-only — PASS (no SSR/SPA; no client directive change;
   pure utility-class diffs + 1 JSON field).
3. Content SSOT — PASS (microcopy edit lives in `otb.json`; no copy
   added to `.astro`/`.tsx`).
4. WhatsApp SSOT — PASS (untouched; CTA labels unchanged; messages
   intact).
5. Motion contract — PASS (no animation properties added; `text-balance`
   is layout-text, not motion).
6. Quality gates — PASS:
   - `bunx astro check` → 23 files: 0 errors / 0 warnings / 0 hints.
   - `bun run lint` (biome + oxlint) → 0 warnings / 0 errors.
   - Build not re-run (no dependency/config change; tokens unchanged).

## Handoff hint to layout (4/7)

Typographic system is now disciplined: every display h2 balances on
2-line wraps; legal copy lands within 70ch; agenda dates align with the
numeral discipline. Layout phase can safely assume: (a) no h2 will
overflow / orphan ugly at `sm:` boundary; (b) Investimento secondary
CTA shares verb form with Hero secondary CTA — both say "Conhecer o
programa" so layout phase may consider visual treatment unification.
Open observation: Investimento descricao constrained to `max-w-xl`
inside `lg:col-span-6` — at viewports `lg:1024–1280px` the column is
~512px → text already constrained by container; the `max-w-xl` is
redundant but harmless. Layout phase may verify or simplify.
