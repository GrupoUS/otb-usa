# Run: 2026-03-25 — SDR Laura WhatsApp (site-wide)

## `<answer>` (auto-research-gpus)

**Hipótese:** Centralizar o número da SDR (+55 62 9470-5081) e nomear a Laura nos CTAs aumenta clareza do próximo passo e qualifica o lead antes da conversa.

**Baseline (antes):** `wa.me/5511920474028` espalhado; mensagens sem destinatário nomeado; mentoria em `wa.link`.

**Patch:** `src/lib/whatsapp.ts`; `LandingHero`, `LandingCTA`, `CTASection`, `Footer`, `contato`, `Layout` (schema); `whatsappMessage` em todos os produtos; mentoria `cta.url` + label.

**Decisão:** keep

**Validação:** `bun run lint && bunx astro check && bun run build`

## Arquivos tocados

- `src/lib/whatsapp.ts` (novo)
- `src/components/landing/LandingHero.astro`
- `src/components/landing/LandingCTA.astro`
- `src/components/home/CTASection.astro`
- `src/components/layout/Footer.astro`
- `src/layouts/Layout.astro`
- `src/pages/contato.astro`
- `src/content/products/*.json` (7× `whatsappMessage` + mentoria `cta`)
- `.claude/skills/grupo-us/references/manual-resumo.md`
- `.claude/CLAUDE.md`, `AGENTS.md`
