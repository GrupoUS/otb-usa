# Pack Execution Guides

Detailed execution flows, key rules, and common patterns for each debug pack.

---

## 8a. `frontend-debug`

**Scope:** React/UI regressions, hydration errors, interaction failures, visual glitches.

**Execution flow:**
1. Pre-flight (Phase 0) + agent-browser check
2. Launch 3 sub-agents: Evidence Collector + Code Archaeologist + Regression Hunter
3. While agents work, run quality gates as baseline
4. Consolidate findings → select hypothesis
5. Apply minimal fix
6. Verification gates
7. Browser evidence: screenshot + console + network + responsive viewports
8. Report

**Key rules:**
- NEVER fix without capturing initial screenshot first
- NEVER interact with page without calling `agent-browser snapshot` first (refs invalidate after DOM changes)
- Choose browser mode: headless for public pages, CDP for authenticated pages (see `references/browser-setup.md`)
- Default target: `${project.stagingUrl}` from `.claude/config.json` (override with `url=` argument)
- In CDP mode, do NOT call `agent-browser close` — it kills the user's Chrome session

**Common frontend patterns:**
- `Select controlled/uncontrolled` → `value={undefined}` transitioning to string
- Hydration mismatch → dynamic values computed differently on server vs client
- Infinite re-render → `useEffect` dep array includes unstable reference (new object/array each render)
- Loading skeleton stuck → query never resolves, check `staleTime` and `enabled` condition

---

## 8b. `backend-debug`

**Scope:** Hono/tRPC procedure failures, service errors, mutation side effects.

**Execution flow:**
1. Pre-flight (Phase 0)
2. Launch 2 sub-agents: Code Archaeologist + Regression Hunter
3. If mutation involved, also launch DB State Inspector
4. Consolidate → hypothesis
5. Minimal fix
6. Verification gates
7. Database validation (psql)
8. Report

**Key rules:**
- Always verify procedure boundary: `protectedProcedure` vs `adminProcedure` vs `mentoradoProcedure`
- Check Zod input schema matches what frontend sends
- Verify `Promise.all` vs sequential for batch operations
- Never use `db.transaction()` with Neon HTTP driver — use `db.batch()` or sequential `await`
- Always guard `.returning()[0]` against empty arrays

**Common backend patterns:**
- `No transactions support in neon-http driver` → use sequential await or db.batch()
- `Cannot read properties of undefined` after insert → unguarded `.returning()[0]`
- HTTP 500 on mutation → same as above, or unhandled async rejection
- `TRPCError UNAUTHORIZED` → procedure context not forwarding userId

---

## 8c. `auth-db-debug`

**Scope:** Clerk authentication, role/permission mismatches, tenant isolation failures.

**Execution flow:**
1. Pre-flight (Phase 0)
2. Launch 2 sub-agents: Code Archaeologist + Regression Hunter
3. Launch DB State Inspector to verify user/mentorado/role state
4. Consolidate → hypothesis
5. Minimal fix
6. Verification gates
7. Database validation: verify role assignments, tenant boundaries, FK integrity
8. Report

**Key rules:**
- Verify `resolveMentoradoForUser` priority chain: team membership → owner lookup → admin/mentor
- Every UPDATE must include `eq(table.mentoradoId, ctx.mentorado.id)` — TOCTOU ownership check
- Verify `CLERK_WEBHOOK_SECRET` matches between environments
- Check Clerk middleware matcher covers the affected route

**Common auth patterns:**
- `auth()` returns null → middleware matcher missing the route
- Mentorado not found → corrupted auto-created record, fix with `UPDATE mentorados SET user_id = NULL`
- Cross-tenant data leak → missing `mentoradoId` filter in WHERE clause
- Webhook 400 → env mismatch between local `.env` and production/staging

---

## 8d. `systematic-audit`

**Scope:** Full cross-layer stability sweep. Post-release hardening or periodic health check.

**Execution flow:**
1. Pre-flight (Phase 0) + agent-browser check
2. Launch 4 sub-agents:
   - Evidence Collector (browser baseline of critical flows)
   - Code Archaeologist (scan for unstable patterns across codebase)
   - Regression Hunter (cross-reference MEMORY.md for known issues)
   - DB State Inspector (FK integrity, orphaned rows, missing indexes)
3. **Inventory first, NO fixes** — classify all findings as P0/P1/P2/P3
4. Present findings table to user for prioritization
5. Fix P0 issues one at a time, with verification after each
6. Then P1, then P2
7. Final gates: `bun run type-check && bun run lint:oxlint:check && bun run test && bun run build`
8. Browser evidence of critical flows post-fix
9. Full report with remaining P3 items logged

**Key rules:**
- NEVER fix during inventory phase
- One fix at a time, validate after each
- Track progress with TaskCreate/TaskUpdate
- Cross-reference `.claude/rules/stability.md` (Stability Audit Checklist A-L)
