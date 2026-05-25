# Run: 2026-03-26 — deduplicação CTA WhatsApp nas landings

**Hipótese:** Esconder o botão verde quando `cta.url` já é WhatsApp reduz redundância sem perder o atalho Laura nos funis com URL externa.

**Arquivos:** `src/lib/whatsapp.ts`, `LandingHero.astro`, `LandingCTA.astro`

**Decisão:** keep

**Validação:** `bun run lint && bunx astro check && bun run build`
