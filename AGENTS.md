# Grupo US — AGENTS.md

> Behavioral + orchestrator guide for AI agents. Follows the [agents.md](https://agents.md/) spec.
> Read by Claude Code, Cursor, Aider, Codex, Continue, and any agents.md-aware tool.
> Authoritative rules live in `.claude/CLAUDE.md` (cardinals, routing, stopping conditions) and `.claude/rules/` (universal Tier-2). Never duplicate them here.

---

## Tier loading

| Tier | Files | Trigger |
|---|---|---|
| 1 (always) | this `AGENTS.md` + `.claude/CLAUDE.md` | session start |
| 2 (on demand) | `.claude/rules/{frontend,DESIGN,stability,seo}.md` | routing matrix in `.claude/CLAUDE.md` |
| 3 (skills + refs) | `.claude/skills/*/SKILL.md` + `references/` | skill auto-trigger (description match) |
| Subdir | `<path>/AGENTS.md` | only when editing files under that path |

**Combined Tier 1 budget:** < 500 lines. If a line in Tier 1 doesn't change behavior, drop it. Subdirectory `AGENTS.md` files **override or supplement** this root file when editing inside that subtree — always check before acting on a scoped task.

---

## Core principles

- **Think → Research → Plan → Decompose → Implement → Validate.**
- **KISS / YAGNI.** Build only what the current requirement specifies. Remove unused / dead code immediately.
- **Preserve context** across agent and thinking transitions. Hand off explicitly via the `senior-prompt-engineer` Context Handoff schema.
- **Never assume an error is fixed** — audit and validate after every change.
- **Implement directly, code-first.** Reference applied rules when relevant (e.g., "per `.claude/rules/frontend.md` redirect tri-sync").
- **Single source of truth.** Never duplicate rule content into this file — edit the rule, point here.
- **Chain of Thought.** Sequential atomic subtasks; verbalize reasoning; validate against requirements.
- **Incorporate always.** Enhance existing structure; avoid creating new files.
- **Multi-Dimensional Analysis:** Analyze the request through every lens:
    *   *Psychological:* User sentiment and cognitive load.
    *   *Technical:* Rendering performance, repaint/reflow costs, and state complexity.
    *   *Accessibility:* WCAG AAA strictness.
    *   *Scalability:* Long-term maintenance and modularity.

## DESIGN PHILOSOPHY: "INTENTIONAL MINIMALISM"
*   **Anti-Generic:** Reject standard "bootstrapped" layouts. If it looks like a template, it is wrong.
*   **Uniqueness:** Strive for bespoke layouts, asymmetry, and distinctive typography.
*   **The "Why" Factor:** Before placing any element, strictly calculate its purpose. If it has no purpose, delete it.
*   **Minimalism:** Reduction is the ultimate sophistication.

---

## Execution behavior

### Commands (`.claude/commands/`)

11 commands (`_shared.md` is shared boilerplate, not invokable). Invoke `/<name> [args]`. Each reads `.claude/config.json` at start; overlay-first resolution per `_shared.md § 0`.

| Command | When to invoke |
|---|---|
| `/plan [task]` | Any L3+ task, before code |
| `/prime [auto\|backend\|frontend\|fullstack]` | Cross-domain or unclear-scope start |
| `/research [question]` | External knowledge gap or pattern lookup |
| `/design [task]` | New UI page or component |
| `/implement [plan-path]` | Execute approved plan |
| `/debug [audit\|frontend\|backend\|auth-db\|recover]` | Any error, crash, regression |
| `/perf [build\|db]` | Performance issue (default = runtime PSI) |
| `/verify [quick\|spec-only\|paranoid]` | Post-implementation gate |
| `/evolve [auto\|handoff]` | Post-task learning capture / autoresearch loop |
| `/delegate` | Hand task to specialist (7-section protocol) |
| `/recover` | Failure recovery after 2+ failed attempts |

Skip commands for L1-L2 trivial fixes — direct edit faster than command overhead.

### Agents (`.claude/agents/`)

Spawn via `Agent({ subagent_type: "<name>", ... })`. Read-only research agents **must** use `run_in_background: true`.

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

Stopping conditions detail in `.claude/CLAUDE.md § Stopping conditions`. Quick: max 3 fix attempts on same hypothesis → escalate to `evaluator` Mode 3. Max 5 agent spawns / request → checkpoint with user.

### Skills (`.claude/skills/`)

Invoke via `Skill("<name>")` BEFORE any domain-specific action — even 1% match. Order: process skills first, domain skills second, implementation skills last.

| Phase | Skills |
|---|---|
| Process (preload via agent `skills:` frontmatter) | `senior-prompt-engineer`, `planning`, `evolution-core` |
| Tech-stack (auto-trigger via description match) | `astro` |
| Project | `grupo-us`, `gpus-theme` |
| Implementation | `ui-ux-pro-max`, `frontend-design`, `skill-creator`, `performance-optimization` |

Agent ↔ skill preload assignments → `senior-prompt-engineer/SKILL.md § 8`.

### MCP servers (always use `serverIdentifier`)

Read each tool's schema before calling. Prefer MCP over CLI / web guess. Don't use external MCP for purely local ops (git, `bun run build`, repo file reads). Don't introduce backend / DB / payments servers without explicit product requirement.

| `serverIdentifier` | Use |
|---|---|
| `plugin-tavily-tavily` | Web search, URL extract, citations |
| `plugin-compound-engineering-context7` | Library / framework docs (Astro, Tailwind v4, React 19, etc.) |
| `cursor-ide-browser` | UI verification (lock → act → unlock) |
| `user-shadcn` | shadcn/ui component patterns |
| `user-sequentialthinking` | Multi-step reasoning for L4+ ambiguous / high-risk problems |

### Terminal execution

- POSIX shell + forward slashes regardless of host OS. Bash is available even on Windows hosts — never wrap in `wsl`, `cmd /c`, or any OS-specific launcher.
- Always include a timeout (default 120s, max 600s). Prefer non-interactive, self-terminating commands.
- Non-interactive mandatory: `git commit -m "..."` (never editor), `git log -n N`, `gh --yes`. Prefix `GIT_TERMINAL_PROMPT=0` when git auth might prompt.
- **Never** pipe `2>&1 | tail/head/grep` to capture output — breaks exit-code detection. Use `; echo "EXIT=$?"` or filter post-run.
- Stuck command (running > 3× expected): check status; terminate + re-run with corrected non-interactive flags.
- **Bun only** (`bun install`, `bun run`, `bunx`). Never `npm` / `yarn` / `pnpm`.
- Never skip pre-commit hooks (`--no-verify`) unless explicitly requested.

### Debug on error

`PAUSE` → `THINK` (invoke `mcp__sequential-thinking__sequentialthinking`: what happened? root cause? 3 candidate fixes?) → `HYPOTHESIZE` (formulate fix + validation plan) → `EXECUTE` (apply fix only after understanding cause). Never retry blindly.

Two consecutive fix attempts on the same hypothesis fail → invoke `/debug recover` (per `.claude/CLAUDE.md § Stopping conditions`).

---

## Authority precedence

When guidance overlaps, lower number wins:

1. Subdirectory `AGENTS.md` (when editing files under that subtree)
2. `.claude/rules/*.md` (Tier 2 universal rules — auto-loaded by routing matrix)
3. `.claude/CLAUDE.md` (cardinal rules + routing matrix + stopping conditions)
4. Root `AGENTS.md` (this file — behavioral + orchestrator)
5. Tech-stack skills (`astro`, etc.) — framework patterns + project overlays
6. Project skills (`grupo-us`, `gpus-theme`) — brand SSOT, helpers, voice
7. `docs/` (Tier 3 reference, on demand)

---

## Decision authority

| Action | Authority |
|---|---|
| L1-L2 fixes, style/lint/type fixes | Autonomous |
| File deletion, new dependency, schema-shape change | **Confirm first** |
| Production config, deploy, destructive operations, force push | **Always ask** |

Detail per action class lives in `.claude/CLAUDE.md § Decision authority`.

---

## Templates (`.claude/templates/`)

Reusable protocols. Load when the matching command runs.

| Template | Used by |
|---|---|
| `delegation-protocol.md` | `/delegate` |
| `handoff-template.md` | session handoff (long sessions, context near limit) |
| `recovery-protocol.md` | `/debug recover`, `/recover` |
| `architecture-review-checklist.md` | architecture review flows |
| `audit-agent-prompts.md` | `/debug audit` |
| `refactor-methodology.md` | refactor flows |

---

## Subdirectory `AGENTS.md`

None today (`src/` tree is small enough that root rules apply uniformly). Add when a subtree grows domain conventions that don't apply repo-wide. When present, read **only** when editing files inside that subtree.

---

## Commit format

Conventional Commits: `feat:` `fix:` `docs:` `refactor:` `chore:` `perf:`. One logical change per commit. Reference touched rule when relevant (e.g., `fix(frontend): WhatsApp SSOT — drop inline wa.me`).

---

## Where rules live (don't duplicate)

| Need | Location |
|---|---|
| Cardinal rules (8) + routing matrix + stopping conditions + intent classification | `.claude/CLAUDE.md` |
| Universal frontend / design / stability / SEO rules | `.claude/rules/{frontend,DESIGN,stability,seo}.md` |
| Astro patterns + render-mode invariants + redirect tri-sync + `Layout.astro` contracts | `astro` skill (auto-trigger) — overlay at `references/gpus-overlay.md` |
| WhatsApp SDR Laura SSOT (`WHATSAPP_SDR_E164`, `whatsappUrlWithText`, `isWhatsAppDestination`, "Olá, Laura!" prefix) | `grupo-us/references/whatsapp-ssot.md` |
| Theme tokens canon (HSL Navy/Gold) | `gpus-theme` skill |
| Brand voice / products / journey / CTAs | `grupo-us` skill |
| Project paths / tooling / gates / protected files | `.claude/config.json` |
| Multi-agent handoff schema + parallel-batch contract | `senior-prompt-engineer/references/{agent-handoff-contracts,parallel-batch-contracts}.md` |
| Autoresearch audit trail + per-area `compound.md` brand memory + `/evolve` run records | `evals/README.md` + `evals/site/<area>/compound.md` |
| Chronological project decisions | `docs/learnings-log.md` |

If a topic is missing from the table above, add it to the matching rule file or skill and link from here — never paste content into this file.

---

## Recent learnings (last 3)

- **2026-05-02** — AGENTS.md → behavioral + orchestrator (drop rule duplication, relocate learnings log).
- **2026-05-02** — `.claude/rules/` generified; project SSOT migrated to `astro` + `grupo-us` skills.
- **2026-05-01** — `senior-prompt-engineer` rewired as agent-orchestration SSOT (handoff schema, parallel-batch contract, coordinator max-iteration).

Full chronological log → `docs/learnings-log.md`.
