# Risk — Risk Assessment & Decisions (L6+)

**When to use:** L6+ tasks, architecture decisions, multi-module changes, breaking changes, security-sensitive work.
**Skip:** L1-L5 unless breaking changes / security / data loss risk.

---

## Pre-Mortem (Failure Analysis)

### 1. Assume Failure

> "2 days later. The feature broke. What happened?"

Common categories:
- **Build / type-check** — schema drift, missing import, generated-types stale, lockfile conflict
- **Logic** — null checks, race conditions, off-by-one, unhandled promise rejection
- **Integration** — webhook signature, API contract mismatch, version skew
- **Data** — migration path, FK constraint, missing index, data loss on rollback
- **Auth / permission** — wrong scope, tenant filter missing, privilege escalation
- **Performance** — N+1, full table scan, hot path allocation, bundle bloat
- **Security** — input validation gap, secret leak, CSRF/XSS, SSRF
- **A11y / SEO** — missing labels, focus traps, broken canonical, missing meta
- **Cross-cutting** — telemetry blind spot, log injection, missing rollback path
- **Human** — requirement misread, scope creep, cardinal-rule violation

### 2. Ranking

```
Score = Probability (1-3) × Impact (1-3)
```

| Score | Action                         |
|-------|--------------------------------|
| 7-9   | **BLOCK** — mitigate first     |
| 4-6   | **MITIGATE** — add safeguards  |
| 1-3   | **ACCEPT** — monitor           |

### 3. Embed in Plan

```markdown
## Risk

| # | Risk | Score | Mitigation |
|---|------|-------|------------|
| 1 | [risk description] | 6 | [concrete mitigation step + owner] |
```

---

## Stack-Specific Failure Modes

> Populate from the host project's `${overlay}/layer-map.md`. Generic checklist below — adapt to stack.

| Layer | Failure (generic) | Prevention |
|-------|-------------------|------------|
| Schema / migration | Missing index on FK | Add index in same migration |
| Validator | Drift between DB shape and API contract | Derive validator from canonical source (ORM, schema gen) |
| Auth | Webhook signature unverified | Verify signing secret, fail closed |
| DB connection | Cold-start saturation | Pool / serverless-friendly driver |
| Payment / 3rd-party | Missing event handling, non-idempotent | Idempotent handler keyed on provider event ID |
| Caching | Stale data after write | Invalidate on write, or short TTL |
| Tests | Snapshot/fixture drift | Regenerate + review before merge |
| Build | Lockfile out of sync | Commit lockfile with same package-manager version |
| Deploy | Env var missing on target | Document in `.env.example`; fail-fast on first read |

For project-specific failure modes (frontend hydration, render-mode invariants, design-token drift, redirect tri-sync, etc.), keep them in the host project's `.claude/rules/stability.md` or `${overlay}/layer-map.md` — not in this generic skill.

---

## ADR (Architecture Decision Records)

**When:** L6+ with multiple valid approaches.
**Skip:** L1-L5, or single-approach decisions.

### Format (≤15 lines)

```markdown
### ADR: [Title]

**Context:** [Problem and why decision is needed]

**Options:** A) [Option] / B) [Option]

**Decision:** [X] because [reason]

**Consequences:** [Consequence], [Trade-off]
```

### Example (generic)

```markdown
### ADR: Router for new endpoints

**Context:** 8 new endpoints. Project is mid-migration from Framework A to Framework B.

**Options:** A) Framework A / B) Framework B

**Decision:** B because aligned with migration roadmap; new endpoints don't need to be ported later.

**Consequences:** Better long-term DX, team learns B, slightly higher initial setup cost.
```

### Plan Integration

```markdown
## Research
...

## Architecture Decisions
### ADR: [Title]
...

## Tasks
```

---

## Checklist

- [ ] 5+ failure modes brainstormed (cover build / logic / integration / data / auth / perf / security / cross-cutting)
- [ ] Top 3 risks with mitigations
- [ ] Score ≥ 7 has rollback path
- [ ] Stack-specific failures from `${overlay}/layer-map.md` checked
- [ ] Cardinal-rule violations from host `.claude/CLAUDE.md` checked
- [ ] ADR for architectural decisions (L6+)
