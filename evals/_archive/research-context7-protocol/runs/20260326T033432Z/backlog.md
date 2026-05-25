# Still to improve

## Knowledge Gaps

- Binary criteria cap reached at 15/15 after iter 1.
- The max-3-calls limit could be a dedicated binary criterion (currently covered under C2 "reason stated" but not explicitly counted).
- Live agent grading would test whether an agent actually skips Step 1 for pre-resolved IDs vs always resolving.

## Next Actions

- Future candidate: add a short anti-pattern example showing a guessed ID being wrong (`/astro-v6` vs `/websites/v6_astro_build_en`) — makes the cost concrete.
- Consider adding a "quick lookup" shorthand for the 3 pre-resolved IDs so agents don't even resolve for Astro.

## Plateau

Reached at iteration 1 — max score 15/15 with current criterion set.
