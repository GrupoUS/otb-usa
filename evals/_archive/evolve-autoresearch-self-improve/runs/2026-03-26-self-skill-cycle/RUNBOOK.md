# EVOLVE_AUTORESEARCH run

Run dir: `/home/mauricio/gpus/evals/evolve-autoresearch-self-improve/runs/2026-03-26-self-skill-cycle`

## Frozen harness

- `harness.json`: source of truth for criteria, scoring, sample budget, and plateau threshold
- `test_cases.jsonl`: fixed golden set for this run
- `candidates/`: baseline prompt + deterministic candidate scaffolds
- `grades/grade-template.json`: template for scoring one candidate

## Criteria

- `C1`: Clearly distinguishes ordinary target-prompt optimization from self-improvement of this meta-skill or the /evolve command.
- `C2`: Requires baseline-first evaluation and a frozen harness before any candidate scoring.
- `C3`: Defines explicit crash handling with limited retry judgement and crash logging semantics.
- `C4`: Enforces the same fixed test pool and sample budget for baseline and every candidate.
- `C5`: Requires concrete disk artifacts for the run: harness snapshot, fixed test cases, experiments TSV, and evolve-response XML.
- `C6`: If a self-improvement run also updates /evolve, says that command sync happens only after one target artifact wins the run.

## Suggested flow

1. Fill `test_cases.jsonl` with the fixed sample pool before grading any candidate.
2. Keep `candidates/baseline.prompt.txt` unchanged for iteration `0`.
3. Generate candidate prompt files.
4. Copy `grades/grade-template.json` per candidate and fill binary results.
5. Score each candidate with `evolve_autoresearch_score.py`.
6. Build `evolve-response.xml` with `evolve_autoresearch_report.py`.
