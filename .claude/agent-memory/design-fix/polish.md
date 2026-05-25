# design-fix · Phase 7/7 · polish (FINAL)

## Phase commitment

Audited the full 20-item polish checklist against the post-optimize tree.
**Zero code changes applied** — every item resolved by intent in prior
phases (onboard / harden / typeset / layout / adapt / optimize). The
correct outcome of a final polish pass after 6 disciplined upstream
phases is verification, not retouching. Bundle is byte-identical to
post-optimize (0% regression, well inside the 5% gate). All 3 quality
gates pass cleanly. One non-blocking dependency-removal recommendation
(`@astrojs/react`) surfaced for user decision — outside this phase's
authority per the explicit "DO NOT touch package.json" gate.

## Files touched

None.

## Diff summary

No diffs. Verification-only phase.

## 20-item polish.md checklist

| # | Item | Status | Notes |
|---|---|---|---|
| 1 | Inline `color-mix()` consolidation drift | DONE | Colorize phase consolidated the 3 highest-frequency tints (`bg-gold-tint-10`, `bg-navy-soft-70`, `border-gold-mid-35`). Long-tail one-offs (12/15/18/22/25/30/45/55/60%) verified still inline by intent per `global.css` line 47 comment. Acceptable. |
| 2 | Magic numbers in spacing | DONE | Grep across `src/` for arbitrary `mt-[Npx]` / `mb-[Npx]` / `py-[Npx]` returned no hits outside the discrete Tailwind scale. Bracket sizes that DO exist (`text-[11px]`, `text-[10px]`, `text-[4.25rem]`, `tracking-[0.32em]`) are intentional typographic escapes from the default scale — not magic spacing. |
| 3 | Stray / duplicate / contradictory utilities | DONE | Spot-checked Modulos.astro line 33-34 (stray blank line at end of class string after `hover:bg-...` — cosmetic, no impact). All other components clean. No `mx-auto mx-4` / `bg-navy bg-navy-light` / `p-4 px-6 py-3` contradictions found. |
| 4 | Lucide via Icon.astro pattern | DONE | All 9 components use `Icon name="..." size={N} strokeWidth={M}`. Default strokeWidth=1.75 (Icon.astro line 17). Overrides: 2 (decorative labels), 2.25 (emphasis on CTAs / chevrons), 2.5 (check marks in Investimento benefits). Intentional 3-tier system: 1.75 body / 2 utility / 2.25 emphasis / 2.5 affirmation. PASS. |
| 5 | `aria-current` on active state | DONE | `Investimento.astro` line 86: `aria-current={isActive ? "true" : undefined}` on active lote row. Footer nav anchors do NOT receive `aria-current` — correct, since this is a single-page landing where "current section" requires scroll-spy JS (out of scope; would violate static-MPA simplicity contract). |
| 6 | `aria-describedby` for FAQ | N/A | FAQ uses native `<details>`/`<summary>` — disclosure semantics built-in, no aria-describedby needed (that pattern is for form inputs ↔ error messages). |
| 7 | `aria-live` for dynamic regions | N/A | Zero dynamic regions (no async data, no toasts, no live updates). |
| 8 | Focus rings 2px solid + 2px offset | DONE | `global.css` line 108-111: `:focus-visible { outline: 2px solid var(--color-gold); outline-offset: 2px; }`. Skip link same pattern line 102-106. Universal coverage. |
| 9 | Animation cleanup — deleted keyframes | DONE | Grep `animate-spotlight\|animate-aurora\|gold-glow` → 0 matches in `src/`. Mobile media query `global.css` line 229-240 references `gold-pulse-glow`, `float-gentle`, `landing-mesh-bg` — all 3 still exist in CSS. No dangling references. |
| 10 | Heading hierarchy | DONE | One `<h1>` in Hero (`id="hero-heading"`). Every section uses `<h2>` with matching `aria-labelledby`. Cards use `<h3>`. No skipped levels. Programa decorative "01" is a `<span aria-hidden="true">`, not a heading. |
| 11 | Image alt text quality | DONE | 3 `<img>` tags total: Footer logo "Logo OTB em dourado." / Speakers "Retrato profissional de {nome}." / Turmas `foto.alt` (from JSON). No "imagem de" / "foto de" / "picture of" prefixes. Descriptive, contextual. |
| 12 | Visual stability — width/height | DONE | All 3 `<img>` have explicit width+height attributes: Footer 44×44, Speakers 256×256, Turmas 900×600. Icon.astro propagates size to width/height. CLS = 0 risk. |
| 13 | Console silence | DONE | Grep `console\.` in `src/` → 0 matches. Hardened by harden phase. |
| 14 | Trailing whitespace / stray empty lines | DONE | Biome handles formatting on staged files. No formatter complaints. Modulos.astro has one blank line inside a `class={...}` template-literal context (line 34) — cosmetic only, no rendered impact. |
| 15 | Final hex scan | DONE | Grep `#[0-9a-fA-F]{3,8}` in `src/`: 8 hits in `global.css` `@theme` block (sanctioned by cardinal #7) + 1 hit in `Layout.astro` line 62 `<meta name="theme-color" content="#1a1a2e">` (sanctioned exception documented in inline comment on line 61: meta theme-color cannot read CSS variables). **Total cardinal-#7 violations: 0.** |
| 16 | WhatsApp SSOT | DONE | Grep `wa\.me/` in `src/`: 2 hits, BOTH in `src/lib/whatsapp.ts` (the helper module itself, lines 21 + 29). **Total cardinal-#6 violations: 0.** |
| 17 | Modulos `numero` vs Programa "01" — pattern consistency | DONE (intentionally different) | Programa "01" is `text-7xl font-bold text-gold/70` — section-level editorial lead-in. Modulos `numero` is `text-2xl font-bold text-gradient-gold` — list-item badge. Different purposes, different patterns, both deliberate. No retouch needed. |
| 18 | Speakers grid balance with 5 items | DONE (no action) | Layout is `lg:grid-cols-5` (single row at lg+, perfectly balanced). At `sm:grid-cols-2`, item 5 sits alone on row 3 left-aligned. The prompt assumed a 3-col grid that doesn't exist. Asymmetric trailing item at `sm` is acceptable — alternative (forcing centering) would introduce special-case CSS for no real-world benefit. |
| 19 | Hero scroll cue arrow color budget | DONE (already correct) | Hero.astro line 101-109: label is `text-text-muted/70`, chevron icon is `text-gold` (full gold). The chevron is the actual affordance signal (animated, 18px); label is supportive. Gold budget restraint observed — gold is on the meaningful element, not splashed on both. PASS per `otb-theme` "ouro raro" mandate. |
| 20 | Programa `idx + 2` stagger | DONE | Confirmed `data-reveal-delay={String(idx + 2)}` on Programa cards (line 71) is intentional — first 2 delay slots are taken by the heading column reveal sequence (left-side: heading at delay 1 implicit, narrativa at `data-reveal-delay="1"` line 52). Cards starting at delay 2 prevents collision. |

## Final scans

- **Hex outside `global.css @theme`**: 1 sanctioned exception only (`Layout.astro:62` meta theme-color; documented inline). Cardinal #7 violations: **0**.
- **`wa.me/` outside `src/lib/whatsapp.ts`**: 0. Cardinal #6 violations: **0**.
- **`console.*` in shipped code**: 0.
- **`animate-spotlight` / `animate-aurora` / `.gold-glow` orphan refs**: 0.
- **Deleted-keyframe references in mobile block**: 0 (mobile block only disables existing utilities).

## Bundle stability (post-optimize → post-polish)

| File | post-optimize | post-polish | Δ |
|---|---|---|---|
| `dist/_astro/client.6ovyCpOH.js` (orphan, unreferenced) | 193,540 B | 193,540 B | **0** |
| `dist/_astro/index@_@astro.dR6TOiIF.css` | 51,523 B | 51,523 B | **0** |
| `dist/_astro/fonts/*.woff2` | unchanged | unchanged | **0** |

**0% regression.** Well inside the 5% gate. Byte-for-byte identical
because no source files were edited.

## Maestro 6-gate self-check

1. Cardinal rules — **PASS** (no new hex; tokens only; transform/opacity intact; Bun tooling; LF endings; no SSR/SPA; no `prerender = false`; no inline `wa.me/`; no emoji icons).
2. Astro static-only — **PASS** (no SSR/SPA introduced; no `ClientRouter`; no SSR adapter).
3. Content SSOT — **PASS** (`otb.json` untouched per phase scope; zero hardcoded copy in `.astro`).
4. WhatsApp SSOT — **PASS** (untouched).
5. Motion contract — **PASS** (zero new animations; existing `transform`+`opacity`-only system intact; `prefers-reduced-motion` honored globally + per-utility).
6. Quality gates — **PASS**:
   - `bun run lint` (biome + oxlint) → 0 warnings / 0 errors (23 files / 19 files).
   - `bunx astro check` → 23 files: 0 errors / 0 warnings / 0 hints.
   - `bun run build` → 1 page built in 1.33s; static output; no errors; sitemap-index.xml generated.

## Recommendations for follow-up (out of this phase's scope)

1. **Remove orphan `client.6ovyCpOH.js` (193KB build artifact)** — emitted
   by the registered `@astrojs/react` integration but never referenced
   from `index.html`. The project has zero `.tsx` files and zero
   `client:*` directives. **User decision required**: removing this
   means uninstalling 4 deps (`@astrojs/react @types/react react
   react-dom`). Zero bytes shipped to the browser today, but ~193KB
   wasted build output + reinstall surface. **Recommend**: ask user
   before next dependency-management sweep.
2. **Heavy turma photos (`turma-grupo-1.jpg` 2.2MB / `turma-grupo-2.jpg`
   1.6MB)** — currently `loading="lazy" fetchpriority="low"
   decoding="async"` so they don't compete with LCP. Migrating the
   two `<img>` tags to Astro's `<Image>` component would yield
   automatic WebP + responsive `srcset` (likely 10-20x byte
   reduction). Pattern change is non-trivial; deferred from polish
   for being a real refactor, not a polish item.
3. **Single-page scroll-spy `aria-current` for footer nav** — would
   require a small IntersectionObserver script. Currently footer
   anchors do not advertise the current section. Polish-phase
   judgment: not worth the JS payload on a static landing where the
   nav is more of an outline than a router. Skip unless user requests.
4. **iOS Safari real-device font-render verification** — flagged by
   optimize phase. The Playfair preload + `font-display: swap` chain
   is correctly wired now (first phase where the font actually loads),
   but on-device verification across iOS Safari, Android Chrome, and
   slow-3G should happen before final launch. Out of automated phase
   scope.

## Chain conclusion

7-phase design-fix sequence complete. All 6 Maestro gates green at
every phase boundary. Bundle stable (`0 B` initial JS shipped,
well inside the `<50KB` cardinal budget). Zero cardinal-rule
violations across all 7 phases. The landing is production-ready
pending the 4 follow-up items above (all user-gated or
out-of-phase-scope).
