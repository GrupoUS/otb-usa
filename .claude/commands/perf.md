---
description: Performance audits + optimization. Modes (positional arg) — default: runtime audit (PSI/Lighthouse) · build: bundle analysis, code splitting, build-tool tuning · db: pool audit, N+1 scan, index gaps, prepared-statement candidates. Pass URL/scope/strategy after the mode token.
workflow_type: orchestrator-workers
---

# /perf — Performance & Optimization

**ARGUMENTS**: $ARGUMENTS

> First positional arg = mode. Examples:
> ```
> /perf                            # default — runtime audit (PSI/Lighthouse)
> /perf url=https://example.com    # runtime audit on specific URL
> /perf strategy=mobile            # runtime, mobile only
> /perf build                      # bundle/build-tool optimization
> /perf db                         # database performance (N+1, indexes, pool)
> /perf compare baseline.json after.json    # compare two runs
> ```
> All modes use **Skill `performance-optimization`** + agent `performance-optimizer`.

---

## 0. Setup (every mode)

```typescript
Skill("performance-optimization");
```

Read `.claude/config.json`:
- `${project.stagingUrl}` → default audit target (override via `url=`)
- `${tooling.buildTool}` → build-tool selection (vite / webpack / esbuild / rollup / turbopack / astro / next / etc.)
- `${tooling.typeChecker}` / `${tooling.testRunner}` / `${tooling.packageManager}`
- `${gates.lighthouse}` / `${gates.lcp}` / `${gates.cls}` / `${gates.inp}` / `${gates.initialJsKb}` → pass thresholds

Project SEO specifics: `.claude/rules/seo.md` (locale, JSON-LD, sitemap filter, CWV thresholds).

---

## 1. Mode dispatch

Parse first positional token from `$ARGUMENTS`:

| Token | Section |
|---|---|
| (none) / `runtime` / `routes` / `all` | § 2 (runtime audit) |
| `fix` | § 2 + auto-fix loop (§ 2.5) |
| `compare` | § 2.6 (compare two PSI runs) |
| `build` / `bundle` | § 3 (build/bundle optimization) |
| `db` / `database` | § 4 (database performance) |

Other tokens after mode are kwargs (`url=`, `strategy=`, `scope=`, etc.).

---

## 2. Runtime audit (default mode)

Google PageSpeed Insights v5 (zero-dependency). Falls back to Lighthouse CLI when quota exceeded.

### 2.1 Measurement tool selection

```
1. Try PSI API (preferred — no Chrome needed)
2. If HTTP 429 (quota) → Lighthouse CLI:
   ${tooling.packageManager} dlx lighthouse URL --output=json \
     --chrome-flags="--headless --no-sandbox --disable-gpu"
3. For full crawl → Unlighthouse:
   ${tooling.packageManager} dlx unlighthouse --site URL --throttle --samples 1
```

### 2.2 Default config

```yaml
KEY_ROUTES: detect from router files (${PATHS_FRONTEND_ROOT}/routes/, app/, pages/) or use user-provided list
THRESHOLDS:
  performance:    { pass: ${gates.lighthouse.performance}, warn: 50 }
  accessibility:  { pass: ${gates.lighthouse.accessibility}, warn: 70 }
  best-practices: { pass: ${gates.lighthouse.bestPractices}, warn: 70 }
  seo:            { pass: ${gates.lighthouse.seo}, warn: 80 }
CWV_TARGETS:
  LCP: ${gates.lcp}ms
  CLS: ${gates.cls}
  INP: ${gates.inp}ms
  FCP: 1800ms
  TBT: 200ms
```

### 2.3 Execute

Call PSI API for the resolved URL with each selected strategy (mobile + desktop unless overridden).

### 2.4 Output

```markdown
## PSI Report: {URL}

### Scores ({strategy})
| Category | Score | Status |
|---|---|---|
| Performance | XX | PASS / WARN / FAIL |
| Accessibility | XX | PASS / WARN / FAIL |
| Best Practices | XX | PASS / WARN / FAIL |
| SEO | XX | PASS / WARN / FAIL |

### Core Web Vitals
| Metric | Value | Target | Status |
|---|---|---|---|
| FCP | X.Xs | 1.8s | PASS / FAIL |
| LCP | X.Xs | {gates.lcp}ms | PASS / FAIL |
| CLS | X.XX | {gates.cls} | PASS / FAIL |
| INP | Xms | {gates.inp}ms | PASS / FAIL |
| TBT | Xms | 200ms | PASS / FAIL |

### Top Opportunities
| Audit | Savings | Display |
|---|---|---|
| unused-javascript | XXXms | Est savings XXX KiB |
```

### 2.5 Auto-fix loop (`/perf fix`)

