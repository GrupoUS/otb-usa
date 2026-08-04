# Claude Code Hooks

## Overview

All hooks are **Python 3** for portability across Windows / macOS / Linux. Each hook is **silent by default** (exits 0 with no stdout) unless it has to print a JSON decision (PreToolUse), inject context (SessionStart / SubagentStart), or block on errors (Stop). Every hook fails open: any internal exception → `sys.exit(0)` so a broken hook can never wedge a session.

Project-specific values (project name, package manager, protected paths) come from `.claude/config.json` and `${overlay}/...`. Hooks read these at runtime — no per-project edits needed.

> **Note on `AGENTS.md` / `CLAUDE.md`.** These files are loaded by the runtime via the `claudeMd` mechanism (visible in any turn under the `# claudeMd` system reminder). The `SessionStart` hook intentionally does **NOT** re-emit them in `additionalContext` — duplicating that content into the system prompt every turn was costing tens of KB per session.

## Unattended-mode policy

Hooks são **conectados** em `.claude/settings.json` e rodam em modo desassistido: **nenhum hook pergunta nada**. Só o que é destrutivo é negado.

| Ajuste | Onde | Efeito |
|---|---|---|
| `AUTO_ALLOW_UNKNOWN = True` | `smart_bash_approver.py` | Qualquer comando fora da lista DANGEROUS é auto-aprovado. Nunca devolve `ask`. Coloque em `False` para voltar à triagem allow/ask/deny original. |
| `WARN_ONLY_PROJECT_FILES = True` | `protect_files.py` | Dois níveis: **hard deny** para `.env*`, `credentials/`, `secrets/`, `api-keys/`, `.git/`, lockfiles; **warn + allow** para os arquivos de `config.json::protectedFiles` (`astro.config.mjs`, `src/lib/whatsapp.ts`, `src/content.config.ts`, `package.json`, `tsconfig.json`, `biome.json`, `lefthook.yml`). Entradas com barra casam por sufixo de caminho. |
| `ENFORCE_BACKGROUND = True` | `task_routing_guard.py` | A convenção "agente read-only roda em background" virou nota em stderr, não deny — um gate de crítica em foreground não pode travar a cadeia. `subagent_type` desconhecido continua sendo negado. |
| `LINT_ROOTS = ("src/",)` | `ultracite.py` | O lint do Stop só olha o código do projeto. Bundles vendorados em `.claude/skills/**` nunca bloqueiam. |
| Stop hook **não conectado** | `settings.json` | `ultracite.py` no evento Stop bloqueava o fim do turno com erro de oxlint. O lint roda no gate `/verify` / `bun run lint`. Para reativar, adicione o bloco `Stop` apontando para `ultracite.py`. |

Rollback total: remova a seção `hooks` de `.claude/settings.json`.

## Configured hooks

### SessionStart
- **`session_context.py`** — emits a short `additionalContext` tag (`[PROJECT] Bun | branch:<branch> | gates: lint+astro-check+build`). One line, ~80 chars. Source-aware: `startup` / `resume` / `compact`.

