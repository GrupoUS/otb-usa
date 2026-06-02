---
name: evolution-core
description: Use at session start to load historical context; after fixing errors to capture learnings; when running Karpathy-style optimize loops over a target skill prompt with `<evolve_request>`; when running site copy / SEO / CTA / conversion / funnel autoresearch experiments on the GPUS Astro site (`<area>` input). Provides persistent SQLite memory, the Python autoresearch toolchain, and the GPUS commercial-first profile.
---

# Evolution Core

Three sub-skills behind one routing surface. Load `references/<file>.md` for the matching intent — do **not** read all three eagerly.

## Routing

| Trigger | Sub-skill | Reference |
|---|---|---|
| Session start, capture learning, `/evolve` (no token), CLI memory ops | **memory** | [`references/memory.md`](references/memory.md) |
| `/evolve optimize <skill>`, `<evolve_request>` XML in input, mutating a target prompt under multi-sample evals | **optimizer** (Karpathy autoresearch) | [`references/optimizer.md`](references/optimizer.md) |
| `/evolve optimize site:<area>`, `<input><area>...</area></input>`, copy / SEO / CTA / conversion / funnel work on the GPUS Astro site | **gpus-profile** (extends optimizer) | [`references/gpus-profile.md`](references/gpus-profile.md) |

Site optimize runs load **both** `optimizer.md` (scoring contract) and `gpus-profile.md` (commercial heuristics + cardinal rules + `<answer>` shape).

## Storage layout (shared)

```
.claude/docs/evolution/        # JSONL + SQLite memory.db (memory sub-skill)
evals/<skill-slug>/runs/<id>/  # autoresearch runs (optimizer + gpus-profile)
  ├── harness.json
  ├── test_cases.jsonl
  ├── candidates/
  ├── grades/
  ├── experiments.tsv          # append-only Karpathy history
  ├── applied.md               # keep promotions
  ├── backlog.md               # gaps + next actions
  └── best_skill_prompt.txt    # current winner
evals/site/<area-slug>/        # GPUS site profile runs
  ├── runs/<tag>/run.md
  └── compound.md              # durable cross-run learnings
```

## Scripts (`.claude/skills/evolution-core/scripts/`)

| Script | Purpose | Sub-skill |
|---|---|---|
| `memory_manager.py` | SQLite + JSONL CLI (sessions, capture, load_context, stats) | memory |
| `evolve_autoresearch_harness.py` | Freeze run from `<evolve_request>` | optimizer |
| `evolve_autoresearch_mutate.py` | Seed deterministic candidate variants | optimizer |
| `evolve_autoresearch_score.py` | Validate grade sheet, enforce sample budget, append TSV | optimizer |
| `evolve_autoresearch_report.py` | Build `evolve-response.xml` | optimizer |
| `evolve_autoresearch_log.py` | TSV utility (init / append / import-response / stats) | optimizer |

Detail + bootstrap commands in `scripts/AUTORESEARCH_README.md`.

## Hooks (auto, project-wide)

`.claude/hooks/{session_context,task_completed,subagent_stop}.py` — Python for portability. Wired in `.claude/settings.json`. Generate `errors.jsonl` + `sessions.jsonl` automatically.

## Hard rules (cross-cutting)

- **Single mutable artifact per autoresearch run.** Optimizer mutates only `target_skill_prompt`. Sibling-file syncs are `program.md`-class — between runs, not as a second scored target.
- **Fixed grading budget.** Same `samples_per_iteration` + same test pool for every candidate including baseline. No ad hoc tightening or loosening.
- **Append-only history.** Never delete `<experiment_log>` rows or `experiments.tsv` rows. Worse candidates → `discard`. Crashes → `crash`.
- **No subjective primary metrics.** Binary checks unless inherently numeric and declared upfront.
- **Memory CLI only.** Never `echo >>` into `.claude/docs/evolution/*` files — always go through `memory_manager.py`.

## Portability

Generic. To copy to another project: copy this skill dir + `.claude/hooks/{session_context,task_completed,subagent_stop}.py` + matching `.claude/settings.json` hook entries. Database auto-resolves to project root via `.git` lookup or `EVOLUTION_PROJECT_ROOT` env var.
