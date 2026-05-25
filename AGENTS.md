# OTB USA — AGENTS.md

> Guia comportamental e de orquestração para agentes no projeto **OTB USA — Grupo US**. As regras cardinais e a matriz de roteamento vivem em `.claude/CLAUDE.md`; regras de domínio em `.claude/rules/`; skills em `.claude/skills/`.

---

## Tier loading

| Tier | Files | Trigger |
|---|---|---|
| 1 | `AGENTS.md` + `.claude/CLAUDE.md` | início da sessão |
| 2 | `.claude/rules/{frontend,DESIGN,stability,seo,astro,commit,mcp,commands}.md` | matriz em `.claude/CLAUDE.md` + `globs:` |
| 3 | `.claude/skills/*/SKILL.md` + `references/` | skill auto-trigger |
| Subdir | `<path>/AGENTS.md` | somente ao editar aquele subtree |

Subdirectory `AGENTS.md` sobrescreve ou complementa este arquivo quando existir.

---

## Core principles

- **Think → Research → Plan → Decompose → Implement → Validate.**
- **KISS / YAGNI.** Entregar só o necessário para o requisito atual.
- **Single source of truth.** Copy do produto fica em `src/content/products/otb.json`; componentes consomem Content Collections.
- **OTB-only context.** Não importar regras, rotas, produtos, CTAs ou memória de outros projetos. `Grupo US` é marca-mãe, não substituto do escopo OTB USA.
- **Implementar direto, code-first.** Referencie regras aplicadas quando relevante.
- **Nunca assumir que corrigiu.** Validar depois de alterações.
- **Minimalismo intencional.** Layout premium, autoral, sem cara de template.

## Design philosophy

- **Anti-genérico:** se parecer template, redesenhar.
- **Autoridade internacional:** Boston/EUA, business, saúde estética avançada, sofisticação sem excesso.
- **Ouro raro:** usar o gold como decisão e hierarquia, não decoração.
- **Motion contido:** `transform` + `opacity`; nunca animar propriedades de layout.

---

## Execution behavior

### Commands (`.claude/commands/`)

| Command | When to invoke |
|---|---|
| `/plan [task]` | L3+ antes de codar |
| `/prime [auto\|frontend]` | início de tarefa cross-domain ou escopo incerto |
| `/research [question]` | lacuna externa de docs/práticas |
| `/design [task]` | página, seção ou componente visual novo |
| `/implement [plan-path]` | executar plano aprovado |
| `/debug [audit\|frontend\|recover]` | erro, regressão ou build quebrado |
| `/perf [build]` | performance, bundle, Lighthouse |
| `/verify [quick\|spec-only\|paranoid]` | gate pós-implementação |
| `/evolve [auto\|handoff]` | captura de aprendizado/autoresearch |
| `/delegate` | delegação explícita |
| `/recover` | recuperação após 2+ tentativas falhas |

L1–L2: editar direto, sem overhead.

### Agents

| Task signal | Agent |
|---|---|
| Astro / React islands / styling | `frontend-specialist` |
| Bugs, regressões, build/type errors | `debugger` |
| Performance, SEO, a11y, segurança | `performance-optimizer` |
| Pesquisa interna do codebase | `explorer-agent` |
| Docs externas / libs | `librarian` |
| Planejamento / PRD | `project-planner` |
| Revisão de código | `code-reviewer` |
| Verificação final | `verification-agent` |

Max 5 agents por pedido; checkpoint com usuário se exceder.

### Skills

| Phase | Skills |
|---|---|
| Process | `senior-prompt-engineer`, `planning`, `evolution-core`, `debugger` |
| Tech-stack | `astro` |
| Project | `otb-usa`, `otb-theme` |
| Implementation | `ui-ux-pro-max`, `performance-optimization`, `skill-creator` |

### Terminal

- POSIX + paths com `/`, mesmo no Windows.
- Sempre usar timeout.
- **Bun only:** `bun install`, `bun run`, `bunx`.
- Nunca `npm`, `yarn` ou `pnpm`.
- Git read-only com `git --no-pager`; comandos que podem abrir editor com `GIT_EDITOR=true`.

### Branch workflow — main-only

- Sempre trabalhar em `main`. **Não criar feature branches.**
- Commit direto em `main` após gates passarem (`bun run lint && bunx astro check && bun run build`).
- Sem force-push, sem auto-merge de PR.
- Detalhe em `.claude/rules/commit.md § Branch workflow`.

---

## Authority precedence

1. Subdirectory `AGENTS.md` quando existir
2. `.claude/rules/*.md`
3. `.claude/CLAUDE.md`
4. Root `AGENTS.md`
5. Tech-stack skill `astro`
6. Project skills `otb-usa`, `otb-theme`
7. `docs/` sob demanda

---

## Decision authority

| Action | Authority |
|---|---|
| L1–L2, lint/type/style fixes | Autônomo |
| File deletion, new dependency, schema-shape change | Confirmar primeiro |
| Produção, deploy, destructive ops, force push | Sempre perguntar |

---

## Where rules live

| Need | Location |
|---|---|
| Cardinal rules + routing + stopping conditions | `.claude/CLAUDE.md` |
| Frontend/design/stability/SEO | `.claude/rules/{frontend,DESIGN,stability,seo}.md` |
| Astro static-only + Content Collections + layout contracts | `.claude/rules/astro.md` + `Skill('astro')` → `references/otb-usa-overlay.md` |
| OTB USA copy, produto, público, CTA, legal Harvard | `Skill('otb-usa')` |
| OTB Navy/Gold tokens e design canon | `Skill('otb-theme')` |
| Tooling, gates, protected files | `.claude/config.json` |
| Commit / pre-commit | `.claude/rules/commit.md` |
| MCP / terminal / debug loop | `.claude/rules/mcp.md` |

---

## Recent learnings

- **2026-05-25** — Repositório reconfigurado como OTB USA-only; referências herdadas de site institucional/produtos paralelos removidas dos guias canônicos.
- **2026-05-25** — Briefing oficial da **3ª Edição OTB EUA** (Boston, 19–21 abr 2027) absorvido em `Skill('otb-usa')` → `references/edicao-3-boston.md` + `manual-resumo.md`. Schema `src/content.config.ts` ganhou campos opcionais `edicao`, `lotes`, `agenda`, `parceiros`. Phase 2 do plano (`docs/analise-o-https-docs-google-com-document-vast-pancake.md`) bloqueada por gate stakeholder: Lote 1 ativo, ASA, wording Anatomy Review, escopo taxa 5%, contatos parceiros, datas online, copy "íntima". Lote 0 (US$ 3.000) venceu em 30 abr 2026.
