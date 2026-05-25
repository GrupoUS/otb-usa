# Harness Patterns — Generator-Evaluator Loop, Sprint Contracts, Context Resets

> Source: Anthropic Engineering, "Harness Design for Long-Running Apps"

---

## 1. Generator-Evaluator Loop (GEL)

**The core insight:** Separate production from quality judgment. Never ask the same agent to generate AND evaluate its own work.

**Why self-review fails:** Agents default to "confidently praising work — even when quality is obviously mediocre." A generating agent is motivated (implicitly) to complete the task, which creates subtle bias toward approving its own output.

**The solution:** A separate evaluator with calibrated skepticism. The evaluator's role is NOT to be adversarial but to be the second set of eyes with a different incentive: catch what the generator missed.

```
Generator Agent  →  produces plan/spec/code
                      ↓
Evaluator Agent  →  scores against explicit criteria
                      ↓
     PASS? → proceed     FAIL? → actionable feedback → generator
```

### Evaluator Disposition

- Score against hard thresholds, not gut feel
- FAIL with specific, actionable feedback — vague "needs improvement" is useless
- Do not approve work that misses thresholds even if overall quality seems acceptable
- Distinguish architectural issues (Mode 3) from quality issues (Mode 1)

### Calibration Anchors (Scoring 1-10)

Use these anchors to prevent score drift. Calibrate evaluator judgment before each session.

| Score | Completeness | Atomicity | Risk Coverage | Dependency Order |
|-------|-------------|-----------|---------------|-----------------|
| **9** | Every requirement maps to ≥1 task; edge cases covered | Each step is clearly one action (2-5 min), no ambiguity | Top 5 risks with mitigations, all BLOCK items addressed | Can execute in order without backtracking |
| **7** | All requirements covered, minor edge cases missing | Most steps atomic, 1-2 steps slightly large but splittable | Major risks identified, some mitigations vague | Order works, minor dependency question |
| **5** | Core requirements covered, 1-2 missing | Mix of atomic and vague steps | Some risks noted, mitigations missing | Some tasks could conflict, needs clarification |
| **3** | Several requirements missing or vague | Steps like "implement auth" with no decomposition | Risks absent or trivial | Order unclear or has explicit conflict |

**Hard thresholds:** Completeness ≥ 8 · Atomicity ≥ 7 · Risk Coverage ≥ 7 · Dependency Order ≥ 8

---

## 2. Sprint Contract Template

**Purpose:** Before any implementation begins, planner and evaluator negotiate explicit agreements defining WHAT will be built, HOW success will be verified, and the SCOPE BOUNDARY. This bridges user stories → testable implementation.

```markdown
### Sprint Contract: [Sprint N — Name]

**Deliverables:**
- [ ] `exact/path/to/file.ts` — [what it does]
- [ ] `exact/path/to/other.ts` — [what it does]

**Acceptance Criteria:**
- [ ] `bun test apps/api/src/path/test.ts` passes
- [ ] `${tooling.packageManager} run ${tooling.typeChecker}` reports 0 errors
- [ ] [Playwright: user can do X without Y error]
- [ ] Edge case: [describe at least 1 edge case and expected behavior]

**Done Definition:** `${tooling.packageManager} run ${tooling.typeChecker} && ${tooling.packageManager} run ${tooling.testRunner} <path>`

**Boundary (NOT in this sprint):**
- [Feature A] — defer to Sprint N+1
- [Edge case B] — out of scope for this milestone
```

### Mini-Contract (L3-L5)

For lower complexity, use a 3-line version:

```markdown
**Sprint N:** [Name] — builds [X], verified by `[command]`, excludes [Y].
```

### Worked Example (Database Schema Sprint — generic)

```markdown
### Sprint Contract: Sprint 1 — Database Schema

**Deliverables:**
- [ ] `${paths.schemaRoot}/<schema-file>` — add `notifications` table with FK to `users`
- [ ] `${paths.schemaRoot}/0005_notifications.sql` — migration file

**Acceptance Criteria:**
- [ ] `${tooling.packageManager} run db:push` (or framework migration command) completes without errors
- [ ] `${tooling.packageManager} run ${tooling.typeChecker}` reports 0 errors
- [ ] FK index exists on `notifications.user_id`
- [ ] Edge case: duplicate notification insert rejected by unique constraint

**Done Definition:** type-check + apply migration both pass

**Boundary (NOT in Sprint 1):**
- Notification delivery logic — Sprint 2
- Frontend notification bell — Sprint 3
```

---

## 3. Context Reset Protocol

**When context becomes a problem:**
- After completing a phase in a long session (L6+)
- Context exceeds ~80K tokens
- Agent starts repeating or summarizing instead of progressing
- "Context anxiety" — model prematurely wraps up

**The reset approach:** Write a structured handoff artifact, clear context, resume with only the artifact + active sprint contract.

### Handoff Artifact Format

Save to `docs/plans/HANDOFF-{slug}.md`:

```markdown
# Context Handoff — {slug}

**Session Date:** YYYY-MM-DD
**Current Phase:** [Phase N: Name]
**Complexity Level:** L[X]

## Completed
- [Phase 1]: [brief summary of what was done]
- [Sprint 1]: [outcome]

## Active Sprint Contract
[paste the current sprint contract block here]

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| [Decision A] | [why] |

## Unresolved
- [ ] [Question or issue still open]
- [ ] [Dependency not yet resolved]

## Next Action
[Exactly one sentence: what to do first after loading this handoff]
```

**How to resume:** New context loads this artifact + reads the plan file's relevant sprint. No need to replay full conversation history.

**Integration:** This artifact is NOT the same as `/handoff` (which is for ending a session entirely). Context resets are mid-plan checkpoints for long L6+ tasks.

---

## 4. Iterative Simplification

> "Every component in a harness encodes an assumption about what the model can't do on its own — and those assumptions are worth stress testing."

As Claude's capabilities improve across model versions:

1. **Stress-test each harness component:** Can the model now handle this natively?
2. **Sprint decomposition** may become unnecessary for high-capability models (Anthropic observed Opus 4.6 handles tasks natively that Sonnet 4.5 needed explicit sprint decomposition for)
3. **Evaluator strictness** may be adjustable — less hand-holding on obvious quality failures
4. **Context resets** may become less necessary as long-context retrieval improves

**Principle:** Don't calcify harness patterns. Remove components that no longer encode real limitations. The interesting harness work moves to more sophisticated orchestration, not less.
