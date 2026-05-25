# design-fix · Phase 2/7 · harden

## Phase commitment

Static marketing landing → most "hardening reality" axes
(forms/permissions/large datasets/i18n+RTL) are N/A by architecture:
no inputs, no auth, fixed-length zod-bounded lists, single pt-BR
locale. Real risks reduced to: (a) reveal script silent failure,
(b) long-text overflow on narrow viewports, (c) decorative JS leaks
ignoring reduced-motion. Hardened all three.

## Files touched

- F:\Projetos\otb-usa\src\layouts\Layout.astro
- F:\Projetos\otb-usa\src\components\landing\WhyOTB.astro
- F:\Projetos\otb-usa\src\components\landing\Investimento.astro
- F:\Projetos\otb-usa\src\components\landing\Speakers.astro
- F:\Projetos\otb-usa\src\components\landing\FAQ.astro
- F:\Projetos\otb-usa\src\components\landing\Footer.astro
- F:\Projetos\otb-usa\src\components\landing\TargetAudience.astro

## Diff summary

- Layout.astro: reveal script wrapped in try/catch (3 layers) +
  extracted `revealAll` helper. IO constructor exception → degrade
  to instant reveal. Document state probe failure → last-resort
  reveal. Previously, an IO exception left every section invisible.
- WhyOTB.astro: pointer-glow `is:inline` script guarded with
  try/catch + `instanceof HTMLElement` check + `prefers-reduced-motion`
  short-circuit (decorative cursor-follow respects user motion pref).
- Investimento.astro: `min-w-0` + `break-words` on parcelamento bullets,
  lote label, and lote price row (`flex-wrap` on price) — long copy can
  no longer push the layout horizontally at `< sm`.
- Speakers.astro: `break-words` on speaker name + bio (bio max 280
  chars on `lg:col-span-5` narrow card — guards against unbroken
  long words / URLs).
- FAQ.astro: `break-words` on resposta panel + `min-w-0 break-words`
  on summary pergunta (chevron icon now safe from being pushed
  off-row by long titles).
- Footer.astro: `break-words` on legal.disclaimer + creditosImagens.
- TargetAudience.astro: `min-w-0 break-words` on personaBullets text
  span; outer `<li>` also `min-w-0` to allow shrink under numeral.

## Coverage matrix (8 hardening dimensions)

| Dimension          | Status | Notes                                                                                                                                    |
| ------------------ | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Text overflow      | DONE   | `break-words` + `min-w-0` on every multi-line user-copy span exposed to potential long input. Heading wrap was already safe via responsive sizing. |
| i18n + RTL         | N/A    | Schema is single-locale pt-BR; no `dir`/locale switching planned. Briefing fixes Brazilian audience.                                    |
| Error handling     | DONE   | Layout reveal script: 3-level try/catch + IO unavailable degradation. WhyOTB glow script: try/catch + reduced-motion short-circuit. Console silent (`/* decorative; failure is acceptable */`). |
| Edge cases         | DONE   | Verified every optional field (`lotes`, `parceiros`, `agenda`, `freshStats`, `positioningQuote`, `personaIntro`, `personaBullets`, `narrativa`, `escassez`, `checkoutUrl`, `creditosImagens`, partner `descricao`/`contato.whatsapp`/`contato.instagram`, `hero.eyebrow`, `hero.highlight`, `*.highlight`, `m.subtitulo`, `l.validade`) is truthy-guarded. No `TypeError` risk when JSON drops any optional. |
| Large datasets     | N/A    | Schema is bounded (max 10 modulos, 5 speakers, 9 FAQ, 6 categorias, 9 beneficios, 3 lotes, 2 turmas, 2 parceiros). No virtualization needed. |
| Permissions        | N/A    | No auth, no role-aware UI. Static marketing landing.                                                                                     |
| Input validation   | N/A    | No forms; no user input. Build-time zod schema is the only validator. WhatsApp URL helper centralized.                                  |
| Accessibility      | DONE   | One `<h1>` (Hero), one `<h2>` per section with `id`+`aria-labelledby`. Footer nav anchors verified against component ids: `topo`, `por-que-otb`, `publico`, `programa`, `turmas`, `modulos`, `boston-harvard`, `speakers`, `investimento`, `faq` — all present. Skip link `#conteudo-principal` lands on `<main tabindex="-1">`. Every icon-only/floating link has `aria-label`. `prefers-reduced-motion` globally honored in `global.css` (lines 115–128) plus scoped overrides in FAQ.astro + scroll-hint utility + new WhyOTB JS guard. No sticky header → WCAG 2.4.11 (focus not obscured) PASS. Hero scroll-cue anchor `#programa` reachable. |

## Deferred to later phases

- `typeset` (3/7): may reconsider line-length / `max-w-*` on long
  body copy to push toward 60–75ch optimal measure.
- `layout` (4/7): could revisit Investimento lote row's wrap
  behavior on the `sm` boundary if visual rhythm degrades.
- `adapt` (5/7): final responsive sweep — verify the new
  `flex-wrap` on lote price doesn't create double-row jitter at
  `420–639px` widths.
- `optimize` (6/7): image priority/preload audit for hero LCP.
- `polish` (7/7): focus-ring contrast verification on `bg-gold`
  CTAs (current ring is also gold — relies on offset).

## Maestro 6-gate self-check

1. Cardinal rules — PASS (no new hex; tokens only; transform/opacity
   preserved; Bun tooling; LF endings preserved per file edit semantics).
2. Astro static-only — PASS (no SSR/SPA introduced; scripts remain
   inline/`is:inline`; zero new client directive).
3. Content SSOT — PASS (no `.astro`/`.tsx` copy added; only utility
   classes + JS guards).
4. WhatsApp SSOT — PASS (untouched).
5. Motion contract — PASS (`transform`+`opacity` invariants intact;
   reduced-motion respected universally; new WhyOTB JS now also
   gates on `prefers-reduced-motion`).
6. Quality gates — PASS: `bunx astro check` 0/0/0;
   `bun run lint` (biome + oxlint) 0 warnings / 0 errors. Build
   not re-run (no dependency/config change; check+lint sufficient
   at phase gate per project convention).

## astro check result

PASS — 23 files: 0 errors, 0 warnings, 0 hints.

## Handoff hint to typeset (3/7)

Foundations now resilient to data extremes the zod schema permits.
Typeset can safely assume: (a) no text container will overflow on
narrow viewports regardless of `bio`/`pergunta`/`bullet` length;
(b) reveal animations always run-to-completion (no stuck-invisible
state); (c) decorative cursor-glow is now reduced-motion-aware.
Open observation for typeset: persona bullet `min-w-0 break-words`
allows mid-word break; verify Playfair Display doesn't show ugly
hyphenation orphans at `sm` breakpoint with longest 240-char bullet.
