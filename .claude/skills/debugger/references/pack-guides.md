# Pack Execution Guides — GPUS Astro landing

Detailed execution flows for the static Astro debug packs.

---

## `frontend-debug`

**Scope:** Astro components, React islands, CSS, hydration, accessibility, visual/interaction regressions.

**Execution flow:**
1. Pre-flight: `git --no-pager status --short` and reproduce symptom.
2. Capture baseline evidence when browser-visible: screenshot/snapshot/viewport notes.
3. Launch Code Archaeologist + Regression Hunter if the issue spans multiple files.
4. Run or inspect the specific failing command/output.
5. Select one root-cause hypothesis.
6. Apply the smallest targeted fix.
7. Run `bun run lint && bunx astro check && bun run build`.
8. Browser/static smoke: verify affected route/anchor/interaction in `dist` or local preview.
9. Report changed files, evidence, warnings, and remaining risks.

**Key rules:**
- Prefer static Astro and CSS before React islands.
- Prefer `transform` + `opacity` when equivalent; honor `prefers-reduced-motion`.
- Do not add hardcoded hex in components; use tokens.
- Do not add product copy in components when it belongs in `${content.productJson}`.

---

## `content-debug`

**Scope:** `${content.productJson}`, `src/content.config.ts`, WhatsApp CTA, regulated-health legal copy, referenced assets.

**Execution flow:**
1. Read `src/content.config.ts` and the relevant `${content.productJson}` fields.
2. Trace the consuming component/page.
3. Check for schema mismatch, missing field, missing asset, invalid URL, or WhatsApp prefix violation.
4. Apply a minimal schema+JSON or asset fix.
5. Run the validation gate.
6. Smoke generated `dist` for the affected text/asset/canonical URL.

**Key rules:**
- `${content.productJson}` is product/copy SSOT.
- WhatsApp messages must start with `${lead.whatsappGreeting}`.
- Regulated-health claims stay descriptive: never imply official affiliation, endorsement, certification, or partnership (PRODUCT.md § Guardrails).
- Dates, price, and legal claims require stakeholder confirmation if changed.

**Common patterns:**
- Build/check error on collection → JSON shape drift from schema.
- 404 asset → JSON points to a missing `public/**` path.
- CTA points outside helper → inline `wa.me` or wrong message prefix.

---

## `seo-debug`

**Scope:** `astro.config.mjs`, `src/layouts/Layout.astro`, `src/pages/*.astro`, `public/robots.txt`, OG/Twitter image, sitemap, canonical URL.

**Execution flow:**
1. Confirm canonical domain from `.claude/config.json`: `${project.productionUrl}`.
2. Inspect `astro.config.mjs` `site`, redirects, and sitemap filter.
3. Inspect `Layout.astro` canonical/OG/JSON-LD generation.
4. Build and inspect `dist/index.html`, `dist/sitemap-0.xml`, `dist/sitemap-index.xml`, and `dist/robots.txt`.
5. Fix only the mismatch.
6. Rerun the validation gate and targeted grep smoke.

**Key rules:**
- `/` is canonical.
- Any stale/compatibility route is noindex/redirect fallback and excluded from sitemap.
- OG images must exist under `public/**` and resolve as absolute URLs in generated HTML.
- Do not reintroduce legacy domains.

---

## `systematic-audit`

**Scope:** Full static-site hardening sweep after a set of changes.

**Execution flow:**
1. Pre-flight: branch/status + current diff summary.
2. Inventory first, no fixes:
   - Evidence Collector: browser/static output evidence.
   - Code Archaeologist: changed files and dependency chain.
   - Content State Inspector: schema, JSON, assets, WhatsApp/legal.
   - Regression Hunter: known GPUS static anti-patterns.
3. Classify findings as P0/P1/P2/P3.
4. Fix P0/P1 one at a time; do not batch unrelated hypotheses.
5. Run `bun run lint && bunx astro check && bun run build`.
6. Targeted smoke:
   - no active legacy references outside archives/dist;
   - sitemap includes only canonical URLs;
   - referenced content assets exist;
   - no inline `wa.me` outside `src/lib/whatsapp.ts`.
7. Report remaining P2/P3 items separately.

**Key rules:**
- Never fix during inventory unless the user explicitly asked for direct implementation.
- Keep changes surgical and on-product only.
- Do not alter production/deploy config without explicit confirmation.
