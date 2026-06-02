---
name: debugger
description: Use for systematic bug diagnosis, failing gates, runtime errors, SEO regressions, content/schema issues, and Astro static-site verification for GPUS landings.
---

# Debugger — GPUS Astro landing

Root-cause debugging skill for the **GPUS static Astro landing**. This repo has no backend, database, auth, payments, tenant model, or server runtime; debug work must stay within Astro static generation, Content Collections, assets, SEO, accessibility, and browser evidence.

---

## Iron Law

1. **No fix without root cause.** Understand why before changing code.
2. **No “fixed” claim without fresh evidence.** Run the validation gate and cite results.
3. **No scope expansion during incident handling.** Log adjacent issues, fix them later.

---

## When to Use

- `bun run lint`, `bunx astro check`, or `bun run build` failures
- Runtime/static page regressions on `/` or any public route
- Broken anchors, missing assets, hydration/island issues, or visual regressions
- Content Collection/schema mismatches in `src/content.config.ts` + `${content.productJson}`
- SEO/canonical/sitemap/robots/OG/JSON-LD regressions
- Post-change audits before completion

For performance/Lighthouse campaigns, use `performance-optimization` after the debug gate is green.

---

## Pack Selector

| Pack | Scope | Browser evidence | Content/assets audit | Sub-agents |
|---|---|:-:|:-:|:-:|
| `frontend-debug` | UI, Astro component, CSS, hydration/island, browser behavior | YES | optional | 2–3 parallel |
| `content-debug` | Content Collections, `${content.productJson}`, WhatsApp prefix, regulated-health legal copy, missing assets | optional | YES | 1–2 parallel |
| `seo-debug` | canonical, sitemap, robots, OG/Twitter image, JSON-LD, redirects | optional | YES | 1–2 parallel |
| `systematic-audit` | Full static-site hardening sweep | YES | YES | 3–4 parallel |

**Pack selection logic:**
1. If input names a pack → use it.
2. Visual/UI/component symptom → `frontend-debug`.
3. Content/schema/asset/WhatsApp/legal symptom → `content-debug`.
4. SEO/canonical/route/sitemap/robots/social preview symptom → `seo-debug`.
5. Input says “audit” or scope is unclear → `systematic-audit`.
6. Ambiguous → ask one concise clarifying question only if evidence is unavailable.

---

## Live Docs Lookup

When debugging Astro, React, Tailwind, Biome, Oxlint, Vercel, or browser APIs, prefer official/current docs over memory. For internal questions, search the repo first.

---

## Phase Overview

- **Phase 0 — Pre-flight.** Capture branch/status when edits may follow. Run the relevant failing command or the validation gate baseline.
- **Phase 1 — Evidence.** Reproduce the symptom; for browser issues capture screenshot/snapshot; for content/SEO inspect generated `dist` output.
- **Phase 2 — Hypothesis.** Select one root-cause hypothesis with file/line evidence and counter-evidence.
- **Phase 3 — Minimal fix.** One targeted change at a time. Read target files first. Do not rewrite unrelated copy/design.
- **Phase 4 — Verification gate.** Run `bun run lint && bunx astro check && bun run build`.
- **Phase 5 — Static smoke.** Verify the affected output in `dist` (anchors, canonical, sitemap, images, no legacy references).
- **Phase 6 — Report.** State root cause, changed files, verification command/results, and remaining warnings.

Pack-specific execution flows: see `references/pack-guides.md`.

---

## Common Root Causes Catalog — GPUS Static

| Symptom | Root cause | Fix guidance |
|---|---|---|
| Anchor CTA does nothing | Target section missing on canonical `/` | Add/restore section or change CTA target; verify `dist/index.html` |
| Build succeeds but image 404s | Content JSON points to missing `public/**` asset | Add asset or update JSON path; run asset existence check |
| Duplicate route competes with `/` | Stale route indexed/rendered | Canonicalize to `/`, exclude from sitemap, keep stale route noindex/redirect fallback |
| OG image blank in social preview | `seo.ogImage` path missing or too small | Provide the default OG image under `public/og/` and verify absolute OG URL |
| `astro check` Zod/content error | JSON shape diverges from `src/content.config.ts` | Fix schema and JSON together; keep product copy in `${content.productJson}` |
| WhatsApp URL invalid | Message does not start with `${lead.whatsappGreeting}` or inline `wa.me` used | Use `src/lib/whatsapp.ts`; keep message prefix intact |
| Claim regulado (saúde estética) implica vínculo/endosso/certificação oficial | Copy implies affiliation/endorsement/certification/partnership | Reformular como contexto; ver PRODUCT.md § Guardrails |
| Hydration mismatch | Dynamic values differ SSR/client in island | Move dynamic client-only values to client effect or static data |
| Biome CRLF/format failure | Edited file line endings/indentation changed | Run targeted `bunx biome check <files> --write` |
| Legacy identity appears | Active docs/config/source still mention old project/product/domain | Move to archive or rewrite to the current canonical terms |

Project-specific rules also live in `.claude/CLAUDE.md`, `.claude/rules/stability.md`, `.claude/rules/astro.md`, and the project skills.

---

## Escalation Rule

- **1–2 failed fix attempts** → restart investigation with a fresh hypothesis.
- **3 failed attempts** → stop, summarize evidence, and ask for direction.

---

## NEVER Constraints

1. NEVER skip pre-flight/gate evidence before claiming completion.
2. NEVER add SSR, `ClientRouter`, `prerender = false`, or an adapter.
3. NEVER hardcode product copy in `.astro`/`.tsx` when it belongs in `${content.productJson}`.
4. NEVER inline `wa.me`; use `src/lib/whatsapp.ts`.
5. NEVER introduce off-product routes/products/CTAs/domains.
6. NEVER imply that a regulated-health (saúde estética) claim carries official affiliation, endorsement, certification, or partnership; see PRODUCT.md § Guardrails.
7. NEVER leave `console.log` or `debugger` statements in production code.
8. NEVER use non-Bun package managers.
9. NEVER delete protected/source files without explicit confirmation.

---

## References

| File | Content |
|---|---|
| `references/browser-setup.md` | Public static-site browser evidence |
| `references/subagent-templates.md` | GPUS-focused prompt templates for evidence/code/content checks |
| `references/pack-guides.md` | Pack-specific execution flows |
| `references/methodology.md` | Root-cause method and report templates |
| `references/verification.md` | Static-site verification and regression prevention |
| `references/patterns.md` | Astro/content/SEO/a11y debugging checklists |
| `references/consolidated-domain-rules.md` | GPUS static-site domain constraints |

---

## Configuration

Use `.claude/config.json` for project metadata and tooling. Canonical validation gate: `bun run lint && bunx astro check && bun run build`.
