# Planning docs — compound

## Regra

Ao mudar rotas, redirects, WhatsApp ou decisões arquiteturais (MPA vs ClientRouter), atualizar em lote:

- `.planning/PROJECT.md`, `STATE.md`, `REQUIREMENTS.md`, `ROADMAP.md`
- `.planning/codebase/{STACK,STRUCTURE,CONVENTIONS}.md`
- Planos de fase obsoletos: banner **SUPERSEDED** ou **DONE** no topo (não apagar histórico)
- `docs/plans/aprimoramento/gpus-company-info.md` quando canais de contato divergirem (institucional vs drasacha)

## Números canônicos (2026-03-26)

- Páginas `.astro`: **8** em `src/pages/`
- Redirects: **5** em `astro.config.mjs`
- WhatsApp site: **+55 62 9470-5081** → `src/lib/whatsapp.ts`
