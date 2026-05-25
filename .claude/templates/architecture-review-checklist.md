# Architecture Review Checklist

> Reference checklist used inside `/debug audit` (Dimension 1: Architecture & Structural Patterns).
> Generic — applies to any codebase. For project-specific anti-patterns layer the overlay's `anti-patterns.md`.

## 1. System Structure Assessment

- Identify the architectural pattern in use (MVC, Clean, Hexagonal, Layered, Modular Monolith, Event-Driven, etc.). Cite files/dirs that evidence the pattern.
- Map the component hierarchy. How deep is the call graph?
- Are module boundaries respected? Or do "internal" modules leak across layers?

## 2. Design Pattern Evaluation

- Which patterns are implemented (Repository, Factory, Strategy, Observer, etc.)?
- Are they applied **consistently** across modules?
- Are there **anti-patterns** (god objects, circular deps, leaky abstractions, anemic domain models)?
- Does each pattern earn its complexity?

## 3. Dependency Architecture

- Coupling levels — measure imports per module; hotspots?
- Circular dependencies — `madge`, `dpdm`, or grep equivalents detect them
- Dependency direction — does the architecture enforce inward-pointing dependencies (Clean) or anything goes?
- Shared types/interfaces — defined once in `shared/`, or redefined per module?

## 4. Data Flow Analysis

- Trace information flow for one critical use-case end-to-end
- State management — server-state, client-state, cache, all distinct?
- Persistence strategy — single source of truth per entity?
- Transformation patterns — how does raw input reach the domain model?

## 5. Scalability & Performance

- Where would the system break first under 10× load?
- Caching strategy — explicit and consistent?
- Bottlenecks — DB queries, sync I/O, hot paths in render loops?
- Resource management — connection pools, file handles, listeners cleaned up?

## 6. Security Architecture

- Trust boundaries — clearly drawn?
- Authentication patterns — single canonical path or scattered?
- Authorization — RBAC, ABAC, RLS, or mixed?
- Data protection — PII handling, encryption at rest, secret management

## 7. Cross-cutting Concerns

- Error handling — uniform or per-module?
- Logging — structured, leveled, sampled?
- Monitoring/observability — traces, metrics, logs all wired?
- Configuration — env vars, secrets, feature flags managed centrally?

## 8. Quality & Testability

- Code organization — locality of change (one feature → one folder)?
- Documentation adequacy — onboarding to first PR in <1 day?
- Test pyramid — unit/integration/E2E ratio sane?
- Technical debt — TODO/FIXME density per kloc

## Output format

For each finding:

| File | Severity | Pattern violated | Recommendation |
|---|---|---|---|

Severity: P0 (critical) · P1 (important) · P2 (moderate) · P3 (minor).
