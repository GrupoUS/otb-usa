---
description: Canonical shared patterns for all commands — Quality Gates, Complexity Routing, Agent Matrix, Tool Usage, Skill-to-Domain Matrix, Parallel/Sequential patterns, Verdict Matrix, Config Loader, AutoResearch Loop.
---

# _shared — Canonical Shared Patterns

> Loaded by reference from every command. Read this file to understand patterns; never duplicate sections inside individual commands.

---

## Section 0: Config Loader

Every command reads `.claude/config.json` at start to resolve project-specific values. Pattern:

```bash
# read config (commands invoke via Bash or Read)
test -f .claude/config.json && cat .claude/config.json
```

Substitution placeholders used in commands (resolve at runtime):

| Placeholder | Source field |
|---|---|
| `${project.name}` | `project.name` |
| `${project.displayName}` | `project.displayName` |
| `${project.stagingUrl}` | `project.stagingUrl` |
| `${project.productionUrl}` | `project.productionUrl` |
| `${project.designModelRepo}` | `project.designModelRepo` |
| `${project.locale}` | `project.locale` |
| `${content.productJson}` | `content.productJson` |
| `${content.productSlug}` | `content.productSlug` |
| `${content.ogImage}` | `content.ogImage` |
| `${content.anchors}` | `content.anchors` |
| `${content.legalRoutes}` | `content.legalRoutes` |
| `${content.sections.*}` | `content.sections.*` (section→anchor alias map) |
| `${lead.sdrName}` | `lead.sdrName` |
| `${lead.whatsappGreeting}` | `lead.whatsappGreeting` |
| `${lead.whatsappHelper}` | `lead.whatsappHelper` |
| `${lead.formComponent}` | `lead.formComponent` |
| `${lead.endpointEnv}` | `lead.endpointEnv` |
| `${lead.leadTable}` | `lead.leadTable` |
| `${tracking.ga4Env}` | `tracking.ga4Env` |
| `${tracking.pixelEnv}` | `tracking.pixelEnv` |
| `${paths.backendRoot}` | `paths.backendRoot` |
| `${paths.frontendRoot}` | `paths.frontendRoot` |
| `${paths.schemaRoot}` | `paths.schemaRoot` |
| `${paths.libRoot}` | `paths.libRoot` |
| `${paths.componentsRoot}` | `paths.componentsRoot` |
| `${tooling.packageManager}` | `tooling.packageManager` |
| `${tooling.buildTool}` | `tooling.buildTool` |
| `${tooling.typeChecker}` | `tooling.typeChecker` |
| `${tooling.linter}` | `tooling.linter` |
| `${tooling.testRunner}` | `tooling.testRunner` |
| `${gates.lighthouse.*}` | `gates.lighthouse.*` |
| `${gates.lcp/cls/inp/initialJsKb}` | `gates.*` |
| `${rulesDir}` | `rulesDir` (defaults to `.claude/rules`) |

**Rule layer.** All project rules + supplements live under `${rulesDir}`. No overlay folder, no overlay-first resolution. Tier 2 rules auto-load via `globs:` frontmatter; supplements load on demand by command/skill:

| File | Purpose |
|---|---|
| `${rulesDir}/routing-supplements.md` | Project-specific routing matrix rows (loaded by `/prime`, `/implement`) |
| `${rulesDir}/verify-supplements.md` | Project-specific smoke tests (loaded by `/verify`) |
| `Skill("debugger")` → `references/anti-patterns.md` | Project-specific bug patterns + Negative Constraints index |
| `Skill("planning")` → `references/layer-map.md` | Project-specific layer map for sprint phase ordering |
| `Skill("grupo-us")` → product/legal references | ${project.displayName} product, copy, audience, CTA and LGPD/consent guardrails |
| `${rulesDir}/docs/evolution/` | Runtime data: errors.jsonl, memory.db, HANDOFF.md (not docs) |

Project identity, cardinal rules, and constraints live in **root `AGENTS.md`** (always loaded as Tier 1).

---

## Section 0.5: Superpowers Bootstrap

Every command **MUST** invoke the superpowers meta-router as the first skill load, before any other skill, agent, or Bash call:

```typescript
Skill("superpowers:using-superpowers"); // meta-router — sets discipline + announce pattern
```

This loads the discipline-skill index and the "announce-before-action" rule. GPUS Astro landing domain skills (`debugger`, `planning`, `evolution-core`, `grupo-us`, `gpus-theme`, `astro`, `performance-optimization`) are loaded **after** the superpowers method layer, per § 12 (Skill invocation order).

