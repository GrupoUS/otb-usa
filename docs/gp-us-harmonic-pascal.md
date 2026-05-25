# Plan: GP-US Harmonic Pascal — Base Template Initialization

**Complexity:** L4 — multi-file strip + identity rename + protected-file overrides; mechanically simple but cross-cutting.
**Layers (execution order):** identity layer → scaffold strip → astro config purge → quality gates → final scaffold audit.
**Slug / display / URL:** `gp-us-harmonic-pascal` · `GP-US Harmonic Pascal` · `https://harmonic-pascal.grupous.com.br`.

---

## Context

Repo `gpus-site-padrao` ships the full Grupo US site (10 pages, 40+ components, 7 product collections, 13 team entries, brand-laden `Layout.astro`, hardcoded redirects in `astro.config.mjs`, `src/lib/whatsapp.ts` SSOT, navy/gold tokens). Bootstrap prompt requires an empty runnable scaffold with new identity (`gp-us-harmonic-pascal`). User opted to **strip to empty scaffold** and override the protected-file lock, since `astro.config.mjs` (locked) hardcodes redirects to legacy slugs that disappear with the strip.

**Outcome:** clean Astro 6 + Tailwind v4 + React 19 scaffold, runnable via `bun install && bun run check && bun run lint && bun run build`, with new identity wired into config, package, README, and overlay file, ready to receive future project-specific UI.

**Constraint exceptions explicitly authorized by user (recorded for audit):**
- Touch `astro.config.mjs` (drop redirects + sitemap filter/serialize; keep site URL, fonts, integrations).
- Delete `src/lib/whatsapp.ts` (protected file; brand SSOT no longer applicable).
- Touch `src/content.config.ts` (clear collection schemas to avoid validating against zero product/team entries).
- "No reference to `grupous.com.br`" rule: new production URL is `https://harmonic-pascal.grupous.com.br` (subdomain of grupous.com.br); host string is preserved as part of the new identity, not as legacy reference.

---

## Phase 1 — Identity layer  [PARALLEL]

- [ ] `.claude/config.json` — `project.name` → `gp-us-harmonic-pascal`; `project.displayName` → `GP-US Harmonic Pascal`; `project.productionUrl` → `https://harmonic-pascal.grupous.com.br`; add `"overlay": ".claude/overlay/gp-us-harmonic-pascal"` at root level.
- [ ] `package.json` — `name` → `gp-us-harmonic-pascal` (currently `"gpus"`). Leave `version`, `engines`, `scripts`, `dependencies`, `devDependencies` untouched.
- [ ] `README.md` — full rewrite as **generic GP-US base-template usage guide**. See **README content spec** below — must follow `.claude/rules/DESIGN.md` (sentence-case headings, no emoji icons, two-tier type voice) and reference `.claude/skills/gpus-theme/SKILL.md` (Navy/Gold tokens, dark-only institutional identity, portable light/dark for downstream). pt-BR primary language matches `.claude/config.json::project.locale`.
- [ ] Create `.claude/overlay/gp-us-harmonic-pascal/CLAUDE-overlay.md` with the exact stub from the prompt (display name + repo + URL + `astro-static-tailwindv4` + `pt-BR` + four empty H2 sections).

**Verify:** `bun run check` passes; `cat .claude/config.json | grep gp-us-harmonic-pascal` returns 4 hits (name, displayName, productionUrl in URL, overlay).

### README content spec (Phase 1 deliverable)

File: `README.md`. pt-BR. Sentence-case headings. No emoji icons. Sections in order:

