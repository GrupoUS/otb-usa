---
description: Post-implementation verification gate. Runs gates → /debug → /perf → E2E → spec → codex review → codex adversarial → evaluator Mode 3 → report → /evolve. Modes (positional arg) — default: full (10 phases) · quick: gates + /debug + spec only · spec-only: plan compliance only · paranoid: force all phases regardless of touched surface.
workflow_type: prompt-chaining
---

# /verify — Post-Implementation Verification Gate

**ARGUMENTS**: $ARGUMENTS

> Sequential verification pipeline. Each phase gates the next. Failure escalates per `_shared.md` and `debug.md` § 8.
>
> First positional arg = mode. `/verify`, `/verify quick`, `/verify spec-only`, `/verify paranoid`.

---

## Stopping Conditions

- STOP if Phase 0 gates fail → fix gates first, do not proceed
- STOP after `/debug` returns unresolved findings → invoke `/debug recover`
- STOP after `/perf` regresses past WARN threshold → invoke `/debug recover`
- STOP if Phase 3.5 E2E surfaces JS console errors or critical network failures → invoke `/debug frontend`
- STOP if Phase 5 codex review returns P0/P1 findings → present via `codex:codex-result-handling`, ask which to fix
- STOP if Phase 6 codex adversarial returns P0/P1 design challenges → present, ask user before Phase 7
- STOP if Phase 7 evaluator Mode 3 returns `REVISION_REQUIRED` → invoke `/debug recover`
- STOP and ASK user if Phase 1 cannot locate a plan file and no `$ARGUMENTS` given
- STOP after 2 consecutive verify failures on same diff → reactive escalation to evaluator Mode 3
- STOP if scope drift introduces auth, payment, PII, or schema changes not in the plan → confirm with user before VERIFIED
- Phase 9 `/evolve` only runs if final verdict is `VERIFIED` or `VERIFIED-WITH-NOTES`

---

## 0. Mode selection

Parse first positional token from `$ARGUMENTS`:

| Mode | Aliases | Behavior |
|---|---|---|
| `full` (default) | — | All 10 phases. Smart gating skips irrelevant phases by touched-surface signals. |
| `quick` | `q`, `fast` | Skip Phases 3, 3.5, 5, 6, 7, 9 — gates + /debug + spec only |
| `spec-only` | `spec`, `compliance` | Phase 1 + Phase 4 + Phase 5 only |
| `paranoid` | `release`, `pre-pr` | Force ALL phases regardless of touched surface |

`$ARGUMENTS` also accepts:

| Arg shape | Meaning |
|---|---|
| `<path>` ending in `.md` | Use that file as the plan |
| `latest` | Pick newest `.md` under `docs/` (default if no arg) |
| `+codex` | Force Phase 5 even in `quick` |
| `+adversarial` | Force Phase 6 even in `quick`/`spec-only` |
| `+evaluator` | Force Phase 7 even in `quick`/`spec-only` |
| `+e2e` | Force Phase 3.5 even when no frontend change detected |
| `--no-evolve` | Skip Phase 9 |

---

## Iron Law

```
NO "VERIFIED" VERDICT WITHOUT EVIDENCE FOR EVERY PHASE THAT RAN.
SCOPE DRIFT MUST BE REPORTED, NOT HIDDEN.
PHASE 9 (/evolve) NEVER RUNS ON NEEDS-WORK / FAILED.
```

If any phase did not produce a checkable artifact when it was supposed to run, verdict is `NEEDS-WORK` — never assume green.

---

## 1. First action — context + skills + gates

### 1.0 Context load (WISC)

Per `_shared.md` § 4. Auto-detect from changed file paths (read `.claude/config.json` for `${paths.frontendRoot}` / `${paths.backendRoot}`):

- `${paths.frontendRoot}/**` only → `/prime frontend`
- `${paths.backendRoot}/**` only → `/prime backend`
- Multi-layer → `/prime fullstack`

