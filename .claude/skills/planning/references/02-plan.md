# Plan — Implementation Plan Structure

**Save to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

> Project context comes from `.claude/config.json` (`paths.*`, `tooling.*`) and the optional `${overlay}/layer-map.md`. Examples below use placeholders — substitute with the host project's values.
> Plan handoff to executor agent must conform to `.claude/skills/senior-prompt-engineer/references/agent-handoff-contracts.md`.

---

## Plan Document Template

```markdown
# [Feature Name] Implementation Plan

> **For Claude:** Use this plan with `/implement` command.

**Goal:** [One sentence describing what this builds]

**Architecture:** [2-3 sentences — which layers in the project's chain, why]

**Tech Stack:** [resolved from `.claude/config.json::tooling` — package manager, build tool, type checker, test runner, framework]

**Complexity:** L[1-10] — [Justification]

---

## Research Summary

| #  | Finding | Confidence | Source   | Impact |
|----|---------|------------|----------|--------|
| 1  | ...     | 4          | codebase | high   |

**Knowledge Gaps:** [What remains unknown]
**Assumptions:** [To validate]
**Edge Cases:** [Min 5 for L4+]

---

## Sprint Contracts

> Negotiated between planner and evaluator BEFORE implementation begins.
> Full template + calibration anchors → `references/04-harness-patterns.md`.

### Sprint Contract: Sprint 1 — [Name]

**Deliverables:**
- [ ] `exact/path/to/file.<ext>` — [what it does]

**Acceptance Criteria:**
- [ ] `${tooling.packageManager} run ${tooling.typeChecker}` reports 0 errors
- [ ] `${tooling.packageManager} run ${tooling.testRunner} <path>` passes (when project has a test runner)
- [ ] `${tooling.packageManager} run ${tooling.linter}` passes
- [ ] Edge case: [describe at least 1]

**Done Definition:** [project's quality-gate command from `.claude/config.json` or `${overlay}/layer-map.md`]

**Boundary (NOT in Sprint 1):** [explicit deferrals]

### Sprint Contract: Sprint 2 — [Name]

[Same structure]

---

## Tasks

### Phase 1: Foundation [SEQUENTIAL]

> Context Reset Checkpoint: write handoff artifact if context > 80K (per `references/04-harness-patterns.md § 3`).

### Task 1: [Component Name]

**Files:**
- Create: `exact/path/to/file.<ext>`
- Modify: `exact/path/to/existing.<ext>:123-145`
- Test: `tests/path/to/test.<ext>` (if `tooling.testRunner` non-empty)

**Step 1: Define the contract first** (TDD when project has a test runner)

```pseudo
test('specific behavior', () => {
  const result = process(input);
  expect(result).toBe(expected);
});
```

**Step 2: Run and verify it fails**

Run: `${tooling.packageManager} run ${tooling.testRunner} tests/path/test.<ext>`
Expected: FAIL with "function not defined"

**Step 3: Minimal implementation**

```pseudo
export function process(input: InputType): OutputType {
  return expected;
}
```

**Step 4: Verify it passes**

Run: `${tooling.packageManager} run ${tooling.testRunner} tests/path/test.<ext>`
Expected: PASS

**Step 5: Commit**

```bash
git add tests/path/test.<ext> src/path/file.<ext>
git commit -m "feat: <concise message>"
```

### Phase 2: Core [PARALLEL]

> ⚡ PARALLEL-SAFE: Can run simultaneously
> Context Reset Checkpoint after phase if context > 80K.

### Task 2: [Backend Component]

**Owner:** debugger (or appropriate specialist)
[Same structure as Task 1]

### Task 3: [Frontend Component]

**Owner:** frontend-specialist
[Same structure as Task 1]

### Phase 3: Integration [SEQUENTIAL]

### Task 4: [Integration]

[Same structure as Task 1]

---

## Handoff

**Options:**

1. Implement now — `/implement`
2. Review first — open plan file
3. Modify plan — adjust before execution

**Artifact handoff format** (mid-plan context resets):
- Save current state to `docs/plans/HANDOFF-{slug}.md`
- Include: current phase, completed deliverables, active sprint contract, unresolved decisions, next action
- Schema → `references/04-harness-patterns.md § 3`

**Executor handoff** (planner → executing agent): conform to Context Handoff schema in `.claude/skills/senior-prompt-engineer/references/agent-handoff-contracts.md`. Parallel-batch returns conform to `parallel-batch-contracts.md`.
```

---

## Complexity Levels

