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
| `${project.stagingUrl}` | `project.stagingUrl` |
| `${project.locale}` | `project.locale` |
| `${paths.frontendRoot}` | `paths.frontendRoot` |
| `${paths.libRoot}` | `paths.libRoot` |
| `${paths.componentsRoot}` | `paths.componentsRoot` |
| `${paths.stylesRoot}` | `paths.stylesRoot` |
| `${tooling.packageManager}` | `tooling.packageManager` |
| `${tooling.buildTool}` | `tooling.buildTool` |
| `${tooling.typeChecker}` | `tooling.typeChecker` |
| `${tooling.linter}` | `tooling.linter` |
| `${gates.lighthouse.*}` | `gates.lighthouse.*` |
| `${gates.lcp/cls/inp/initialJsKb}` | `gates.*` |

### Rule file resolution

Rules live at `.claude/rules/<file>.md` and are project-authoritative. When a command or skill says "read `.claude/rules/<file>.md`", read it directly:

```bash
RULE=frontend.md
cat ".claude/rules/$RULE"
```

Available rules: `frontend.md`, `DESIGN.md`, `stability.md`, `seo.md`. See `.claude/rules/README.md` for scope of each.

---

## Section 1: Quality Gates

| Timing | Gates |
|---|---|
| After each task | type-check |
| After each phase | type-check + lint |
| Final | type-check + lint + tests |

```bash
# Resolve from config
${tooling.packageManager} run ${tooling.typeChecker}    # or `bunx tsgo`, `npx tsc --noEmit`, etc.
${tooling.packageManager} run lint                       # or direct: `bunx biome check`, `eslint .`
${tooling.packageManager} run test                       # only when test runner configured
```

> **Pre-commit:** run formatter+linter on every manually edited file. Most linters (`biome`, `eslint`) treat errors as build-breaking — they fail CI immediately.

---

## Section 2: Complexity Routing

| Level | Indicators | Mode |
|---|---|---|
| L1-L2 | Single file, known pattern, trivial | Direct — no agents |
| L3 | Multi-file, single domain | 1 background agent |
| L4-L5 | Multi-domain, parallel changes | 2-3 parallel agents |
| L6+ | Architecture, multi-service | Agent Teams |

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

> **Spawn contract:** every `Agent()` / `Task()` invocation MUST inject the 5 mandatory context fields from `.claude/skills/senior-prompt-engineer/references/agent-handoff-contracts.md § 1`. Do not duplicate the field list in command bodies — link only.

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
| Frontend | `/prime frontend` | frontend.md baseline + staged design refs on demand |
| Backend / API / DB | `/prime backend` | backend.md + database.md + stability.md baseline + targeted refs |
| Full-stack / multi-domain | `/prime` (auto) or `/prime fullstack` | Intent-based Tier 2 + exact Tier 3 only when justified |
| Continuing prior session | Read `.claude/docs/evolution/HANDOFF.md` first | — |

**Tier 3 (read on demand only):**
- `docs/architecture/` (if exists) — runtime/env, schema reference, learnings
- `docs/design-specs/` (if exists) — design system foundation, frontend learnings, feature specs
- ADRs — irreversible decisions; read when scope touches that decision

---

## Section 5: Tool Usage (ACI)

> ACI = Agent-Computer Interface. Per Anthropic "Building Effective Agents": tool documentation often more important than prompts.

