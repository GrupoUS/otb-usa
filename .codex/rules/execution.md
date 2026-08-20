---
paths:
  - "src/**"
---

# Execution — commits, the terminal, and what to do when it fails

> Graph Powers template. Agent and skill routing comes from the plugin; only what belongs to this
> repository stays here.

## Commits `[HARD]`

**Nothing is committed or pushed without an explicit request in the current turn.** The final state
of any task is: working tree ready, gates green, report written. The commit is the reviewer's
decision.

The plugin's guardrails enforce this with code. When the approval comes, the opt-in travels with
the command — and the hook matches the key as **text**, not as shell syntax, so write whichever
form your shell accepts:

| Shell | Form |
|---|---|
| bash, zsh, Git Bash | `OTBUSA_ALLOW_COMMIT=1 git commit -m "..."` |
| PowerShell | `$env:OTBUSA_ALLOW_COMMIT=1; git commit -m "..."` |
| cmd.exe | `set OTBUSA_ALLOW_COMMIT=1 && git commit -m "..."` |

Only the first is also valid POSIX shell syntax. On Windows it releases the gate and then fails to
run the command, which reads as a broken guardrail and is not.

Format: Conventional Commits — `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`, `perf:`,
`build:`, `ci:`. The verb describes what the change does, not what you did.

## Before committing

In this order, and each result is evidence, not an impression:

```bash
bun run lint          # biome + oxlint
bunx astro check      # type-check Astro
bun run build         # gera dist/
bun test              # asserções sobre o dist/
```

If a gate fails, the commit did not happen — report which one, with the exact output, and fix the
cause. Never `git commit --amend` as a recovery: that rewrites the previous commit, which was not
the problem.

## Terminal

These are correctness facts, not ceremony — ignoring them breaks result capture:

- **Always with a timeout.** A hung command with no timeout hangs the whole session.
- **Non-interactive always**: `git commit -m`, never the editor; `--yes` where it exists;
  `GIT_TERMINAL_PROMPT=0` when git might ask for a credential.
- **Do not pipe output into `tail`/`grep` when you need the exit code** — the code becomes the last
  command's in the pipe. Use `; echo "EXIT=$?"` and filter afterwards.
- **Forward slashes in paths**, on every operating system.

## What this project refuses to merge

Root `REVIEW.md` — the gates and what each proves, the blocking findings with the incidents behind
them, the mechanical checks, and who approves what. `/pr-review` reads it; this rule does not
restate it.

## When something fails

Stop, understand, then fix. Repeating the same attempt with a small variation is the pattern that
burns the most time — after two attempts on the same hypothesis, the hypothesis is the problem.

## Branches

Work on `main`. Neste repositório `main` é ao mesmo tempo a branch de trabalho **e** a branch
protegida — não existe caminho de PR, e a frase padrão do template ("nada é escrito diretamente
na protegida") **não vale aqui**. O que substitui a revisão de PR é a ordem: gates verdes →
diff na tela → o usuário pede o commit.

## Notas deste projeto

- **Workflow main-only `[HARD]`.** Este repositório tem uma branch só. Não criar `feature/*`,
  `fix/*` nem `dev-test`; commit direto em `main` depois dos gates. Sem force-push, sem auto-merge.
  Não existe caminho de PR aqui — a revisão é humana, antes do commit.
- **O push é a metade que falha em silêncio.** O Vercel constrói a partir de `origin/main`, não do
  repositório local. Quando o push for pedido: `bun run ship` (predeploy → push → `deploy:verify`).
- Bun apenas: `bun install`, `bun run`, `bunx`. Nunca `npm`, `yarn`, `pnpm`.
- Detalhe completo em `.claude/rules/commit.md`.
