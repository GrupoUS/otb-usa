# Claude Code Behavioral Config

> Tier 1 — always loaded. Project-specific. Combined with root `AGENTS.md` must stay **< 500 lines total**.
> Read root `AGENTS.md` first: @../AGENTS.md
> Subdirectory `AGENTS.md` files are read **only when editing files in that subdirectory**.

---

## Project identity

**Name:** Grupo US
**Purpose:** Static marketing site for Grupo US.

Stack: Astro 6 (static-only) · Bun · Tailwind CSS v4 · React 19 (islands; minimal) · Railway · Lucide React · Playfair Display + Inter · pt-BR.

Project metadata in `.claude/config.json`. Architecture map / commands / pre-delivery checklist in root `AGENTS.md`. Brand voice + products: `gpus-theme` skill + `grupo-us` skill.

---

## Behavior

These are non-default behaviors. Standard coding conventions are not listed because Claude already applies them.

- **Implement directly, don't just suggest.** Code-first responses.
- **Minimal explanation.** Assume I know the language.
- **Bun only.** `bun install`, `bun run`, `bunx`. Never `npm` / `yarn` / `pnpm`.
- **Reference applied rules** when relevant (e.g., "per `.claude/rules/frontend.md` redirect tri-sync").

---

## Skill invocation

- **Invoke relevant skills BEFORE any response or action.** Even a 1% chance a skill applies → invoke it first.
- **Process skills first** (planning, debugging), **implementation skills second**.
- **Use the `Skill` tool** — never `Read` skill files directly with the `Read` tool.
- **Process skills used by an agent SHOULD be preloaded via the `skills:` frontmatter field** (Anthropic-recommended). Body-level `Skill()` calls remain valid for ad-hoc / conditional invocation. See `.claude/skills/senior-prompt-engineer/SKILL.md § 8` for assignments.

---

## Intent classification

| Type | Indicators | Action |
|---|---|---|
| **Trivial** (L1-L2) | Single file, known pattern | Direct fix — no planning |
| **Explicit** (L3) | Well-scoped, clear requirements | Light planning → execute |
| **Exploratory** (L4) | Ambiguous scope, multiple valid approaches | Discover → research → plan |
| **Open-ended** (L5+) | Vague, requires decomposition | Full D.R.P.I.V via `/plan` |

**Autonomy:** proceed without asking when changes are **local + reversible + evidence-supported + within existing architecture**. State assumptions briefly and continue.

**Ask first only for:**
- Destructive operations (file deletion, branch deletion, hard reset)
- Shared-system or production-impacting config changes
- External actions visible to other people (commits, pushes, PRs, messages, deploys)

---

## Cardinal rules (project-specific, non-negotiable)

1. **Never assume correctness.** Verify against official docs, runtime build, or `bun run check:external-urls` before applying changes.
2. **Always debug after changes.** Every modification ends with `bun run lint && bunx astro check && bun run build`.
3. **NEVER use emojis as UI icons.** Lucide React SVG only.
4. **NEVER use SPA.** Astro static MPA only — no `ClientRouter`, no `prerender = false`, no SSR adapter.
5. **NEVER hardcode product / team / landing copy** in `.astro` or `.tsx`. Always `getCollection()` from `src/content/`.
6. **NEVER inline `wa.me/...` URLs.** Always go through `src/lib/whatsapp.ts`.
7. **NEVER hardcode hex** outside `src/styles/global.css` `@theme` block. Semantic tokens or named navy/gold utilities only.
8. **NEVER animate layout properties** (`width`, `height`, `top`, `left`, `padding`, `margin`). FAQ uses CSS grid `grid-template-rows: 0fr ↔ 1fr`. Other animations: `transform` + `opacity` only.

---

## Routing matrix (project-specific)

> **Tech-stack skills auto-trigger** via skill description match. `astro` skill auto-loads on `*.astro` / `astro.config.mjs` / `src/content.config.ts` edits. `astro/references/gpus-overlay.md` carries project-specific Astro patterns (redirect tri-sync, render-mode invariants, Layout.astro contracts). `grupo-us/references/whatsapp-ssot.md` carries SDR Laura SSOT. `gpus-theme` carries Navy/Gold token canon. Generic `.claude/rules/*` carry universal do/don't only.

