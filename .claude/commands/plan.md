---
description: Planning command. Classifies complexity, researches if needed, produces an implementation-ready plan. Does not write code. Delegates methodology to the planning skill.
workflow_type: prompt-chaining
---

# /plan

**ARGUMENTS**: $ARGUMENTS

> **Invoke the `planning` skill now** (`.claude/skills/planning/SKILL.md`) before proceeding.
> All methodology, output formats, layer stack, classification rules, and checklists are defined there.
>
> Project layer chain documented in `.claude/CLAUDE.md § Routing matrix (project-specific)` and root `AGENTS.md § Architecture Map`.

---

## Routing

```
L1-L2 (single file, clear root cause)?           → Skip /plan, fix directly
Frontend creation (new page/component)?           → Route to /design first
Backend + frontend hybrid?                        → Plan backend first, then /design for UI
Contains "--build"?                               → Plan → Sprint Contracts → Build → QA loop
```

## Flags

| Flag | Effect |
|---|---|
| `--build` | Execute plan after approval — spawn `/implement` automatically |
| `--plan-only` | Skip evaluator review of the plan itself |
| `--skip-research` | Skip codebase research (only for well-known trivial patterns) |
| `--sprints=N` | Override sprint count for complex plans |

---

## Execution

1. **Classify** the request: Simple (L1-L3) / Medium (L4-L5) / Complex (L6+)
2. **Research** for Medium+: invoke `/research` to grep codebase + check external docs before planning
3. **Produce plan** in the format matching the classification (per planning skill)
4. **Evaluator gate** for Complex (L6+): spawn `evaluator` agent — must pass all thresholds
5. **Present plan** and wait for user approval — do not begin implementation

---

## Stopping Conditions

- STOP if request is L1-L2 → tell user to fix directly, skip planning
- STOP after presenting plan → wait for user approval before `/implement`
- STOP if `evaluator` returns REVISION_REQUIRED 3× → present all feedback, ask user
- ASK if requirements span 3+ domains without clear priority order

---

## Output template (Medium / Complex)

```markdown
## Plan: [Feature Name]

**Complexity:** L[N] — [one-line justification]
**Layers:** [layers touched, in execution order — derived from project layer map]
**Assumptions:** [any ASSUMED constraints]

### Phase 1: [Layer] [SEQUENTIAL]
- [ ] `[exact file path]:[line-ref if applicable]` — [action] — verify: `[command]`

### Phase 2: [Layer] [PARALLEL if independent]
- [ ] `[exact file path]` — [action]

**Risks:** [non-obvious risks and mitigations]

---
Evaluator: [APPROVED | REVISION_REQUIRED — N iterations] (Complex only)
Plan saved: `docs/plans/YYYY-MM-DD-[slug].md` (Complex only)

Next: run /implement to execute, or ask to adjust any item above.
```
