# Audit Agent Prompts — 9 Dimensions / 4 Parallel Agents

> Reference templates loaded by `/debug audit`. Each agent gets one prompt; agents run in parallel via `Task({ run_in_background: true })`.
> Generic — replace `${PATHS_BACKEND_ROOT}`, `${PATHS_FRONTEND_ROOT}` with values from `.claude/config.json`.

---

## Global rule (applies to ALL 4 agents)

> DO NOT apply fixes — report only. Return findings as: `File:line | Severity (P0-P3) | Description | Rule violated | Recommendation`.

## Severity classification

| Priority | Description | Action |
|---|---|---|
| P0 | Critical — crashes, data loss, auth bypass, dependency CVE ≥ 7.0 | Fix immediately |
| P1 | Important — degraded UX, security risk, complexity > 10, coverage < 80% on critical path | Fix this sprint |
| P2 | Moderate — technical debt, maintainability | Plan and schedule |
| P3 | Minor — readability, marginal optimization | Backlog |

---

## Agent 1 — Architecture & Structure (Dimensions 1-2) — `evaluator` (Mode 3)

```
TASK: Critical Analysis — Dimensions 1 and 2
SCOPE (if provided): $ARGUMENTS

## DIMENSION 1 — ARCHITECTURE & STRUCTURAL PATTERNS
1. Identify the architectural pattern in use (MVC, Clean, Hexagonal, Layered, Modular Monolith, etc.). Cite files/dirs that evidence the pattern.
2. Consistency: is the pattern applied across ALL modules? List divergent modules with file:line.
3. SOLID violations:
   - S: multi-responsibility classes/functions
   - O: code requiring modification to extend
   - D: concrete dependencies instead of abstractions
4. DRY: duplicate logic between files. Grep for repeated patterns in routers/controllers/hooks/components.
5. KISS: over-engineering — unnecessary abstractions, indirections without value.
6. Separation of concerns:
   - Business logic leaking into UI?
   - DB queries coupled to HTTP handlers?
   - Circular imports between layers?
7. Shared contracts: types/interfaces in shared/ or redefined per module?

## DIMENSION 2 — FOLDER STRUCTURE & NAMING
1. Map directory tree 3 levels deep.
2. Naming conventions:
   - Folders consistent (kebab-case vs camelCase)?
   - Components use PascalCase?
   - Hooks use use* consistently?
   - Routers use domain naming?
3. Problems: orphan files, empty folders, duplicate structures, incomplete barrel files (index.ts), oversized files (>500 lines).

RETURN: standard findings format (see global rule above).
```

---

## Agent 2 — Code Quality (Dimension 3) — `debugger`

```
TASK: Critical Analysis — Dimension 3
SCOPE (if provided): $ARGUMENTS

### 3.1 Readability & Style
- Functions >50 lines (file:line)
- Naming: descriptive variables/functions/interfaces
- Style consistency (linter config is reference)

### 3.2 Type Safety
- Search: `as any`, `as unknown`, `!` (non-null) — file:line
- Functions without explicit return types in services/routers
- `@ts-ignore` / `@ts-expect-error` without justification
- Verify .claude/rules/stability.md (Checklist A-L)

### 3.3 Error Handling
- Generic Error instead of typed errors with codes
- Empty try-catch or catch-only-log
- Result destructuring without null guard (stability rule C)
- Unawaited promises without justification
- Frontend mutateAsync not wrapped in try-catch (stability rule J)

### 3.4 Dead Code & Duplication
- Unused exports
- Commented-out blocks (>3 lines)
- Duplicate functions across routers/hooks
- Unused imports

### 3.5 Security
- Hardcoded credentials (keys, tokens, passwords)
- .env in .gitignore?
- console.log with sensitive data (userId, email, tokens)
- dangerouslySetInnerHTML usage
- target="_blank" without rel="noopener" (stability rule K)
- CORS config (stability rule G)

### 3.8 Dependency Analysis
- package.json + workspace package.json:
  - Critical CVEs (cross-check GHSA / `bun audit` when available)
  - Outdated majors (e.g., react@17 when 19 current)
  - Unused deps
  - Restrictive licenses (GPL/AGPL) in commercial project
  - Deprecated packages
- Transitive risk: no maintainer activity > 2 years

### 3.9 Technical Debt
- TODO / FIXME / HACK comments: count + severity
- Cyclomatic complexity > 10 (count if/else/for/while/switch/&&/||/?? branches) — file:line
- Deprecated APIs not caught by linter
- Modernization opportunities
- Migration debt: commented migrations, unused feature flags

RETURN: standard findings format + problematic snippet (3-5 lines).
```

---

## Agent 3 — Documentation + Missing Flows (Dimensions 4-5) — `debugger`

