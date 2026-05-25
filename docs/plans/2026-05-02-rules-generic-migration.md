# Rules Generic Migration — Audit

**Date:** 2026-05-02
**Goal:** Make `.claude/rules/*` portable to any project. Astro-specific → `astro` skill. Project-specific → `grupo-us` / `gpus-theme` skill or `.claude/CLAUDE.md`.

Legend:
- **U** — Universal (stays in generic rule)
- **A** — Astro-specific (migrates to `.claude/skills/astro/`)
- **P** — Project-specific (migrates to `grupo-us` / `gpus-theme` skill, or stays in `.claude/CLAUDE.md` cardinals)
- **D** — Drop entirely (already covered elsewhere or framework-known)

---

## frontend.md (165 hits)

| Section | Disposition | Destination |
|---|---|---|
| Render mode table (`/sobre`, `/curso-auriculo`, etc.) | P | CLAUDE.md routing matrix already names routes — DROP from rule |
| "Static is mandatory (cardinal #4)" | A | `astro/SKILL.md` Common pitfalls + cardinal stays in CLAUDE.md |
| Component placement (`src/components/landing/`, `home/`, `about/`) | P | DROP (project structure) |
| Default to `.astro`, promote to `.tsx` when needed | A | `astro/SKILL.md` |
| Hydration directives table (`client:visible`, `client:idle`, `client:load`) | A | `astro/SKILL.md` (already there) — extend with "WhatsAppFloatingButton justification" pattern |
| Styling: `bg-background`, `text-foreground` semantic tokens | U (concept) + P (token names) | Concept stays as "Use semantic tokens; never inline hex" universal; specific tokens → `gpus-theme` |
| "No hardcoded hex outside `@theme`" | U | DESIGN.md universal |
| Custom utilities `.bg-mesh`, `.glass-card`, `.gold-glow` | P | `gpus-theme` (already there) |
| Lucide React only + named imports | U | DESIGN.md/frontend.md "ONE icon library, named imports" |
| Content Collections SSOT, schema, Zod | A | `astro/references/content-collections.md` (extend) |
| Product schema fields | P | DROP (in `src/content.config.ts` directly) |
| Conversion section order (LandingHero → ... → MobileCTABar) | P | DROP (project pattern) |
| Home journey order | P | already in `grupo-us` skill |
| WhatsApp SDR Laura SSOT (`whatsapp.ts`, `WHATSAPP_SDR_E164`, "Olá, Laura!", `isWhatsAppDestination`) | P | `grupo-us/references/whatsapp-ssot.md` (new) |
| External redirect tri-sync (`externalSiteUrl` + `redirects` + sitemap `filter`) | A (Astro mechanism) | `astro/references/gpus-overlay.md` (new) |
| Google Fonts preconnect | A | `astro/references/performance.md` (already there) |
| Railway deploy notes | P | DROP (in `.claude/config.json::tooling.deployer`) |
| Forms: label-for, color+icon+text errors | U | frontend.md universal |
| Performance: hoist statics, no >50KB libs | U | frontend.md universal |
| Images: `<Image>` + `loading=eager+fetchpriority=high` above-fold | A (Astro syntax) + U (priority concept) | astro skill carries `<Image>` syntax; rule keeps "above-fold eager+high, below-fold lazy+low, explicit dimensions" |
| `NeonStory` image lazy/low priority | P | DROP (specific component reference) |
| Skip link, `<main id="conteudo-principal">` | A (Layout.astro contract) + U (skip link concept) | astro overlay carries id; rule keeps "skip link first focusable, target main with tabindex=-1" |
| `prefers-reduced-motion` block | U | DESIGN.md universal |
| `[data-reveal]` IntersectionObserver + `<noscript>` fallback | A | `astro/references/gpus-overlay.md` |
| FAQ accordion CSS grid `0fr/1fr` | U | DESIGN.md universal (cross-framework pattern) |
| Focus ring `outline 2px solid #d4af37` | U (focus ring concept) + P (color hex) | DESIGN.md "Focus ring 2px+offset, project token color" |
| Headings: one h1, semantic landmarks | U | frontend.md universal |
| ARIA labels on icon-only buttons (with "Laura" specific) | U + P | Universal: "icon-only buttons require aria-label"; Laura specifically → `grupo-us` |
| Color contrast ratios with specific hex | U (ratios) + P (specific values) | DESIGN.md keeps WCAG ratios; specific token contrasts → `gpus-theme` |
| Anchors and buttons (`href="#"` forbidden) | U | frontend.md universal |
| Smoke test before merge (Tab → skip link, FAQ Enter, etc.) | U | frontend.md / stability.md universal |
| Negative constraints (no `npm`, no `cmd /c`, no SPA, no client:load) | mix | Bun/cmd → DROP (in `.claude/config.json`); SPA/`client:load` → `astro/SKILL.md`; rest universal in `frontend.md` |

