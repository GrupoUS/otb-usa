# OTB USA — Learnings log

> Append-only chronological project decisions. New entries on top.

---

### [2026-05-25] OTB USA-only repository context

**Problem:** The repository inherited agent docs, skills, routes and historical notes from non-OTB contexts, which made agents route work through unrelated products and stale deployment assumptions.

**Solution:** Re-scoped root docs and `.claude/` to OTB USA. Project skills are now `otb-usa` and `otb-theme`; Astro overlay is `otb-usa-overlay.md`; evolution profile is `otb-profile.md`; canonical project metadata points to OTB USA.

**Pattern:** Grupo US remains parent brand context. Product work in this repo must stay OTB-only: no unrelated routes, CTAs, product journeys or examples.

**Validation:** Search residual terms, then run `bun run lint && bunx astro check && bun run build`.
