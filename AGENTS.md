# GPUS Astro Landing — AGENTS.md

> Guia comportamental e de orquestração para agentes em **landings Astro do Grupo US / Dra. Sacha Gualberto**. Camada genérica e portável: vale para qualquer projeto/produto GPUS construído nesta stack.
>
> **Valores de instância** (nome, domínio, slug, SDR, rotas, tracking) vivem em `.claude/config.json` e são lidos via placeholders `${...}` (ex.: `${project.displayName}`, `${content.productJson}`, `${lead.whatsappGreeting}`). Histórico desta instância: `docs/<project>-changelog.md`.
>
> Regras cardinais e matriz de roteamento vivem em `.claude/CLAUDE.md`; regras de domínio em `.claude/rules/`; skills em `.claude/skills/` (+ skills globais `grupo-us`, `gpus-theme`).

---

## Tier loading

| Tier | Files | Trigger |
|---|---|---|
| 1 | `AGENTS.md` + `.claude/CLAUDE.md` + `.claude/config.json` | início da sessão |
| 2 | `.claude/rules/{frontend,DESIGN,stability,seo,astro,commit,mcp,commands}.md` | matriz em `.claude/CLAUDE.md` + `globs:` |
| 3 | `.claude/skills/*/SKILL.md` + `references/` | skill auto-trigger |
| Subdir | `<path>/AGENTS.md` (ex.: `src/AGENTS.md`) | somente ao editar aquele subtree |

Subdirectory `AGENTS.md` sobrescreve ou complementa este arquivo quando existir.

---

## Core principles

- **Think → Research → Plan → Decompose → Implement → Validate.**
- **KISS / YAGNI.** Entregar só o necessário para o requisito atual.
- **Single source of truth.** Copy da landing em `${content.productJson}` (Content Collection); componentes consomem `.data`. Valores de instância em `.claude/config.json`.
- **Escopo do produto.** Não importar regras, rotas, produtos, CTAs ou copy de outros projetos GPUS. Modelo de design opcional = `${project.designModelRepo}` quando definido.
- **Implementar direto, code-first.** Referencie regras aplicadas quando relevante.
- **Nunca assumir que corrigiu.** Validar depois de alterações (`bun run lint && bunx astro check && bun run build`).
- **Conversão com integridade.** Landing premium; nada de promessa/credencial/data fabricada. Copy não confirmada = PROPOSTA.

## Design philosophy

- **Anti-genérico:** se parecer template, redesenhar. Ousar é o default.
- **Autoridade:** Dra. Sacha, saúde estética avançada, sofisticação com presença — criatividade e drama visual bem-vindos.
- **Ouro com intenção:** gold como hierarquia e impacto, sem teto fixo de cobertura.
- **Motion expressivo:** movimento, profundidade e animação incentivados. Qualquer propriedade pode ser animada (incl. layout); `transform`/`opacity` preferidos quando equivalentes, por performance. Único requisito: honrar `prefers-reduced-motion`.

> Canon visual completo: root `DESIGN.md`. Posicionamento/conversão: root `PRODUCT.md`.

---

## Execution behavior

### Commands (`.claude/commands/`)

| Command | When to invoke |
|---|---|
| `/plan [task]` | L3+ antes de codar |
| `/prime [auto\|frontend]` | início cross-domain ou escopo incerto |
| `/research [question]` | lacuna externa de docs/práticas |
| `/design [task]` | página, seção ou componente visual novo |
| `/implement [plan-path]` | executar plano aprovado |
| `/debug [audit\|frontend\|recover]` | erro, regressão ou build quebrado |
| `/perf [build]` | performance, bundle, Lighthouse |
| `/verify [quick\|spec-only\|paranoid]` | gate pós-implementação |
| `/evolve [auto\|handoff]` | captura de aprendizado |
| `/delegate` · `/recover` | delegação / recuperação após 2+ falhas |

L1–L2: editar direto, sem overhead.

### Agents

| Task signal | Agent |
|---|---|
| Astro / React islands / styling / form | `frontend-specialist` |
| Bugs, regressões, build/type errors | `debugger` |
| Performance, SEO, a11y, segurança, tracking | `performance-optimizer` |
| Pesquisa interna do codebase | `explorer` |
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
| Project (brand) | `grupo-us`, `gpus-theme` |
| Implementation | `ui-ux-pro-max`, `impeccable`, `performance-optimization`, `skill-creator` |

### Terminal

- Bun only: `bun install`, `bun run`, `bunx`. Nunca `npm`, `yarn`, `pnpm`.
- Sempre usar timeout; comandos não-interativos.
- Git read-only com `git --no-pager`; editor-risk com `GIT_EDITOR=true`.
- Vercel: CLI autenticado (`vercel whoami`). Deploy/alias = sempre perguntar.
- `rm -rf` em diretório pode ser bloqueado pelo `smart_bash_approver` hook — remover arquivos com `rm -f file...`.

### Branch workflow — main-only

- Sempre trabalhar em `main`. **Não criar feature branches.**
- Commit direto em `main` após gates passarem.
- Sem force-push, sem auto-merge. Push/deploy só quando o usuário pedir.

---

## Authority precedence

1. Subdirectory `AGENTS.md` quando existir
2. `.claude/rules/*.md`
3. `.claude/CLAUDE.md` + `.claude/config.json`
4. Root `AGENTS.md`
5. Tech-stack skill `astro`
6. Brand skills `grupo-us`, `gpus-theme`
7. `docs/` sob demanda

---

## Decision authority

| Action | Authority |
|---|---|
| L1–L2, lint/type/style fixes | Autônomo |
| File deletion, new dependency, schema-shape change | Confirmar primeiro |
| Destino de lead/form, IDs de tracking, env vars | Confirmar primeiro |
| Produção (`astro.config.mjs`, `vercel.json`), deploy, destructive ops, force push | Sempre perguntar |

---

## Where rules live

| Need | Location |
|---|---|
| Cardinal rules + routing + stopping conditions | `.claude/CLAUDE.md` |
| Valores de instância (nome, domínio, slug, SDR, rotas, tracking) | `.claude/config.json` |
| Frontend/design/stability/SEO | `.claude/rules/{frontend,DESIGN,stability,seo}.md` |
| Astro static-only + Content Collections + layout contracts | `.claude/rules/astro.md` + `Skill('astro')` |
| Sistema de design visual (Navy/Gold, componentes, motion) | root `DESIGN.md` + `Skill('gpus-theme')` |
| Posicionamento / conversão / CRO / guardrails | root `PRODUCT.md` |
| Copy, público, CTA, funil, voz Dra. Sacha | `Skill('grupo-us')` |
| Tooling, gates, protected files | `.claude/config.json` |
| Commit / pre-commit | `.claude/rules/commit.md` |
| MCP / terminal / debug loop | `.claude/rules/mcp.md` |
| Histórico da instância | `docs/<project>-changelog.md` |

---

## Recent learnings

> Aprendizados específicos da instância vivem em `docs/<project>-changelog.md` (ex.: `docs/aula-trintae3-changelog.md`), não nesta governança portável. Capturar via `/evolve`.