```
TASK: Critical Analysis — Dimensions 4 and 5
SCOPE (if provided): $ARGUMENTS

## DIMENSION 4 — DOCUMENTATION
### 4.1 Inventory
README files, AGENTS.md, CLAUDE.md, docs/, ADRs, JSDoc/TSDoc comments.

### 4.2 Quality
For each doc: up to date with code? Sufficient for new dev?

### 4.3 Missing
- Setup / local install
- API documentation (endpoints, schemas, examples)
- Architecture diagrams
- CONTRIBUTING.md
- Environment variables guide
- Operational runbooks (deploy, rollback, monitoring)

### 4.4 Code Comments
- Complex functions (>30 lines) without explanation
- Abandoned TODOs
- Types without JSDoc where non-obvious

## DIMENSION 5 — MISSING PAGES, SCREENS & FLOWS
### 5.1 Route Inventory
Map all routes (read routes/ recursively). For each: path, component, functionality.

### 5.2 Essential Missing Screens
- Error pages: 404, 500, 403, maintenance
- Error Boundary fallback with friendly UX
- Auth flows: password recovery, email confirmation, onboarding
- Destructive action confirmation dialogs
- Empty state pages with guidance

### 5.3 Incomplete Flows
- Auth: registration → onboarding → main app
- CRUD: create/edit/delete/empty states all covered?
- Payment flow (success, failure, webhook handling)
- Integration flows (error states covered?)

RETURN: standard findings format + category (documentation/screen/flow).
```

---

## Agent 4 — UX + Tests/CI (Dimensions 6-7) — `frontend-specialist`

```
TASK: Critical Analysis — Dimensions 6 and 7
SCOPE (if provided): $ARGUMENTS

## DIMENSION 6 — UX & MICRO-INTERACTIONS

### 6.1 Tooltips & Labels
- Form fields with placeholders/tooltips?
- Action buttons with tooltips (esp. icon-only)?
- Charts with legends?
- Standalone icons with alt text or tooltips?

### 6.2 Validation & Feedback
- Inline validation (not just on submit)?
- Contextual error messages (not generic)?
- Required fields visually marked?

### 6.3 Empty & Loading States
- Empty lists with guidance?
- Skeletons/spinners during fetches?
- Progress indicators for long operations?
- Error states with retry?

### 6.4 Navigation
- Active page indicator?
- Visual feedback after actions (toasts, alerts)?
- Modals with close + ESC?

### 6.5 Accessibility (a11y)
- Images without alt?
- Forms without <label htmlFor=>?
- Interactive components without aria-*?
- Semantic tokens vs hardcoded hex?
- Keyboard nav (tabIndex, onKeyDown)?
- Heading hierarchy (no skipped levels)?

### 6.6 Responsiveness
- Responsive classes (sm:, md:, lg:, xl:)?
- Components breaking <640px?
- Large tables: horizontal scroll or alt layout?
- Modals usable on small screens?

### 6.7 Visual Consistency
- Semantic tokens, not hardcoded hex?
- Consistent spacing (Tailwind scale)?
- Dark mode: components work in both themes? (skip if dark not in scope)

## DIMENSION 7 — TESTS, CI/CD

### 7.1 Coverage
Map .test.* / .spec.* files. Modules without tests. Critical paths (auth, payments, sensitive data) without tests.

### 7.2 Quality
- Meaningful assertions (not just "doesn't crash")?
- .skip / .only left behind?
- Integration tests beyond unit?
- Edge cases (null, empty, overflow)?

### 7.3 Missing Test Types
- Unit tests for critical services
- Integration tests (handler → response)
- E2E for critical flows
- Accessibility tests (axe-core)

### 7.4 CI/CD
- .github/workflows/ pipelines
- type-check, lint, test before merge?
- Auto-deploy (staging, production)?
- Missing: coverage, security audit, preview deploys?

RETURN: standard findings format + category (UX/a11y/tests/CI).
```

---

## Consolidation report template

When all 4 agents return, produce `docs/AUDIT-REPORT-{YYYY-MM-DD}.md`:

```markdown
# Critical Audit Report
Date: {date} | Scope: {scope or "full"}
Agents: evaluator (Mode 3), debugger ×2, frontend-specialist

## Executive Summary

| Dimension | P0 | P1 | P2 | P3 | Total |
|---|---|---|---|---|---|
| 1. Architecture | | | | | |
| 2. Structure | | | | | |
| 3. Code Quality | | | | | |
| 4. Documentation | | | | | |
| 5. Missing Screens | | | | | |
| 6. UX | | | | | |
| 7. Tests/CI | | | | | |
| 8. Dependencies | | | | | |
| 9. Technical Debt | | | | | |
| **TOTAL** | | | | | |

## Quality Thresholds (auto-flag P1 if violated)
- Test coverage < 80% on critical paths
- Cyclomatic complexity > 10 in any function
- Any dependency with critical CVE (CVSS ≥ 7.0)

## Findings per dimension
[verbatim findings tables from each agent]

## Prioritized Action Plan

| Phase | Severity | # Actions | Timeline |
|---|---|---|---|
| 1 | P0 | X | Immediately |
| 2 | P1 | X | Next sprint |
| 3 | P2 | X | Plan and schedule |
| 4 | P3 | X | Backlog |
```

---

## Optional: Codex adversarial cross-check (P0/P1)

When report surfaces P0 or P1, optionally run an independent Codex pass:

```typescript
Skill("codex:rescue");

// "Run codex adversarial-review --scope working-tree
//  Focus on: [list P0/P1 findings from report by file:line]
//  Report findings only — do not apply fixes."
```

Present Codex findings per `codex:codex-result-handling` protocol: show all → STOP → ask user which to fix.
