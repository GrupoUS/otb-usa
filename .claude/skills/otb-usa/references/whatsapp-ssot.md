# WhatsApp SSOT — OTB USA

## Source of truth

- Helper/number: `src/lib/whatsapp.ts`.
- Product messages: `src/content/products/otb.json`.
- Current SDR name in copy: Laura.

## Rules

- Never inline `wa.me/...` in `.astro`, `.tsx` or content.
- Use `whatsappUrlWithText(message)` for message-specific CTAs.
- Use `defaultWhatsAppUrl()` only for generic/footer/floating contact.
- While Laura remains the SDR, messages must start with `Olá, Laura!`.
- If SDR/name/number changes, update `src/lib/whatsapp.ts`, schema validation in `src/content.config.ts`, OTB JSON messages and this reference together.

## Current message intent

Hero:

```text
Olá, Laura! Quero saber mais sobre a próxima turma do OTB nos Estados Unidos.
```

Investment CTA:

```text
Olá, Laura! Quero garantir minha vaga na próxima turma do OTB Estados Unidos.
```

## Smoke checks

- Search UI files for inline WhatsApp URLs; only `src/lib/whatsapp.ts` may contain `wa.me`.
- Run `bunx astro check` after message/schema changes.