---

## DESIGN.md (114 hits)

| Section | Disposition | Destination |
|---|---|---|
| North Star (Navy/Gold/Playfair/Inter/glassmorphism) | P | `gpus-theme` (already there) |
| Marca anchors (Navy `#1a1a2e`, Gold `#d4af37`, etc.) | P | `gpus-theme` (already there) |
| Anti-traps table (Sales-loud, Stock-clinical, Token-drift) | P (project anti-traps) | `gpus-theme` |
| Template test (Stripe minimalism + Playfair authority) | P | `gpus-theme` |
| Color system tables (HSL semantic tokens with specific values) | P | `gpus-theme` (already canonical) |
| Token usage rules (1-8) | mix | Rules 1-3, 6-8 universal (contrast minimums, semantic tokens, color never sole indicator); rule 4-5 P (specific to navy/gold utilities) |
| Typography role table | mix | Roles + universal rules (sentence case, tabular-nums, ratio ≥2x, min 12px, no `#000`/`#fff` body) → DESIGN.md universal; specific font names → `gpus-theme` |
| Components: Buttons primary/secondary/ghost/whatsapp | mix | Hierarchy concept → DESIGN.md; `bg-gold`/`bg-whatsapp` specifics → `gpus-theme` + `grupo-us` whatsapp |
| Cards (Standard/Glass/Hover lift) | P | `gpus-theme` |
| Inputs spec | U | DESIGN.md universal |
| Badges/pills | mix | Rounded-full + caps + tracking concept universal; specific bg/text P |
| Navigation header/footer | P | DROP (project layout) |
| FAQ accordion CSS grid `0fr/1fr` | U | DESIGN.md universal |
| Mobile CTA bar | P | DROP |
| Layout (container, spacing, asymmetry, grid patterns) | mix | Concept universal (8px grid, asymmetric over 50/50, breakpoint patterns); specific Tailwind classes P |
| Border radius scale | U | DESIGN.md universal |
| Depth & elevation table | P | `gpus-theme` (depth via glass + gold-glow) |
| Iconography: Lucide only, sizes, aria | U | DESIGN.md "ONE icon library, named imports, aria-label icon-only, aria-hidden decorative" |
| Motion section | U | DESIGN.md universal (transform/opacity only, prefers-reduced-motion, no transition all, accordion grid pattern) |
| Imagery rules (above/below fold priority, dimensions, alt) | U | DESIGN.md universal |
| Custom utilities table (`.gold-glow`, `.glass-card`) | P | `gpus-theme` |
| Do's and Don'ts | mix | Universal rows stay; project-specific (Lucide, Playfair, navy/gold) → respective skills |
| Responsive breakpoints | U | DESIGN.md universal |
| A11y summary | U | DESIGN.md universal |

---

## stability.md (139 hits)

| Section | Disposition | Destination |
|---|---|---|
| Core checklist A–L | U mostly | stability.md universal — drop hex examples in rule C |
| Static-site invariants (no SSR / no SPA / no DB / Bun-only / MPA) | mix | "no SSR if static" / "no SPA if MPA" → universal stability concept; Bun-only → DROP (in `.claude/config.json`); `src/pages/api/` → A |
| Performance gates table | U (concept) + P (route names) | stability.md universal CWV thresholds; route list → DROP |
| Smoke test: external redirect | A | `astro/references/gpus-overlay.md` |
| Smoke test: hardcoded hex grep | U | stability.md universal |
| Smoke test: Lucide-only enforcement | mix | "icon-mix grep" universal; Lucide name P |
| Smoke test: static-only render mode (`prerender = false`, `ClientRouter`) | A | `astro/SKILL.md` Common pitfalls |
| Smoke test: hydration discipline (`client:load` count) | A | `astro/SKILL.md` |
| Smoke test: WhatsApp URL leak | P | `grupo-us/whatsapp-ssot.md` |
| Smoke test: "Olá, Laura!" prefix | P | `grupo-us/whatsapp-ssot.md` |
| Smoke test: sitemap excludes redirect | A | `astro/references/gpus-overlay.md` |
| Smoke test: Initial JS budget | U | stability.md universal |
| Lighthouse routes | P (route names) | DROP route names; concept (run on critical pages) universal |
| A11y manual smoke (Tab, FAQ, mobile menu, JS off, prefers-reduced-motion) | U | stability.md universal |
| Anti-patterns: Render mode | A | `astro/SKILL.md` |
| Anti-patterns: Hydration | A | `astro/SKILL.md` |
| Anti-patterns: Content drift | mix | "no hardcoded copy" universal; redirect tri-sync → `astro/gpus-overlay` |
| Anti-patterns: WhatsApp/Laura | P | `grupo-us` |
| Anti-patterns: Design (hex outside `@theme`, mixing icons, layout-property animation) | mix | hex + icon mix + layout animation universal; `bg-[#1a1a2e]` example P |
| Anti-patterns: Accessibility | U | stability.md universal |
| Anti-patterns: Tooling (`npm`/`cmd`/`--no-verify`) | mix | `--no-verify` universal; `bun`/`cmd` → DROP (in config) |
| Common bug sources (`bg-[#25D366]`, FAQ Framer regression, sitemap drift) | mix | concept universal; specific examples P/A |
| Debug triage: `[data-reveal]` regression | A | `astro/references/gpus-overlay.md` |
| Debug triage: FAQ height-vs-grid | U (cross-framework) | stability.md universal |
| Debug triage: External redirect drift | A | `astro/references/gpus-overlay.md` |
| Debug triage: WhatsApp URL drift | P | `grupo-us` |
| Debug triage: hydration / island LCP | A | `astro/SKILL.md` |
| Quick triage matrix | mix | universal symptoms stay; Astro/project ones move |
| Verification matrix | mix | concept universal; specific commands → `${tooling.*}` placeholders |
| Final gates | universal with placeholders | `${tooling.packageManager} run lint && check && build` |
| Escalation triggers | U | stability.md universal |

