---
description: Execute implementation plans. Parses plan for phase structure + agent assignments, loads domain skills, spawns specialists, orchestrates parallel/sequential execution with sprint contract gates.
workflow_type: orchestrator-workers
---

# /implement

**ARGUMENTS**: $ARGUMENTS

> **Plans come from:** `/plan` — format defined in `.claude/skills/planning/SKILL.md`
> **Plan files:** `docs/plans/YYYY-MM-DD-<feature>.md` or active conversation context

---

## 0. Pre-flight

```bash
ls docs/plans/*.md 2>/dev/null
```

| Source | Action |
|---|---|
| Plan file exists | Load from file |
| Plan in chat context | Extract phases + tasks from conversation |
| No plan found | Run `/plan` first — never implement without a plan |

Parse from plan: **Complexity**, **Layers**, phase markers (`[SEQUENTIAL]` / `[PARALLEL]`), task list (`- [ ]`), verify commands, sprint contracts, `[ASSUMED]` items to validate before starting.

Read `.claude/config.json` for tooling + paths. Project-specific layer/agent routing lives in `.claude/CLAUDE.md § Routing matrix (project-specific)`.

**Flags:**

| Flag | Effect |
|---|---|
| `--codex` | Delegate L5+ phases to `codex:rescue` skill |
| `--sprint=N` | Execute only sprint N of multi-sprint plan |
| `--dry-run` | Parse + display task/agent assignments without executing |

---

## 1. Skill routing

Per `_shared.md` § 6 (Skill-to-Domain Matrix), load the skill matching the task domain **before spawning any agent for that phase**.

If the plan touches:
- Schema / migrations / data → load `debugger` skill (and `supabase-postgres-best-practices` for Postgres)
- API / handlers / services → `debugger`
- React / components / styling → `ui-ux-pro-max` + `frontend-design`
- Performance / SEO → `performance-optimization`
- Spreadsheets / data files → `xlsx`
- Skill creation / iteration → `skill-creator`
- Supabase products → `supabase`

Multiple skills may load. Process skills (`planning`, `debugger`) before implementation skills.

---

## 2. Agent assignment

If plan doesn't specify `**Agent:**`, assign by file-path detection:

| File-path pattern | Agent |
|---|---|
| `${paths.schemaRoot}/**` | `debugger` |
| `${paths.backendRoot}/**` | `debugger` |
| `${paths.frontendRoot}/**` (UI files) | `frontend-specialist` |
| `${paths.frontendRoot}/**` (logic / hooks / non-UI) | `debugger` |
| Cross-domain (3+ layers) | `project-planner` as coordinator |
| Any failing task | `debugger` |

Project-specific bindings in `.claude/CLAUDE.md § Routing matrix`.

Background read-only agents (always `run_in_background: true`):

| When | Agent |
|---|---|
| Before any phase — grep existing patterns | `explorer` |
| External API docs, package versions | `librarian` |

---

## 3. Execution mode (per `_shared.md` § 2)

| Complexity | Mode |
|---|---|
| L1-L2 | DIRECT — main agent executes |
| L3-L5 | SUBAGENTS — `Agent()` per task/phase |
| L6+ | AGENT TEAMS — `TeamCreate` + coordinator + `TaskCreate` |

---

## 4. Mode A — DIRECT (L1-L2)

1. Load skill for the task domain
2. Execute task directly in main agent
3. Run verify command
4. Gate per `_shared.md` § 1 (type-check)

---

## 5. Mode B — SUBAGENTS (L3-L5)

### Before any phase

Spawn `explorer` in background to grep existing patterns relevant to this phase:

```typescript
Agent({
  subagent_type: "explorer",
  prompt: "Grep [domain] patterns in [paths]. Report file:line for reuse.",
  run_in_background: true
});
```

### Sequential phase

Per `_shared.md` § 8 (Sequential Phase Gating).

```
Load domain skill
→ Spawn agent for task 1 → wait → run verify command → gate
→ Spawn agent for task 2 → wait → run verify command → gate
→ ...
```

### Parallel phase

Per `_shared.md` § 7 (Parallel Agent Spawn). Spawn all independent tasks in **single message**:

```typescript
// Write-capable → foreground:
Agent({ subagent_type: "frontend-specialist", prompt: "..." })
Agent({ subagent_type: "debugger", prompt: "..." })
// Read-only → background:
Agent({ subagent_type: "explorer", prompt: "...", run_in_background: true })
```

After all complete: parse each agent's `## Context Handoff` block per `.claude/skills/senior-prompt-engineer/references/agent-handoff-contracts.md § 2`, consolidate parallel-batch findings per `parallel-batch-contracts.md § 5`, run phase gate.

### Sprint contract gate

If plan includes sprint contracts, after all tasks in a sprint:

1. Run each `verify:` command listed in the contract's Done Definition
2. All must pass — no partial credit
3. Any failure → fix + re-run before next sprint

---

