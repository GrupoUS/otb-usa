---
name: performance-optimization
description: Use for runtime performance, build performance, database and API speed, security baseline checks, SEO readiness, bundle size, Core Web Vitals, and production release gates.
---

# Performance Optimization

Single performance skill for four goals: speed, database performance, security baseline, and SEO/GEO baseline.

> Reads `.claude/config.json` for `${tooling.*}` (gate commands), `${project.stagingUrl}` (PSI target), `${gates.*}` (thresholds), `${paths.*}` (search scopes). Project-specific SEO/route specifics loaded from `${overlay}/seo-supplement.md` if present.

---

## Core Rules

1. Measure before changing code.
2. Change one bottleneck at a time.
3. Re-measure with the same tool and scenario.
4. Keep fixes minimal (KISS) and only for active issues (YAGNI).

---

## Packs

Pick one pack per run:

| Pack | Use when | Minimum output |
|---|---|---|
| `performance-core` | Slow load, sluggish interaction, high API p95, large bundle | before/after metrics + exact fixes |
| `database-performance` | Slow API p95, N+1, SELECT *, missing indexes, pool exhaustion, cold starts | before/after query metrics + exact fixes |
| `security-baseline` | Release hardening, OWASP sanity, dependency + header checks | findings by severity + mitigation |
| `seo-geo-baseline` | Search visibility, crawlability, AI citation readiness | indexability/schema/CWV report + action list |

---

## Baseline Commands

```bash
${tooling.packageManager} run ${tooling.typeChecker}
${tooling.packageManager} run lint
${tooling.packageManager} run build
ANALYZE=true ${tooling.packageManager} run build      # if project supports analyze flag
```

## Live Docs Lookup (Context7)

Before applying optimizations, fetch live docs via `mcp__claude_ai_Context7__*` for:
- ORM (query optimization, prepared statements, batch APIs)
- Query/cache library (`staleTime`, `gcTime`, polling patterns)
- Framework runtime (rendering modes, hydration strategies)
- Charting / heavy UI libs (lazy loading + tree-shaking patterns)

---

## `database-performance` Pack

Use when API p95 is high, queries are slow, or DB is suspected bottleneck.

**Step 1 — Connection pool audit.** Locate the pool initialization (typically `${paths.libRoot}/db.*` or `lib/database.*`). Verify:

```typescript
// Generic Postgres pool template — adapt to driver
const pool = new Pool({
  connectionString,
  max: 10,                          // serverless: leave headroom; long-running: tune to load
  idleTimeoutMillis: 30_000,        // close idle connections
  connectionTimeoutMillis: 10_000,  // fail fast on cold starts
});
```

Report as findings if any of `max`, `idleTimeoutMillis`, or `connectionTimeoutMillis` are absent. For HTTP-only drivers (e.g., serverless Postgres), prepared statement support varies — verify against runtime before applying.

**Step 2 — Query anti-pattern scan.**

```bash
# SELECT * (missing column specification) — adapt grep to ORM idiom
grep -rn "select \*\|\.select()\.from" ${paths.backendRoot}/ --include="*.ts" --include="*.sql"

# N+1: await db. inside for/while loop
grep -A5 "for (const\|for (let\|while (" ${paths.backendRoot}/ -rn --include="*.ts" | grep "await db\."
```

| Severity | Pattern | Fix |
|---|---|---|
| High | `select *` / `db.select().from(table)` with no columns | Specify columns explicitly |
| High | `await db.` inside `for` loop | Pre-fetch IDs → single batched query (`IN (...)` / `inArray`) |
| Medium | List queries without `LIMIT` | Cap at 100 for list endpoints |
| Medium | Sequential independent queries | Wrap in `Promise.all([...])` |

**Step 3 — Index audit.** For every FK column, confirm a corresponding index exists in the same table definition or migration:

```bash
grep -rn "references\|FOREIGN KEY" ${paths.schemaRoot}/ ${paths.backendRoot}/
grep -rn "create index\|index(" ${paths.schemaRoot}/ ${paths.backendRoot}/
```

Per project rules, every FK gets an index in the **same migration** that creates the FK.

**Step 4 — Prepared-statement candidates.** Identify hot-path queries: every-request reads, frequently-called service functions, scheduler/cron hot loops. ORM-specific syntax varies — Drizzle uses `.prepare(name)`, Postgres native uses `PREPARE name AS …`.

**Step 5 — Batch operations.**

```typescript
// Instead of: for (const item of items) { await db.insert(table).values(item); }
await db.insert(table).values(items);   // single round-trip
```

For deeper Postgres-specific guidance (RLS performance, partitioning, advisory locks, JSONB indexing) → defer to skill `supabase-postgres-best-practices`.

---

## `performance-core` Pack

For runtime speed (frontend + API).

