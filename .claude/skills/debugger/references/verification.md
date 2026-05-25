# Verification & Prevention

> Fix the bug AND fix the system that allowed it.

---

## Defense-in-Depth Validation

After fixing, add validation at EVERY layer data passes through.

### The Four Layers

| Layer | Purpose | Example |
|-------|---------|---------|
| **1. Entry Point** | Reject invalid input at API boundary | Zod schema validation |
| **2. Business Logic** | Ensure data makes sense | Duplicate check before create |
| **3. Environment Guards** | Prevent dangerous operations | Refuse prod DB ops in tests |
| **4. Debug Instrumentation** | Capture context for forensics | Stack traces, timestamps |

### Implementation

```typescript
// Layer 1: Entry Point (tRPC + Zod)
export const create = mentoradoProcedure
  .input(z.object({
    nome: z.string().min(1, "Nome é obrigatório"),
    email: z.string().email().optional(),
  }))
  .mutation(async ({ ctx, input }) => { /* ... */ });

// Layer 2: Business Logic
async function createMentorado(ctx: Context, input: CreateInput) {
  const existing = await ctx.db
    .select()
    .from(mentorados)
    .where(and(
      eq(mentorados.userId, ctx.userId),
      eq(mentorados.nome_completo, input.nome),
    ));

  if (existing.length > 0) {
    throw new TRPCError({ code: "CONFLICT", message: "Nome já existe" });
  }
}

// Layer 3: Environment Guard
if (process.env.NODE_ENV === "test") {
  const dbUrl = process.env.DATABASE_URL ?? "";
  if (!dbUrl.includes("localhost") && !dbUrl.includes("neondb_test")) {
    throw new Error("Refusing operation on non-test database");
  }
}

// Layer 4: Debug Instrumentation
console.error("DEBUG db-op:", {
  table,
  dataKeys: Object.keys(data),
  timestamp: new Date().toISOString(),
  stack: new Error().stack,
});
```

---

## Regression Prevention

### When to Apply

| Bug Level | Required Actions |
|-----------|-----------------|
| L1-L4     | Fix + test (standard flow) |
| L5        | Fix + test + regression risk note |
| L6+       | Fix + test + postmortem + prevention |

### Regression Risk Assessment

| Risk | Definition | Action |
|------|-----------|--------|
| **High** | Same bug class likely elsewhere | Scan codebase, fix ALL instances |
| **Medium** | Could recur if related code changes | Add guard, document |
| **Low** | Isolated incident | Standard fix |

### Prevention Checklist

Before closing a L5+ bug:

- [ ] **Test exists**: Fails without fix, passes with it
- [ ] **Guard added**: Defense-in-depth at appropriate layer
- [ ] **Pattern scan**: If High risk, scanned for same pattern elsewhere
- [ ] **Documentation**: Root cause in commit message

---

## Fix Verification Criteria

A fix is verified when ALL are true:

1. **Reproducible**: Bug can be reproduced on demand
2. **Test-proven**: Test fails without fix, passes with it
3. **Isolated**: Fix changes only what's necessary
4. **Gate-passing**: `check`, `lint`, `test` all pass
5. **Non-regressive**: No previously passing tests now fail

---

## Postmortem Template (L6+)

```markdown
## Bug Postmortem: [Brief Title]

**Date:** YYYY-MM-DD
**Severity:** P1/P2/P3/P4
**Time to Resolve:** Xh

### Timeline
1. Bug reported: [when, how]
2. Root cause identified: [when, technique]
3. Fix implemented: [when]
4. Fix verified: [when, how]

### Root Cause
[1-2 sentences. Be specific.]

### Why It Escaped
- [ ] Missing test coverage
- [ ] Insufficient defense-in-depth
- [ ] Edge case not considered
- [ ] Environment difference (dev vs prod)

### Prevention Measures
1. [Test added] — describe the test
2. [Guard added] — describe the validation
3. [Pattern fix] — if High risk, list other instances fixed

### Lessons Learned
What would have caught this earlier?
```
