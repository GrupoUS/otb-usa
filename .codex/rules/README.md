---
paths:
  - ".claude/rules/README.md"
---

# The rules layer — OTB Estados Unidos — Grupo US


This directory is **this project's** rules layer. Generic process — how to plan, debug, verify,
delegate — comes from the Graph Powers plugin and is not repeated here.

## How a rule is loaded

A file with `paths:` in its frontmatter enters context on its own when a matching file is touched.
Without `paths:`, the rule only loads when someone names it.

That is what separates a useful rule from dead weight: a rule with no `paths:` that nobody cites is
never read, and a rule with `paths: **` enters every session, whatever it costs.

| Rule | `paths:` | Authority |
|---|---|---|
| `astro.md` | `src/**`, `astro.config.mjs`, `src/content.config.ts`, `.claude/**` | Invariantes Astro static-only, Content Collections SSOT, contratos do `Layout.astro` |
| `frontend.md` | `src/pages/**`, `src/components/**`, `src/layouts/**`, `src/styles/**`, `src/content/**` | Colocação de componente, hidratação, formulários, a11y |
| `DESIGN.md` | (sem `paths:` — carrega quando citada) | Do/don't universal de design; identidade fica na raiz `DESIGN.md` |
| `seo.md` | (sem `paths:` — carrega quando citada) | Locale, sitemap, OG/Twitter, JSON-LD, CWV |
| `stability.md` | `src/**`, `package.json`, `tsconfig.json` | Checklist A–L, invariantes de render-mode, gates de perf |
| `commit.md` | `src/**`, `.claude/**`, `public/**`, `scripts/**`, `astro.config.mjs`, `package.json`, `src/content/**` | Conventional Commits, gate manual, arquivos protegidos, deploy |
| `mcp.md` | `src/**`, `.claude/**`, `scripts/**` | Inventário MCP, disciplina de terminal, loop de debug |
| `commands.md` | `.claude/**` | Slash commands, ordem de skills, pareamento com agentes |
| `README.md` | (índice) | Mapa desta camada |

## Precedence

From most specific to most general — the first one that speaks on a subject wins:

1. `AGENTS.md` in the subdirectory being edited
2. `.claude/rules/*.md` loaded by `paths:`
3. `AGENTS.md` at the root — the project's identity and invariants
4. `CLAUDE.md` — behaviour
5. Graph Powers plugin skills — process

## What does NOT belong here

Generic process. If a rule in this directory describes how to plan, review, debug or delegate, it is
duplicating the plugin — and two copies diverge. A rule here answers a question only this project
asks.
