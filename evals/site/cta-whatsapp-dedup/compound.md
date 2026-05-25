# CTA WhatsApp — evitar duplicar canal

- **`isWhatsAppDestination(url)`** em `src/lib/whatsapp.ts` — usar em qualquer bloco que ofereça “primário + WhatsApp secundário”.
- **Regra:** Se o primário já abre WhatsApp, não mostrar segundo botão com o mesmo propósito; mensagem pré-preenchida continua no `cta.url` (JSON) ou no `whatsappUrlWithText` quando o primário é externo.
