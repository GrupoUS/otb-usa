# Applied in this run

| UTC (ISO) | candidate_id | score | delta_vs_baseline | summary |
|-----------|--------------|-------|-------------------|---------|
| 2026-03-26T03:34Z | candidate-A | 15/15 | +3 | Added WHY parenthetical inline to Section 2.0 header |

## Promotion detail — candidate-A

**Change:** Added `*(picking the wrong strategy wastes agent cycles — one row match prevents a full re-investigation)*` inline after `### 2.0 Select Investigation Strategy`.

**Criteria fixed:** C5 (WHY rationale at first-encounter point) — was 0/3 (fails all 3 test cases), now 3/3.

**Why this worked:** The table was complete but skippable without visible cost. The parenthetical communicates what goes wrong if you skip strategy selection without being verbose.

**Note:** TSV baseline score recorded as 9/15 (baseline C1 miscounted as 0); actual baseline is 12/15 with C5 as the sole failing criterion. Delta is +3.