```typescript
Skill("debugger");          // for Phase 2
Skill("evolution-core");    // for Phase 9 (/evolve)
// Phases 5 + 6 use codex-plugin-cc slash commands directly (`/codex:review`,
// `/codex:adversarial-review`). Do NOT preload `Skill("codex:rescue")` —
// the slash commands handle routing themselves.
```

### 1.1 Quality gates (canonical)

Per `_shared.md` § 1. Resolve commands from `${tooling.*}` config.

```bash
${tooling.packageManager} run ${tooling.typeChecker} 2>&1 | tail -30
${tooling.packageManager} run lint 2>&1 | tail -20
```

These are **Phase 0**. Failure here blocks all further phases.

---

## 2. Phase 0 — gates baseline

| Check | Command | Pass condition |
|---|---|---|
| Type-check | `${tooling.packageManager} run ${tooling.typeChecker}` | exit 0, 0 errors |
| Lint | `${tooling.packageManager} run lint` | exit 0 |
| Formatter (touched files) | `${tooling.linter} check <touched-files>` | exit 0 |

If FAIL → STOP. Surface exact error. Do NOT continue. Suggest user fix gates first.

In `spec-only` mode, skip Phase 0 entirely.

### 0.2 Codex plugin pre-check (full + paranoid modes only)

Before any phase that uses `/codex:review` or `/codex:adversarial-review` (Phases 5-6), confirm the plugin is available:

```bash
# Pre-flight check — do NOT silently fall back to bash if missing
which codex >/dev/null 2>&1 && echo "codex available" || echo "MISSING"
```

If MISSING and mode is `full` or `paranoid`: ask the user to choose `[skip codex phases]`, `[escalate to evaluator Mode 3 instead]`, or `[abort and install codex first]`. Do NOT silently skip — that hides ship-blocker findings.

In `quick` and `spec-only` modes: codex phases are off by default, no pre-check needed.

---

## 3. Phase 1 — resolve inputs

### 3.1 Locate the plan

```bash
# Explicit arg path
test -f "$ARG_PATH" && PLAN="$ARG_PATH"

# Or "latest" → newest plan-style file under docs/
[ -z "$PLAN" ] && PLAN=$(ls -t docs/*.md 2>/dev/null | head -1)
```

If still no plan → ASK user (do not silently fall back to prompt-only).

### 3.2 Extract requirements

Read the plan file. Pull:
- **Context** section — what problem is being solved
- **Approach / Critical Files** — what was supposed to change
- **Verification** section — how the change should be tested
- Any explicit acceptance criteria, checklists, numbered requirements

Read the **original user prompt** from current conversation. Combine with plan extracts to build the compliance checklist:

```
[ ] R1 — <requirement, paraphrased exactly from source>
[ ] R2 — ...
```

### 3.3 Enumerate actual changes + risk signals

```bash
git diff main...HEAD --stat
git log main..HEAD --oneline
git diff main...HEAD --name-only

# Risk signals — feed Phase 3.5 / 6 / 7 routing
TOUCHED_FRONTEND=$(git diff main...HEAD --name-only | grep -c "^${paths.frontendRoot}/" || echo 0)
TOUCHED_BACKEND=$(git diff main...HEAD --name-only | grep -c "^${paths.backendRoot}/" || echo 0)
TOUCHED_SCHEMA=$(git diff main...HEAD --name-only | grep -c "^${paths.schemaRoot}/" || echo 0)
TOUCHED_AUTH=$(git diff main...HEAD --name-only | grep -E '(auth|session|webhook|rls|policy)' | wc -l)
TOUCHED_PAYMENT=$(git diff main...HEAD --name-only | grep -E '(stripe|asaas|kiwify|hubla|billing|payment|pix)' | wc -l)
TOTAL_LINES=$(git diff main...HEAD --stat | tail -1 | grep -oE '[0-9]+ insertion' | grep -oE '[0-9]+' || echo 0)
TOTAL_FILES=$(git diff main...HEAD --name-only | wc -l)
```

Cache the file list and counters for Phases 2, 3, 3.5, 4, 6, 7.

---

## 4. Phase 2 — `/debug` (sequential)