---

## seo.md (32 hits)

| Section | Disposition | Destination |
|---|---|---|
| Locale `pt-BR` | P (locale value) | rule keeps "set `<html lang>` to project locale"; specific locale → `.claude/config.json::project.locale` |
| Routes table | P | DROP (project routes) |
| Double-source rule (page vs redirect) | A | `astro/references/gpus-overlay.md` |
| Sitemap `@astrojs/sitemap` filter | A | `astro/references/gpus-overlay.md` |
| robots.txt | U | seo.md universal template |
| OG/Twitter cards | U | seo.md universal |
| JSON-LD Organization | mix | shape universal; specific values (`grupous.com.br`, `+55-62-9470-5081`, instagram) P → DROP (live in `Layout.astro`) |
| BreadcrumbList | U | seo.md universal |
| CWV thresholds | U | seo.md universal |
| AI citation (description ≥120, tagline ≤90) | U | seo.md universal |
| Brand voice anchors ("Nós iluminamos", "Olhar de dono") | P | `grupo-us` (already there) |

---

## README.md (10 hits)

| Section | Disposition | Destination |
|---|---|---|
| "Project-specific authoritative rules for Grupo US — Site Institucional" | P | strip — rule README universal |
| Files table | U | keep but generic descriptors |
| Project conventions reflected (Astro 6, Bun-only, Lucide, Content Collections SSOT, WhatsApp SSOT, redirect tri-sync, GPUS Theme, Playfair, Railway) | P | DROP — those describe gpus-site, not generic rules |
| How rules loaded | U | keep generic |

---

## Migration matrix summary

**To `.claude/skills/astro/SKILL.md`:**
- Hydration directive table (already there, extend with WhatsAppFloatingButton justification)
- Common pitfalls: `client:load` creep, `<Image>` priority discipline, FAQ grid pattern, hero island LCP, `prerender = false` forbidden, `ClientRouter`/`astro:after-swap`/SSR adapter forbidden

**New `.claude/skills/astro/references/gpus-overlay.md`:**
- External redirect tri-sync (`externalSiteUrl` ↔ `astro.config.mjs::redirects` ↔ sitemap `filter()`)
- WhatsAppFloatingButton `client:load` justification (only `client:load` in repo)
- Layout.astro contracts (skip link first, `<main id="conteudo-principal" tabindex="-1">`, `<noscript>` reveal fallback, `[data-reveal]` IntersectionObserver, Google Fonts preconnect)
- Render mode invariants (no SSR adapter, no `prerender = false`, no SPA / `ClientRouter`)
- Sitemap filter excludes redirect routes
- Site smoke commands (`bun run check:external-urls`, etc.)

**Extend `.claude/skills/astro/references/content-collections.md`:**
- "no hardcoded copy in components — always `getCollection()`/`getEntry()`" SSOT pattern
- Schema validation gate (`bunx astro check` re-validates Zod on JSON edits)
- React island data passing (`map(e => e.data)` already covered)

**Extend `.claude/skills/astro/references/performance.md`:**
- (already substantial) — confirm `client:idle` for hero animations, preconnect Google Fonts present (yes), `<Image>` priority discipline (yes)