Exceptions:
- `/prime` is a context loader — it only **recommends** the next command run the bootstrap.
- Subagents skip the bootstrap (superpowers `<SUBAGENT-STOP>` directive).

---

## Section 0.7: Path Conventions

Specs, plans, and learnings produced by the superpowers pipeline use these canonical paths:

| Artifact | Path | Producer |
|---|---|---|
| Design spec | `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md` | `Skill("superpowers:brainstorming")` |
| Implementation plan | `docs/superpowers/plans/YYYY-MM-DD-<topic>-plan.md` | `Skill("superpowers:writing-plans")` |
| Session handoff | `${rulesDir}/docs/evolution/HANDOFF.md` | `Skill("evolution-core")` § Session Handoff |
| Audit report | `docs/AUDIT-REPORT-YYYY-MM-DD.md` | `/debug audit` |
| Phase tracker | `.claude/logs/progress.md` | `/implement` (append on phase complete) |

Folders auto-created on first write. The project `.claude/logs/progress.md` remains the chronological phase tracker when a command requires phase tracking.

---

## Section 1: Quality Gates

| Timing | Gates |
|---|---|
| After focused source/config edit | `bun run lint` |
| After content/schema/route edit | `bunx astro check` + targeted smoke |
| Final | `bun run lint && bunx astro check && bun run build` |

```bash
bun run lint                                          # Biome + oxlint
bunx astro check                                      # Astro type/content gate
bun run build                                         # static production output
```

> **Pre-commit:** run formatter+linter on every manually edited file. Most linters (`biome`, `eslint`) treat errors as build-breaking — they fail CI immediately.

---

## Section 1.5: Verification Gate (evidence before completion)

Before any command (or phase inside a command) claims success, invoke:

```typescript
Skill("superpowers:verification-before-completion");
```

The skill enforces: a verification command was actually run, its full stdout + exit code are captured, and the claim of "done / fixed / passing" cites that evidence. No claim without evidence.

Apply at:
- Tail of any command that mutates code (`/implement`, `/debug` fix mode, `/design` Phase 2, `/perf fix`, `/evolve`).
- Inside `/verify` Phase 0 — gates pass condition becomes evidence-bound, not assumption-bound.
- Per-phase tail inside `/implement` Mode B and `/debug` fix mode.

Anti-pattern: marking a task complete after only inspecting code; running a non-canonical or nonexistent validation script and forgetting to check exit code; assuming a fix worked because the diff "looks right".

---

## Section 2: Complexity Routing

| Level | Indicators | Mode |
|---|---|---|
| L1-L2 | Single file, known pattern, trivial | Direct — no agents |
| L3 | Multi-file, single domain | 1 background agent |
| L4-L5 | Multi-domain, parallel changes | 2-3 parallel agents |
| L6+ | Architecture, multi-service | Coordinator + specialist agents; use Agent Teams only when the runtime exposes them |

---

## Section 3: Agent Assignment Matrix

| Task type | Agent | Background? |
|---|---|---|
| Backend handler/service/auth/DB | `debugger` | No (write-capable) |
| React/components/UI/styling | `frontend-specialist` | No (write-capable) |
| Schema/migrations/indexes | `debugger` | No |
| Tests/QA | `debugger` | No |
| Performance/security/SEO | `performance-optimizer` | No |
| Codebase patterns/files lookup | `explorer` | **YES — mandatory** |
| External docs/packages | `librarian` | **YES — mandatory** |
| Architecture consultation | `evaluator` (Mode 3) | Caller decides |

Read-only agents (`explorer`, `librarian`) **must** use `run_in_background: true`.

**Explorer vs Librarian:**

| Question | Agent |
|---|---|
| What exists in this codebase? | `explorer` |
| How does this library/API work? | `librarian` |
| Both needed? | Spawn both in same message |

> `explorer` = custom agent (`.claude/agents/explorer-agent.md`), NOT the built-in `Explore`. Use `subagent_type: "explorer"`.

---

## Section 4: WISC Context Load

Before any task, load the right tier:

| Domain | Command | Loads |
|---|---|---|
| Frontend | `/prime frontend` | DESIGN.md baseline (merged web-layer rule) + staged design refs on demand |
| Backend / API / DB | `/prime backend` | backend.md + database.md + stability.md baseline + targeted refs |
| Full-stack / multi-domain | `/prime` (auto) or `/prime fullstack` | Intent-based Tier 2 + exact Tier 3 only when justified |
| Continuing prior session | Read `${rulesDir}/docs/evolution/HANDOFF.md` first | — |

