# Delegation Protocol — 7-Section Template

> Reference template for delegating tasks to specialist agents (Task tool / subagents).
> Loaded by `/implement` and any command that spawns sub-agents.

## Pre-Delegation Declaration

Before invoking the Task tool, output:

```
Agent selected: [agent name]
Why this agent: [match between agent specialty and task domain]
Skills to load: [list from .claude/skills/]
Skill evaluation:
  - [skill-1]: INCLUDED because [reason]
  - [skill-2]: OMITTED because [reason]
Expected outcome: [concrete deliverable]
```

## The 7 Sections

Every delegation prompt MUST include:

1. **TASK** — atomic, specific, one action per delegation
2. **EXPECTED OUTCOME** — concrete deliverables with success criteria
3. **REQUIRED SKILLS** — skills to invoke (from `.claude/skills/`)
4. **REQUIRED TOOLS** — explicit whitelist
5. **MUST DO** — exhaustive requirements; nothing implicit
6. **MUST NOT DO** — forbidden actions
7. **CONTEXT** — file paths, patterns, constraints

## Post-Delegation Verification

After the agent returns:

- Does the result work as expected?
- Does it follow existing codebase patterns?
- Did the agent honor MUST DO and MUST NOT DO?

## Research Agent Selection

When delegating research, choose by **where the answer lives**:

| Need | Agent |
|---|---|
| Patterns / files / conventions in repo | `explorer` (or `Explore` for quick lookups) |
| Docs / packages / best practices / external APIs | `librarian` |
| Both | Spawn both in the **same message** (parallel) |

## Anti-patterns

- Vague TASK ("improve auth") → always atomic
- Missing CONTEXT → agent re-discovers, wasting tokens
- No MUST NOT DO → agent expands scope
- Skipping pre-declaration → no audit trail of why this agent
