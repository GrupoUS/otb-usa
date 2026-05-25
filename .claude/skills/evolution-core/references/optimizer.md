# evolution-core — Optimizer (Karpathy autoresearch)

Loaded when `/evolve optimize <target>` runs or when `<evolve_request>` XML appears in input.

You are the **optimizer**: improve **one target skill prompt** per run via objective, repeatable evaluation. Never edit OS, IDE, MCP, provider, or harness mid-run.

## Editable vs immutable surfaces

| Surface | Editable this run? |
|---|---|
| `target_skill_prompt` | **Yes** — only this |
| Eval criteria list | No — frozen after Step 1 of IMPLEMENT |
| Scoring formula | No |
| Test case set | No — fixed before first candidate |
| Acceptance / plateau rules | No |
| This optimizer doc | No |

User wants different criteria → **stop**, declare new run. No silent harness rewrites.

## Karpathy mapping

Source: [github.com/karpathy/autoresearch/tree/master](https://github.com/karpathy/autoresearch/tree/master).

| Upstream | Role | Analog here |
|---|---|---|
| `prepare.py` | Frozen prep + eval | `harness.json`, `test_cases.jsonl`, scoring formula, `samples_per_iteration` |
| `train.py` | Single mutable file, keep/discard by metric | `target_skill_prompt` |
| `program.md` | Human-tuned org context | This skill, `/evolve` command, `evals/README.md` — edited **between** runs |

**Three debts to preserve:**

1. **Single mutable artifact per run.** `<evolve_request>` mutates only `target_skill_prompt`. Sibling-file syncs (e.g. `/evolve` command) are `program.md`-class — done **between** runs, not as a second scored target.
2. **Fixed grading budget.** Same `samples_per_iteration` + same test pool for every candidate, including baseline. Never grade promising candidates more loosely or tighten only baseline.
3. **Objective primary metric.** `total_score = sum over samples of binary criterion passes`. No vibes.

## Self-improvement runs (program.md-class)

User asks to improve **this** optimizer or `/evolve`:

- One scored target only (this doc *or* command excerpt). Baseline first.
- Sibling orchestration update happens **after** target wins. Treat as `program.md` sync.
- Sample pool must include: 1 ordinary optimize case + 1 self-improvement boundary + 1 crash/failure case.

## Crash discipline

Candidate crashes / unusable output / harness break:

1. Decide: small operational bug (one quick retry after local fix) or broken idea (log `crash`, move on).
2. Never mutate harness / criteria / sample budget to rescue.
3. Append-only: `crash` row in `experiments.tsv`, baseline + current best unchanged, cause noted in `knowledge_gaps` / `backlog.md`.
4. Prefer abandoning fragile candidates over large prompt complexity for tiny gains.

## Methodology (A.P.T.E / D.R.P.I.V)

- **Discover / Analyze.** Parse `<evolve_request>`. Required field missing or `eval_constraints` cannot derive 3+ binary checks → ask **one** multiple-choice clarifying question, **stop**.
- **Research.** Map constraints to atomic binary criteria (≥95% binary unless inherently numeric). List gaps + assumptions.
- **Plan.** Fix test cases, candidate count, iteration cap, plateau threshold `K`, optional min baseline score.
- **Implement.** Baseline → candidates → multi-sample eval → keep/discard → log.
- **Validate.** Self-check output schema, promotion rule, `<experiment_log>` coherence.

## Required input (`<evolve_request>`)

```xml
<evolve_request>
  <target_skill_name>...</target_skill_name>
  <target_skill_prompt>...</target_skill_prompt>
  <task_domain>...</task_domain>
  <eval_constraints>...</eval_constraints>
  <resources>
    <max_iterations>...</max_iterations>
    <samples_per_iteration>...</samples_per_iteration>
    <max_cost_per_iteration>...</max_cost_per_iteration> <!-- optional -->
  </resources>
  <logging_preferences>
    <keep_all_candidates>true|false</keep_all_candidates>
    <store_rationale>true|false</store_rationale>
  </logging_preferences>
</evolve_request>
```

Required: `target_skill_name`, `target_skill_prompt`, `task_domain`, `eval_constraints`, `resources/max_iterations`, `resources/samples_per_iteration`.

## Required output (`<evolve_response>`)

```xml
<evolve_response>
  <status>success|partial|failed</status>
  <summary>...</summary>
  <best_skill_prompt>...</best_skill_prompt>
  <eval_design>
    <criteria>...</criteria>
    <scoring_formula>...</scoring_formula>
  </eval_design>
  <experiment_log>
    <iteration index="1">
      <candidate_id>...</candidate_id>
      <score>...</score>
      <delta_vs_baseline>...</delta_vs_baseline>
      <decision>keep|discard</decision>
      <hypothesis>...</hypothesis>
      <changes_summary>...</changes_summary>
    </iteration>
  </experiment_log>
  <knowledge_gaps>...</knowledge_gaps>
  <next_actions>...</next_actions>
</evolve_response>
```

Every iteration logged, including baseline (`candidate_id=baseline`, no mutation).

## Optimization loop

1. **Freeze harness:** final binary criteria list (3–10) + scoring rule (e.g. `total_score = sum(samples) sum(criterion passes)`). Never change mid-run.
2. **Define test cases:** ≥ `ceil(samples_per_iteration / candidates_per_iteration)` distinct inputs, or fixed pool ≥ 3.
3. **Baseline:** unchanged prompt, full sample count, score it. `current_best = baseline`.
4. **Per iteration** (until `max_iterations`, plateau, or budget):
   - Propose 2–5 small diff-friendly candidates (one hypothesis each).
   - Each candidate: full N executions. ≥ 5 total graded outputs before claiming improvement vs baseline.
   - Each criterion = 1 (pass) / 0 (fail). Sum to candidate score.
   - Promote only if `candidate_score > current_best_score`. Else discard.
   - Log: `candidate_id`, `score`, `delta_vs_baseline`, `decision`, `hypothesis`, `changes_summary`.
5. **Plateau:** No `keep` for `K` consecutive iterations (default `K = min(3, max_iterations)`) → status `partial`, note in summary + `next_actions`.
6. **Regression guard:** Higher total but fails must-not-regress criterion → discard, note in `knowledge_gaps`.
7. **Simplicity:** Tie within rounding → prefer shorter/clearer. Tiny gain at large complexity cost → discard unless constraints require.
8. **Anti-overfitting:** No optimizing on word count or banned-substring proxies. Criteria reflect `eval_constraints` substance.

## Hard rules

- No subjective primary metrics. Binary unless inherently numeric and declared upfront.
- Fixed grading budget per candidate — same `samples_per_iteration` + same pool for all (incl. baseline). No ad hoc shortening / extending.
- Never one trial per candidate for final comparison. Aggregate over `samples_per_iteration`.
- Never promote candidate with score < `current_best_score`.
- Never delete prior `<experiment_log>` history. Archive worse candidates in text if `keep_all_candidates`.
- Never claim unavailable tools. List limits in `<knowledge_gaps>`.

## `evals/` tree (mandatory)

Every new run: `evals/<skill-slug>/runs/<run-id>/` (top-level — never inside `_archive/`).

| File | Purpose |
|---|---|
| `experiments.tsv` | Karpathy-style append-only history (via Python CLI) |
| `applied.md` | Each `keep` promotion + what changed in prompt |
| `backlog.md` | Failing criteria, `<knowledge_gaps>`, `<next_actions>`, plateau reasons |

Put run path in `<next_actions>`. Fill `applied.md`/`backlog.md` after scoring — never empty if response had substance.

Layout: [`evals/README.md`](../../../../evals/README.md). Frozen historical snapshots from prior promotions live in [`evals/_archive/`](../../../../evals/_archive/README.md) (read-only — do not write).

## Python toolchain

All scripts in `.claude/skills/evolution-core/scripts/` (stdlib only).

| Script | Purpose |
|---|---|
| `evolve_autoresearch_harness.py` | Parse `<evolve_request>`, freeze harness, create `harness.json`, `test_cases.jsonl`, `candidates/`, `grades/` |
| `evolve_autoresearch_mutate.py` | Seed deterministic candidate prompt variants |
| `evolve_autoresearch_score.py` | Validate grade sheet, enforce sample budget, append TSV, update `best_skill_prompt.txt` |
| `evolve_autoresearch_report.py` | Build `evolve-response.xml`, optionally append backlog notes |
| `evolve_autoresearch_log.py` | TSV-centric init/import/stats |

**Bootstrap:**

```bash
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_harness.py init-run \
  --file /tmp/evolve-request.xml
```

**Seed candidates:**

```bash
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_mutate.py seed-candidates \
  --run-dir evals/<skill-slug>/runs/<run-id>
```

**Score one candidate:**

```bash
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_score.py score-candidate \
  --run-dir evals/<skill-slug>/runs/<run-id> \
  --grade-file evals/<skill-slug>/runs/<run-id>/grades/baseline.json
```

**Build response:**

```bash
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_report.py build-response \
  --run-dir evals/<skill-slug>/runs/<run-id> \
  --append-backlog
```

**TSV utility (init / append / import-response / stats):**

```bash
python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_log.py init \
  --evals-root evals --skill-slug <slug> --target-skill-name <name> --note "optional"

python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_log.py append \
  --run-dir evals/<slug>/runs/<id> \
  --iteration 0 --candidate-id baseline --score 28 --delta-vs-baseline 0 \
  --decision keep --changes-summary "baseline eval"

python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_log.py import-response \
  --run-dir evals/<slug>/runs/<id> --file path/to/response.xml --write-best --merge-backlog

python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_log.py stats \
  --run-dir evals/<slug>/runs/<id> --require-min-rows 5
```

`decision`: `keep` / `discard` / `crash` (Karpathy-style).
TSV columns: `iteration`, `candidate_id`, `score`, `delta_vs_baseline`, `decision`, `hypothesis`, `changes_summary`.

Emit `<evolve_response>` in chat **and** persist under `evals/`.

## Few-shots (sketches)

**A — diagram:** 4 binary criteria × 10 samples = 40 max. Variants on layout + negative numbering. Pick highest `total_score`.

**B — proposal:** Required headings present, paragraphs ≤ 5 sentences, pricing triple, fluff markers absent. 3–5 prospect scenarios fixed pool. Iterate structure + examples.

**C — support chat:** Reply ≤ 120 words, exactly one next step on ambiguous, no fabrications, polite tone. 8 samples × 4 criteria = 32 max. Tighten ambiguity handling.

## When invoked from /evolve

Complete `<evolve_response>` **before** the command's capture phase (memory, GSD, session report).
