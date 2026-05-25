---
description: Project context loader. Modes (positional arg) — default: auto-classify cross-domain · backend: backend rules + domain refs · frontend: frontend rules + design refs · fullstack: cross-domain. Loads minimum-viable context, never eager.
workflow_type: augmented-llm
---

# /prime — Intelligent Context Loader

**ARGUMENTS**: $ARGUMENTS

> First positional arg = scope. Examples:
> ```
> /prime                  # auto-classify intent, then load
> /prime backend          # backend-focused (rules + recent backend changes)
> /prime frontend         # frontend-focused (rules + recent frontend changes)
> /prime fullstack        # multi-domain
> ```

---

## Goal

Load **minimum-viable** project context for the current task. Never eager-load everything.

Tier model:
- **Tier 1** (always loaded by harness): root `AGENTS.md` + `.claude/CLAUDE.md`
- **Tier 2** (load on demand): `.claude/rules/*.md` (`frontend.md`, `DESIGN.md`, `stability.md`, `seo.md`)
- **Tier 3** (load only when justified): `docs/`, ADRs, learnings, design specs, spec docs

---

## 0. Setup (every mode)

Read `.claude/config.json`. Note `${paths.*}` and `${rulesDir}` for later loading.

Run:
```bash
git status --short
git log --oneline -10
```

Project routing matrix is in `.claude/CLAUDE.md § Routing matrix (project-specific)` — consult for stage 2 deep loading.

---

## 1. Mode dispatch

Parse first positional token from `$ARGUMENTS`:

| Token | Section |
|---|---|
| (none) / `auto` / `cross` | § 2 (auto-classify) |
| `backend` / `api` / `db` | § 3 (backend) |
| `frontend` / `ui` / `react` | § 4 (frontend) |
| `fullstack` / `multi` | § 5 (fullstack) |

---

## 2. Auto-classify mode (default)

Read user task description from `$ARGUMENTS` (after the mode token, if any). Classify intent:

| Signal | Classify as | Route to |
|---|---|---|
| React / UI / layout / styling / component / page | frontend-heavy | § 4 |
| API / handler / route / middleware / service / validator | backend-heavy | § 3 |
| Schema / migration / RLS / FK / index / enum | backend (data) | § 3 (with database.md emphasis) |
| External provider / webhook / payment / email / monitoring | integration-heavy | § 3 (load `integrations.md` first) |
| UI + API + schema | fullstack | § 5 |
| Vague / exploratory | partial — see § 2.1 | — |

### 2.1 Vague task

Don't load eagerly. Output:

```
Project: ${project.name} | Branch: {branch}
Intent: unclear
Recommended next: ask user "Is this primarily frontend, backend, integration, or cross-domain?"
```

---

## 3. Backend mode

### 3.1 Stage 0 — Base load

Read compact backend rules:
- `.claude/rules/backend.md`
- `.claude/rules/database.md`
- `.claude/rules/stability.md`

```bash
git log --oneline -5 -- ${paths.backendRoot}
git log --oneline -5 -- ${paths.schemaRoot}
```

Do NOT yet read deep references or subdirectory `AGENTS.md` files.

### 3.2 Stage 1 — Classify task shape

| Task shape | Examples | Stage 2 load |
|---|---|---|
| API/handler | route, validator, auth guard, response shape | `${paths.backendRoot}/AGENTS.md` if present |
| Schema/data | columns, relations, indexes, enum alignment | `${paths.schemaRoot}/AGENTS.md` if present + project schema reference doc |
| Service/integration | webhooks, external APIs, third-party providers | `.claude/rules/integrations.md` (re-read if not yet loaded), provider-specific docs |
| Runtime/env | env vars, deploy config, runtime behavior | runtime/architecture doc if exists in `docs/architecture/` |
| Schema-domain orientation | which domain owns which table | schema-reference doc |
| Historical bug pattern | tenant resolution, aggregation, date boundary | backend-learnings doc |
| Multi-domain | API + schema + integration | only the exact combination required |

If the task is unclear → ask one short clarifying question rather than load more.

### 3.3 Stage 2 — Targeted deep loading

Load **only** the files justified by Stage 1. Consult `.claude/CLAUDE.md § Routing matrix (project-specific)` for project bindings (e.g., where Content Collections live, where WhatsApp SSOT lives).

### 3.4 Loading rules

