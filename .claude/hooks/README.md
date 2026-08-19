# Claude Code Hooks

## Onde os hooks vivem

Quase todos os hooks desta sessão são **globais** (`~/.claude/hooks/`, registrados em
`~/.claude/settings.json`) e valem para qualquer projeto. Este diretório guarda só o que é
específico do OTB USA.

Antes, o projeto mantinha um fork local de nove hooks e os registrava de novo em
`.claude/settings.json`. Como o Claude Code **soma** os hooks de todos os níveis, cada evento
disparava as duas cópias: contexto de sessão injetado duas vezes, linhas duplicadas em
`subagent-events.jsonl`, lint rodando duas vezes por edit. Os forks locais também estavam
defasados (sem o `hookRelax`, sem o `FAIL_PATTERN` corrigido, sem o toast de Windows).

**Regra:** só registre um hook aqui quando o comportamento for exclusivo deste repositório.
Melhoria que serve para todo projeto vai no hook global.

| Hook | Escopo | Arquivo |
|---|---|---|
| `protect_files.py` | **projeto** — lê `config.json::protectedFiles` | `.claude/hooks/protect_files.py` |
| `session_context`, `smart_bash_approver`, `task_routing_guard`, `ultracite`, `subagent_start`, `subagent_stop`, `task_completed`, `notify`, `session_baseline`, `tool_failure_guard`, `agent_routing_hint`, `memory_compiler_delegate`, `pre_write_guard` | global | `~/.claude/hooks/` |

Todos são **Python 3**, silenciosos por padrão (exit 0 sem stdout) e fail-open: qualquer exceção
interna vira `sys.exit(0)`, então hook quebrado nunca trava a sessão.

> **`AGENTS.md` / `CLAUDE.md`** são carregados pelo runtime via `claudeMd`. O hook `SessionStart`
> não os reemite em `additionalContext` — duplicar isso custava dezenas de KB por sessão.

## Hook do projeto — `protect_files.py`

Registrado em `.claude/settings.json` no evento `PreToolUse` (matcher `Edit|Write`).
`WARN_ONLY_PROJECT_FILES = True` define dois níveis:

- **hard deny:** `.env*`, `credentials/`, `secrets/`, `api-keys/`, `.git/`, lockfiles;
- **warn + allow:** os caminhos de `config.json::protectedFiles` (`astro.config.mjs`,
  `src/lib/whatsapp.ts`, `src/content.config.ts`, `package.json`, `tsconfig.json`, `biome.json`,
  `lefthook.yml`). Entradas com barra casam por sufixo de caminho.

O aviso não substitui a regra: mexer nesses arquivos exige razão explícita e os gates rodados
(`.claude/rules/commit.md`).

Rollback: remova a seção `hooks` de `.claude/settings.json`.

## Logs

Os hooks globais escrevem em `.claude/logs/` **do projeto** (gitignorado — é estado de runtime,
não fonte):

| Arquivo | Escritor | Limite |
|---|---|---|
| `sessions/<id>.baseline.json` | `session_baseline.py` | 10 arquivos mais recentes |
| `subagent-events.jsonl` | `subagent_stop.py` | 400 linhas |
| `tool-failures.jsonl` | `tool_failure_guard.py` | 400 linhas |
| `agent-orchestration-events.jsonl` | `agent_routing_hint.py` | 400 linhas |
| `evaluator-escalation.jsonl`, `evaluator-failure-count.txt` | `subagent_stop.py` | — (só cresce em falha) |

Os cortes vêm de `~/.claude/hooks/logcap.py` (`cap_jsonl`, `prune_dir`). O `.jsonl` só é reescrito
quando passa de 2x o limite, então o append normal continua O(1).

## Testando

```bash
# Compile-check
python -m py_compile .claude/hooks/*.py ~/.claude/hooks/*.py

# Proteção de arquivo (hook do projeto)
echo '{"tool_input":{"file_path":".env"}}'     | python .claude/hooks/protect_files.py   # deny
echo '{"tool_input":{"file_path":"src/x.ts"}}' | python .claude/hooks/protect_files.py   # exit 0

# Contexto de sessão (global) — deve sair curto, com os gates de config.json::gates.label
echo '{"source":"startup"}' | python ~/.claude/hooks/session_context.py
# expect: {"hookSpecificOutput":{...,"additionalContext":"[OTB-USA] Bun | branch:<...> | gates: lint+astro-check+build"}}

# Aprovador de bash (global)
echo '{"tool_input":{"command":"bun run lint"}}' | python ~/.claude/hooks/smart_bash_approver.py  # allow
echo '{"tool_input":{"command":"rm -rf /"}}'     | python ~/.claude/hooks/smart_bash_approver.py  # deny
```
