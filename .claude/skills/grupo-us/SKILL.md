---
name: grupo-us
description: Use when writing Grupo US copy, answering questions about company products, aligning brand voice or sales journeys, mapping CTAs, or reconciling the institutional Astro repo with the internal Google manual and drasacha.com.br funnel.
---

# Grupo US — company and products

Domain knowledge for **Grupo US** (health aesthetics education ecosystem): brand voice, official product IDs, student journey, culture, routes, and source-of-truth rules.

## When to use

- Draft or review **Portuguese** marketing copy, FAQ, WhatsApp scripts, or landing messaging for Grupo US offers.
- Decide **which product** fits a persona or funnel stage (student journey).
- Edit **`src/content/products/*.json`** or institutional pages — keep alignment with schema and avoid inventing facts.
- **UI or layout** that changes home journey, product grid order, CTAs, landing copy, or JSON in `src/content/products/` — load this skill **early**, together with `astro` / `gpus-theme` (see `.claude/commands/design.md`).
- Explain **differences** between institutional site (`grupous.com.br`), **drasacha.com.br**, and the **Google Doc manual**.
- Onboard an agent to **IDs** (`produto_*`, `pessoa_*`, `empresa_grupo_us`) for tools or RAG.

## Source hierarchy

1. **Brand voice, product IDs, internal sales logic** → read `references/manual-resumo.md` (from the [Google Doc](https://docs.google.com/document/d/1EV8aXBMqXG_bIKEqUs0xGZkc_xbbncweiK1ZLOpCGw0/edit?usp=drive_link); refresh via `.../export?format=txt`).
2. **Published institutional site copy and slugs** → `src/content/products/*.json` and [AGENTS.md](../../../AGENTS.md) (no hardcoded product copy in components).
3. **Live funnel URLs** → `cta.url`, `externalSiteUrl` in JSON, plus **drasacha.com.br** when the task is campaigns or external LPs.
4. **Culture A.C.T.I.V.A.** → `references/cultura-activa.md` ([Notion — Quem Somos](https://five-iguana-d79.notion.site/Quem-Somos-2694d8c589888005b889e1213682dd58)).

If sources conflict, open `references/conflitos-fontes.md` and **do not silently merge** divergent facts (especially OTB location, TRINTAE3 duration, prices).

## Procedure

1. Classify the task: **institutional repo**, **vitrine / drasacha**, or **internal manual / IA voice**.
2. Load only the needed reference files:
   - Identity, IDs, journey, contacts → `references/manual-resumo.md`
   - Culture behaviors → `references/cultura-activa.md`
   - Slugs, routes, redirects → `references/produtos-e-rotas.md`
   - Conflicts and decisions → `references/conflitos-fontes.md`
3. For **prices or dates**, never fabricate: point to official checkout, WhatsApp, or confirm with the team.
4. After marketing updates the Google Doc, re-export text and **diff** against `manual-resumo.md`.

## Student journey (manual — recommendation order)

1. Entry / beginner: **Comunidade US** or **Curso de Aurículo**.
2. Solid training: **TRINTAE3**.
3. Networking: **Na Mesa Certa**.
4. Scale: **Mentoria Black NEON**.
5. Top of pyramid: **OTB (MBA)**.

Details and alternate framing → `references/manual-resumo.md`.

## Bundled references

| File | Purpose |
|------|---------|
| `references/manual-resumo.md` | Voice, phrases, mission/vision/values, product IDs, journey, people IDs, support contacts |
| `references/cultura-activa.md` | A.C.T.I.V.A. culture table and anti-patterns |
| `references/produtos-e-rotas.md` | ID ↔ slug ↔ institutional route ↔ external URLs |
| `references/conflitos-fontes.md` | OTB location, TRINTAE3 duration, Neon Dash gap, pricing rules |
| `references/whatsapp-ssot.md` | SDR Laura WhatsApp SSOT — `WHATSAPP_SDR_E164`, `whatsappUrlWithText`, `isWhatsAppDestination`, "Olá, Laura!" prefix, dedup pattern, smoke commands |

## Quick grep (references)

- Product IDs: `produto_`
- People IDs: `pessoa_`
- Company: `empresa_grupo_us`