| Task touches | Load these | Implement in |
|---|---|---|
| New page / product landing | `frontend.md` + `DESIGN.md` + `astro` skill | `src/pages/<slug>.astro` (mirror `mentoria-black-neon.astro`) + `src/content/products/<slug>.json` |
| New external product redirect | `astro/references/gpus-overlay.md § External redirect tri-sync` | `src/content/products/<slug>.json::externalSiteUrl` + `astro.config.mjs::redirects` + `astro.config.mjs::sitemap.filter()` (3-way sync) |
| Edit landing copy / CTA / FAQ / testimonial | `astro/references/content-collections.md § SSOT pattern` + `grupo-us` skill | `src/content/products/<slug>.json` only — never component file |
| Update home journey order | `grupo-us/references/manual-resumo.md § Jornada do aluno` | `src/content/products/<slug>.json::order` |
| WhatsApp message / CTA | `grupo-us/references/whatsapp-ssot.md` | `cta.whatsappMessage` in product JSON (always prefixed `Olá, Laura!`) — `src/lib/whatsapp.ts` is SSOT for URL building |
| WhatsApp number / E.164 | `grupo-us/references/whatsapp-ssot.md` | `src/lib/whatsapp.ts::WHATSAPP_SDR_E164` — single source |
| Theme token / new utility | `DESIGN.md` + `gpus-theme` skill | `src/styles/global.css` `@theme` block + `@layer utilities` |
| New landing section component | `frontend.md` + `DESIGN.md` + `astro` skill | `src/components/landing/*.astro` (pure Astro by default; promote to `.tsx` only when interactivity required) |
| Hero island animation | `astro/SKILL.md § Common Mistakes` + `astro/references/gpus-overlay.md § Hydration` | `src/components/landing/<island>.tsx` with `client:idle` (never `client:load`) |
| FAQ behavior | `frontend.md` + `DESIGN.md § Motion` + `astro/references/islands-architecture.md § FAQ accordion` | `src/components/landing/FAQ.astro` — native `<details>` or CSS grid `0fr/1fr`; never Framer height tween |
| SEO meta / JSON-LD | `seo.md` + `astro` skill (when sitemap plugin / Astro-specific) | `src/layouts/Layout.astro` (Organization + BreadcrumbList) + per-page frontmatter (`title`, `description`, `ogImage`) |
| A11y plumbing | `frontend.md § Accessibility` + `astro/references/gpus-overlay.md § Layout.astro contracts` | `src/layouts/Layout.astro` (skip link, `<main id="conteudo-principal">`, `<noscript>` reveal) + `src/styles/global.css` |
| Performance budget | `stability.md § Performance gates` + `astro/references/performance.md` | `Layout.astro` (preconnect Google Fonts) + Astro `<Image>` discipline + hydration audits |
| Smoke tests / anti-patterns / debug | `stability.md` + `astro/references/gpus-overlay.md § Smoke commands` | filesystem (greps + Lighthouse + `bun run check:external-urls`) |
| Agent prompt or new agent file | `senior-prompt-engineer` skill | `.claude/agents/<name>.md` (frontmatter + body) |
| Multi-agent command (parallel batch) | `senior-prompt-engineer` + `_shared.md § 7.5` | `.claude/commands/<cmd>.md` |
| Autoresearch run / record evolve experiment / consult prior keep-decision evidence | `evals/README.md` + `evals/site/<area>/compound.md` | `evals/site/<area>/runs/<YYYY-MM-DD>-<slug>/run.md` (write via `/evolve`) — never hand-edit harness/grade artifacts |
| Anywhere | `stability.md` | universal checklist |

---

## Sequential thinking

Invoke `mcp__sequential-thinking__sequentialthinking` **before** acting (not after) when any of these apply:

