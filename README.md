# GP-US Harmonic Pascal

Base estática Astro + Tailwind v4 do ecossistema GP-US — Navy/Gold dark, pt-BR, deploy Railway.

## Sobre este template

Repositório canônico GP-US para sites estáticos institucionais. Stack fixa: Bun + Astro 6 (MPA estático, sem SSR) + Tailwind CSS v4 + React 19 (islands, mínimas).

Por design, o template é entregue **sem páginas, componentes ou conteúdo**. Clone, renomeie a identidade, defina o conteúdo em Content Collections e construa as páginas em cima da camada de configuração já validada.

A camada de IA (`.claude/`, `AGENTS.md`, agents, skills, commands, hooks, templates) é compartilhada entre todos os projetos GP-US e **não deve ser modificada por projeto** — preserve-a em qualquer fork.

## Stack

- **Astro 6** — MPA estático. Nunca SSR, nunca `prerender = false`, nunca `ClientRouter` (cardinal #4).
- **Bun** — gerenciador único. Jamais `npm`, `yarn`, `pnpm`.
- **Tailwind CSS v4** — tokens declarados em `src/styles/global.css` via `@theme`.
- **React 19** — apenas como islands (`client:idle`, `client:visible`); jamais hidratação eager por padrão.
- **Lucide React** — única biblioteca de ícones. **Emoji nunca** como ícone de UI (cardinal #3).
- **Tipografia** — Playfair Display (headings) + Inter (body), via `astro/config fontProviders.google()`.
- **Railway** — deploy estático com `predeploy` rodando lint + check + build.
- **pt-BR** — locale fixo em `<html lang>` e em `.claude/config.json::project.locale`.

## Quickstart

```bash
bun install
bun run dev      # http://localhost:4321
bun run check    # astro-check (TypeScript)
bun run lint     # biome + oxlint
bun run build    # astro build → dist/
```

Pré-commit: `bun run prepare` instala o `lefthook`. **Nunca** `--no-verify`.

## Iniciar um novo projeto a partir deste template

1. Clone este repositório e renomeie a pasta para o slug do novo projeto.
2. Edite `.claude/config.json`:
   - `project.name` → kebab-case do projeto (ex.: `gp-academy`).
   - `project.displayName` → nome humano (ex.: `GP Academy`).
   - `project.productionUrl` → URL canônica completa, sem barra final.
   - `overlay` → `.claude/overlay/<slug>` no nível raiz.
3. Edite `package.json::name` para o mesmo slug.
4. Atualize o título e a tagline deste `README.md` para o novo projeto.
5. Crie `.claude/overlay/<slug>/CLAUDE-overlay.md` com o stub padrão (use `.claude/overlay/gp-us-harmonic-pascal/CLAUDE-overlay.md` como modelo canônico).
6. Atualize `astro.config.mjs::site` para a nova URL.
7. **Atualize os assets de host** (apontam para a URL canônica e precisam mudar a cada projeto):
   - `public/robots.txt` → linha `Sitemap:` para `https://<nova-url>/sitemap-index.xml`.
   - `public/favicon.svg` → comentário identificador (`<!-- ... Stylized Monogram ... -->`); substitua por SVG do novo projeto se houver identidade visual própria.
   - `public/favicon.ico` + `public/favicon-96.png` → substitua por ícones do novo projeto se houver identidade visual própria.
   - `src/pages/index.astro` → `<title>` e qualquer copy placeholder.
   - `src/styles/global.css` → ajuste tokens `@theme` se a identidade visual mudar (vide seção *Tema e design*).
8. Verifique:
   ```bash
   bun install
   bun run check
   bun run lint
   bun run build
   ```

### Bloqueios (não editar sem autorização explícita do projeto)

- `.claude/CLAUDE.md`, `.claude/rules/`, `.claude/agents/`, `.claude/commands/`, `.claude/skills/`, `.claude/hooks/`, `.claude/templates/`
- `AGENTS.md`
- `tsconfig.json`, `biome.json`, `lefthook.yml`, `bun.lock`

`astro.config.mjs` e `src/lib/whatsapp.ts` ficam protegidos por padrão via `.claude/config.json::protectedFiles`. Toque apenas após autorizar a remoção temporária da entrada.

## Estrutura

```
src/
  pages/index.astro        # bare scaffold; substitua pelas páginas reais
  components/              # vazio; adicione componentes Astro/.tsx aqui
  content/                 # Content Collections (cardinal #5)
  content.config.ts        # defina schemas via zod
  layouts/                 # adicione Layout.astro quando o projeto crescer
  lib/                     # utilitários (whatsapp.ts, formatters, etc.)
  styles/global.css        # @import tailwindcss + @theme tokens
public/                    # favicons + assets estáticos
astro.config.mjs           # site, fonts, integrations, sitemap
.claude/                   # camada de IA — bloqueada
AGENTS.md                  # behavioral + orchestrador — bloqueado
```

## Tema e design

Identidade institucional GP-US: **Navy backgrounds + Gold accents**, dark-only, sem toggle de tema (alinhado a `AGENTS.md`).

- **Tokens** vivem em `src/styles/global.css` dentro de `@theme`. **Hex hardcoded fora desse bloco é proibido** (cardinal #7). Use tokens semânticos (`bg-background`, `text-foreground`, `border-border`) ou utilitários nomeados navy/gold.
- **Tipografia**: Playfair Display em headings, Inter em body. Sentence case nos títulos. UPPERCASE só em badges com `letter-spacing ≥ 0.04em`.
- **Animação**: apenas `transform` + `opacity`. FAQ via CSS grid `grid-template-rows: 0fr ↔ 1fr` ou `<details>` nativo. Jamais animar `width`, `height`, `top`, `left`, `padding`, `margin` (cardinal #8). `prefers-reduced-motion` honrado em toda animação.
- **Ícones**: Lucide React via named import. Decorativo: `aria-hidden="true"`. Botão icon-only: `aria-label` obrigatório.
- **Acessibilidade**: skip link como primeiro focável, `<main id="conteudo-principal">` com `tabindex="-1"`, focus ring `2px + 2px offset` em `:focus-visible`, `<noscript>` fallback para reveal-on-scroll.
- **Imagens**: `width` + `height` explícitos (CLS = 0). LCP: `loading="eager"` + `fetchpriority="high"`. Demais: `loading="lazy"` + `fetchpriority="low"`.

### Light/Dark portátil (projetos derivados)

Para projetos que precisem de toggle light/dark, copie de `.claude/skills/gpus-theme/`:

- `assets/theme-tokens.css` → `src/styles/theme-tokens.css` (importar antes do `global.css`)
- `assets/components.json` → raiz do projeto (configura shadcn/ui `new-york` + base `zinc` + `lucide`)
- `assets/tailwind-theme.ts` → caso o projeto use Tailwind v3

Toggle via `document.documentElement.classList.toggle("dark")`. View Transition API disponível na skill.

### Referências de design

| Tópico | Local |
|---|---|
| Do/Don't universais | `.claude/rules/DESIGN.md` |
| Palette + portable assets | `.claude/skills/gpus-theme/SKILL.md` |
| HSL completo (light + dark) | `.claude/skills/gpus-theme/references/css-variables.md` |
| shadcn/ui config | `.claude/skills/gpus-theme/references/shadcn-config.md` |

## Conteúdo (Content Collections)

Toda copy de produto, time, FAQ, depoimento e CTA vive em `src/content/<collection>/*.json`, validada por schema zod em `src/content.config.ts`. Componentes leem via `getCollection()` ou `getEntry()`.

**Nunca hardcode copy em `.astro` ou `.tsx`** (cardinal #5). Adicionar campo: atualize schema + arquivos JSON + componente leitor — os três se movem juntos.

Para voz da marca, jornada do aluno e produtos do ecossistema GP-US, consulte `.claude/skills/grupo-us/SKILL.md`.

## Configuração de IA

Cada projeto GP-US herda a mesma orquestração `.claude/`. Comandos disponíveis:

| Comando | Quando usar |
|---|---|
| `/plan [tarefa]` | Tarefas L3+, antes de código |
| `/prime [auto\|backend\|frontend\|fullstack]` | Início cross-domain ou escopo incerto |
| `/research [pergunta]` | Lacuna de conhecimento externo |
| `/design [tarefa]` | Nova página/componente UI |
| `/implement [plano]` | Executar plano aprovado |
| `/debug [audit\|frontend\|backend\|recover]` | Erros, crashes, regressões |
| `/perf [build\|db]` | Issue de performance |
| `/verify [quick\|paranoid]` | Gate pós-implementação |
| `/evolve [auto\|handoff]` | Captura de aprendizado / autoresearch |
| `/delegate` | Handoff para especialista |
| `/recover` | Recuperação após 2+ falhas |

Skills herdadas: `astro` (auto-trigger em arquivos Astro), `gpus-theme`, `grupo-us`, `senior-prompt-engineer`, `planning`, `evolution-core`, `ui-ux-pro-max`, `frontend-design`, `performance-optimization`, `skill-creator`.

Matriz completa em `AGENTS.md`. Cardinais e roteamento em `.claude/CLAUDE.md`.

## Quality gates

| Estágio | Comando | Threshold |
|---|---|---|
| Type | `bunx astro check` | zero erros |
| Lint | `bun run lint` | zero erros biome + oxlint |
| Build | `bun run build` | exit 0; `dist/` produzido |
| CWV (pós-deploy) | `bun run lighthouse:audit` | Perf/A11y/BP/SEO ≥ 95; LCP < 2.5s; CLS = 0; INP < 100ms |

`predeploy` encadeia lint + check + build automaticamente.

## Deploy

Railway, deploy estático. O script `predeploy` (`bun run lint && bunx astro check && bun run build`) é executado antes do publish. Domínio canônico em `astro.config.mjs::site` e em `.claude/config.json::project.productionUrl` — mantenha os dois alinhados.

## Documentação interna

| Tópico | Local |
|---|---|
| Regras cardinais (8) + roteamento | `.claude/CLAUDE.md` |
| Behavioral + orchestrador | `AGENTS.md` |
| Design canon (DOs/DON'Ts) | `.claude/rules/DESIGN.md` |
| Frontend, stability, SEO universais | `.claude/rules/{frontend,stability,seo}.md` |
| Skill Astro (overlay GP-US) | `.claude/skills/astro/references/gpus-overlay.md` |
| Tema Navy/Gold completo | `.claude/skills/gpus-theme/SKILL.md` |
| Voz da marca + jornada | `.claude/skills/grupo-us/SKILL.md` |
| Trilha de decisões | `docs/learnings-log.md` |

## Licença

<!-- TODO: definir licença do projeto -->
© Grupo US — uso interno.
