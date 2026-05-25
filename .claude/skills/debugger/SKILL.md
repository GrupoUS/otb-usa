---
name: debugger
description: Use for systematic bug diagnosis, failing tests, runtime errors, regressions, frontend or backend debugging, and root-cause verification.
---

# Debugger

Production-grade debugging skill — combines root-cause rigor, parallel sub-agent research, browser/CLI evidence, and database validation into a single canonical workflow.

> **Project-specific anti-patterns** are loaded from `${overlay}/anti-patterns.md` (path resolved from `.claude/config.json::overlay`). If the overlay file is missing, the skill runs with the generic catalog only.

---

## Iron Law

1. **No fix without root cause.** Understand WHY before changing code.
2. **No "fixed" claim without fresh evidence.** Gates must pass, evidence (screenshot / DB query / passing test) must confirm.
3. **No scope expansion during incident handling.** Log new issues, fix them later.

---

## When to Use

- Runtime errors, failed tests, unstable UI behavior
- API/handler/service failures, auth or permission mismatches
- Tenant isolation, RLS, schema consistency doubts
- Broad post-change audit or release hardening checks

For speed/security/SEO optimization campaigns → use `performance-optimization`.

---

## Pack Selector

| Pack | Scope | Browser evidence | DB validation | Sub-agents |
|---|---|:-:|:-:|:-:|
| `frontend-debug` | UI / hydration / interaction issues | YES | — | 3 parallel |
| `backend-debug` | Handler / service / ORM failures | — | YES | 2 parallel |
| `auth-db-debug` | Auth, role, tenant, RLS, sync drift | — | YES | 2 parallel |
| `systematic-audit` | Full cross-layer stability sweep | YES | YES | 4 parallel |

**Pack selection logic:**
1. If input names a pack → use it
2. Visual / UI / component symptom → `frontend-debug`
3. 5xx / handler / mutation symptom → `backend-debug`
4. Auth / role / tenant / permissions symptom → `auth-db-debug`
5. Input says "audit" or scope unclear → `systematic-audit`
6. Ambiguous → ask ONE clarifying question (multiple choice preferred)

---

## Live Docs Lookup (Context7)

When debugging library-specific issues, fetch live docs first via `mcp__claude_ai_Context7__resolve-library-id` → `query-docs`. Always prefer official docs over training knowledge for: ORMs, auth providers, query libraries, framework runtimes, anything where the API surface is non-trivial.

---

## Phase Overview

- **Phase 0 — Pre-flight.** Run config-driven gates (`${tooling.typeChecker}`, `${tooling.linter}`, `${tooling.testRunner}`) as baseline. For `frontend-debug` / `systematic-audit`, also verify browser CLI tooling. Browser mode selection: see `references/browser-setup.md`.
- **Phase 1 — Parallel research.** Launch all sub-agents simultaneously in background. Templates in `references/subagent-templates.md`. All packs use Code Archaeologist + Regression Hunter. Frontend / audit packs add Evidence Collector; backend / auth-db packs add DB State Inspector.
- **Phase 2 — Hypothesis selection.** Merge findings. Rank by evidence count (2+ sources = HIGH). Document selected hypothesis: statement, evidence, counter-evidence, fix target (file:line).
- **Phase 3 — Minimal fix.** ONE change at a time. Read target file first. Apply smallest possible change. Verify with type-check. Revert immediately if new errors appear.
- **Phase 4 — Verification gate.** Run gates from `_shared.md` § 1. ALL must exit 0.
- **Phase 5 — Evidence confirmation.** Frontend: browser screenshots. Backend / auth-db: SQL validation queries. Audit: both.
- **Phase 6 — Report.** Structured report with pack, root cause, fix applied, evidence paths, verification exit codes, remaining risks. Offer to save to `debug-reports/YYYY-MM-DD-<slug>.md`.

Pack-specific execution flows: see `references/pack-guides.md`.

---

## Common Root Causes Catalog (Generic)

Quick lookup for frequently encountered issues across stacks. Project-specific anti-patterns live in `${overlay}/anti-patterns.md`.

### Core patterns