> Skip in `spec-only` mode.

**Agent:** `debugger`. **Skill:** `debugger` (loaded in 1.0). `/debug` itself spawns the agent — do not double-spawn.

Auto-pick `/debug` mode from changed file paths:

| Changed surface | Mode | Sub-agents |
|---|---|---|
| Frontend only | `/debug frontend` | per `debug.md` § 3 |
| Backend (no schema) | `/debug backend` | code-archaeologist + regression-hunter |
| Schema / auth / RLS | `/debug auth-db` | + db-state-inspector |
| Mixed | `/debug` (default) | per `debug.md` § 1 complexity routing |

Run inline. Block until returns. Foreground because `debugger` writes fixes (per `_shared.md` § 3).

### Pass condition

- All quality gates re-run by `/debug` are green
- No unresolved findings in `/debug` Findings Table
- All applied fixes themselves passed gates

### Fail handling

`/debug` reports unresolved root cause OR applied fixes failed gates 2× → STOP → invoke `/debug recover`.

Capture for report: mode used, fixes applied (file:line), final gate output.

---

## 5. Phase 3 — `/perf` (sequential)

> Skip in `spec-only` and `quick` modes.

**Agent:** `performance-optimizer`. **Skill:** `performance-optimization`. `/perf` spawns one agent per failing route — do not double-spawn.

Auto-pick `/perf` mode by changed surface:

| Changed surface | Mode | Threshold |
|---|---|---|
| Frontend route | runtime PSI on `${project.stagingUrl}` | Performance ≥ `${gates.lighthouse.performance}` |
| Backend / DB queries | `db` | No new N+1, no missing FK index, no new SELECT * |
| Build config / deps | `build` | Build time ≤ baseline + 10%, total JS ≤ baseline |
| Mixed | runtime + db | Both must pass |

### Thresholds (from config gates)

```yaml
performance:    pass: ${gates.lighthouse.performance}, warn: 50
accessibility:  pass: ${gates.lighthouse.accessibility}, warn: 70
best-practices: pass: ${gates.lighthouse.bestPractices}, warn: 70
seo:            pass: ${gates.lighthouse.seo}, warn: 80
CWV:            LCP ${gates.lcp}ms | CLS ${gates.cls} | INP ${gates.inp}ms
```

### Fail handling

Score below WARN OR new N+1 introduced OR FK index missing → STOP → `/debug recover`.
Score in WARN band → record as `WARN`, continue, flag in final report.

---

## 6. Phase 3.5 — E2E browser (verification-agent)

> Skip in `quick` and `spec-only` modes.
> In `full`: only when `TOUCHED_FRONTEND > 0` (or `+e2e` flag passed).
> In `paranoid`: always run.

**Agent:** `verification-agent`. **Tools:** Playwright MCP. **Foreground.**

### Invocation

```typescript
Agent({
  description: "E2E verify on staging",
  subagent_type: "verification-agent",
  prompt: `Verify the user flow affected by the diff on ${project.stagingUrl}.

Diff summary: <N files in frontend, key routes from Phase 1.3>
Plan acceptance criteria: <copy from Phase 1.2 checklist>

For each affected route:
1. Navigate to the route
2. Capture browser_snapshot + browser_take_screenshot
3. Capture browser_console_messages — flag any error/warning
4. Capture browser_network_requests — flag any 4xx/5xx on XHR
5. Run the golden-path interaction described in the plan
6. Run one realistic edge case (empty state, permission denial, network slow)

Return: PASS/FAIL per route + screenshot path + console.errors[] + network.failures[]. Under 800 tokens.`
});
```

### Pass condition

- No JS console errors
- No 4xx/5xx on critical XHR / API calls
- Screenshot matches expected layout

### Fail handling

JS error OR critical network failure → STOP → invoke `/debug frontend` with captured evidence.

---

## 7. Phase 4 — Spec compliance + scope drift

Walk the compliance checklist from Phase 1.3. For each requirement, search diff for evidence:

```bash
git diff main...HEAD -- <plan-cited-file> | grep -n "<expected-symbol>"
```

