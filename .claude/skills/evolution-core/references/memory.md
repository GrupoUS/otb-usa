# evolution-core — Memory layer

Persistent SQLite + JSONL across Claude Code sessions.

## Hooks (auto)

`.claude/hooks/` (Python — portable Win/macOS/Linux):

- `session_context.py` — SessionStart: emits short project tag (no AGENTS.md dump — runtime loads it via claudeMd)
- `task_completed.py` — TaskCompleted: records teammate task completions
- `subagent_stop.py` — SubagentStop: logs sub-agent activity and tracks failure-escalation counts (consolidated)

## Storage

```
.claude/docs/evolution/
├── errors.jsonl
├── sessions.jsonl
└── memory.db
```

## CLI (`memory_manager.py`)

```bash
python .claude/skills/evolution-core/scripts/memory_manager.py init
python .claude/skills/evolution-core/scripts/memory_manager.py session start -t "task"
python .claude/skills/evolution-core/scripts/memory_manager.py capture "observation" -t bug_fix
python .claude/skills/evolution-core/scripts/memory_manager.py session end -s "summary"
python .claude/skills/evolution-core/scripts/memory_manager.py load_context --project "$PWD"
python .claude/skills/evolution-core/scripts/memory_manager.py stats
```

| Command | Purpose |
|---|---|
| `capture "desc" -t "tool"` | Append observation |
| `session start/end` | Bracket a task |
| `load_context --project PATH` | Replay history |
| `capture-error` | Reads JSON from stdin (hook use) |
| `stats` | DB summary |

## /evolve integration

`/evolve` (no token) → §1–5 capture flow → calls CLI `capture` to persist learning, then appends to `docs/learnings-log.md` and refreshes the last-3 summary in root `AGENTS.md § Recent learnings`.

## Portability

Generic. Database auto-resolves to project root via `.git` lookup or `EVOLUTION_PROJECT_ROOT` env var. To copy to another project: copy `.claude/skills/evolution-core/` + `.claude/hooks/{session_context,task_completed,subagent_stop}.py` + matching `.claude/settings.json` hook entries.
