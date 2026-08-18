# OTB USA — Learnings log

> Append-only chronological project decisions. New entries on top.

---

### [2026-08-18] A content-driven hero turns a font swap into CLS

**Problem:** The v2 hero grew past the fold on a phone (1368px against an 823px viewport), so its height
became content-driven. When the webfonts landed, the text reflowed by ~48px and dragged the full-bleed
photograph behind it — CLS went from 0 to 0.06 on mobile. Astro's Fonts API already emits metric-matched
fallbacks (`size-adjust`, `ascent-override`), which hold line *height* stable but not line *count*:
per-glyph advances still differ, so a wrapped line can appear or disappear on swap.

**Solution:** Preload both families in `Layout.astro` (Inter, the body face of everything above the fold,
was previously swap-only), and pin the countdown row with `flex-nowrap` plus `ch`-sized numeric cells so
it can never reflow on its own. CLS back to 0; FCP improved 1.5s → 1.3s; LCP unchanged within noise.

**Pattern:** A section whose height is content-driven and which sits behind a full-bleed plate is a CLS
amplifier. Either keep the section inside a fixed height (`min-h` that actually contains the content) or
remove the font swap. Measure before assuming the fallback metrics cover it.

**Validation:** `scratchpad/probe.mjs` — a CDP probe that renders the built page under Lighthouse-like
throttling and records `layout-shift` entries with their sources, plus hero geometry over time. Lighthouse
mobile: accessibility 92 → 100, CLS 0.06 → 0.

---

### [2026-08-18] One scroll listener, and information is not decoration

**Problem:** Four components each opened their own `scroll` listener with their own rAF token
(`ScrollProgress`, `StickyCta`, the parallax in `motion.ts`, and the header's observer), which is four
layout passes per frame and no shared notion of scroll state.

**Solution:** `src/scripts/motion.ts` now owns a single passive `scroll` listener that drains registered
tasks inside one frame, plus a `resize`/`load` re-measure. Components declare attributes
(`data-scroll-progress`, `data-sticky-cta`, `data-float-wa`, `data-hero-fade`, `data-hpin`, `data-cd`)
instead of scripting.

**Pattern:** Under `prefers-reduced-motion: reduce` the runtime disables everything decorative but keeps
what carries information — reading progress, the sticky conversion bar and the countdown. Switching those
off would remove content, not motion. Every other behaviour degrades to a correct static state: the
marquee is a wrapped row, the pinned rail is a snap carousel, reveals are visible.

**Validation:** Probe at 412×823 and 1440×900, with and without reduced motion: no horizontal overflow,
countdown alive in both modes, rail pinned only ≥900px.

---

### [2026-05-25] OTB USA-only repository context

**Problem:** The repository inherited agent docs, skills, routes and historical notes from non-OTB contexts, which made agents route work through unrelated products and stale deployment assumptions.

**Solution:** Re-scoped root docs and `.claude/` to OTB USA. Project skills are now `otb-usa` and `otb-theme`; Astro overlay is `otb-usa-overlay.md`; evolution profile is `otb-profile.md`; canonical project metadata points to OTB USA.

**Pattern:** Grupo US remains parent brand context. Product work in this repo must stay OTB-only: no unrelated routes, CTAs, product journeys or examples.

**Validation:** Search residual terms, then run `bun run lint && bunx astro check && bun run build`.
