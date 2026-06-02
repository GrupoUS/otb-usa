---
globs: src/**, .claude/**, public/**, scripts/**, astro.config.mjs, package.json, src/content/**
---

# Commit Format + Pre-Commit Gate — GPUS Astro Landing

> Conventional Commits + lefthook pre-commit + manual gate checklist.

## Conventional Commits

Format: `<type>(<scope>): <subject>` — `feat | fix | docs | refactor | chore | test | perf | style | build | ci`.

Scopes: `site`, `theme`, `content`, `seo`, `astro`, `config`, `form`, `tracking`, `scripts`, `.claude`, `deps`, `a11y`, `perf`.

Examples:

- `feat(site): add landing hero section`
- `fix(content): align WhatsApp CTA copy in product JSON`
- `feat(form): wire registration form to lead endpoint`
- `docs(.claude): align governance with project scope`

One logical change per commit. Reference touched rule when useful.

## Automated gate

`lefthook.yml` runs `bun run lint` on staged source/config files.

## Manual gate checklist

Run in order before commit/PR:

1. `bun run lint`
2. `bunx astro check`
3. `bun run build`
4. Hex scan em UI files: nenhum `#[0-9a-fA-F]{3,8}` fora de `src/styles/global.css` (exceção: `<meta theme-color>`).
5. WhatsApp scan: nenhum `wa.me/` fora de `src/lib/whatsapp.ts`.
6. Content drift scan: nenhuma copy/FAQ/oferta hardcoded em `.astro`/`.tsx` (vive em `${content.productJson}`).
7. Production noise scan: nenhum `console.log` ou `debugger`.
8. Form/PII scan: campos com `<label>`, consent + link de privacidade presentes; sem PII logada.

Para mudanças de UI/perf também rodar `bun run lighthouse:audit` com preview/dev server local.

## Protected files

Per `.claude/config.json::protectedFiles.exact`:

- `astro.config.mjs`
- `src/lib/whatsapp.ts`
- `src/content.config.ts`
- `package.json`
- `tsconfig.json`
- `biome.json`
- `lefthook.yml`

Editar com razão explícita + validar. O hook `protect_files.py` bloqueia Write/Edit nesses arquivos (lê a lista de `config.json`).

## Env / secrets

- `PUBLIC_FORM_ENDPOINT`, `PUBLIC_GA4_ID`, `PUBLIC_FB_PIXEL_ID` vivem em env (Vercel / `.env` não commitado). Documentar em `.env.example` quando criados. Nunca commitar valores.

## Branch workflow — main-only

Single-branch repository. Sempre editar em `main`.

- **Sem feature branches**, sem `dev-test`, sem `feature/*`, sem `fix/*`.
- **Never force-push** (`--force` / `-f`).
- **Never auto-merge/auto-approve PRs.**
- Commits direto em `main` após o manual gate + lefthook.
- Push para `origin/main` e deploy Vercel só quando o usuário pedir.
