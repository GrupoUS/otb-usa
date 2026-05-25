# Evals — EVOLVE_AUTORESEARCH

This tree is **mandatory** whenever `/evolve` runs **Fase 1** (autoresearch with `<evolve_request>`).

## Top-level dirs

| Path | Status | Purpose |
|---|---|---|
| `README.md` | active | this file (layout SSOT) |
| `site/<area-slug>/` | **active** | GPUS site copy/SEO/CTA autoresearch — `compound.md` + `runs/` (cited by `docs/learnings-log.md`) |
| `<skill-slug>/runs/<id>/` | active (write target) | new `/evolve optimize <slug>` runs land here |
| `_archive/` | **read-only** | frozen `2026-03-26` skill-autoresearch snapshots (wins promoted to skills) — see [`_archive/README.md`](_archive/README.md) |

## Layout

```text
evals/
  <skill-slug>/
    runs/
      <run-id>/
        experiments.tsv      # append-only (Python CLI)
        run_meta.txt
        applied.md             # what was promoted (keep) — fill after each run
        backlog.md             # gaps, next_actions, failing criteria — keep current
        best_skill_prompt.txt  # optional; from import-response --write-best
        harness.json           # frozen criteria, scoring formula, sample budget
        test_cases.jsonl       # fixed golden set for this run
        candidates/            # baseline + candidate prompt files
        grades/                # grade sheets and scored results
```

- **`applied.md`**: concrete prompt changes that **won** (candidate id, score, short summary).
- **`backlog.md`**: what is **not** solved yet — copy from `<knowledge_gaps>`, `<next_actions>`, and any criterion that still fails on samples.

Use one `runs/<run-id>/` folder per optimization session so history stays diff-friendly.

## Bootstrap

From the repo root:

```bash
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_log.py init \
  --evals-root evals \
  --skill-slug <target_skill_name_slug> \
  --target-skill-name "Human name" \
  --note "optional"
```

Then `import-response` with `--merge-backlog` to append gaps from the XML into `backlog.md`.

See `.claude/commands/evolve.md` (`optimize` mode) and `.claude/skills/evolution-core/references/optimizer.md`.

Alternative bootstrap flow:

```bash
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_harness.py init-run \
  --file /tmp/evolve-request.xml
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_mutate.py seed-candidates \
  --run-dir evals/<slug>/runs/<run-id>
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_score.py score-candidate \
  --run-dir evals/<slug>/runs/<run-id> \
  --grade-file evals/<slug>/runs/<run-id>/grades/baseline.json
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_report.py build-response \
  --run-dir evals/<slug>/runs/<run-id> \
  --append-backlog
```

---

## Site code autoresearch (GPUS `/evolve` + `<input><area>`)

When `/evolve` runs **site autoresearch** for copy, SEO, CTA strategy, funnel flow, conversion friction, or supporting performance work, use this layout:

```text
evals/
  site/
    <area-slug>/
      compound.md      # durable learnings across runs for this commercial area
      runs/
        <YYYY-MM-DD>-<slug>/
          run.md        # full <answer> or metrics + decision (keep/discard/investigate)
```

`compound.md` should accumulate:

- winning copy patterns
- SEO structures that worked
- CTA phrasings worth preserving
- objections that remain unresolved
- funnel or journey insights worth reusing

After a **keep** decision, update `compound.md` with what should be preserved in future runs. After **investigate**, update it with what is still unclear and what evidence is missing.

`run.md` is the per-experiment record. Optional: add `metrics.txt` (before/after Lighthouse or build notes).

**Batches:** when the user requests multiple consecutive loops in one session, you may record them under one run folder (e.g. `runs/<tag>-10x-loop/run.md`) plus a single `compound.md` for the batch, as long as each loop has its own **hypothesis**, **files touched**, and **keep \| discard** line.

Performance-focused site batches may live under `evals/site/performance-batch-<date>/` with the same structure (see `performance-batch-2026-03-26/`).

Primary human-readable log lives at **`docs/learnings-log.md`** (root `AGENTS.md § Recent learnings` carries the last 3 as a one-line summary). `compound.md` is the area-level memory for future autoresearch.

Sub-skill: `.claude/skills/evolution-core/references/gpus-profile.md` (loaded by `/evolve optimize site:<area>` or whenever `<input><area>` appears).
