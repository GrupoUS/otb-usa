---
globs: src/**, .claude/**, scripts/**
---

# MCPs + Terminal + Debug Discipline — OTB USA

## MCP servers

| Question type | Tool |
|---|---|
| Library/framework docs | Context7 resolve → query docs |
| Current best practices/CVEs/ecosystem | Tavily search with year/version |
| L4+ decomposition | sequential-thinking |
| UI verification | browser tool when available |
| Component patterns | shadcn registry tool when relevant |

Do not add backend, DB or payments MCPs without an explicit OTB requirement. This repo is a static marketing landing.

## Terminal execution

- POSIX shell + forward slashes.
- Always include timeout.
- Prefer non-interactive, self-terminating commands.
- Git read-only with `git --no-pager`; editor-risk git commands with `GIT_EDITOR=true`.
- Bun only: `bun install`, `bun run`, `bunx`.
- Never use `npm`, `yarn`, `pnpm`.
- Never `--no-verify` unless explicitly requested.

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
