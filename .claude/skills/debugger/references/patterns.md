# Debugging Patterns & Checklists

Quick reference for implementation patterns and security checks.

---

## Async Testing: Condition-Based Waiting

Replace arbitrary timeouts with condition polling.

### Core Pattern

```typescript
// ❌ BEFORE: Guessing at timing
await new Promise((r) => setTimeout(r, 50));
const result = getResult();
expect(result).toBeDefined();

// ✅ AFTER: Waiting for condition
await waitFor(() => getResult() !== undefined);
const result = getResult();
expect(result).toBeDefined();
```

### waitFor Implementation

```typescript
async function waitFor<T>(
  condition: () => T | undefined | null | false,
  description: string,
  timeoutMs = 5000,
): Promise<T> {
  const startTime = Date.now();

  while (true) {
    const result = condition();
    if (result) return result;

    if (Date.now() - startTime > timeoutMs) {
      throw new Error(`Timeout waiting for ${description}`);
    }

    await new Promise((r) => setTimeout(r, 10)); // Poll every 10ms
  }
}
```

### Quick Patterns

| Scenario | Pattern |
|----------|---------|
| Wait for event | `waitFor(() => events.find(e => e.type === 'DONE'))` |
| Wait for state | `waitFor(() => machine.state === 'ready')` |
| Wait for count | `waitFor(() => items.length >= 5)` |
| Wait for DOM | `waitFor(() => document.querySelector('.loaded'))` |

### When Arbitrary Timeout IS Correct

```typescript
// First: wait for triggering condition
await waitForEvent(manager, "TOOL_STARTED");
// Then: wait for timed behavior (documented!)
await new Promise((r) => setTimeout(r, 200)); // 2 ticks at 100ms intervals
```

---

## Testing Pyramid

```
        /\
       /E2E\       ← Few, slow, high confidence
      /------\
     / Integ. \    ← Some, medium speed
    /----------\
   /   Unit     \  ← Many, fast, isolated
```

| Layer | Tool | Count | When to Use |
|-------|------|-------|-------------|
| **Unit** | Vitest | 70% | Pure functions, business logic |
| **Integration** | Vitest + tRPC | 20% | API routes, DB queries, auth |
| **E2E** | Playwright | 10% | Critical user journeys |

### Test Commands

```bash
bun test                        # Run all tests
bun test path/to/file.test.ts   # Specific file
bun test --coverage             # With coverage
bun test --watch                # Watch mode
```

### Test Naming

```
describe('[Component]')
  it('[should] [expected behavior] [when condition]')
```

---

## Security Checklist (OWASP 2025)

### Quick Checks

| Check | Command/Pattern |
|-------|-----------------|
| Auth verified | `if (!ctx.user) throw new Error("Unauthorized")` |
| No exposed secrets | `grep -r "sk_live\|password\|api_key" src/` |
| Parameterized queries | `db.select().where(eq(users.id, userId))` |
| Dependency audit | `bun audit` |

### Access Control

```typescript
// ✅ Always verify auth + ownership
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Unauthorized");

const item = await ctx.db.get(itemId);
if (item.userId !== identity.subject) throw new Error("Forbidden");
```

### Injection Prevention

```typescript
// ✅ Parameterized (Drizzle)
db.select().from(users).where(eq(users.id, userId));

// ❌ NEVER string concat SQL
db.execute(`SELECT * FROM users WHERE id = ${userId}`);
```

### Security Review Checklist

**Authentication:**
- [ ] All routes require auth check
- [ ] Session tokens are HTTP-only cookies
- [ ] Rate limiting on login attempts

**Authorization:**
- [ ] Resource ownership verified
- [ ] Admin routes protected

**Data Protection:**
- [ ] HTTPS enforced in production
- [ ] PII handling follows LGPD

**Input Validation:**
- [ ] All inputs validated with Zod
- [ ] File uploads type-checked
- [ ] Size limits enforced

**Logging:**
- [ ] Failed auth attempts logged
- [ ] No sensitive data in logs
