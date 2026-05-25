# `_archive/` — frozen skill-autoresearch snapshots

Single-snapshot Karpathy autoresearch runs from `2026-03-26` (one cycle each).

Winning prompts already promoted into the live skills (`evolution-core`, `senior-prompt-engineer`, `planning`, `delegate`, `debugger`, `orchestrator`, `research`). These directories preserve the audit trail (harness, candidates, grade sheets, `experiments.tsv`, `applied.md`, `backlog.md`) for provenance.

**Not consulted by current `/evolve` runs.** Treat as read-only history.

## Layout (per dir)

```
<skill-slug>/
  runs/
    <run-id>/
      experiments.tsv
      run_meta.txt
      applied.md
      backlog.md
      best_skill_prompt.txt   (some runs)
      harness.json
      test_cases.jsonl
      candidates/
      grades/
```

## What lives here

| Dir | Cycle | Outcome |
|---|---|---|
| `curso-auriculo-landing-copy/` | CTA copy seed for landing | Promoted to `src/content/products/curso-auriculo.json` |
| `debug-investigation-strategy/` | `debugger` agent prompt | Promoted to `.claude/agents/debugger.md` |
| `delegate/` | `/delegate` command | Promoted to `.claude/commands/delegate.md` |
| `design-maestro-auditor/` | UI audit agent | Promoted (folded into design workflow) |
| `evolve-autoresearch-self-improve/` | meta self-cycle (204K) | Promoted to `evolution-core/references/optimizer.md` (Karpathy mapping + crash discipline) |
| `orchestrator-mandatory-context/` | orchestrator handoff | Promoted to `senior-prompt-engineer/references/agent-handoff-contracts.md` |
| `plan-socratic-gate/` | planning skill discovery | Promoted to `planning/references/01-discover.md` |
| `research-context7-protocol/` | Context7 / Tavily ordering | Promoted to `/research` command + `parallel-batch-contracts.md` |

## New runs go where?

`/evolve optimize <slug>` writes to `evals/<slug>/runs/<run-id>/` (top level — namespace clear of `_archive/`). Don't add new runs here.

## Restore

To re-activate a snapshot for a fresh diff baseline: `git mv evals/_archive/<slug> evals/<slug>`.