**Tier 3 (read on demand only):**
- `Skill("grupo-us")` — ${project.displayName} product, audience, CTA, LGPD/consent guardrails
- `Skill("gpus-theme")` — Navy/Gold tokens, design canon, frontend handoff
- `Skill("astro")` — static Astro MPA, Content Collections
- `${rulesDir}/docs/` — project Tier-3 markdown the host project chooses to keep outside skills (e.g. PRDs, planning docs)

---

## Section 5: Tool Usage (ACI)

> ACI = Agent-Computer Interface. Per Anthropic "Building Effective Agents": tool documentation often more important than prompts.

| Tool | Purpose | When to use | When NOT to use | Edge cases |
|---|---|---|---|---|
| `Agent()` | Spawn subagent | L3+ tasks needing specialist | L1-L2 (overhead > value) | Background agents cannot Write/Edit |
| `Skill()` | Load domain context | Before any domain action — even 1% match | Never skip | Multiple skills OK; process skills before implementation skills |
| Agent Team tools | Runtime-native agent teams | L6+ multi-service tasks with true parallelism and team tools available | Below L6, or when tools are unavailable | If unavailable, use a coordinator agent plus explicit phase gates |
| `mcp__tavily__search` | Web search (current) | Research, version checks, CVE audits, external API patterns | Known codebase patterns (use Grep) | Add year/version to query for non-stale |
| `mcp__claude_ai_Context7__*` | Library/framework docs | Any library Q: API, config, migration | General research (Tavily); internal (Grep) | resolve-library-id first → query-docs |
| `mcp__sequential-thinking__sequentialthinking` | Multi-step reasoning | L4+, ambiguous, 3+ file errors, irreversible | L1-L2, known patterns | Invoke BEFORE acting |
| `Read / Grep / Glob` | Codebase exploration | Always prefer over bulk reads | Never overly broad Grep patterns | Grep to filter → Read for content |
| `WebFetch` | Fetch web content | Official docs deep-dive, specific page | General research (Tavily) | `librarian` agent context only |

---

## Section 6: Skill-to-Domain Matrix

Single source of truth — used by `/implement`, `/design`, `/verify`, `/debug audit`.

| Domain / task signal | Primary skill | Supporting skills |
|---|---|---|
| Bug fix / runtime error / regression | `debugger` | `evolution-core` (post-fix capture) |
| Plan / decompose / architecture decision | `planning` | `senior-prompt-engineer` (if AI feature) |
| UI / component / page / design system | `gpus-theme` + `astro` | `debugger` (if mid-fix) |
| Performance / SEO / security baseline / Core Web Vitals / bundle | `performance-optimization` | Host database/performance skill if present |
| Database query / schema / permission model | Host database skill if present | `debugger` |
| External provider / deployment / product API | Host provider skill if present | `librarian` for external docs |
| Spreadsheet / financial model | `xlsx` | — |
| Skill creation / iteration | `skill-creator` | — |
| Memory / cross-session learning | `evolution-core` | — |
| Prompt engineering / LLM apps / RAG | `senior-prompt-engineer` | — |

If domain isn't listed → no skill applies; use rules + tool docs directly.

---

## Section 7: Parallel Agent Spawn pattern

Before any parallel batch, invoke:

```typescript
Skill("superpowers:dispatching-parallel-agents");
```

This skill enforces: distinct scope per agent, shared return contract, single-message dispatch, stopping conditions. The numbered rules below are the local GPUS Astro landing quick-reference.

When invoking 2+ agents in parallel:

1. **Single message** — all `Agent()` calls in the same response (concurrent execution).
2. **Background flag** — `run_in_background: true` for read-only agents (`explorer`, `librarian`, audit dimensions, codex:rescue diagnose).
3. **Foreground only** when the agent must write/edit (`frontend-specialist`, `debugger` in fix mode).
4. **Distinct scope** — each agent prompt has non-overlapping investigation area; otherwise merge into one agent.
5. **Same return contract** — all agents in a parallel batch return findings in the same format (table, columns, severity scale) so consolidation is mechanical.
6. **Maximum 5 spawns per user request** (per CLAUDE.md stopping conditions). At 5 → checkpoint with user.

Anti-pattern: spawning agents serially across multiple messages → loses parallelism + multiplies overhead.

---

## Section 8: Sequential Phase Gating pattern

When phases have dependencies (Phase N requires Phase N-1 output):

```
Phase N-1 → produce artifact → checkpoint gate → Phase N → ...
```

Each gate verifies:
- Required artifact present (file written, agent returned, tests passed)
- Quality threshold met (gate output matches contract)
- No regression in prior phase output

