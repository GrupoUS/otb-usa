# OTB USA — Grupo US

> Landing estática do **OTB Estados Unidos**, MBA em Business Aesthetic Health do Grupo US, com imersão internacional em Boston/EUA.
>
> **URL canônica:** [`https://otb.gpus.com.br`](https://otb.gpus.com.br)

Brief de produto → [`PRODUCT.md`](PRODUCT.md) · Design system → [`DESIGN.md`](DESIGN.md) · Regras para agentes → [`AGENTS.md`](AGENTS.md)

---

## Stack

- **Astro 6** — renderização estática e ilhas React pontuais.
- **Tailwind CSS v4** — via plugin Vite (`@tailwindcss/vite`), tokens em `src/styles/global.css` com `@theme {}`.
- **React 19 + motion + lucide-react** — interatividade mínima e ícones SVG.
- **Bun** — runtime, package manager e executor. Não usar `npm`, `yarn` ou `pnpm`.
- **Biome + oxlint** — lint/format.
- **Lefthook** — hook de pre-commit.
- **Deploy** — static hosting com build `bun run build` → `dist/`.

---

## Comandos

| Tarefa | Comando |
|---|---|
| Instalar dependências | `bun install` |
| Dev server | `bun run dev` |
| Type-check Astro | `bunx astro check` |
| Lint | `bun run lint` |
| Lint + auto-fix | `bun run lint:fix` |
| Build de produção | `bun run build` |
| Preview do build | `bun run preview` |
| Lighthouse local | `bun run lighthouse:audit` |
| Gate pré-deploy | `bun run predeploy` |

---

## Estrutura

```text
otb-usa/
├── src/
│   ├── pages/
│   │   └── index.astro        # landing OTB USA (rota única)
│   ├── components/
│   │   ├── landing/           # seções da landing
│   │   └── icons/             # wrapper Lucide
│   ├── content/
│   │   └── products/otb.json  # copy e dados do produto
│   ├── content.config.ts      # schema Zod da collection products
│   ├── layouts/Layout.astro   # head, SEO, JSON-LD, reveal, main landmark
│   ├── lib/whatsapp.ts        # SSOT de WhatsApp
│   └── styles/global.css      # @theme + utilities
├── public/                    # favicon, imagens, OG
├── scripts/lighthouse-audit.mjs
├── .claude/                   # agentes, comandos, regras e skills
├── AGENTS.md
├── PRODUCT.md
├── DESIGN.md
├── astro.config.mjs
├── biome.json
├── lefthook.yml
├── package.json
└── tsconfig.json
```

---

## Páginas

| Rota | Arquivo | Descrição |
|---|---|---|
| `/` | `src/pages/index.astro` | landing OTB USA (rota única) |
| `/otb` | — | redirect 301 → `/` (`astro.config.mjs`), excluído do sitemap |

A copy de produto não deve ser hardcoded nos componentes. Edite `src/content/products/otb.json` e mantenha o schema em `src/content.config.ts` sincronizado quando necessário.

---

## Content Collections

A collection `products` usa JSON com schema Zod em `src/content.config.ts`.

Fonte principal:

- `src/content/products/otb.json` — SEO, hero, público, programa, módulos, Boston/Harvard, especialistas, investimento, FAQ e disclaimer legal.

Componentes recebem dados já tipados a partir de `getEntry("products", "otb")`.

---

## Guardrails OTB USA

- OTB USA é o escopo do repo; Grupo US é marca-mãe.
- Não importar rotas, copy, CTAs ou regras de outros produtos.
- Harvard deve aparecer apenas como contexto geográfico/institucional do ecossistema acadêmico; sem vínculo, patrocínio, endosso ou certificação oficial.
- WhatsApp passa por `src/lib/whatsapp.ts`.
- Tokens visuais vivem em `src/styles/global.css`.
- Site é Astro static-only; sem SPA, sem SSR adapter.

---

## Para agentes

| Tier | Onde |
|---|---|
| Tier 1 | `AGENTS.md` + `.claude/CLAUDE.md` |
| Tier 2 | `.claude/rules/{DESIGN,frontend,stability,seo,astro,commit,mcp,commands}.md` |
| Tier 3 | `.claude/skills/{astro,otb-usa,otb-theme,...}` |

Skills principais: `astro`, `otb-usa`, `otb-theme`, `planning`, `senior-prompt-engineer`.

Comandos: `/plan`, `/design`, `/research`, `/implement`, `/verify`, `/debug`, `/perf`, `/evolve`, `/delegate`, `/recover`, `/prime`.