| Trigger | Example |
|---|---|
| Request is L4+ (multi-domain, cross-layer) | Feature touching schema + UI + SEO |
| Ambiguous requirements with 2+ valid approaches | "improve performance" with no metric |
| Error spans 3+ files or services | Cascade failure after deploy |
| Architecture decision with irreversible consequences | New dependency, render-mode change |
| Plan has 3+ sequential phases with dependencies | Sprint with content → component → style gates |
| Confidence < 4 on root cause after initial investigation | Bug with no clear reproduction path |

**Never invoke for:** L1-L2 fixes, known patterns, direct style/lint/type changes.

---

## Research tools

| Question | Tool |
|---|---|
| Library/framework API, config, version, migration | `mcp__claude_ai_Context7__resolve-library-id` → `mcp__claude_ai_Context7__query-docs` |
| Current best practices, CVEs, ecosystem news, external APIs | `mcp__tavily__search` (add year + version to query) |
| Both needed | Run both in parallel in the same message |

Codebase search (`Grep` / `Read` / `Glob`) is the **fallback for internal questions, never the first step for external knowledge.** Use even for well-known libraries — training data may be stale.

---

## Stopping conditions (hard limits)

- **Max 3 fix attempts** on the same hypothesis → escalate to `evaluator` (Mode 3: Architecture Analysis)
- **Max 5 agent spawns** per user request → pause and checkpoint with the user
- **Confidence < 3** on a critical finding → flag as assumption and ask the user
- **Scope expands** beyond the original request → STOP and confirm
- **Quality gate fails 2× consecutively** → invoke `/debug recover`
- **Coordinator max-iteration:** any agent-team coordinator returns `BLOCKED` to main after 2 consecutive `REVISION_REQUIRED` on the same task → main calls `/debug recover` (do not escalate to user mid-loop)

---

## Decision authority

| Action | Authority |
|---|---|
| L1-L2 fixes, style/lint/type fixes | Autonomous |
| Schema additions, new dependencies, file deletion | **Confirm first** |
| Production config, destructive operations, deploy to prod | **Always ask** |

---

## Pointers (Tier 3 — read on demand)

### Generic universal rules (portable to any project)

- `.claude/rules/frontend.md` — universal frontend do/don't (component placement, hydration philosophy, content-data SSOT, forms, external surfaces, performance, a11y plumbing).
- `.claude/rules/DESIGN.md` — universal design do/don't (color tokens, typography, components, layout, iconography, motion, imagery, depth, focus).
- `.claude/rules/stability.md` — universal A–L checklist + render-mode invariants + CWV gates + smoke template + anti-patterns + debug triage.
- `.claude/rules/seo.md` — universal locale, routes, sitemap, robots, OG/Twitter, JSON-LD shape, CWV thresholds, AI citation (GEO).

### Tech-stack skills (auto-trigger via skill description match)

- `.claude/skills/astro/` — Astro framework patterns. **Project overlay:** `references/gpus-overlay.md` (render-mode invariants, redirect tri-sync, hydration project rules, Layout.astro contracts, smoke commands).

### Project skills

- `.claude/skills/gpus-theme/` — Navy/Gold tokens canon (HSL).
- `.claude/skills/grupo-us/` — products / journey / brand voice (`manual-resumo.md`, `produtos-e-rotas.md`, `cultura-activa.md`, `conflitos-fontes.md`, `whatsapp-ssot.md`).

### Audit trail / governance

- root `AGENTS.md` — behavioral + orchestrator (commands / agents / skills / MCPs / terminal / authority precedence). Cardinals + routing remain here in `CLAUDE.md`.
- `docs/learnings-log.md` — chronological project decisions (append-only, on-demand).
- `evals/` — autoresearch audit trail. `evals/README.md` for layout. `evals/site/<area>/compound.md` is durable brand-area memory between `/evolve` runs (consult before re-running same area). New skill autoresearch lands in `evals/<skill-slug>/runs/` with frozen harness + grades. `evals/_archive/` holds frozen 2026-03-26 skill-autoresearch snapshots already promoted to live skills (read-only).
- `docs/` — product specs, design canon, implementation plans.
