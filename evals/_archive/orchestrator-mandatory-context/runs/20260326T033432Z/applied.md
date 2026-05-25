# Applied in this run

| UTC (ISO) | candidate_id | score | delta_vs_baseline | summary |
|-----------|--------------|-------|-------------------|---------|
| 2026-03-26T03:34Z | candidate-A | 15/15 | +3 | Added WHY parenthetical inside MANDATORY CONTEXT code-block header |

## Promotion detail — candidate-A

**Change:** Inside the `Task({})` code block, `## MANDATORY CONTEXT` → `## MANDATORY CONTEXT *(agents without context rediscover what you already know — fill every field)*`

**Criteria fixed:** C5 (WHY rationale at first-encounter point, inside the code block) — was 0/3, now 3/3.

**Why this worked:** The downstream callout (`> MANDATORY CONTEXT RULE: ...`) explained the cost, but an agent copying the Task({}) template might never reach that callout. Moving the WHY inside the block header makes it visible at copy-paste time — consistent with the same fix applied to delegate.md in run `20260326T030818Z`.
