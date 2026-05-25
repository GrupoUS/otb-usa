# Debug Methodology

> 4-Phase systematic debugging: Investigate → Analyze Patterns → Hypothesize → Implement.

---

## Phase 1: Investigate

**BEFORE attempting ANY fix.**

### Self-Interrogation (write answers)

```
1. What SHOULD happen? (expected behavior, exact values)
2. What ACTUALLY happens? (observed behavior, exact values)
3. WHERE do they diverge? (specific point)
```

### Read Error Messages Completely

- Don't skip past errors
- Read stack traces **completely** — line numbers, file paths, error codes
- They often contain the exact solution

### Reproduce Consistently

- Can you trigger it reliably?
- What are the exact steps?
- **If not reproducible → gather more data, don't guess**

### Check Recent Changes

```bash
git diff HEAD~5
git log --oneline -10
```

### Multi-Component Tracing

For each boundary (client → tRPC → Drizzle → Neon):

```typescript
// Add logging at each layer
console.error("=== tRPC input ===", { input, userId: ctx.userId });
console.error("=== Service args ===", { mentoradoId, filters });
console.error("=== Query params ===", { where: conditions });
console.error("=== Result ===", { count: result.length });
```

---

## Phase 2: Analyze Patterns

1. **Find Working Examples** — Locate similar working code
2. **Compare Differences** — List EVERY difference, however small
3. **Understand Dependencies** — What config/env does this need?

---

## Phase 3: Hypothesize

**Scientific method — one variable at a time.**

1. **Form Single Hypothesis** — "X is the root cause because Y"
2. **Test Minimally** — Smallest possible change
3. **Verify Before Continuing**:
   - Worked? → Phase 4
   - Didn't work? → NEW hypothesis, don't add more fixes

### Cognitive Biases to Avoid

| Bias | Symptom | Countermeasure |
|------|---------|----------------|
| **Confirmation** | Seeking proof, ignoring disproof | Ask: "What would disprove this?" |
| **Anchoring** | Fixating on first error | Read ENTIRE output before hypothesis |
| **Fixation** | Persisting with wrong approach | 2-strike rule: change approach after 2 failures |
| **Ownership** | "My code is fine" | Same scrutiny for your code as unfamiliar code |
| **Optimism** | "That should fix it" | Run gates EVERY time |

### Generate 3 Hypotheses

Before committing to any fix:
- [ ] Generated ≥ 2 alternative hypotheses
- [ ] Evidence DISPROVES other hypotheses (not just proves mine)
- [ ] Fix addresses ROOT CAUSE, not symptom

---

## Phase 4: Implement

### 1. Create Failing Test

```typescript
it("should reject empty mentoradoId", () => {
  expect(() => service.create({ mentoradoId: "" })).toThrow();
});
```

### 2. Implement Single Fix

- ONE change at a time
- No "while I'm here" improvements

### 3. Verify Gates

```bash
bun run type-check && bun run lint:oxlint:check && bun run test
```

### 3-Fix Escalation Rule

- **< 3 fixes failed** → Return to Phase 1
- **≥ 3 fixes failed** → **STOP.** Question architecture. Discuss with user.

---

## Root Cause Tracing

Trace backward through call chain to find original trigger.

### 5-Step Backward Trace

```
1. Observe Symptom        → "column mentorado_id does not exist"
2. Find Immediate Cause   → db.select().where(eq(metricas.mentorado_id, id))
3. Ask: What Called This? → metricasRouter.getByMentorado(id)
4. Keep Tracing Up        → id = undefined — context not yet loaded
5. Find Original Trigger  → Query fires before auth resolves
```

**Fix at source:**

```typescript
// Root cause: query fires without mentoradoId
const { data } = trpc.metricas.getByMentorado.useQuery(
  { mentoradoId },
  { enabled: !!mentoradoId } // ← Fix at source
);
```

### Git Bisect for Regressions

```bash
git bisect start
git bisect bad                    # Current is broken
git bisect good HEAD~20           # This was working
# Git guides you to exact commit
git bisect reset
```

---

## Templates

### 5 Whys

```markdown
**Problem**: [Describe error]
1. Why? → [First cause]
2. Why? → [Deeper cause]
3. Why? → [Underlying issue]
4. Why? → [Systemic reason]
5. Why? → [Root cause]

**Root Cause**: [Final determination]
**Fix**: [Solution implemented]
```

### Debug Report

```markdown
## Debug Report

**Issue**: [Description]
**Bug Type**: Cosmetic | Performance | Security | Functionality
**Root Cause**: [5 Whys result]
**Fix**: [What was changed]
**Verification**:
- [ ] `bun run type-check` ✅
- [ ] `bun run test` ✅

**Lessons Learned**: What would have caught this earlier?
```

### Commit Message

```
fix(scope): brief description

Root cause: [5 Whys result]
Fix: [What was changed]

Tested: bun run type-check ✅, bun run test ✅
```