1. Measure baseline against all key routes.
2. Identify routes with Performance < threshold.
3. **Cluster failing routes by suspected shared root cause** before spawning agents (e.g., "all routes slow due to unoptimized hero image" → 1 cluster; "/sobre slow on team grid + /produto slow on testimonials" → 2 clusters). Spawn 1 `performance-optimizer` agent **per cluster, not per route** — saves the 5-spawn budget and re-measures all routes per cluster fix.
4. Spawn agents in **single message**, each with `isolation: "worktree"` and the 5 mandatory context fields per `.claude/skills/senior-prompt-engineer/references/agent-handoff-contracts.md § 1`.
5. Each agent prompt includes: cluster scope (which routes share this root cause), per-route scores/CWV/opportunities, failing audits, files/components in scope, task (read frontend rules from `.claude/rules/frontend.md`, fix top 3 opportunities by `savings_ms`, run quality gates per `_shared.md` § 1, return Context Handoff per `agent-handoff-contracts.md § 2`).
6. After all agents return: re-measure ALL routes (cluster fixes often lift sibling routes); verify improvements; if a route is still failing, re-cluster on remaining root cause.

Skip routes already at threshold.

### 2.6 Compare (`/perf compare baseline.json after.json`)

Load both JSON outputs. Display delta table: Δ score per category, Δ CWV per metric, regressions highlighted.

---

## 3. Build mode — `/perf build`

Generic across build tools. Detects `${tooling.buildTool}` from config + project files.

### 3.1 Build system detection

Read config + project files to confirm:
- Build tool: `vite`, `webpack`, `rollup`, `esbuild`, `turbopack`, `astro`, `next`, `nuxt`, etc.
- Type checker: `tsgo`, `tsc`, `swc`, `babel`
- Bundler-specific config files (`vite.config.*`, `webpack.config.*`, `rollup.config.*`, `astro.config.*`, etc.)
- Build scripts in `package.json`

### 3.2 Performance baseline

```bash
# Clean build
time ${tooling.packageManager} run build

# Incremental build (cache warm)
time ${tooling.packageManager} run build

# Type check (if separate)
time ${tooling.packageManager} run ${tooling.typeChecker}

# Output sizes — adapt path per build tool
ls -lh ${PATHS_FRONTEND_ROOT}/dist/assets/ 2>/dev/null \
  || ls -lh ${PATHS_FRONTEND_ROOT}/.output/public/ 2>/dev/null \
  || ls -lh build/ 2>/dev/null \
  | sort -k5 -hr | head -20
```

Document: clean vs incremental times, bundle sizes per chunk, type-check time, slowest phases from build log.

### 3.3 Bundle analysis

Run an appropriate visualizer for the build tool. Generic options:
- Vite / Rollup: `rollup-plugin-visualizer` (or `vite-bundle-visualizer`)
- Webpack: `webpack-bundle-analyzer`
- esbuild: `esbuild-visualizer`
- Generic: `source-map-explorer` on the production build

Identify: largest chunks + top contributors, duplicate dependencies across chunks, splitting opportunities.

### 3.4 Caching strategy

**Dependency pre-bundling cache** (Vite `.vite/deps`, Webpack `.cache`, etc.) — verify it exists and is populated.
**TypeScript incremental** — `tsBuildInfoFile` set, `incremental: true`.
**CI/CD cache** — package manager cache, build-tool cache, type-checker cache, between pipeline runs.

### 3.5 Code splitting & lazy loading

- Route-based splitting: heavy page components lazy-loaded with `<Suspense>`/equivalent
- Heavy deps (charts, PDF, rich-text editors, code editors) dynamically imported
- Vendor chunks separated explicitly via `manualChunks` (or equivalent)
- Chunk size warning limit set (default 500KB)

### 3.6 Asset optimization

- Images: WebP / AVIF, lazy loading, correct sizing, explicit `width`/`height` for CLS
- CSS: framework purge active in production builds
- Compression: gzip + brotli at server / CDN / proxy
- Tree shaking: `sideEffects: false` for pure utility packages

### 3.7 Build-tool-specific recommendations

Apply patterns appropriate to the detected `${tooling.buildTool}`. Examples:

```
target: 'es2020'           # modern target = smaller output
minify: 'esbuild'           # esbuild faster than terser
cssMinify: true
sourcemap: false            # disable in prod (or 'hidden')
chunkSizeWarningLimit: 500
optimizeDeps.include: [stable deps]
```

For TypeScript-heavy projects: `skipLibCheck: true`, `moduleResolution: 'bundler'`, project references for monorepos > 200 files/package, avoid `paths` aliases that force re-resolution of full module graph.

### 3.8 Dev mode