Mark each:

| Symbol | Meaning |
|---|---|
| ☑ | Implemented — evidence at `path:line` |
| ☐ MISSING | No evidence in diff |
| ⚠ PARTIAL | Some evidence but not complete |

### Plan-verification cross-check

If plan has `## Verification` section listing test steps, walk each. Mark whether actually executable post-diff (file exists, command runs).

### Scope drift detection

```
DRIFT = files in `git diff --name-only` NOT cited in plan AND NOT cited in original prompt
```

Classify drift risk:

```
SET DRIFT_RISK =
  "auth"    if any drift file matches /(auth|session|webhook|rls|policy)/
  "payment" if matches /(stripe|asaas|kiwify|hubla|billing|payment|pix)/
  "PII"     if matches /(users|customers|leads).*(\.ts|\.tsx)$/ AND new fields added
  "schema"  if any drift file under ${paths.schemaRoot}
  "env"     if any drift file matches /\.env|env\.ts|config\.ts/
  "ci"      if any drift file under .github/workflows/
  "none"    otherwise
```

`DRIFT_RISK ≠ none` feeds Phase 6 (focus) and Phase 7 (gating). Surface drift in report regardless. If drift includes any of: schema, auth, payment, env, CI → escalate (confirm with user before VERIFIED).

Also run the project-specific smoke tests in `.claude/rules/stability.md § Smoke tests` (Lucide grep, no-hex grep, redirect tri-sync, WhatsApp URL leak, Lighthouse routes).

---

## 8. Phase 5 — `/codex:review`

> Skip in `quick` mode (override with `+codex`).
> In `spec-only`, `full`, `paranoid`: run.

**Runtime:** codex-plugin-cc slash command `/codex:review`. Do **not** spawn the `codex:codex-rescue` subagent or load `Skill("codex:rescue")` from /verify.

### Pattern

```bash
/codex:review --base main --background
# Capture session ID for later /codex:result lookup
```

In `full` mode, allow Phase 6 + Phase 7 to run while Codex review is in flight. Collect via `/codex:result <session-id>` before Phase 8 synthesis.

### Direct-Bash fallback (when slash command unavailable)

```bash
PLUGIN_ROOT=$(ls -dt "$HOME/.claude/plugins/cache/openai-codex/codex/"*/ 2>/dev/null | head -1)
node "${PLUGIN_ROOT}scripts/codex-companion.mjs" review --base main --background
```

### Windows pwsh sandbox quirk (Codex 0.125+)

On Windows, Codex's sandbox shells through MS-Store `pwsh.exe` and intermittently returns `exit -1` for routine command lookups. Mitigation: always pre-paste relevant diff hunks or file excerpts into the focus text so Codex doesn't have to shell out.

### Findings classification

| Codex severity | Internal mapping | Verdict effect |
|---|---|---|
| P0 (critical) | `NEEDS-WORK` | STOP, ask user which to fix |
| P1 (important) | `NEEDS-WORK` | STOP, ask user |
| P2 (moderate) | `VERIFIED-WITH-NOTES` | Continue, log in report |
| P3 (minor) | `VERIFIED-WITH-NOTES` | Continue, log in report |
| no findings | `VERIFIED` | Continue clean |

Present findings via `codex:codex-result-handling` — do NOT auto-fix.

---

## 9. Phase 6 — `/codex:adversarial-review`

> Skip in `quick` and `spec-only` (override with `+adversarial`).
> In `full` / `paranoid`: always run.

**Runtime:** codex-plugin-cc slash command `/codex:adversarial-review`. Same fallback + Windows quirk as Phase 5.

### Focus calculation

Use `DRIFT_RISK` from Phase 4 + risk signals from Phase 1.3:

