# Plan: Refactor `AGENTS.md` — behavioral + orchestrator (drop rule duplication)

**Date:** 2026-05-02
**Branch:** `refactor/evolution-core-consolidation`
**Complexity:** L4 (Medium) — single-file rewrite + minor CLAUDE.md de-dup + learnings-log relocation. Spans `AGENTS.md` + `.claude/CLAUDE.md` + new `docs/learnings-log.md`.

---

## Context

`D:\Coders\neondash\AGENTS.md` (214 lines) is a clean **behavioral + orchestrator** AGENTS.md: WISC tier-loading protocol, core principles YAML, execution-behavior tables for commands / agents / skills / MCPs / CLI / terminal / debug-on-error, authority precedence, subdirectory map, templates table, commit format. Zero rule content — all canonical rules live in `.claude/CLAUDE.md`, `.claude/rules/`, overlays, skills.

Current `D:\Coders\gpus-site\AGENTS.md` (345 lines) has drifted into rule duplication:

| Section | Status vs `.claude/CLAUDE.md` |
|---|---|
| Cardinal rules (8 numbered) | **Duplicated verbatim** — both files carry identical rules 1-8 |
| Behavior bullets | **Duplicated** (`Implement directly`, `Bun only`, `Reference applied rules`) |
| Decision authority table | **Duplicated** (3 rows × 2 columns identical) |
| MCP servers | Only here — but redundant with CLAUDE.md `Research tools` table |
| Where rules live | Partial overlap with CLAUDE.md `Pointers` block |
| Learnings log (~240 lines) | Only here — but bloats Tier 1 always-loaded budget |

