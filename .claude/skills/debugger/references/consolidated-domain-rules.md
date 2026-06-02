# Consolidated Domain Rules — GPUS Astro landing

## Project scope

This is a static Astro landing for a Grupo US program. It has no backend, database, auth or payments integration in this repo.

## Debug priorities

1. Reproduce or inspect the failing path.
2. Identify root cause before editing.
3. Keep fixes on-product only.
4. Validate with the narrowest relevant command, then broader gates.

## Build rules

- Use Bun only.
- Static MPA only.
- Product copy in `${content.productJson}`.
- WhatsApp URL helper in `src/lib/whatsapp.ts`.
- Tokens in `src/styles/global.css`.

## Validation

```bash
bun run lint
bunx astro check
bun run build
```

## Common failure modes

| Symptom | Check |
|---|---|
| Missing section copy | `${content.productJson}` + schema |
| Build schema error | `src/content.config.ts` |
| Wrong canonical | `astro.config.mjs`, `Layout.astro`, `.claude/config.json` |
| WhatsApp CTA drift | `src/lib/whatsapp.ts` + product JSON messages |
| Motion jank | prefer `transform`/`opacity` when equivalent; honor `prefers-reduced-motion` |