| Tool | Purpose | When to use | When NOT to use | Edge cases |
|---|---|---|---|---|
| `Agent()` | Spawn subagent | L3+ tasks needing specialist | L1-L2 (overhead > value) | Background agents cannot Write/Edit |
| `Skill()` | Load domain context | Before any domain action — even 1% match | Never skip | Multiple skills OK; process skills before implementation skills |
| `TeamCreate / TaskCreate` | Agent teams | L6+ multi-service tasks with true parallelism | Below L6 (coordination overhead) | Must `TeamDelete` when done |
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
| Plan / decompose / architecture decision | `planning` | `senior-prompt-engineer` (mandatory when plan spawns ≥2 agents) |
| Multi-agent orchestration / handoff schema / agent file authoring | `senior-prompt-engineer` | `planning` (if planning involved) |
| UI / component / page / design system | `ui-ux-pro-max` + `frontend-design` | `debugger` (if mid-fix) |
| Performance / SEO / security baseline / Core Web Vitals / bundle | `performance-optimization` | `supabase-postgres-best-practices` (DB perf) |
| Postgres query / schema / RLS perf | `supabase-postgres-best-practices` | `supabase` |
| Supabase product (Database, Auth, Storage, Edge Functions, Realtime, MCP) | `supabase` | `supabase-postgres-best-practices` |
| Spreadsheet / financial model | `xlsx` | — |
| Skill creation / iteration | `skill-creator` | — |
| Memory / cross-session learning | `evolution-core` | — |
| Prompt engineering / LLM apps / RAG | `senior-prompt-engineer` | — |

If domain isn't listed → no skill applies; use rules + tool docs directly.

---

## Section 7: Parallel Agent Spawn pattern

When invoking 2+ agents in parallel:

1. **Single message** — all `Agent()` calls in the same response (concurrent execution).
2. **Background flag** — `run_in_background: true` for read-only agents (`explorer`, `librarian`, audit dimensions, codex:rescue diagnose).
3. **Foreground only** when the agent must write/edit (`frontend-specialist`, `debugger` in fix mode).
4. **Distinct scope** — each agent prompt has non-overlapping investigation area; otherwise merge into one agent.
5. **Same return contract** — all agents in a parallel batch return findings in the same format (table, columns, severity scale) so consolidation is mechanical.
6. **Maximum 5 spawns per user request** (per CLAUDE.md stopping conditions). At 5 → checkpoint with user.

Anti-pattern: spawning agents serially across multiple messages → loses parallelism + multiplies overhead.

---

## Section 7.5: Handoff Contract Schema

All agents — single, parallel-batch, or coordinator-managed — return findings using the canonical schema in `.claude/skills/senior-prompt-engineer/references/agent-handoff-contracts.md`. Parallel batches additionally conform to `.claude/skills/senior-prompt-engineer/references/parallel-batch-contracts.md` (shared columns + severity scale + consolidation rules).

The 5 mandatory context fields injected on every spawn live in the same skill (`agent-handoff-contracts.md § 1`). Commands MUST link to the SSOT — do not redeclare the field list in command bodies.

Coordinator failure recovery (max 2 resubmissions per task on `REVISION_REQUIRED` before `BLOCKED` → `/debug recover`): see `agent-handoff-contracts.md § 4`.

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
| Render mode declaration | `.claude/rules/frontend.md` | Page/route changes |
| Content Collections SSOT | `.claude/rules/frontend.md` | Product/team copy edits |
| External redirect tri-sync | `.claude/rules/frontend.md` | externalSiteUrl change |
| WhatsApp SSOT | `.claude/rules/frontend.md` | WhatsApp URL/CTA edits |
| Design tokens / no hex | `.claude/rules/DESIGN.md` | Style changes |
| Anti-patterns + debug triage | `.claude/rules/stability.md` | Per-project bugs |
| Pre-commit formatter/linter | `${tooling.linter}` per AGENTS.md | Every commit |

---

## Section 12: Skill invocation order

When a task touches multiple domains, invoke skills in this order:

1. **Process skills first** — `planning`, `debugger`, `evolution-core` (set the methodology)
2. **Domain skills second** — `supabase`, `supabase-postgres-best-practices`, `performance-optimization`, `senior-prompt-engineer`
3. **Implementation/design skills last** — `ui-ux-pro-max`, `frontend-design`, `xlsx`, `skill-creator`

Multiple skills can be loaded in the same response; order matters because earlier skills set context that later ones build on.