- Dev transformer uses fast path (esbuild / SWC) — never Babel in dev
- HMR / Fast Refresh active
- Cheap source maps for fastest rebuilds

### 3.9 CI/CD optimization

```yaml
cache:
  - <package-manager-cache>
  - <build-tool-pre-bundle-cache>
  - <type-checker-incremental-cache>

# Parallel jobs where independent
jobs:
  type-check:  ${tooling.typeChecker}
  lint:        ${tooling.linter}
  test:        ${tooling.testRunner}
  build:       ${tooling.packageManager} run build  # after type-check
```

### 3.10 Output

```markdown
## Build Optimization Report

### Baseline
| Metric | Value |
|---|---|
| Clean build time | Xs |
| Incremental build time | Xs |
| Type check time | Xs |
| Total JS (gzip) | XXX KB |
| Total CSS (gzip) | XX KB |
| Largest chunk | XXX KB — name |

### Findings
| # | Issue | Impact | Effort |

### Applied Optimizations
| Optimization | Before | After | Δ |

### Remaining Opportunities
[ranked by impact]

### Budgets (set in CI to fail on regression)
| Asset class | Budget |
| Total JS gzip | ${gates.initialJsKb}KB |
| Largest chunk | 500KB |
```

---

## 4. Database mode — `/perf db`

Generic across SQL databases (Postgres / MySQL / SQLite).

### 4.1 Connection pool audit

Locate the connection / pool initialization (`${PATHS_LIB_ROOT}/db.*`, `lib/database.*`, etc.). Verify:
- Pool size appropriate for serverless vs long-running
- Idle timeout configured (avoid orphan connections)
- Max lifetime / recycle settings
- For Postgres: `prepare: false` if using a serverless driver that doesn't support prepared statements (else mismatch causes runtime errors)

### 4.2 N+1 scan

Grep across `${PATHS_BACKEND_ROOT}` and service layer:
- `for (...) { await db.query(...) }` — classic N+1
- Loops over arrays calling `findOne` / `select` per item
- Missing `IN (...)` batch queries
- Missing relation eager-loading where used in tight loops

Report each hit with file:line + suggested batched alternative.

### 4.3 SELECT * scan

```bash
grep -rn "select \*" ${PATHS_BACKEND_ROOT} --include="*.ts" --include="*.js" --include="*.sql" | head -50
```

For each: verify whether all columns are actually used in the call site. Suggest column projection.

### 4.4 Index gap check

For Postgres / MySQL:
- List all FK columns: `SELECT conname, conrelid::regclass, conkey FROM pg_constraint WHERE contype = 'f'`
- For each FK column → check if an index exists. Missing FK index = sequential scan on cascade / join.
- List columns frequently in WHERE clauses (grep app code for repeated filters) without supporting index.
- Composite indexes: WHERE a = ? AND b = ? requires `(a, b)` not `(a)` + `(b)`.

### 4.5 Prepared-statement candidates

Grep for repeated parameterized queries (same SQL shape, different params). Suggest preparing them or moving to a query builder that auto-prepares.

### 4.6 RLS / row-level security perf (Postgres)

When RLS policies use subqueries or function calls:
- Verify the helper function is `STABLE` (cacheable per query) not `VOLATILE`
- Confirm `security definer` functions set `search_path`
- Avoid policies that force per-row function evaluation in hot loops

### 4.7 EXPLAIN ANALYZE walk

Pick 3 hottest queries (from app logs or `pg_stat_statements`). For each:

```sql
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT) <query>;
```

Flag: seq scans on big tables, sort spilling to disk, nested loops over many rows, missing index usage.

### 4.8 Output

```markdown
## DB Performance Report

### Pool config
| Property | Value | Recommendation |
|---|---|---|
| Pool size | X | … |
| Idle timeout | Xs | … |
| Prepare | true/false | … |

### N+1 hits
| File:line | Pattern | Suggested fix |

### SELECT * hits
| File:line | Columns actually used |

### Missing indexes
| Table.column | Reason | Migration SQL |

### EXPLAIN ANALYZE highlights
[3 worst queries with annotations]
```

For Supabase / Postgres-specific deeper guidance, defer to skill `supabase-postgres-best-practices`.

---

## 5. Error handling

| Error | Action |
|---|---|
| PSI API HTTP 429 | Retry once; fall back to Lighthouse CLI |
| URL unreachable | Report; suggest checking deployment / DNS |
| `jq` not installed | Parse JSON via `${tooling.packageManager}` `-e` script or Python |
| Unlighthouse fails | Fall back to multi-route PSI scan |
| Build fails during § 3 | Run `${tooling.typeChecker}` first to surface compiler errors |
| DB inaccessible during § 4 | Run static-only checks (grep + index check from migration files) |
