---
globs: src/**, .claude/**, public/**, scripts/**, astro.config.mjs, package.json, src/content/**
---

# Commit Format + Pre-Commit Gate — OTB USA

> Conventional Commits + lefthook pre-commit + manual gate checklist.

## Conventional Commits

Format: `<type>(<scope>): <subject>` — `feat | fix | docs | refactor | chore | test | perf | style | build | ci`.

Scopes: `site`, `theme`, `content`, `seo`, `astro`, `config`, `scripts`, `.claude`, `deps`, `a11y`, `perf`.

Examples:

- `feat(site): add OTB USA hero section`
- `fix(content): align OTB WhatsApp CTA copy`
- `docs(.claude): align agents with OTB USA scope`
- `refactor(theme): simplify OTB gold token utilities`

One logical change per commit. Reference touched rule when useful.

## Automated gate

`lefthook.yml` runs `bun run lint` on staged source/config files.

## Manual gate checklist

Run in order before commit/PR:

1. `bun run lint`
2. `bunx astro check`
3. `bun run build`
4. Hex scan in UI files: no `#[0-9a-fA-F]{3,8}` outside `src/styles/global.css`.
5. WhatsApp scan: no `wa.me/` outside `src/lib/whatsapp.ts`.
6. Content drift scan: no OTB product/FAQ/pricing copy hardcoded in `.astro` / `.tsx`.
7. Production noise scan: no `console.log` or `debugger`.

For UI/perf changes also run `bun run lighthouse:audit` with a local preview/dev server.

## Protected files

Per `.claude/config.json::protectedFiles.exact`:

- `astro.config.mjs`
- `src/lib/whatsapp.ts`
- `src/content.config.ts`
- `package.json`
- `tsconfig.json`
- `biome.json`
- `lefthook.yml`

Edit with explicit reason and validate after.

## Branch workflow — main-only

Single-branch repository. Always edit on `main`.

- **Always work on `main`.** No feature branches, no `dev-test`, no `feature/*`, no `fix/*`.
- **Never create new branches** unless the user explicitly requests one for an isolated experiment.
- **Never force-push** (`--force` / `-f`) — destructive on shared history.
- **Never auto-merge or auto-approve PRs.**
- Commits go directly to `main` after the manual gate checklist + automated `lefthook` pre-commit gate.
- Push to `origin/main` after commit.
