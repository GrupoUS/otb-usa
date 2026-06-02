---
globs: src/**, .claude/**, scripts/**
---

# MCPs + Terminal + Debug Discipline — GPUS Astro Landing

## MCP servers

| Question type | Tool |
|---|---|
| Library/framework docs | Context7 resolve → query docs |
| Current best practices/CVEs/ecosystem | Tavily search with year/version |
| L4+ decomposition | sequential-thinking |
| UI verification | browser tool when available |
| Component patterns | shadcn registry tool when relevant |

Do not add backend, DB or payments MCPs without an explicit requirement. This repo is a static landing de inscrição (aula gratuita); lead via form (endpoint externo) + WhatsApp.

## Terminal execution

- POSIX shell + forward slashes.
- Always include timeout.
- Prefer non-interactive, self-terminating commands.
- Git read-only with `git --no-pager`; editor-risk git commands with `GIT_EDITOR=true`.
- Bun only: `bun install`, `bun run`, `bunx`.
- Never use `npm`, `yarn`, `pnpm`.
- Never `--no-verify` unless explicitly requested.
- Vercel CLI autenticado (`vercel whoami`); deploy/alias/env de produção = sempre perguntar.
- `rm -rf` em diretório pode ser bloqueado pelo `smart_bash_approver` hook — usar `rm -f file...` por arquivo.

## Debug on error

```text
PAUSE → THINK → HYPOTHESIZE → EXECUTE → VALIDATE
```

- Do not retry blindly.
- Formulate root-cause hypothesis before editing.
- Validation command must prove the fix.
- Two consecutive failures on same hypothesis → `/debug recover`.

## When to load more

| Need | Load |
|---|---|
| Commands + skill ordering | `.claude/rules/commands.md` |
| Commit format + gate | `.claude/rules/commit.md` |
| Stability/debug checklist | `.claude/rules/stability.md` |
| Astro invariants | `.claude/rules/astro.md` |
| Cardinal rules | `.claude/CLAUDE.md` + `AGENTS.md` |