| Level  | Indicators                       | Deliverables                                  |
|--------|----------------------------------|-----------------------------------------------|
| L1-L2  | Bug fix, single function         | Atomic tasks                                  |
| L3-L5  | Feature, multi-file              | Tasks + research + parallel + mini-contracts  |
| L6-L8  | Architecture, integration        | + full sprint contracts + pre-mortem + ADR    |
| L9-L10 | Migrations, multi-service        | + dependency graph                            |

### Complexity Indicators

| Increases (+1 to +2) | Decreases (-1)        |
|----------------------|-----------------------|
| Multi-file            | Existing pattern reused |
| DB / schema change    | Similar code already exists |
| Auth / permission change | Isolated to one module |
| 3rd-party API integration | Tests already exist |
| Breaking change       | Feature flag available |
| Security-sensitive    | |
| Multi-service         | |

---

## Task Granularity

**Each step is ONE action (2-5 minutes):**

- "Write the failing test" — step
- "Run it to make sure it fails" — step
- "Implement minimal code to pass" — step
- "Run tests and verify pass" — step
- "Commit" — step

```
❌ "Implement auth" (too big)
✅ "Add Zod schema for login form" (atomic)
```

### Task Requirements

- Exact file paths with line ranges where relevant
- Complete code snippets (never "add validation" or "implement logic")
- Validation command per phase (`${tooling.packageManager} run …`)
- Rollback implicit: undo the change
- Dependencies marked with ⚡ PARALLEL-SAFE

---

## Phase Organization

### Sequential Phases

```markdown
### Phase 1: Foundation [SEQUENTIAL]

> Must complete before next phase
> Context Reset Checkpoint after phase if context > 80K

- Task 1.1
- Task 1.2
```

### Parallel Phases

```markdown
### Phase 2: Core [PARALLEL]

> ⚡ PARALLEL-SAFE: independent components

- Task 2.1 (debugger)
- Task 2.2 (frontend-specialist)
- Task 2.3 (debugger)
```

---

## Confidence Scoring

| Score | Meaning                       | Action               |
|-------|-------------------------------|----------------------|
| **5** | Verified in codebase / docs   | Use directly         |
| **4** | Multiple sources agree        | Use with confidence  |
| **3** | Community consensus           | Note uncertainty     |
| **2** | Single source / unverified    | Flag as assumption   |
| **1** | Speculation                   | Don't rely on it     |

**Rule:** Findings ≤ 2 MUST be flagged and validated before relying.

---

## Agent Selection

| Complexity | Pattern    | Agents              | Parallel? |
|------------|------------|---------------------|-----------|
| L1-L2      | Direct     | None                | N/A       |
| L3         | Subagent   | 1 (explorer or specialist) | No |
| L4-L5      | Swarm      | 2-3 subagents       | YES       |
| L6-L8      | Team       | 3-5 teammates       | YES       |
| L9-L10     | Full Swarm | 5+                  | YES       |

Spawn templates + handoff schema → `.claude/skills/senior-prompt-engineer/SKILL.md`.

---

## L6+ Additions

For complex tasks (L6+), add these sections:

### Risk Assessment

```markdown
## Risk Assessment

| Risk     | Probability  | Impact       | Mitigation        |
|----------|--------------|--------------|-------------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [How to mitigate] |
```

### Architecture Decision Record (ADR)

```markdown
## ADR: [Decision Title]

**Context:** [Why this decision was needed]

**Decision:** [What was decided]

**Alternatives Considered:**

1. [Alternative 1] — Rejected because [...]
2. [Alternative 2] — Rejected because [...]

**Consequences:** [Trade-offs accepted]
```

> Full pre-mortem protocol → `references/03-risk.md`.

---

## Pre-Commit Checklist

Before presenting plan:

- [ ] Research complete (codebase, official docs via Context7, current best practices via Tavily)
- [ ] Sprint contracts negotiated and evaluator-approved (L6+)
- [ ] Atomic tasks (2-5 min each step)
- [ ] Exact paths
- [ ] Complete code snippets provided
- [ ] Parallel tasks marked with ⚡
- [ ] Confidence scores (1-5)
- [ ] L6+: ADR + Risk Assessment
- [ ] No layers invented that the host project doesn't have
- [ ] Cardinal rules from host `.claude/CLAUDE.md` upheld

---

## Remember

- Exact file paths
- Complete code in plan (not "add validation")
- Exact verify command per phase (lint / type-check / test / build per project convention)
- DRY, YAGNI, frequent commits (Conventional Commits)
- One action per step (2-5 minutes)
- Sprint contracts come BEFORE tasks — evaluator approves first