**Step 1 — Frontend baseline.** Run PSI against `${project.stagingUrl}` (or `localhost` for dev). Capture per-route scores + CWV. Compare against `${gates.lighthouse.*}` and `${gates.lcp/cls/inp}` thresholds.

**Step 2 — Bundle analysis.** Run analyzer for the detected build tool (`vite-bundle-visualizer`, `webpack-bundle-analyzer`, `source-map-explorer`, etc.). Report largest chunks + duplicate deps + splitting opportunities.

**Step 3 — Component perf.** For React projects, run React DevTools profiler or React Doctor (project-dependent — gate on `${tooling.frontendFramework}`). Look for: unnecessary rerenders, unstable callback refs, large list rendering without virtualization.

**Step 4 — Network.** Audit cache strategies (`Cache-Control` headers, ETag, ISR/revalidate), CDN coverage on static assets, compression (gzip/brotli), HTTP/2 multiplexing.

**Step 5 — API latency.** Measure p50/p95/p99 on hot endpoints. For each endpoint over budget: trace where time is spent (DB, external calls, serialization, middleware). Apply targeted fix.

---

## `security-baseline` Pack

OWASP top-10 sanity sweep + dependency + header check.

**Step 1 — Dependencies.** Run `bun audit` when available for the current Bun version. Cross-check against GHSA / Snyk for any package with no maintainer activity > 2 years.

**Step 2 — Secret scanning.** `git log --all -G "ApiKey|SecretKey|password|token|secret" --since="6 months ago"` — or use `gitleaks` / `truffleHog` for thorough scan. Confirm `.env` files are gitignored.

**Step 3 — HTTP headers.** Check production responses for: `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`.

**Step 4 — Auth/authz audit.** Re-read `.claude/rules/backend.md` + `.claude/rules/database.md` (or project equivalents). Verify per-route auth scoping. For RLS systems: confirm policies on every table; test anon read against sensitive tables (must deny).

**Step 5 — Input validation.** Confirm every public endpoint validates body via schema (Zod / Valibot / Yup / equivalent) at module scope, never inside handlers.

---

## `seo-geo-baseline` Pack

For search visibility + AI-citation readiness.

**Step 1 — Indexability.** `robots.txt` + `sitemap.xml` exist + reachable. `<meta name="robots">` is `index,follow` on public pages, `noindex` on private pages.

**Step 2 — Structured data.** Schema.org JSON-LD on key pages: `Organization`, `WebSite`, `BreadcrumbList`, content-type-specific (`Article`, `Product`, `FAQPage`, etc.).

**Step 3 — OG / Twitter cards.** `<meta property="og:*">` + `<meta name="twitter:*">` on every page. Image dimensions set explicitly.

**Step 4 — Locale.** `<html lang="${project.locale}">`. Hreflang tags if multi-locale.

**Step 5 — CWV.** Same thresholds as `performance-core`. CLS = 0 mandatory for SEO score.

**Step 6 — AI citation (GEO).** Author bylines, dates, source links — make it easy for LLM crawlers to cite. Schema.org `Article` with `author`, `datePublished`, `dateModified`. Avoid hidden text / cloaking.

If `${overlay}/seo-supplement.md` exists, also load project-specific SEO rules (sitemap routes, locale-specific quirks, donation-listing schema, etc.).

---

## Output format (every pack)

```markdown
## Pack: <name>

### Baseline
| Metric | Before |
|---|---|

### Findings
| # | Severity | Issue | File:line | Fix |

### Applied fixes
| Optimization | Before | After | Δ |

### Remaining opportunities
[ranked by impact]
```

---

## References

| File | Content |
|---|---|
| `references/psi-api.md` | PageSpeed Insights API usage |
| `references/react-doctor.md` | React Doctor config + interpretation |
| `references/seo-playbook.md` | Generic SEO baseline (sitemap, robots, headers, schema.org) |
| `references/unlighthouse.md` | Site-wide Unlighthouse scan setup |
| `${overlay}/seo-supplement.md` | **Project-specific** SEO routes/locale (loaded if overlay configured) |

---

## Configuration

This skill reads `.claude/config.json` for:
- `${tooling.packageManager}` / `${tooling.typeChecker}` / `${tooling.linter}` — gate commands
- `${project.stagingUrl}` / `${project.productionUrl}` — PSI/Lighthouse targets
- `${project.locale}` — SEO locale
- `${gates.lighthouse.*}` / `${gates.lcp/cls/inp/initialJsKb}` — pass thresholds
- `${paths.backendRoot}` / `${paths.frontendRoot}` / `${paths.schemaRoot}` / `${paths.libRoot}` — search scopes
- `${overlay}` — project-specific SEO supplement

To use in another project: copy `.claude/skills/performance-optimization/`, point `.claude/config.json` at the new tooling/paths/URLs, and optionally write `${overlay}/seo-supplement.md` for project-specific SEO/route specifics.
