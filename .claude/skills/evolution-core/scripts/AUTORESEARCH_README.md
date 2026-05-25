# Autoresearch scripts (evolution-core / optimizer)

Local, auditable Karpathy-style workflow. Scripts live in `.claude/skills/evolution-core/scripts/`. Stdlib Python only.

## Files

- `evolve_autoresearch_harness.py`
  - Parses `<evolve_request>`
  - Freezes the run harness
  - Creates `request.json`, `harness.json`, `test_cases.jsonl`, `candidates/`, `grades/`
- `evolve_autoresearch_mutate.py`
  - Generates deterministic prompt variants from baseline + constraints
- `evolve_autoresearch_score.py`
  - Validates grade sheet against frozen harness
  - Computes aggregate score
  - Applies `keep | discard | crash`
  - Updates `experiments.tsv` and `best_skill_prompt.txt`
- `evolve_autoresearch_report.py`
  - Builds `evolve-response.xml`
  - Optionally appends `knowledge_gaps` and `next_actions` into `backlog.md`
- `evolve_autoresearch_log.py`
  - TSV-focused utility for init/append/import/stats
- `memory_manager.py`
  - Sibling memory CLI (separate sub-skill — see `references/memory.md`)

## Suggested flow

```bash
# 1. Bootstrap from an evolve request
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_harness.py init-run \
  --file /tmp/evolve-request.xml

# 2. Seed deterministic candidates
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_mutate.py seed-candidates \
  --run-dir evals/<skill-slug>/runs/<run-id>

# 3. Score baseline + each candidate using filled grade JSON
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_score.py score-candidate \
  --run-dir evals/<skill-slug>/runs/<run-id> \
  --grade-file evals/<skill-slug>/runs/<run-id>/grades/baseline.json

# 4. Build evolve-response.xml
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_report.py build-response \
  --run-dir evals/<skill-slug>/runs/<run-id> \
  --append-backlog
```

## Why this split

- Keeps the "frozen harness" separate from scoring + reporting
- Each step reviewable in git diffs
- Avoids monolithic runner that hides candidate generation or grading
- Mirrors `karpathy/autoresearch`: small surfaces, fixed evaluation, append-only history

## Reference

Full optimizer contract + I/O schemas + hard rules: `.claude/skills/evolution-core/references/optimizer.md`.
