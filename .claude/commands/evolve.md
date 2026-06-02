---
description: Capture GPUS Astro landing learnings and update project memory/docs after validated work.
---

# /evolve — ${project.displayName} Learning Capture

**ARGUMENTS**: $ARGUMENTS

Use after a validated implementation, bug fix, audit, or configuration change that produced reusable project knowledge.

## 0. First action

```typescript
Skill("evolution-core");
```

Load supporting skills only when relevant:

- `Skill("grupo-us")` for product, copy, CTA, or LGPD/legal guardrails.
- `Skill("gpus-theme")` for visual system learnings.
- `Skill("astro")` for Astro/static/Content Collection learnings.
- `Skill("performance-optimization")` for Lighthouse/CWV/bundle learnings.

## 1. What to capture

Capture only reusable, evidence-backed learnings:

- Root cause and validated fix.
- New invariant or anti-pattern.
- Updated validation command or smoke test.
- ${project.displayName}-specific copy/legal/design rule.

Do **not** capture one-off implementation details, guesses, or unvalidated assumptions.

## 2. Preferred targets

| Learning type | Target |
|---|---|
| Behavioral/project rule | `AGENTS.md` or `.claude/CLAUDE.md` |
| Frontend/design rule | `.claude/rules/DESIGN.md` or `.claude/rules/frontend.md` |
| Astro/static invariant | `.claude/rules/astro.md` or `Skill("astro")` references |
| Product/legal/CTA | `Skill("grupo-us")` references or `README.md` |
| Design canon | `Skill("gpus-theme")` references or `.claude/rules/DESIGN.md` |
| Session log | `docs/learnings-log.md` |

## 3. Validation

If files were changed, re-run the smallest relevant validation. For code/config changes, prefer:

```bash
bun run lint
bunx astro check
bun run build
```