| Signal | Focus text |
|---|---|
| `DRIFT_RISK = auth` OR `TOUCHED_AUTH > 0` | "security boundary, token lifecycle, session invalidation, data leakage paths" |
| `DRIFT_RISK = payment` OR `TOUCHED_PAYMENT > 0` | "idempotency, webhook replay, double-charge race, refund correctness" |
| `DRIFT_RISK = PII` | "data exposure, query scope, response shape leakage, log redaction" |
| `DRIFT_RISK = schema` OR `TOUCHED_SCHEMA > 0` | "data migration safety, FK invariants, soft-delete consistency, NOT NULL backfill" |
| `DRIFT_RISK = env` OR `ci` | "secret exposure, build determinism, deploy reproducibility" |
| else | "design tradeoffs, alternative approaches, failure modes, race conditions" |

### Pattern

```bash
/codex:adversarial-review --scope working-tree --background "Focus: <focus_text>. Question the chosen implementation. Surface failure modes, race conditions, alternative simpler approaches. Report findings only — do not apply fixes."
```

### Pass condition

Zero P0/P1 design challenges, OR all P0/P1 acknowledged by user as accepted tradeoff.

### Fail handling

P0/P1 → STOP → present via `codex:codex-result-handling` → ask user before Phase 7. **NEVER auto-fix from adversarial review.**

---

## 10. Phase 7 — evaluator Mode 3 (proactive)

> Skip in `quick` and `spec-only` (override with `+evaluator`).
> In `full`: gated by triggers below.
> In `paranoid`: always run.

### Triggers in `full` mode (any of)

- `TOUCHED_SCHEMA > 0`
- `TOUCHED_AUTH > 0`
- `TOUCHED_PAYMENT > 0`
- `DRIFT_RISK ≠ none`
- Phase 5 OR Phase 6 returned P0/P1 AND user said "continue"
- `TOTAL_LINES > 500` OR `TOTAL_FILES > 15`

If none → skip Phase 7 in `full`.

**Agent:** `evaluator` Mode 3. **Foreground.** No file writes (Mode 3 hard constraint).

### Invocation

```typescript
Agent({
  description: "Pre-verdict architecture analysis",
  subagent_type: "evaluator",
  prompt: `Mode 3: Architecture Analysis (proactive pre-verdict consultation).

Diff summary: <Phase 1.3 stat output>
Plan: <plan path or "none">
Risk signals: schema=<bool>, auth=<bool>, payment=<bool>, drift=<DRIFT_RISK>

Codex review findings (Phase 5): <P0/P1/P2 list or "clean">
Codex adversarial findings (Phase 6): <P0/P1 list or "clean">

Tasks:
1. Frame the architectural problem this diff solves (1 paragraph)
2. List 2 alternative approaches that were not taken
3. Multi-lens evaluation (technical / economic / human / systemic / temporal)
4. Adversarial inversion: "what would make this diff a regression in 6mo?"
5. Second-order effects (6mo / 2yr / 10yr)
6. Confidence calibration on the chosen approach
7. Synthesis: APPROVED / REVISION_REQUIRED + 1-line reason

Hard constraint: analysis only, no file writes, no code generation. Under 300 tokens.`
});
```

### Pass condition

`APPROVED` verdict.

### Fail handling

`REVISION_REQUIRED` → STOP → invoke `/debug recover`.

---

## 11. Phase 8 — Verification report + verdict

Use the verdict matrix template from `_shared.md` § 9. Produce one consolidated report:

