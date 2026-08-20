---
paths:
  - "src/**"
  - ".claude/**"
  - "public/**"
  - "scripts/**"
  - "astro.config.mjs"
  - "package.json"
  - "src/content/**"
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
3a. `bun test` (asserções sobre o `dist/`: grafo JSON-LD, indexabilidade, origens de CTA)
3b. `bun run preview` noutro terminal + `bun run smoke` (dobra, overflow, modal e foco em 6 viewports reais)
4. Hex scan em UI files: nenhum `#[0-9a-fA-F]{3,8}` fora de `src/styles/global.css` (exceção: `<meta theme-color>`).
5. WhatsApp scan: nenhum `wa.me/` fora de `src/lib/whatsapp.ts`.
6. Content drift scan: nenhuma copy/FAQ/oferta hardcoded em `.astro`/`.tsx` (vive em `${content.productJson}`).
7. Production noise scan: nenhum `console.log` ou `graph-powers:debugger`.
8. Form/PII scan: campos com `<label>`, consent + link de privacidade presentes; sem PII logada.

Para mudanças de UI/perf também rodar `bun run lighthouse:audit` com preview/dev server local.

## Protected files

Per `.claude/config.json::protectedFiles.warn`:

- `astro.config.mjs`
- `src/lib/whatsapp.ts`
- `src/content.config.ts`
- `package.json`
- `tsconfig.json`
- `biome.json`
- `lefthook.yml`

Editar com razão explícita + validar. `.claude/hooks/protect_files.py` lê a lista `warn` e **avisa** (stderr) no Write/Edit, sem bloquear. O bloqueio duro vale só para credenciais, lockfiles e `.git/`, e quem o aplica é o `protect_files.py` do plugin graph-powers, que lê `protectedFiles.exact` / `segments` / `contains`. **As duas listas são separadas de propósito:** o hook do plugin nega sem escape, então qualquer arquivo movido de `warn` para `exact` deixa de ser editável por qualquer agente. O aviso não substitui a regra: mudança nesses arquivos precisa de razão explícita e dos gates rodados.

## Env / secrets

- `PUBLIC_FORM_ENDPOINT`, `PUBLIC_GA4_ID`, `PUBLIC_FB_PIXEL_ID` vivem em env (Vercel / `.env` não commitado). Documentar em `.env.example` quando criados. Nunca commitar valores.

## Branch workflow — main-only

Single-branch repository. Sempre editar em `main`.

- **Sem feature branches**, sem `dev-test`, sem `feature/*`, sem `fix/*`.
- **Never force-push** (`--force` / `-f`).
- **Never auto-merge/auto-approve PRs.**
- Commits direto em `main` após o manual gate + lefthook.
- Push para `origin/main` e deploy Vercel só quando o usuário pedir.

## Deploy — o push é a metade que falha em silêncio

O Vercel constrói a partir do `origin/main`, não do repositório local. Um commit que
nunca chegou ao GitHub é indistinguível de um bem-sucedido no terminal — `git log` mostra
ele, a árvore está limpa — e a produção simplesmente continua no build anterior, sem erro
em lugar nenhum.

Quando o usuário pedir deploy, usar **um comando só**:

```bash
bun run ship        # predeploy (lint + astro check + build) → git push origin main → deploy:verify
```

Se o push já foi feito e a dúvida é só se a produção está servindo aquilo:

```bash
bun run deploy:verify              # https://otb.gpus.com.br, espera até 240s
bun run deploy:verify -- <url> --wait=60
```

O hook `post-commit` (lefthook → `scripts/push-reminder.sh`) avisa sempre que o commit
fica só local: imprime no terminal e dispara uma notificação de desktop com o número de
commits à frente do upstream. Ele **não bloqueia** — a IDE engole a saída do hook, por
isso a notificação. Foi essa a falha de 18/08/2026: a IDE rodou `git add` e `git commit`
e nunca rodou `git push` (o trace só tem `add` 18:46:40 e `commit` 18:46:55), e a
produção seguiu no build anterior sem erro em lugar nenhum.

`scripts/deploy-check.mjs` falha com mensagem acionável em três pontos: HEAD fora do
`origin/main` (o caso acima), `dist/` ausente, e produção servindo bytes diferentes dos
de `dist/`. A comparação é o digest de **cada rota** construída (`/`, `/otb`,
`/redirecionando`) contra o HTML servido — página estática do Astro chega ao CDN sem
modificação, então a igualdade é exata. Comparar só o hash dos assets não bastaria:
mudança só de texto não move nome de arquivo. Diagnóstico manual: `vercel ls otb-usa`.