- Never load all backend references by default.
- Never load subdirectory `AGENTS.md` files unless task touches that directory.
- Stop after the minimum sufficient load. Expand in stages, never restart with full preload.
- If task expands → continue staging, don't reset.
- If > 4 files seem necessary → reassess scope.

---

## 4. Frontend mode

### 4.1 Stage 1 — Baseline (always)

Read `.claude/rules/frontend.md`.

```bash
git log --oneline -5 -- ${paths.frontendRoot}
```

For UI work also read `.claude/rules/DESIGN.md` (or the project's design rule file if differently named) when the task involves layout, styling, or design tokens.

Use Stage 1 only for: small UI fixes, className changes, simple component edits, light bug fixes with known patterns.

### 4.2 Stage 2 — Design / foundation load

Escalate when task involves: new UI creation · layout redesign · page structure · color/typography decisions · design review · design-system alignment · interaction design.

Also load (when present in project):
- design system foundation (e.g. `docs/stitch-design/.../DESIGN.md` or equivalent design canon)
- LEVER / extend-vs-create philosophy doc

### 4.3 Stage 3 — Historical patterns

Escalate when task involves: rerender / performance regressions · polling / SSE / query churn · virtualized lists · DnD / kanban / chat surfaces · mutation UX · sanitization / HTML rendering · camera / media flows · tab/panel scroll bugs.

Also load: frontend-learnings doc if exists in project.

### 4.4 Stage 4 — Canonical authority

Load only when:
- Editing files under `${paths.frontendRoot}/**`
- Task complex enough that compact rules aren't enough
- Ambiguity between compact rule and domain authority
- Change spans multiple frontend subsystems

Also load: `${paths.frontendRoot}/AGENTS.md` if present.

### 4.5 Feature-specific spec loading

If the task targets a specific UI surface (e.g., admin dashboard, donation form, checkout flow), load **only** the directly relevant spec from `docs/design-specs/` (or equivalent). Never load the full directory.

### 4.6 Routing heuristic

| Task shape | Stages |
|---|---|
| Trivial L1-L2 | Stage 1 only |
| Explicit frontend impl | Stage 1 → Stage 2 if structure/design involved |
| Performance/debug-heavy | Stage 1 → Stage 3 |
| New page/component architecture | Stage 1 → Stage 2 → Stage 4 |
| Complex frontend refactor | Stage 1 → Stage 2 or 3 → Stage 4 as needed |

---

## 5. Fullstack mode

When task spans multiple domains:

### 5.1 Always load

- `.claude/rules/stability.md` (universal checklist)
- Targeted Tier 2 rules per the routing matrix in CLAUDE.md, e.g.:
  - API + UI → `backend.md` + `frontend.md`
  - Schema + API + UI → `database.md` + `backend.md` + `frontend.md`
  - Webhook + integration + UI status → `backend.md` + `integrations.md` + `frontend.md`

### 5.2 Tier 3 — load only what's justified

- Architecture map / README in `docs/architecture/` (if exists) — only when planning cross-domain work
- Design foundation — only when UI design is part of scope
- Single targeted feature spec — never the whole `design-specs/` folder

### 5.3 Stop conditions

Stop loading if:
- Task hasn't been provided yet (just confirm baseline + ready state)
- Minimum sufficient load achieved
- Task becomes schema-changing / auth-changing / payment-related → flag explicitly before implementation

---

## 6. Anti-bloat rules (all modes)

- Never use `/prime` as "read every rule and every reference"
- Never load both full architecture and full design-spec sets unless task truly spans both
- Never preload historical learnings unless task suggests debugging / performance / edge cases / prior-bug-sensitive areas
- Prefer **one targeted reference** over multiple broad references
- If unsure → load index/README first, never the children
- Stop after the minimum sufficient load

---

## 7. Output format

```
Project: ${project.name} | Mode: {auto|backend|frontend|fullstack} | Stage: {1-4}
Branch: {branch} | Recent: {summary of git log -5}
Loaded:
  - {exact files actually loaded}
Next on demand: {only the most relevant additional files}
Ready for: {task description or "awaiting task"}
```

Keep summary under 120 words.

---

## 8. Stop conditions

- Stop after Stage 0 if task hasn't been provided
- Stop after the minimum sufficient deep load
- If task becomes destructive / payment-related / auth-changing / schema-changing → flag before implementation
- If > 4 files seem necessary in one stage → reassess classification