| Symptom | Root cause | Fix guidance |
|---|---|---|
| `Select is changing from uncontrolled to controlled` | `value={undefined}` transitioning to defined | Use `value={val ?? ""}` to keep controlled |
| `Cannot read properties of undefined` after insert | Destructuring `[0]` on empty array | Guard: `if (!row) throw …` after `[row] = await …returning()` |
| HTTP 5xx on mutation involving transactions | Driver doesn't support transactions in current mode (e.g., HTTP-only Postgres drivers) | Use batched query API or sequential awaits; check driver docs |
| Cache stale after sync mutation | Invalidating one query but not related ones | Invalidate the full set: by-id + list + dependent aggregations |
| `useMutation` in `useEffect` deps → loading stuck | Mutation reference changes on `isPending` toggle | Use `useRef(mutation.mutateAsync)` pattern |
| Webhook 4xx with valid signature | Secret env var mismatch local vs production | Compare `.env` files + deployment env vars |
| Type-check error after schema change | Generated types not regenerated | Re-run type generation step (`gen-types` / `db:push` / equivalent) |
| `Cannot find module '@/...'` after refactor | tsconfig paths stale | Update `tsconfig.json` paths + restart TS server |
| OAuth double dialog / popup race | `fallback_redirect_uri` + manual redirect collision | Remove `fallback_redirect_uri` from provider call |
| SSE listener leak | `addEventListener` inside while loop | Move listener OUTSIDE loop, cleanup in `finally` |
| Loop / queue stops mid-iteration | Listener detached on first event | Use `{ once: false }` or re-attach explicitly |
| CRLF lint failures on Linux CI | `core.autocrlf=true` on Windows commits CRLF | Add `.gitattributes` with `* text=auto eol=lf` + `git add --renormalize .` |
| Tenant resource leak (UPDATE without owner filter) | Missing `WHERE owner_id = …` clause | Add owner predicate; consider RLS at the DB layer |
| `.returning()` guard never fires | Checking `if (!rows)` — empty `[]` is truthy | Destructure: `const [row] = …; if (!row) throw …` |

### Project-specific anti-patterns

Loaded automatically from `${overlay}/anti-patterns.md` if present. That file should document patterns specific to your stack (e.g., Pix idempotency, RLS donor PII, Astro hybrid render mode, etc.).

For full pattern detail: `references/consolidated-domain-rules.md` (rules synthesized across multiple stacks).

---

## Escalation Rule

- **1-2 fix attempts fail** → restart investigation from Phase 1 with fresh hypothesis
- **3 fix attempts fail** → STOP. Challenge architecture assumptions:
  - Is the design fundamentally flawed?
  - Is the symptom a consequence of a deeper structural issue?
  - Escalate to `evaluator` (Mode 3: Architecture Analysis) or invoke `/debug recover`

---

## NEVER Constraints (absolute)

1. NEVER skip pre-flight checks (Phase 0)
2. NEVER claim "fixed" before ALL verification gate commands pass AND evidence is captured
3. NEVER expand scope during an active debug session — log new issues for later
4. NEVER take more than 3 fix attempts on the same hypothesis before escalating
5. NEVER hallucinate file paths — always `Read` the actual file before referencing line numbers
6. NEVER interact with browser elements without calling `browser_snapshot` first (refs invalidate)
7. NEVER leave `console.log` or `debugger` statements in production code after fixing
8. NEVER use `as any` to silence type errors introduced by a fix — find the real type
9. NEVER run an unsupported transaction API on a driver that doesn't support it (e.g., HTTP-only Postgres drivers and `db.transaction()`)

---

## References

| File | Content |
|---|---|
| `references/browser-setup.md` | Browser mode selection, Chrome extension + CDP setup commands |
| `references/subagent-templates.md` | Prompt templates for Phase 1 sub-agents |
| `references/pack-guides.md` | Pack-specific execution flows + key rules |
| `references/methodology.md` | 4-phase debugging method, 5 Whys, git bisect, debug report templates |
| `references/verification.md` | Defense-in-depth, regression prevention, postmortem template |
| `references/patterns.md` | Async testing, testing pyramid, OWASP security checklist |
| `${overlay}/debugger-domain-rules.md` | Cross-stack bug patterns (project-specific — loaded if overlay configured) |
| `${overlay}/anti-patterns.md` | **Project-specific** anti-patterns (loaded if overlay configured) |
| `../../scripts/cdp.py` | Primary CDP tool (browser control via Node.js CDP client) |
| `../../scripts/cdp-tool.js` | Node.js CDP client |
| `../../scripts/launch_chrome_debug.py` | Launches Chrome with `--remote-debugging-port=9222` |

---

## Configuration

This skill reads `.claude/config.json` for `${tooling.*}` (gate commands), `${paths.*}` (search scopes), and `${overlay}` (project anti-patterns location). To use in another project: copy `.claude/skills/debugger/`, drop a custom `${overlay}/anti-patterns.md` if needed, point `.claude/config.json::overlay` at it.