Per Anthropic Claude Code best practices and the [agents.md](https://agents.md/) spec, AGENTS.md is a **behavioral / interop** layer (also picked up by Cursor / Aider / Codex / Continue). It should:
1. Define **how** the agent operates (commands, agents, skills, MCPs, terminal discipline, escalation).
2. **Point to** technical rules (CLAUDE.md, `.claude/rules/`, skills) — never duplicate them.
3. Stay short enough to combine with `CLAUDE.md` under the **< 500-line Tier-1 budget** declared in `CLAUDE.md` line 3.

Today the combined Tier 1 = 345 + 170 = **515 lines** — over budget. The 240-line learnings log is the main offender.

**Outcome:** AGENTS.md becomes a ~150-line behavioral + orchestrator file modeled on neondash. Rule content stays in CLAUDE.md / `.claude/rules/` / skills (already canonical there). Learnings log relocates to `docs/learnings-log.md` (append-only history, on-demand read). CLAUDE.md drops content already covered by AGENTS.md (Decision authority — not Cardinal rules; cardinals are project-invariant and stay in CLAUDE.md per Anthropic guidance).

---

## Reference: existing assets that drive the rewrite

- `D:\Coders\neondash\AGENTS.md` — structural model
- `.claude/CLAUDE.md` — keeps cardinal rules, intent classification, stopping conditions, routing matrix
- `.claude/rules/{frontend,DESIGN,stability,seo,README}.md` — universal Tier-2 rules (already generified per 2026-05-02 learning)
- `.claude/commands/` — 12 active commands (`debug`, `delegate`, `design`, `evolve`, `implement`, `perf`, `plan`, `prime`, `recover`, `research`, `verify`, `_shared`)
- `.claude/agents/` — 12 agents (`code-reviewer`, `debugger`, `evaluator`, `explorer-agent`, `frontend-specialist`, `librarian`, `mobile-developer`, `oracle`, `orchestrator`, `performance-optimizer`, `project-planner`, `verification-agent`)
- `.claude/templates/` — 6 templates (`architecture-review-checklist`, `audit-agent-prompts`, `delegation-protocol`, `handoff-template`, `recovery-protocol`, `refactor-methodology`)
- `.claude/skills/senior-prompt-engineer/SKILL.md § 8` — agent → skill preload assignments (already SSOT)

---

## Target shape: new `AGENTS.md` (~150 lines)

```
# Grupo US — AGENTS.md

> Behavioral + orchestrator guide for AI agents. Follows agents.md spec. Read by
> Claude Code, Cursor, Aider, Codex, Continue, and other agents.md-aware tools.
> Authoritative rules live in `.claude/CLAUDE.md` (cardinals, routing, stopping
> conditions) and `.claude/rules/` (universal Tier-2). Never duplicate here.

## Tier loading
| Tier | Files | Trigger |
|---|---|---|
| 1 (always) | this `AGENTS.md` + `.claude/CLAUDE.md` | session start |
| 2 (on demand) | `.claude/rules/*.md` | routing matrix in CLAUDE.md |
| 3 (skills + refs) | `.claude/skills/*/SKILL.md` + `references/` | skill auto-trigger |
| Subdir | `<path>/AGENTS.md` | only when editing files under that path |

Combined Tier 1 budget: < 500 lines. Subdir AGENTS.md override / supplement
this root file when editing inside that subtree.

## Core principles
- Think → Research → Plan → Decompose → Implement → Validate.
- KISS / YAGNI. Build only what current requirement specifies.
- Preserve context across handoffs. Never assume an error is fixed — audit.
- Implement directly. Code-first responses. Bun-only.

## Execution behavior

### Commands (`.claude/commands/`)
12 commands. Invoke `/<name> [args]`. Each reads `.claude/config.json` and the
overlay-first resolution from `_shared.md § 0`.

| Command | When |
|---|---|
| `/plan [task]` | L3+ task, before code |
| `/prime [auto\|backend\|frontend\|fullstack]` | Cross-domain or unclear scope start |
| `/research [question]` | External knowledge gap |
| `/design [task]` | New page / component |
| `/implement [plan-path]` | Execute approved plan |
| `/debug [audit\|frontend\|backend\|auth-db\|recover]` | Error / regression |
| `/perf [build\|db]` | Performance issue (default = runtime PSI) |
| `/verify [quick\|spec-only\|paranoid]` | Post-implementation gate |
| `/evolve [auto\|handoff]` | Post-task learning capture / autoresearch |
| `/delegate` | Hand task to specialist (7-section protocol) |
| `/recover` | Failure recovery after 2+ failed attempts |

Skip commands for L1-L2 trivial fixes — direct edit faster than command overhead.

### Agents (`.claude/agents/`)
Spawn via `Agent({ subagent_type: "<name>", ... })`. Read-only research agents
MUST use `run_in_background: true`.

| Task signal | Agent | Background? |
|---|---|---|
| Frontend / React / styling | `frontend-specialist` | No |
| Tests / regression / runtime error | `debugger` | No |
| Performance / security / SEO | `performance-optimizer` | No |
| Codebase pattern lookup | `explorer-agent` | **Yes — mandatory** |
| External library / API research | `librarian` | **Yes — mandatory** |
| Plan review / architecture analysis | `evaluator` (Mode 3) | Caller decides |
| Feature planning / PRD | `project-planner` | Caller decides |
| Multi-agent coordination / D.R.P.I.V | `orchestrator` | No |
| Read-only consult (high-IQ second opinion) | `oracle` | Yes |
| Mobile (RN / Flutter) | `mobile-developer` | No |
| Code review (PR-style) | `code-reviewer` | Yes |
| Post-impl staging E2E (Playwright) | `verification-agent` | No |

Stopping: max 3 fix attempts on same hypothesis → `evaluator` Mode 3. Max 5
agent spawns / request → checkpoint with user. (Detail: CLAUDE.md § Stopping
conditions.)

### Skills (`.claude/skills/`)
Invoke via `Skill("<name>")` BEFORE any domain action. Process skills first,
domain skills second, implementation skills last.

| Phase | Skills |
|---|---|
| Process (preload via agent `skills:` frontmatter) | `senior-prompt-engineer`, `planning`, `evolution-core` |
| Tech-stack (auto-trigger on description match) | `astro` |
| Project | `grupo-us`, `gpus-theme` |
| Implementation | `ui-ux-pro-max`, `frontend-design`, `skill-creator` |

Agent ↔ skill preload assignments → `senior-prompt-engineer/SKILL.md § 8`.

### MCP servers (always use `serverIdentifier`)
| Server | Use |
|---|---|
| `plugin-tavily-tavily` | Web search, URL extract, citations |
| `plugin-compound-engineering-context7` | Library / framework docs |
| `cursor-ide-browser` | UI verification (lock → act → unlock) |
| `user-shadcn` | shadcn/ui component patterns |
| `user-sequentialthinking` | L4+ multi-step reasoning |

Read each tool's schema before calling. No external MCP for purely local ops.
No backend / DB / payments MCPs without explicit product requirement.

### Terminal execution
- POSIX shell + forward slashes regardless of host OS.
- Always include timeout (default 120s, max 600s).
- Non-interactive mandatory: `git commit -m "..."`, `git log -n N`, `gh --yes`.
- **Never** pipe `2>&1 | tail/head/grep` to capture output — breaks exit-code
  detection. Use `; echo "EXIT=$?"` or filter post-run.
- Stuck command (> 3× expected): check status; terminate + re-run with
  corrected non-interactive flags.
- Never wrap in `wsl`, `cmd /c`, OS-specific launcher.
- Bun only (`bun install`, `bun run`, `bunx`). Never npm / yarn / pnpm.

### Debug on error
`PAUSE` → `THINK` (`mcp__sequential-thinking__sequentialthinking`: what
happened? root cause? 3 candidate fixes?) → `HYPOTHESIZE` (formulate +
validation plan) → `EXECUTE` (apply only after understanding cause). Never
retry blindly.

## Authority precedence
When guidance overlaps, lower number wins:
1. Subdirectory `AGENTS.md` (when editing files under that subtree)
2. `.claude/rules/*.md` (Tier 2 universal rules — auto-loaded by routing matrix)
3. `.claude/CLAUDE.md` (cardinal rules + routing matrix + stopping conditions)
4. Root `AGENTS.md` (this file — behavioral + orchestrator)
5. Tech-stack skills (`astro`, etc.) — framework patterns
6. Project skills (`grupo-us`, `gpus-theme`) — brand SSOT
7. `docs/` (Tier 3 reference, on-demand)

## Templates (`.claude/templates/`)
| Template | Used by |
|---|---|
| `delegation-protocol.md` | `/delegate` |
| `handoff-template.md` | session handoff |
| `recovery-protocol.md` | `/debug recover`, `/recover` |
| `architecture-review-checklist.md` | `/architecture-review` (when invoked) |
| `audit-agent-prompts.md` | `/debug audit` |
| `refactor-methodology.md` | refactor flows |

## Subdirectory `AGENTS.md`
None today (`src/` is small enough). Add when a subtree grows domain
conventions that don't apply repo-wide. Read ONLY when editing inside that
subtree.

## Commit format
Conventional Commits: `feat:` `fix:` `docs:` `refactor:` `chore:` `perf:`. One
logical change per commit. Reference touched rule when relevant
(e.g., `fix(frontend): WhatsApp SSOT — drop inline wa.me`).

## Where rules live (don't duplicate)
| Need | Location |
|---|---|
| Cardinal rules (8) + routing matrix + stopping conditions + intent classification | `.claude/CLAUDE.md` |
| Universal frontend / design / stability / SEO rules | `.claude/rules/{frontend,DESIGN,stability,seo}.md` |
| Astro-specific patterns | `astro` skill (auto-trigger) |
| WhatsApp SDR Laura SSOT | `grupo-us/references/whatsapp-ssot.md` |
| Theme tokens canon (HSL Navy/Gold) | `gpus-theme` skill |
| Brand voice / products / journey | `grupo-us` skill |
| Project paths / tooling / gates | `.claude/config.json` |
| Autoresearch audit trail | `evals/README.md` + `evals/site/<area>/compound.md` |
| Chronological project decisions | `docs/learnings-log.md` |

## Recent learnings (last 3)
- 2026-05-02: `.claude/rules/` generified — universal do/don't, project SSOT migrated to skills (full → `docs/learnings-log.md`)
- 2026-05-02: `planning` + `senior-prompt-engineer` skills made portable
- 2026-05-01: `senior-prompt-engineer` rewired as agent-orchestration SSOT

Full chronological log → `docs/learnings-log.md`.
```

---

## Phase plan

### Phase 1 — Inventory + verify drop list [SEQUENTIAL]
- [ ] `D:\Coders\gpus-site\AGENTS.md` — re-read top 100 lines and learnings log spans to confirm what migrates vs what's already in CLAUDE.md / rules — verify: visual diff against above target shape
- [ ] `D:\Coders\gpus-site\.claude\CLAUDE.md` — confirm cardinal rules, routing matrix, stopping conditions, decision authority, intent classification all already present (they are per § 58-67, § 71-94, § 127-134, § 138-144, § 41-55) — verify: `grep -c "Cardinal rules" .claude/CLAUDE.md` ≥ 1
- [ ] `D:\Coders\gpus-site\.claude\templates\` — confirm all 6 templates referenced exist — already verified via `ls` (no second pass needed)
- [ ] `D:\Coders\gpus-site\.claude\commands\` and `agents\` — confirm 12 commands + 12 agents inventory matches new tables — already verified via `ls`

### Phase 2 — Relocate learnings log [SEQUENTIAL]
- [ ] Create `D:\Coders\gpus-site\docs\learnings-log.md` — copy current `AGENTS.md § Learnings log` block (lines ~104-345) verbatim. Add header: "Append-only chronological project decisions. New entries on top. Read on demand — Tier 3."
- [ ] Verify: `wc -l docs/learnings-log.md` ≈ 240; `head -3 docs/learnings-log.md` shows the header

### Phase 3 — Rewrite root `AGENTS.md` [SEQUENTIAL]
- [ ] Overwrite `D:\Coders\gpus-site\AGENTS.md` with target shape above (~150 lines). Drop:
  - 8 cardinal rules block (§ 24-37) — already in CLAUDE.md § 58-67
  - "Behavior" bullet section (§ 40-48) — already in CLAUDE.md § 22-27 + new "Core principles" section
  - "Decision authority" table (§ 51-58) — already in CLAUDE.md § 138-144
  - Massive learnings log (§ 104-345) — moved to `docs/learnings-log.md`
- [ ] Add (per neondash model, gpus-tailored):
  - Tier loading table (4 rows)
  - Core principles compact bullets
  - Commands table (12 rows)
  - Agents matrix (12 rows + Background? column)
  - Skills phase ordering (4 rows)
  - MCP servers table (5 rows; same content as today, slightly tighter)
  - Terminal execution discipline (8 bullets)
  - Debug-on-error PAUSE→THINK→HYPOTHESIZE→EXECUTE
  - Authority precedence numbered list (7 items)
  - Templates table (6 rows)
  - Subdirectory AGENTS.md note
  - Where rules live (pointer table only — no rule body)
  - Recent learnings (last 3 only) + link to full log
- [ ] Verify: `wc -l AGENTS.md` between 140 and 170

### Phase 4 — Trim CLAUDE.md if needed [SEQUENTIAL]
- [ ] Read `.claude/CLAUDE.md` line by line; flag any line that is a behavior / orchestration concern (not a project rule) and now better-housed in AGENTS.md. Most likely candidates to drop or compress (NOT cardinals, NOT routing matrix):
  - § 22-27 "Behavior" → keep (project-specific Bun-only, code-first); already terse
  - § 31-36 "Skill invocation" → keep (project-specific preload pattern)
  - § 138-144 "Decision authority" → keep (project-specific schema/dependency policy) — leave duplicate-ish but project-rooted
- [ ] **Likely outcome:** no CLAUDE.md edits needed. AGENTS.md is the file that bloated, not CLAUDE.md. Confirm before editing.
- [ ] Verify: `wc -l .claude/CLAUDE.md AGENTS.md` combined < 350 (well under 500-line budget)

### Phase 5 — Cross-ref repair [PARALLEL]
- [ ] `grep -rn "AGENTS.md" .claude/` — confirm no broken pointer references the dropped sections by line number
- [ ] `grep -rn "AGENTS.md" docs/` — same
- [ ] Update any reference to "Learnings log in AGENTS.md" → "Learnings log in docs/learnings-log.md"
- [ ] Verify: `grep -rn "AGENTS.md § Learnings" .` returns only the docs/learnings-log.md migration note

### Phase 6 — Validation gate [SEQUENTIAL]
- [ ] `bun run lint` (CRLF pre-existing failures in `src/styles/global.css` are not blockers per 2026-05-01 learnings — confirm no NEW failures in `.claude/` / `AGENTS.md` / `docs/`)
- [ ] `bunx astro check` → 0 errors / 0 warnings (hints OK)
- [ ] `bun run build` → 9 pages built clean
- [ ] Smoke: re-read AGENTS.md top-to-bottom, confirm a fresh agent can navigate Commands → Agents → Skills → MCPs → Authority precedence without needing CLAUDE.md to understand orchestration

---

## Critical files

| Path | Action |
|---|---|
| `D:\Coders\gpus-site\AGENTS.md` | **Rewrite** to ~150-line behavioral + orchestrator |
| `D:\Coders\gpus-site\docs\learnings-log.md` | **Create** — relocate full chronological log |
| `D:\Coders\gpus-site\.claude\CLAUDE.md` | **Verify only** — likely no edits |
| `D:\Coders\gpus-site\.claude\rules\*.md` | **Untouched** — already generified 2026-05-02 |
| `D:\Coders\gpus-site\.claude\skills\*` | **Untouched** |

---

## Reused references

- `senior-prompt-engineer/SKILL.md § 8` — agent → skill preload assignments (already SSOT, do NOT redeclare in AGENTS.md)
- `planning/SKILL.md` — methodology (already SSOT, AGENTS.md just points)
- `_shared.md § 0` — overlay-first config resolution (already SSOT)
- `evolution-core/SKILL.md` — autoresearch + memory router

---

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| Breaking external tooling that scans AGENTS.md for cardinal rules (Cursor / Aider / Codex) | Cardinals stay in CLAUDE.md; agents.md spec doesn't mandate cardinals in AGENTS.md. Add "See `.claude/CLAUDE.md` for cardinal rules" pointer in the new "Where rules live" table. |
| Learnings log relocated → grep history of past `AGENTS.md` references breaks | Grep + update pointers in Phase 5. Keep "last 3 learnings + link" inline so 80% of context-fetches hit the same file. |
| Combined Tier 1 budget regresses if AGENTS.md grows again | Hard ceiling enforced via wc-l verify in Phase 3. Future learnings always go to `docs/learnings-log.md`, never inline. |
| neondash uses overlay (`.claude/overlay/neondash/`); gpus-site doesn't — straight port introduces dead overlay refs | Drop "overlay-first" mentions. Replace with "rules + project skills" — gpus-site doesn't use the overlay pattern. |
| CLAUDE.md "Decision authority" overlaps with neondash-style AGENTS.md authority precedence | Keep both — they answer different questions. Decision authority = "may I do this autonomously?". Authority precedence = "when two docs disagree, which wins?". Different lenses. |
| Subdirectory AGENTS.md mentioned but none exist | Document the pattern as future-ready convention. Cheap, no maintenance until one exists. |
| Agent matrix lists 12 agents — drift if new agent added | Single command verify: `ls .claude/agents/*.md \| wc -l` should match table row count. Add CI grep optional, not in scope. |

---

## Verification (end-to-end)

```bash
# Phase 6 gate
bun run lint
bunx astro check
bun run build

# Tier 1 budget
wc -l AGENTS.md .claude/CLAUDE.md
# expect: combined < 350

# Pointer integrity
grep -rn "AGENTS.md § Learnings" .
# expect: only docs/learnings-log.md migration note

# Inventory parity
ls .claude/agents/*.md | wc -l   # expect: 12 — matches Agents matrix
ls .claude/commands/*.md | grep -v _shared | wc -l  # expect: 12 — matches Commands table
ls .claude/templates/*.md | wc -l  # expect: 6 — matches Templates table

# No regressed rule duplication
grep -c "Cardinal rules" AGENTS.md
# expect: 0 (cardinals only live in CLAUDE.md now; AGENTS.md only points)
```

Smoke check: open AGENTS.md fresh and confirm a new contributor can answer:
- Which command runs after a plan? → `/implement`
- Which agent for codebase grep? → `explorer-agent` (background)
- Which skill before agent design? → `senior-prompt-engineer`
- Where do cardinal rules live? → `.claude/CLAUDE.md`
- Where do universal frontend rules live? → `.claude/rules/frontend.md`
- When two docs disagree on a Tier-2 rule vs project skill, who wins? → Authority precedence § order

---

## Out of scope

- Editing `.claude/rules/*.md` — already generified 2026-05-02
- Editing `.claude/skills/*` — already SSOT-correct
- Editing `.claude/commands/*` — orchestration entries here, command bodies untouched
- Editing `.claude/agents/*` — preload frontmatter already correct
- Adding new commands / agents / skills

---

## Next

Approve plan → run `/implement docs/analise-o-d-coders-neondash-agents-md-pa-curious-wave.md` (or ask to adjust any phase / drop / table row above).
