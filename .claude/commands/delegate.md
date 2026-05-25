---
description: Delegate a task to a specialist agent using the mandatory 7-section delegation protocol.
---

# /delegate - Explicit Delegation Protocol

**ARGUMENTS**: $ARGUMENTS

<command-instruction>
Before delegating, you MUST complete the Pre-Delegation Declaration:

```
Agent selected: [agent name]
Why this agent: [match between agent specialty and task domain]
Skills to load: [list from .claude/skills/]
Skill evaluation:
  - [skill-1]: INCLUDED because [reason]
  - [skill-2]: OMITTED because [reason]
Expected outcome: [concrete deliverable]
```

Then structure the delegation prompt with ALL 7 sections:

1. TASK: [atomic, specific - one action per delegation]
2. EXPECTED OUTCOME: [concrete deliverables with success criteria]
3. REQUIRED SKILLS: [skills to invoke — include `astro` skill for any Astro/Content Collection/island work]
4. REQUIRED TOOLS: [explicit whitelist]
5. MUST DO: [exhaustive requirements - nothing implicit]
6. MUST NOT DO: [forbidden actions]
7. CONTEXT: inject the 5 mandatory context fields verbatim from `.claude/skills/senior-prompt-engineer/references/agent-handoff-contracts.md § 1` (Original request · User decisions · Prior agent findings · Current plan state · Do NOT redo). Add a 6th line — **Files and constraints:** exact file paths, repo patterns, constraints from AGENTS.md.

The agent's return MUST conform to the Context Handoff schema in the same reference (§ 2). Verify schema compliance before claiming the delegation succeeded.

After delegation completes, VERIFY:

- Does it work as expected?
- Does it follow existing codebase patterns?
- Did the agent follow MUST DO and MUST NOT DO?

## Research Agent Selection

When delegating research tasks, choose based on **where the answer lives**:

| Need                                        | Agent      |
| ------------------------------------------- | ---------- |
| Find patterns / files / conventions in repo | `explorer` |
| Check docs / packages / best practices      | `librarian` |
| Both needed?                                | Delegate to **both in the same message** (parallel) |

## Skill Routing for Astro Tasks

| Task Domain | Required Skills |
| --- | --- |
| Astro components, pages, layouts, Content Collections | `astro` |
| React Islands, client directives, hydration | `astro` + `debugger` |
| Styling, Tailwind v4, @theme tokens | `astro` + `gpus-theme` |
| New UI sections, visual design | `astro` + `ui-ux-pro-max` + `gpus-theme` |
| Performance, Lighthouse, Core Web Vitals | `astro` + `performance-optimization` |
| Build errors, TypeScript, View Transitions | `astro` + `debugger` |

### Astro-Specific MUST DO / MUST NOT DO

**MUST DO (include when delegating Astro tasks):**
- Use `getCollection()` for all content data — never hardcode
- Map to `.data` before passing to React islands
- Use `<ClientRouter />` (not `ViewTransitions`) for Astro 6
- Use Tailwind v4 `@theme` tokens — never hardcode hex
- Run `bun run lint && bunx astro check && bun run build` as validation gate

**MUST NOT DO:**
- Add interactive React islands (only Aceternity UI visual effects in `src/components/ui/` are allowed)
- Create `src/content/config.ts` (project uses `src/content.config.ts` with explicit schemas)
- Use `client:*` directives on `.astro` components (only on React/Vue/Svelte)
- Use npm/yarn/pnpm (bun only)
  </command-instruction>