**New `.claude/skills/grupo-us/references/whatsapp-ssot.md`:**
- `WHATSAPP_SDR_E164` value
- `whatsappUrlWithText(message)` SSOT pattern
- `WHATSAPP_DEFAULT_SITE_MESSAGE` constant
- `isWhatsAppDestination(url)` dedup pattern
- "Olá, Laura!" prefix convention on every product `cta.whatsappMessage`
- `aria-label` includes "Laura" on every WhatsApp button
- WhatsApp URL leak grep + drift fix
- Forbidden: inline `wa.me/...` URLs

**Stay in `.claude/CLAUDE.md` (always-loaded tier 1):**
- 8 cardinals (some referencing skills for detail)
- Routing matrix updated to load (generic rule + relevant skill)
- New section: "Tech-stack skill auto-trigger"

**Generic `.claude/rules/frontend.md` keeps:**
- Component placement principle (layout/sections/shared/page-specific concept, not paths)
- Hydration philosophy (default static, opt-in interactive)
- Content data SSOT (collections > hardcoded copy, schema-validated) — concept, no Astro syntax
- Forms (label-for, required marker, color+icon+text errors)
- External surfaces baseline (HTTPS only, `noopener noreferrer` on `_blank`)
- A11y plumbing (skip link first, semantic landmarks, focus-visible, `prefers-reduced-motion`, native `<details>` over height tween)
- Performance (priority discipline, explicit dimensions, hoist statics, no >50KB libs)
- Negative constraints universal: no `href="#"`, no emoji-as-icons, no mixing icon libraries, no animating layout props, no `transition: all`
- Closing: "Tech-stack patterns: load `<framework>` skill"

**Generic `.claude/rules/DESIGN.md` keeps:**
- Color: semantic tokens > hex; WCAG AA minimums; color never sole status indicator
- Typography: one heading + one body family; sentence case; UPPERCASE only badges with letter-spacing; `tabular-nums` on numerics; min 12px; ratio ≥2x heading-to-body; never `#000`/`#fff` body on dark
- Buttons: primary/secondary/ghost hierarchy; 44×44 touch target; focus ring 2px+offset; `aria-label` icon-only
- Layout: 8px grid, max-width container, asymmetric over 50/50, breakpoints
- Motion: `prefers-reduced-motion`, transform/opacity only, never width/height/top/left/padding/margin, no `transition: all`, accordion CSS grid `0fr/1fr`
- Iconography: ONE library, named imports, `aria-hidden` decorative, `aria-label` icon-only
- Imagery: above-fold eager+high, below-fold lazy+low, explicit dimensions, alt
- Closing: "Project tokens / brand voice: load `<brand>` skill"

**Generic `.claude/rules/stability.md` keeps:**
- A–L checklist (drop hex examples)
- Static-site invariants conceptual (no SSR if static, no SPA if MPA, no DB if presentation-only)
- Performance gates with `${tooling.*}` placeholders + universal CWV
- Smoke template categories (forbidden hex grep, icon-mix grep, hydration audit, sitemap correctness, JS budget, a11y manual)
- Anti-patterns universal (render mode concept, hydration concept, content drift, design — hex/icons/animation, accessibility, tooling — `--no-verify`)
- Debug triage cross-framework (FAQ height-vs-grid, hydration LCP regression)
- Verification matrix with `${tooling.*}` placeholders
- Final gates: `${tooling.packageManager} run lint && check && build`
- Escalation triggers
- Closing: "Stack-specific smoke commands: load `<stack>` skill"

**Generic `.claude/rules/seo.md` keeps:**
- Locale: every public page sets `<html lang="...">`
- Routes table: concept (canonical / redirect / noindex 404)
- Sitemap: filter excludes redirect-only paths
- robots.txt template generic
- OG/Twitter cards: 1200×630, `og:type`, `twitter:card=summary_large_image`
- JSON-LD: Organization (every page), BreadcrumbList (deep), generic shape
- CWV: LCP < 2.5s, CLS = 0, INP < 100ms, JS < 50KB
- AI citation: description ≥120, tagline ≤90, server-rendered meta
- Closing: "Stack-specific SEO: load `<stack>` skill"

**Generic `.claude/rules/README.md` rewrite:**
- Drop "Grupo US" / Astro / Bun / Tailwind / Lucide / Navy/Gold project conventions
- Replace with: "Universal do/don't tier-2 rules. Project-specific values resolved via `.claude/config.json` + tech-stack skills + project skills."
- Generic file descriptors only

---

## Sprint dependencies

Sprint 2 (astro skill expansion) must complete before Sprint 3 (rules rewrite) — rule rewrites cite skill paths.
Sprint 4 (CLAUDE.md routing) depends on Sprint 3 (rules know where they point).
Sprint 5 (validation) depends on all prior.
