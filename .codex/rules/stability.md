---
paths:
  - "src/**"
---

# Stability — the invariants that do not bend

> Graph Powers template. Every item below exists because the violation already broke something in
> production somewhere. Delete what demonstrably does not apply here; do not delete what "probably
> will not happen".

## Errors and limits

- **No non-null assertion** (`!`, `as T`, `unwrap()`) over an optional result, an environment
  variable or a query return. Use a type guard, an explicit default, or an early return.
- **Every collection is checked before access.** An empty array is truthy; an out-of-range index
  does not warn.
- **Every side effect has error handling** — network, disk, database, browser API. It either
  degrades with a warning or fails loudly. What it must not do is vanish silently.
- **No cast to `any`.** At the boundary: `unknown` plus schema validation.
- **A server process handles uncaught exceptions and unhandled rejections** without exiting quietly.

## Configuration

- **A required variable fails on first read.** Never fall back to `localhost`, a fake key or an
  empty string — a silent default turns a configuration error into a production incident.
- **Every build variable is in `.env.example`**, with a comment saying what it does.
- **No secret in the code or the repository.** Credential, token, private URL: out.

## Data

> Este projeto não tem banco nem ORM (`tooling.database` e `tooling.orm` vazios). As regras de índice,
> delete lógico e transação foram removidas por não terem sujeito aqui — o único write que sai da
> página é o lead. O que sobra é o que existe:
- **A webhook handler is idempotent and verifies its signature** before any effect.

## Interface

- **WCAG AA contrast**, `prefers-reduced-motion` honoured, never information carried by colour alone.
- **Semantic tokens, not colour literals.** A `#hex` in a component is a decision nobody can change
  later.
- **Loading, empty and error states exist** on every screen that fetches data.
- **The error page shows generic text and a way back.** A production build does not expose a stack.

## Hygiene

- **No debug logging in shipped code.** A warning only on the degradation path.
- **LF line endings**, enforced by `.gitattributes` or a hook.

## Gates

This project's commands are in `.claude/config.json::tooling.commands`. Running them is what
separates "I think it is right" from "it is right":

```bash
bun run lint
bunx astro check
bun run build
bun test
```

## Signals specific to this project

- **Render-mode `[HARD]`:** Astro static MPA. Nunca `export const prerender = false`, nunca adapter
  SSR, nunca `ClientRouter`.
- **Sem banco e sem ORM.** A seção *Data* acima foi reduzida ao que existe aqui: o único write é o
  `POST /api/leads` → Apps Script → planilha. Ele valida o payload na borda (`src/lib/leads.ts`) e
  precisa continuar idempotente do lado do Apps Script.
- **SSOT de conteúdo:** copy vive em `src/content/products/otb.json`, schema em
  `src/content.config.ts`. Copy hardcoded em `.astro`/`.tsx` é defeito.
- **SSOT de WhatsApp:** nenhum `wa.me/` fora de `src/lib/whatsapp.ts`; toda mensagem começa com
  `Olá, Laura!`.
- **Tokens:** nenhum hex fora do bloco `@theme` em `src/styles/global.css` (exceção documentada:
  `<meta theme-color>`).
- **Gates são advisory para CWV, hard para a11y**, render-mode, tokens e contratos do Layout —
  ver `.claude/rules/stability.md`.