If a gate fails → STOP. Don't proceed silently. Either:
- Re-run prior phase with corrected scope
- Escalate to evaluator (Mode 3)
- Switch to `/debug recover`

Never collapse phases when their outputs feed each other (e.g., schema → API → UI).

---

## Section 9: Verdict Matrix template

Used by `/verify` to consolidate signals from gates + agents + reviews into a single ship/no-ship verdict.

```markdown
## Verdict — {feature/task}

| Signal | Source | Status | Notes |
|---|---|---|---|
| Type-check | `${tooling.typeChecker}` | PASS / FAIL | {output tail or error count} |
| Lint | `${tooling.linter}` | PASS / FAIL | {error count} |
| Tests | `${tooling.testRunner}` | PASS / FAIL | {N passed / N failed} |
| Static analysis | `/debug` | PASS / FAIL / N issues | {summary} |
| Performance | `/perf` | PASS / FAIL | {Lighthouse / CWV} |
| E2E | `/debug frontend` | PASS / FAIL | {snapshots captured / regressions} |
| Spec compliance | manual or eval | PASS / FAIL | {requirements satisfied?} |
| Codex review | `codex:rescue` | PASS / FAIL / N findings | {by severity} |
| Codex adversarial | `codex:rescue` adversarial-review | PASS / FAIL / N findings | {by severity} |
| Architecture review | `evaluator` Mode 3 | PASS / WARNINGS | {warnings if any} |

## Decision
- **Ship** if: all PASS + no P0/P1 findings unresolved
- **Hold** if: any FAIL or unresolved P0/P1
- **Ship with follow-up** if: only P2/P3 findings + tracked in tasks

## Open follow-ups
- {list of P2/P3 to schedule}
```

---

## Section 10: AutoResearch Loop

Triggered by `/debug auto`, `/implement auto`, or any command-mode that detects unresolved external knowledge gap.

Loop:

1. Identify external question (library API, version diff, current best practice, CVE)
2. Run `mcp__claude_ai_Context7__resolve-library-id` → `query-docs` (preferred for libraries)
3. If still unresolved → `mcp__tavily__search` (with year + version in query)
4. If both fail → spawn `librarian` agent with full context
5. Cache the answer in conversation; if useful long-term → propose memory write via `/evolve`
6. Resume the original task with new info

Hard limit: 3 cycles. After 3 unresolved → flag to user as a research blocker.

---

## Section 11: Guardrails Index

> Quick-reference map. Read the canonical source before applying.

| Guardrail | Canonical location | Trigger |
|---|---|---|
| Stability checklist A-L | `.claude/rules/stability.md` | Any code change |
| DB FK index requirement | `.claude/rules/database.md` | Schema changes |
| Render mode + polling + mutations | `.claude/rules/DESIGN.md` | Page/route changes |
| RLS / auth model | `.claude/rules/database.md` + `.claude/rules/backend.md` | Auth/data changes |
| Webhook idempotency | `.claude/rules/integrations.md` | Webhook handlers |
| Design tokens / no hex / mobile scroll owner | `.claude/rules/DESIGN.md` | Style changes |
| Project-specific anti-patterns | `Skill("debugger")` → `references/anti-patterns.md` | Per-project bugs |
| Pre-commit formatter/linter | `${tooling.linter}` per AGENTS.md | Every commit |

---

## Section 12: Skill invocation order

When a task touches multiple domains, invoke skills in this order:

1. **Meta layer** — `superpowers:using-superpowers` (always first, per § 0.5)
2. **Superpowers method** — `superpowers:brainstorming` / `writing-plans` / `executing-plans` / `subagent-driven-development` / `test-driven-development` / `systematic-debugging` / `verification-before-completion` / `requesting-code-review` / `receiving-code-review` / `dispatching-parallel-agents` / `using-git-worktrees` / `finishing-a-development-branch` / `writing-skills` (HOW: discipline + format)
3. **GPUS Astro landing knowledge** — `grupo-us`, `planning`, `debugger`, `evolution-core` (WHAT: product rules, bug catalog, layer-map, anti-patterns, memory)
4. **Domain skills** — `astro`, `performance-optimization`, `senior-prompt-engineer`
5. **Implementation/design skills last** — `gpus-theme`, `ui-ux-pro-max`, `xlsx`, `skill-creator`

Multiple skills can be loaded in the same response; order matters because earlier skills set context that later ones build on. The pipeline `spec (brainstorming) → plan (writing-plans) → execute (executing-plans / subagent-driven-development) → verify (verification-before-completion) → review (requesting-code-review / receiving-code-review) → finish (finishing-a-development-branch)` is the canonical flow for any L3+ feature work.
