---
description: Capture OTB USA learnings and update project memory/docs after validated work.
---

# /evolve — OTB USA Learning Capture

**ARGUMENTS**: $ARGUMENTS

Use after a validated implementation, bug fix, audit, or configuration change that produced reusable project knowledge.

## 0. First action

```typescript
Skill("evolution-core");
```

Load supporting skills only when relevant:

- `Skill("otb-usa")` for product, copy, CTA, or legal guardrails.
- `Skill("otb-theme")` for visual system learnings.
- `Skill("astro")` for Astro/static/Content Collection learnings.
- `Skill("performance-optimization")` for Lighthouse/CWV/bundle learnings.

## 1. What to capture

Capture only reusable, evidence-backed learnings:

- Root cause and validated fix.
- New invariant or anti-pattern.
- Updated validation command or smoke test.
- OTB-specific copy/legal/design rule.

Do **not** capture one-off implementation details, guesses, or unvalidated assumptions.

## 2. Preferred targets

| Learning type | Target |
|---|---|
| Behavioral/project rule | `AGENTS.md` or `.claude/CLAUDE.md` |
| Frontend/design rule | `.claude/rules/DESIGN.md` or `.claude/rules/frontend.md` |
| Astro/static invariant | `.claude/rules/astro.md` or `Skill("astro")` references |
| Product/legal/CTA | `Skill("otb-usa")` references or `PRODUCT.md` |
| Design canon | `Skill("otb-theme")` references or `DESIGN.md` |
| Session log | `docs/learnings-log.md` |

## 3. Validation

If files were changed, re-run the smallest relevant validation. For code/config changes, prefer:

```bash
bun run lint
bunx astro check
bun run build
```