### PreToolUse
- **`smart_bash_approver.py`** (matcher `Bash`) — em modo desassistido (`AUTO_ALLOW_UNKNOWN = True`) aprova tudo, exceto a lista DANGEROUS: `rm -rf /`, `DROP DATABASE`, force-push, PR merge/approve, gerenciadores não-Bun (`npm`/`pnpm`/`yarn`), `mkfs`, fork bomb, comandos Bun perigosos. Main-only workflow: edits e push em `main` são permitidos; force-push e auto-merge de PR seguem bloqueados. Inclui allow explícito para os inspetores read-only do impeccable (`context`/`detect`/`detect-csp`/`doctor`/`surface-brief`/`context-signals`.mjs) — `live*.mjs` e `pin.mjs` ficam fora porque sobem servidor ou escrevem arquivos de harness.
- **`protect_files.py`** (matcher `Edit|Write`) — dois níveis (ver tabela acima). **Deny:** `.env*`, lockfiles (`bun.lockb`, `bun.lock`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock`), `.git/`, `credentials/`, `secrets/`, `api-keys/`. **Warn + allow:** entradas de `config.json::protectedFiles` + `${overlay}/protected-files.json`.
- **`task_routing_guard.py`** (matcher `Agent|Task`) — valida `subagent_type` contra o conjunto conhecido (inclui `ui-ux-designer`, `oracle` e os quatro agentes `impeccable-*`); a preferência por background em agentes read-only é apenas uma nota em stderr.

### PostToolUse
- **`ultracite.py`** (matcher `Write|Edit`) — branches on `hook_event_name`. In PostToolUse mode runs `bunx biome format --write <file>` on the single edited file (cosmetic only, never linter auto-fix). Handles `.ts/.tsx/.js/.jsx/.json/.css`; skips everything else (incl. `.astro`, que o Biome não parseia). Lint auto-fix is intentionally NOT in PostToolUse: rules like `noUnusedImports` would delete imports added in step N before usage code is written in step N+1.

### Stop — **não conectado**
- **`ultracite.py`** (Stop branch) roda `bunx oxlint` sobre até 20 arquivos `src/**` modificados e bloqueia o fim do turno se `error_count > 0`. Bloquear o Stop conflita com o modo desassistido, então o bloco `Stop` **não está** em `settings.json`. O lint equivalente roda em `bun run lint` / `/verify`.

### SubagentStart
- **`subagent_start.py`** (matcher: `code-reviewer|debugger|evaluator|explorer-agent|explorer|frontend-specialist|impeccable-asset-producer|impeccable-documenter|impeccable-finish-reviewer|impeccable-manual-edit-applier|librarian|mobile-developer|oracle|performance-optimizer|project-planner|ui-ux-designer|verification`) — injects a short per-agent reminder (~80–120 chars) into the subagent's system prompt. Agent keys MUST stay in sync with the matcher.

### SubagentStop
- **`subagent_stop.py`** — consolidated handler. Reads the agent transcript at most once, then:
  1. Logs to `.claude/logs/subagent-events.jsonl` if the agent is non-trivial (`agent_type` ∉ `{Explore, general-purpose, Bash}`) and the transcript has ≥ 20 lines.
  2. For monitored agents (`orchestrator`, `debugger`, `frontend-specialist`, `performance-optimizer`, `mobile-developer`, `project-planner`, `explorer-agent`, `explorer`, `librarian`): scans for failure signals (`fail|failed|error|exception|traceback|panic`); on hit, increments `evaluator-failure-count.txt`, appends to `evaluator-escalation.jsonl`, and emits an escalation message on stderr at threshold 2 (then resets the counter).

### TaskCompleted
- **`task_completed.py`** — appends teammate task completion events to `.claude/logs/team-events.jsonl`. No-op when no `teammate_name` is present.

### Notification
- **`notify.py`** — desktop toast for `permission_prompt|idle_prompt`. Detects WSL (Windows Toast via PowerShell) → macOS (`osascript`) → Linux (`notify-send`) → terminal bell fallback.

---

## Auto-approved commands (examples)

```bash
# Git read-only
git status, git diff, git log, git branch, git fetch, git show, git stash, git remote

# Filesystem read
ls, cat, head, tail, grep, rg, find, which, pwd, echo, tree, stat, wc

# Package manager (Bun only)
bun install, bun run lint, bun run build, bunx astro check, bunx <tool>
# npm / npx / pnpm / yarn are blocked in this project

# Type checkers
tsc, tsgo

# Optional local CLIs (read-only introspection)
psql, mysql, sqlite3

# Version checks
python --version, node --version, bun --version, etc.
```

## Always-blocked commands

```bash
# Destructive
rm -rf /, rm -rf ~, rm -rf $HOME

# Database
DROP DATABASE, DROP TABLE, TRUNCATE

# Git / GitHub dangerous
git checkout main, git switch main, git push origin main, git push --force, gh pr merge, gh pr approve

# System
chmod -R 777 /, dd if=... of=/dev/, :(){ :|:& };:
sudo rm, truncate -s 0, mkfs
```

## Protected files (defaults)

| Pattern | Reason |
|---|---|
| `.env*` | Credentials |
| `credentials/`, `secrets/`, `api-keys/` | Sensitive data |
| `.git/` | Repository state |
| `bun.lockb`, `bun.lock`, `package-lock.json`, `pnpm-lock.yaml`, `yarn.lock` | Lockfiles |

Add per-project entries via `.claude/config.json::protectedFiles` or `${overlay}/protected-files.json`.

---

## Testing hooks

```bash
# Compile-check all hooks
python -m py_compile .claude/hooks/*.py

# Session context — must stay short
echo '{"source":"startup"}' | python .claude/hooks/session_context.py
# expect: {"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"[PROJECT] Bun | branch:<...> | gates: lint+astro-check+build"}}

# Bash approver
echo '{"tool_input":{"command":"bun run lint"}}' | python .claude/hooks/smart_bash_approver.py    # allow
echo '{"tool_input":{"command":"rm -rf /"}}' | python .claude/hooks/smart_bash_approver.py    # deny

# File protection
echo '{"tool_input":{"file_path":".env"}}'   | python .claude/hooks/protect_files.py          # deny
echo '{"tool_input":{"file_path":"src/x.ts"}}' | python .claude/hooks/protect_files.py        # exit 0

# Agent routing
echo '{"tool_input":{"subagent_type":"explorer","run_in_background":false}}' | python .claude/hooks/task_routing_guard.py   # deny
echo '{"tool_input":{"subagent_type":"debugger"}}' | python .claude/hooks/task_routing_guard.py                              # allow

# SubagentStart — verification entry must exist
echo '{"agent_type":"verification"}' | python .claude/hooks/subagent_start.py

# SubagentStop — silent on empty input
echo '{}' | python .claude/hooks/subagent_stop.py   # exit 0, no stdout
```

---

## Logs

```
.claude/logs/subagent-events.jsonl          # SubagentStop activity log
.claude/logs/evaluator-escalation.jsonl     # SubagentStop escalation events
.claude/logs/evaluator-failure-count.txt    # SubagentStop counter (resets at threshold)
.claude/logs/team-events.jsonl              # TaskCompleted events
```

Format example:
```json
{"timestamp":"2026-04-30T12:00:00Z","session_id":"...","agent_id":"...","agent_type":"debugger","transcript_lines":120,"background":"True"}
```

---

## Debug

```bash
/hooks                # show active hooks in Claude Code
claude --debug        # debug mode (hook execution trace)
Ctrl+O                # verbose mode in transcript
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      HOOK FLOW                                │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  SessionStart ───► session_context.py (one-line tag only)     │
│                                                                │
│  PreToolUse ─────► smart_bash_approver.py (Bash)              │
│               ├──► protect_files.py (Edit | Write)            │
│               └──► task_routing_guard.py (Agent)              │
│                        │                                       │
│                        ▼                                       │
│               ALLOW / DENY / ASK                              │
│                                                                │
│  PostToolUse ────► ultracite.py    (biome format --write)     │
│                                                                │
│  SubagentStart ──► subagent_start.py (per-agent context)      │
│  SubagentStop ───► subagent_stop.py (log + escalation merged) │
│                                                                │
│  TaskCompleted ──► task_completed.py (team event log)         │
│                                                                │
│  Stop ───────────► ultracite.py    (oxlint, blocks errors)    │
│                                                                │
│  Notification ───► notify.py (desktop toast)                  │
└──────────────────────────────────────────────────────────────┘
```

---

## Rollback

If hooks cause problems:

```bash
# Quick disable: remove "hooks" section from .claude/settings.json

# Full rollback:
git checkout .claude/settings.json
git checkout .claude/hooks/
```