## 6. Mode C — AGENT TEAMS (L6+)

### Setup

```typescript
TeamCreate({ team_name: "[feature-slug]" });
```

### Coordinator pattern

Create a **coordinator task** assigned to `project-planner`. The coordinator:
- Holds the full plan + sprint contracts
- Delegates domain tasks via `SendMessage` — every spawn injects the 5 mandatory context fields per `.claude/skills/senior-prompt-engineer/references/agent-handoff-contracts.md § 1`
- Validates each specialist's `## Context Handoff` against the contract using the schema in `agent-handoff-contracts.md § 2-3`
- Gates sprints before advancing
- Reports progress + blockers
- **Max 2 agent resubmissions per task on `REVISION_REQUIRED`.** After the 2nd, coordinator returns `BLOCKED: <criterion>` to main agent (NOT user). Main invokes `/debug recover`. See `agent-handoff-contracts.md § 4`.

```typescript
// Coordinator (foreground — must complete before team cleanup):
TaskCreate({ subject: "Coordinator — [feature]", owner: "project-planner" });

// Domain specialists (spawned by coordinator or in parallel where contracts allow):
TaskCreate({ subject: "Schema + API — Sprint N", owner: "debugger" });
TaskCreate({
  subject: "UI Layer — Sprint N",
  owner: "frontend-specialist",
  addBlockedBy: ["[schema-task-id]"]
});
TaskCreate({
  subject: "Integration — Sprint N",
  owner: "debugger",
  addBlockedBy: ["[api-task-id]"]
});
```

### Coordinator prompt template

```
You are the coordinator for implementing [feature].

Plan: [paste plan content or docs/plans/[slug].md]
Sprint contract: [paste Sprint N contract]
Skill loaded: [skill name for this domain]

Responsibilities:
1. Delegate schema/API tasks to debugger agent via SendMessage
2. Delegate UI tasks to frontend-specialist (only after API phase passes gate)
3. Validate each agent's Context Handoff against contract Done Definition
4. Run quality gate after each phase: ${tooling.packageManager} run ${tooling.typeChecker}
5. If any criterion fails → return detailed feedback to the responsible agent, not the user. Max 2 resubmissions per task on REVISION_REQUIRED — on the 3rd would-be iteration, return BLOCKED to main agent (which calls /debug recover)
6. Only report to user: SPRINT N COMPLETE (all criteria met) or BLOCKED: [specific failing criterion + last reviewer evidence]

Do not implement yourself. Coordinate, validate, gate.
```

### Context management

| Model | Strategy |
|---|---|
| Sonnet 4.x | Context reset between sprints — write handoff artifact before each reset |
| Opus 4.6+ | Auto-compaction, continuous session — monitor for context anxiety |

Handoff artifact path: `docs/plans/HANDOFF-[slug]-sprint-N.md` (use `.claude/templates/handoff-template.md` structure).

Handoff contains: completed tasks, verified state, next sprint contract, open issues, key decisions, modified files, resume commands.

Context anxiety symptoms (Sonnet): agent rushing, skipping edge cases, accepting failures. If observed → trigger reset immediately.

---

## 7. `--codex` flag (L5+ delegation)

For implementation phases too large or complex for a standard agent:

Invoke `codex:rescue` skill with:
- Task description from the plan phase
- Sprint contract done criteria
- Relevant file paths + line references
- Verify command

Codex handles implementation. Main agent validates against the sprint contract when done.

---

## 8. Quality gates

Per `_shared.md` § 1.

| When | Command |
|---|---|
| After each task | `${tooling.packageManager} run ${tooling.typeChecker}` |
| After each phase | type-check + lint |
| After sprint (if contracts) | All `verify:` commands in Done Definition |
| Final | type-check + lint + tests |

---

## 9. Failure handling

| Attempt | Action |
|---|---|
| 1st | Read error. Retry with error context added to agent prompt |
| 2nd | Invoke `debugger` skill. Break task into smaller subtasks |
| 3rd | Switch to `/debug recover`. Escalate to user with root-cause analysis |

Never retry blindly. Never skip a gate because a task "looks correct."

---

## Stopping conditions

- STOP if no plan exists → run `/plan` first
- STOP after 3rd failure on same task → invoke `/debug recover`
- STOP if agent team runs 10+ task iterations without sprint completion
- ASK if plan has `[ASSUMED]` items not yet validated
- ASK before destructive operations (schema drops, data deletion)

---

## 10. Cleanup (Agent Teams)

After all sprints complete:

```typescript
// Signal completion, collect final handoffs
TeamDelete({ team_name: "[feature-slug]" });
```

---

## 11. Completion

```
Implementation complete.

Gates passed:
  - Type check: ok
  - Lint: ok
  - Tests: ok
  - Sprint contracts: ok (if applicable)

Options:
  1. PR     → push + open PR
  2. Keep   → branch ready for review
  3. /evolve → capture learnings, update AGENTS.md + memory
```