```markdown
## /verify Report — <YYYY-MM-DD HH:MM>

### Inputs
- Plan: <path | "(none — prompt only)">
- Original ask: <one-line summary>
- Diff: <N files, +X / -Y lines>
- Mode: full | quick | spec-only | paranoid
- Risk signals: schema=<bool> auth=<bool> payment=<bool> drift=<DRIFT_RISK>

### Phase 0 — Gates
- type-check / lint / formatter: PASS / FAIL each

### Phase 2 — /debug
- Mode: <debug | frontend | backend | auth-db | SKIPPED>
- Fixes applied: <count> @ <files>
- Findings open: <count>
- Status: PASS / FAIL / SKIPPED

### Phase 3 — /perf
- Mode: <runtime | db | build | mixed | SKIPPED>
- Scores: Perf XX | A11y XX | BP XX | SEO XX
- CWV: LCP X.Xs | CLS X.XX | INP Xms
- DB: N+1 <none|found> | FK index gaps <count> | SELECT * <count>
- Status: PASS / WARN / FAIL / SKIPPED

### Phase 3.5 — E2E browser
- Routes tested: <N>
- Console errors: <count>
- Network failures: <count>
- Screenshots: <paths>
- Status: PASS / FAIL / SKIPPED

### Phase 4 — Spec Compliance
| # | Requirement | Status | Evidence |
|---|---|---|---|
| 1 | <text> | ☑ | path:line |

- Scope drift: <list of drifted files | "(none)">
- DRIFT_RISK: <auth | payment | PII | schema | env | ci | none>

### Phase 5 — /codex:review
- Findings: P0=<n> P1=<n> P2=<n> P3=<n>
- Session ID: <id>
- Status: PASS / WITH-NOTES / FAIL / SKIPPED

### Phase 6 — /codex:adversarial-review
- Focus: <focus_text>
- P0/P1 challenges: <count + 1-line summaries>
- Status: PASS / FAIL / SKIPPED

### Phase 7 — evaluator Mode 3
- Triggers fired: <list>
- Verdict: APPROVED / REVISION_REQUIRED / SKIPPED
- Key finding: <one-liner>

### Verdict
**VERIFIED** | **VERIFIED-WITH-NOTES** | **NEEDS-WORK** | **FAILED**

### Notes (only if VERIFIED-WITH-NOTES)
- <Codex P2/P3 finding summary>
- <perf WARN band note, if any>
- <evaluator caveat, if any>

### Next
- (NEEDS-WORK) Address: R2, R3, Codex P0/P1 findings
- (FAILED) `/debug recover` invoked — see attached failure report
- (VERIFIED / VERIFIED-WITH-NOTES) Phase 9 (/evolve) running
```

### Verdict matrix

Per `_shared.md` § 9 (Verdict Matrix template).

| Phase 0 | 2 | 3 | 3.5 | 4 | 5 | 6 | 7 | Verdict |
|---|---|---|---|---|---|---|---|---|
| PASS | PASS | PASS | PASS/SKIP | All ☑ | clean OR P3 | clean | APPROVED/SKIP | **VERIFIED** |
| PASS | PASS | WARN | PASS/SKIP | All ☑ | P2/P3 only | clean | APPROVED/SKIP | **VERIFIED-WITH-NOTES** |
| PASS | PASS | PASS | PASS/SKIP | Any ☐/⚠ | — | — | — | **NEEDS-WORK** |
| PASS | PASS | PASS | PASS/SKIP | All ☑ | P0/P1 | — | — | **NEEDS-WORK** |
| PASS | PASS | PASS | PASS/SKIP | All ☑ | — | P0/P1 | — | **NEEDS-WORK** |
| PASS | PASS | PASS | PASS/SKIP | All ☑ | — | — | REVISION_REQUIRED | **NEEDS-WORK** |
| PASS | PASS | PASS | FAIL | — | — | — | — | **FAILED** → `/debug frontend` |
| Any FAIL | — | — | — | — | — | — | — | **FAILED** → `/debug recover` |

---

## 12. Phase 9 — `/evolve` (learnings capture)

> Run only if verdict ∈ {`VERIFIED`, `VERIFIED-WITH-NOTES`}.
> Skip if `--no-evolve` arg passed.
> Skip in `quick` and `spec-only`.

**Skill:** `evolution-core`.

```typescript
Skill("evolution-core");
// Then invoke /evolve with the verify report as input
```

`/evolve` orchestrates:
- Captures new patterns from the diff (reusable components, helpers introduced)
- Updates project learnings docs (frontend / backend / DB) if relevant patterns detected
- Updates `MEMORY.md` if pattern is cross-session relevant
- **Does NOT modify `AGENTS.md`** without explicit user approval

### Output

List of files updated + 1-line summary per update. Surface in chat — do not silently mutate documentation.

---

## 13. Escalation map