1. **`# GP-US Harmonic Pascal`** — H1 title.
2. **Tagline (≤ 90 chars)** — one line under H1: "Base estática Astro + Tailwind v4 do ecossistema GP-US — Navy/Gold dark, pt-BR, deploy Railway."
3. **`## Sobre este template`** — 2–3 sentences explaining: (a) the repo is the canonical GP-US Astro static base (Bun + Astro 6 + Tailwind v4 + React 19 islands); (b) it ships zero pages/components by design — clone, rename identity, build the project on top; (c) full AI configuration layer (`.claude/`, `AGENTS.md`, agents, skills, commands) is preserved across all GP-US projects.
4. **`## Stack`** — bullet list: Astro 6 (static MPA, no SSR), Bun, Tailwind v4 (`@theme` tokens), React 19 (islands), Lucide React, Playfair Display + Inter, Railway, pt-BR. Note **Bun only** (never npm/yarn/pnpm) — cardinal rule.
5. **`## Quickstart`** — bash block with the four canonical commands:
   ```bash
   bun install
   bun run dev      # http://localhost:4321
   bun run check    # astro-check (TypeScript)
   bun run lint     # biome + oxlint
   bun run build    # astro build → dist/
   ```
6. **`## Iniciar um novo projeto a partir deste template`** — step-by-step (the prompt the user just executed), including:
   - Clone repo, rename folder.
   - Replace identity in `.claude/config.json` (`name`, `displayName`, `productionUrl`, `overlay`).
   - Replace `name` in `package.json`.
   - Update title + description in `README.md`.
   - Create `.claude/overlay/<slug>/CLAUDE-overlay.md` with stub (link to current project's overlay as canonical example).
   - Run `bun install && bun run check && bun run lint && bun run build` to verify.
   - **Hard constraints:** never edit `.claude/CLAUDE.md`, `.claude/rules/`, `.claude/agents/`, `.claude/commands/`, `.claude/skills/`, `.claude/hooks/`, `.claude/templates/`, `AGENTS.md`, `tsconfig.json`, `biome.json`, `lefthook.yml`, `bun.lock`. `astro.config.mjs` and `src/lib/whatsapp.ts` are protected by default; touch only with explicit project authorization.
7. **`## Estrutura`** — tree block reflecting empty scaffold:
   ```
   src/
     pages/index.astro        # bare scaffold; replace with project pages
     components/              # empty; add Astro/.tsx components here
     content/                 # add Content Collections (cardinal rule #5)
       ../content.config.ts   # define collection schemas via zod
     layouts/                 # add a Layout.astro when project takes shape
     lib/                     # utilities (whatsapp.ts, etc.)
     styles/global.css        # @import tailwindcss + @theme tokens
   public/                    # favicons + project assets (no UI binaries here)
   astro.config.mjs           # site URL, fonts, integrations
   .claude/                   # AI behavioral config — locked
   AGENTS.md                  # behavioral + orchestrator — locked
   ```
8. **`## Tema e design`** — short canon block, Navy/Gold institutional identity:
   - Tokens em `src/styles/global.css` `@theme` (HSL semantic + named navy/gold) — single source. **Never hardcode hex outside `@theme`** (cardinal rule #7).
   - Identidade institucional: **Navy backgrounds + Gold accents**, dark-only, sem toggle de tema. Para projetos derivados que precisem de light/dark, copiar `assets/theme-tokens.css` + `assets/components.json` da skill `gpus-theme` (`shadcn/ui new-york + zinc base + lucide`).
   - Tipografia: Playfair Display (headings) + Inter (body), pré-carregadas via `astro/config fontProviders.google()`.
   - Animação: apenas `transform` + `opacity`; FAQ via CSS grid `0fr↔1fr` ou `<details>` nativo (cardinal rule #8). `prefers-reduced-motion` honrado.
   - Iconografia: Lucide React SVG apenas — **emoji nunca** (cardinal rule #3).
   - Referências: `.claude/rules/DESIGN.md` (do/don't universais), `.claude/skills/gpus-theme/SKILL.md` (palette + portable assets), `.claude/skills/gpus-theme/references/css-variables.md` (HSL completo).
9. **`## Conteúdo (Content Collections)`** — explain that copy/products/team must live in `src/content/<collection>/*.json` with zod schema in `src/content.config.ts`; components read via `getCollection()`. Never hardcode landing copy in `.astro` / `.tsx` (cardinal rule #5). Link to `.claude/skills/grupo-us` for ecosystem voice.
10. **`## Configuração de IA`** — short note: every GP-US project ships the same `.claude/` orchestration layer. List the 11 commands (`/plan`, `/prime`, `/research`, `/design`, `/implement`, `/debug`, `/perf`, `/verify`, `/evolve`, `/delegate`, `/recover`) with one-line each, point to `AGENTS.md` for the full matrix. Skills inherited: `astro`, `gpus-theme`, `grupo-us`, `senior-prompt-engineer`, `planning`, `evolution-core`, `ui-ux-pro-max`, `frontend-design`, `performance-optimization`, `skill-creator`.
11. **`## Quality gates`** — table of what runs before commit/deploy:
    | Stage | Command | Threshold |
    |---|---|---|
    | Type | `bunx astro check` | zero errors |
    | Lint | `bun run lint` | zero biome + oxlint errors |
    | Build | `bun run build` | exits 0; `dist/` produced |
    | CWV (post-deploy) | `bun run lighthouse:audit` | Perf/A11y/BP/SEO ≥ 95; LCP < 2.5s; CLS = 0; INP < 100ms |

    Pre-commit hook gerenciado por `lefthook.yml` (`bun run prepare` instala). **Nunca** `--no-verify`.
12. **`## Deploy`** — one paragraph: Railway via `predeploy` script (`bun run lint && bunx astro check && bun run build`). Config em `.claude/config.json::tooling.deployer = railway`. Domínio canônico definido em `astro.config.mjs::site` + `.claude/config.json::project.productionUrl`.
13. **`## Documentação interna`** — pointer table:
    | Tópico | Local |
    |---|---|
    | Regras cardinais (8) + roteamento | `.claude/CLAUDE.md` |
    | Behavioral + orchestrador | `AGENTS.md` |
    | Design canon (DOs/DON'Ts) | `.claude/rules/DESIGN.md` |
    | Frontend, stability, SEO universais | `.claude/rules/{frontend,stability,seo}.md` |
    | Skill Astro (overlay GP-US) | `.claude/skills/astro/references/gpus-overlay.md` |
    | Tema Navy/Gold completo | `.claude/skills/gpus-theme/SKILL.md` |
    | Voz da marca + jornada do aluno | `.claude/skills/grupo-us/SKILL.md` |
    | Trilha de decisões | `docs/learnings-log.md` |
14. **`## Licença`** — one line ("© Grupo US — uso interno." or whatever the user later decides). Mark TBD with `<!-- TODO: definir licença -->` for now if unset.

Voice: pt-BR, frase declarativa, sem floreio, sem hedging — alinhado com `.claude/skills/grupo-us` ("Cultura Activa: clareza > floreio"). Limit final README ≤ 220 lines.

---

## Phase 2 — Scaffold strip  [PARALLEL]

### 2a. Pages
- [ ] Delete `src/pages/{contato,curso-auriculo,mentoria-black-neon,otb,politica-de-privacidade,sobre,termos,404}.astro`.
- [ ] Rewrite `src/pages/index.astro` to bare scaffold:
  ```astro
  ---
  import "../styles/global.css";
  ---
  <!doctype html>
  <html lang="pt-BR">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>GP-US Harmonic Pascal</title>
    </head>
    <body></body>
  </html>
  ```

### 2b. Components + layouts
- [ ] Recursively delete `src/components/{about,home,landing,layout,shared,ui}/` (40+ files).
- [ ] Delete `src/layouts/Layout.astro` (Grupo US Organization JSON-LD, WhatsApp float, Header/Footer imports).

### 2c. Content collections
- [ ] Delete `src/content/products/*.json` (7 files) and `src/content/team/*.json` (13 files).
- [ ] Replace `src/content.config.ts` with empty collections export so `bun run check` doesn't attempt schema validation on missing entries:
  ```ts
  import { defineCollection } from "astro:content";
  export const collections = {} as Record<string, ReturnType<typeof defineCollection>>;
  ```

### 2d. Lib
- [ ] Delete `src/lib/whatsapp.ts` (protected — explicit override), `src/lib/productsNav.ts`, `src/lib/utils.ts`. Leave `src/lib/` directory empty (Astro doesn't require it).

### 2e. Styles
- [ ] Edit `src/styles/global.css` — keep `@import "tailwindcss";`, keep `@theme` token block (template default per Step 4 of prompt), but rename comment `/* ===== Grupo US — Design System ===== */` → `/* ===== Design System ===== */`; drop the WhatsApp brand colors (`--color-whatsapp`, `--color-whatsapp-hover`); drop any utilities that depend on removed lib (re-grep before deleting any utility blocks).

### 2f. Public assets
- [ ] Delete `public/images/**` (40+ brand images), `public/og-image.png`, `public/logo-grupo-us.png`, `public/og/.gitkeep`.
- [ ] Keep `public/favicon-96.png`, `public/favicon.ico`, `public/favicon.svg`, `public/robots.txt`. (Decide in pass: scrub robots.txt if it hardcodes `grupous.com.br`.)

**Verify after 2a-2f:** `find src/pages -name "*.astro"` → only `index.astro`; `find src/components -type f` → empty; `find src/content/products src/content/team -type f` → empty; `find public/images -type f` → empty; `bun run check` passes.

---

## Phase 3 — Astro config purge  [SEQUENTIAL after Phase 2]

- [ ] Edit `astro.config.mjs` (protected — explicit override):
  - Update `site` → `https://harmonic-pascal.grupous.com.br`.
  - Delete `redirectTargets` const + `redirects:` field.
  - Delete `sitemap({ filter, serialize })` body; replace with bare `sitemap()`.
  - Keep `react()`, `tailwindcss()` plugin, `fonts: [Playfair Display, Inter]` block (template default per current state).
- [ ] `scripts/check-external-urls.mjs` and `scripts/smoke-test.mjs` reference deleted product slugs. Two options, choose at execution time:
  - (a) Delete both files; leave the `package.json` script entries (`check:external-urls`, `smoke-test`) untouched per constraint — they error only when explicitly invoked, not on boot gates.
  - (b) Rewrite each to no-op (early `process.exit(0)`).
  Recommendation: (a) — fewer lines touched, scripts will be re-authored when project takes shape.
- [ ] `scripts/lighthouse-audit.mjs` — leave (generic Lighthouse runner, no slug references — verify with grep).

**Verify:** `bunx astro check` passes; `bun run build` produces `dist/` with `dist/index.html` + `dist/sitemap-index.xml`.

---

## Phase 4 — Quality gates  [SEQUENTIAL]

Run in order, each must exit 0:
- [ ] `bun install` — refresh lockfile against current dependency set.
- [ ] `bun run check` — astro-check, zero TS errors.
- [ ] `bun run lint` — biome + oxlint, zero lint errors. (Biome may flag the empty collections export; if so, add minimal type assertion as shown in 2c.)
- [ ] `bun run build` — produces `dist/`.

**On failure:** diagnose root cause without adding pages or components; common likely failures:
- Layout import lingering in `index.astro` rewrite (search `Layout.astro` references).
- Token utility (e.g. `gold-glow`) referenced in CSS but utility itself preserved (no error) vs deleted (error). Keep utilities or audit references.
- Sitemap plugin failing on zero pages (Astro typically tolerates 1 page; verify).

---

## Phase 5 — Final scaffold audit  [SEQUENTIAL]

Verify every checkbox in the prompt's Step 4:
- [ ] `src/pages/` contains only `index.astro`.
- [ ] `src/components/` empty (or only structural placeholder dirs — confirm zero `.astro` / `.tsx`).
- [ ] `src/content/` schema only (`content.config.ts`); zero entries under `products/` / `team/`.
- [ ] `src/styles/global.css` Tailwind import + `@theme` tokens + no WhatsApp/brand-removed utilities.
- [ ] `public/` only favicons + `robots.txt`.
- [ ] `.claude/config.json` `overlay` = `.claude/overlay/gp-us-harmonic-pascal`.
- [ ] `.claude/overlay/gp-us-harmonic-pascal/CLAUDE-overlay.md` exists with exact stub content.
- [ ] `grep -rn "gpus-site\|grupous.com.br\|Grupo US\|drasacha\|mentoria-black-neon\|comunidade-us\|trintae3\|na-mesa-certa\|neon-dash\|otb\|curso-auriculo" src public scripts/lighthouse-audit.mjs astro.config.mjs package.json README.md` → returns only legitimate `harmonic-pascal.grupous.com.br` host references in `astro.config.mjs` site + `.claude/config.json` productionUrl.

---

## Critical files (paths)

| File | Action |
|---|---|
| `.claude/config.json` | edit — name, displayName, productionUrl, overlay |
| `package.json` | edit — name only |
| `README.md` | full rewrite — base-template usage guide (see Phase 1 spec) |
| `.claude/overlay/gp-us-harmonic-pascal/CLAUDE-overlay.md` | create |
| `astro.config.mjs` | edit (protected — overridden) — drop redirects + sitemap filter, update site URL |
| `src/content.config.ts` | edit (protected — overridden) — empty collections |
| `src/pages/index.astro` | rewrite — bare scaffold |
| `src/pages/{contato,curso-auriculo,mentoria-black-neon,otb,politica-de-privacidade,sobre,termos,404}.astro` | delete |
| `src/components/**` | delete |
| `src/layouts/Layout.astro` | delete |
| `src/content/{products,team}/*.json` | delete |
| `src/lib/{whatsapp.ts,productsNav.ts,utils.ts}` | delete |
| `src/styles/global.css` | edit — strip WhatsApp tokens + Grupo US comment label |
| `public/images/**`, `public/og-image.png`, `public/logo-grupo-us.png`, `public/og/.gitkeep` | delete |
| `scripts/{check-external-urls,smoke-test}.mjs` | delete |

---

## Out of scope

- `evals/`, `docs/learnings-log.md`, other `docs/` content — audit-trail / governance, not user-facing scaffolding. May contain Grupo US references; constraint scope is `src/`, `public/`, `scripts/`, root config files.
- `.claude/CLAUDE.md`, `.claude/rules/`, `.claude/agents/`, `.claude/commands/`, `.claude/skills/`, `.claude/hooks/`, `.claude/templates/`, `AGENTS.md`, `biome.json`, `lefthook.yml`, `tsconfig.json`, `bun.lock` — locked per prompt hard constraints.

---

## Risks

- **Lockfile drift.** `bun install` may produce different lock vs committed. Constraint forbids touching `bun.lock`. If install regenerates it, ask user before committing.
- **Sitemap on near-empty site.** `@astrojs/sitemap` with one page may emit warnings; benign but verify build output.
- **Tailwind `@theme` token references.** Removing WhatsApp colors fine if no `bg-whatsapp` / `text-whatsapp` left in code. Grep before delete: `grep -rn "whatsapp" src/styles src/pages` post-strip.
- **Tier-1 doc drift.** `.claude/CLAUDE.md` and `AGENTS.md` still reference Grupo US identity ("Project identity: Grupo US"). Locked by prompt — drift accepted; overlay file in step 1 is the new SSOT.
- **Build with empty Layout.** Bare `index.astro` inlining `<html>` works but bypasses any future a11y plumbing. Scaffold-only acceptable; future feature work re-introduces a `Layout.astro`.

---

## Verification (end-to-end)

```bash
bun install
bun run check
bun run lint
bun run build
ls -la dist/                      # expect index.html + assets + sitemap-index.xml
grep -rn "Grupo US\|grupous.com.br\|drasacha" src public 2>/dev/null
# expect: empty (no leftover brand references in user-facing scaffold)
cat .claude/overlay/gp-us-harmonic-pascal/CLAUDE-overlay.md   # exists, exact stub
```

Manual sanity: `bun run dev` → open `http://localhost:4321` → empty white page, no console errors.

---

Next: run `/implement docs/gp-us-harmonic-pascal.md` after approval, or request adjustments to any phase above.