| Condition | Action |
|---|---|
| Phase 0 gates fail | STOP, surface error |
| Phase 2 `/debug` unresolved or 2× fix fail | `/debug recover` |
| Phase 3 `/perf` below WARN, new N+1, FK index missing | `/debug recover` |
| Phase 3.5 E2E fail | STOP, invoke `/debug frontend` |
| Phase 5 codex P0/P1 | STOP, ask user which to fix |
| Phase 6 adversarial P0/P1 | STOP, present, ask user before Phase 7 |
| Phase 7 evaluator REVISION_REQUIRED | `/debug recover` |
| 2 consecutive `/verify` runs return FAILED on same diff | evaluator Mode 3 reactive |
| Scope drift in auth / payment / PII / schema / env / ci | Phase 7 trigger automatic in `full`; in `quick`/`spec-only` ASK user |
| No plan and no `$ARGUMENTS` | ASK user |

---

## 14. Mode behavior matrix

| Mode | 0 | 1 | 2 | 3 | 3.5 | 4 | 5 | 6 | 7 | 8 | 9 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `full` | YES | YES | YES | YES | IF UI | YES | YES | YES | IF risk | YES | IF VERIFIED |
| `quick` | YES | YES | YES | SKIP | SKIP | YES | SKIP\* | SKIP\* | SKIP\* | YES | SKIP |
| `spec-only` | SKIP | YES | SKIP | SKIP | SKIP | YES | YES | SKIP | SKIP | YES | SKIP |
| `paranoid` | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES | YES |

\* `+codex` / `+adversarial` / `+evaluator` / `+e2e` flags override SKIP.

---

## 15. Agent / skill matrix

Per `_shared.md` § 3 and `debug.md` § 7. Quick reference:

| Phase | Agent | Skill | Foreground/Background |
|---|---|---|---|
| 0 — Gates | none (direct Bash) | — | — |
| 1 — Resolve Inputs | none | — | — |
| 2 — `/debug` | `debugger` | `debugger` | foreground (write-capable) |
| 3 — `/perf` | `performance-optimizer` | `performance-optimization` | foreground (write-capable, worktree-isolated) |
| 3.5 — E2E browser | `verification-agent` | (Playwright MCP) | foreground |
| 4 — Spec Compliance | none (direct Read/Grep) | — | — |
| 5 — `/codex:review` | none (slash → codex-plugin-cc) | — | background, collected before Phase 8 |
| 6 — `/codex:adversarial-review` | none (slash → codex-plugin-cc) | — | background, collected before Phase 8 |
| 7 — evaluator Mode 3 | `evaluator` | — | foreground |
| 8 — Report | none | — | — |
| 9 — `/evolve` | none | `evolution-core` | foreground |
| Escalation — fix loop fail | `codex:codex-rescue` | `codex:rescue` | foreground |
| Escalation — 2× FAILED reactive | `evaluator` Mode 3 | — | foreground |

---

## 16. Anti-patterns to reject

- Calling `Skill("debugger")` then also spawning the agent for the same investigation → wastes context. Skill is loaded once at Phase 1.0.
- Spawning `performance-optimizer` directly from `/verify` → bypasses `/perf` orchestration. Always go through `/perf`.
- Spawning `codex-rescue` agent for code review → use `/codex:review` slash command.
- Auto-fixing findings from `/codex:adversarial-review` → present, ask user.
- Running Phase 7 when Phase 5/6 STOPPED awaiting user input → wait for "continue" first.
- Running Phase 9 on `NEEDS-WORK`/`FAILED` → captures wrong learnings. Hard constraint.
- Using `subagent_type: "Explore"` (built-in) when `_shared.md § 3` mandates `"explorer"` (custom).

---

## 17. After VERIFIED

- Phase 9 (`/evolve`) writes any new learnings (only on `VERIFIED` / `VERIFIED-WITH-NOTES`)
- Pre-commit reminder: `${tooling.linter} check --write <touched-files>`
- If session is long → suggest `/evolve handoff` to write session state
- If `VERIFIED-WITH-NOTES` → surface the notes section explicitly
