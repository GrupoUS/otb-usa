---
name: otb-usa
description: Use when writing or reviewing OTB USA copy, audience, CTA, pricing/date wording, Boston/Harvard legal guardrails, WhatsApp messaging, or any content in src/content/products/otb.json.
---

# OTB USA — product and brand context

Domain knowledge for the OTB Estados Unidos landing: product facts, audience, copy voice, CTA rules, and legal boundaries.

## When to use

- Editing `src/content/products/otb.json`.
- Drafting hero, FAQ, investment, modules, audience or speaker copy.
- Reviewing Harvard/Boston claims.
- Changing WhatsApp messages or contact copy.
- Deciding if a section belongs to the OTB USA landing.

## Source hierarchy

1. `src/content/products/otb.json` — current live content SSOT.
2. `src/content.config.ts` — shape/schema SSOT.
3. `PRODUCT.md` — product brief and positioning.
4. `references/*.md` in this skill — agent operating context.
5. Stakeholder confirmation — required for dates, price changes, legal claims or contact changes.

## Non-negotiables

- OTB USA is the repo scope; Grupo US is the parent brand.
- Do not import routes, CTAs, copy, offers or examples from other products.
- Do not claim Harvard sponsorship, endorsement, affiliation or certification.
- Use “Boston”, “Cambridge” and “ecossistema acadêmico de Harvard” as descriptive context only.
- WhatsApp URLs go through `src/lib/whatsapp.ts`.
- WhatsApp message copy lives in `src/content/products/otb.json` and starts with `Olá, Laura!` while Laura remains the active SDR.
- Anatomy Review with "Mike — correspondente americano" is descriptive of the speaker's professional profile only — never imply endorsement, certification or institutional ties with Harvard.
- The Harvard campus tour on Day 1 is descriptive/touristic — no official academic activity inside Harvard, no space-cession by Harvard University.
- The two certifications are: (a) MBA emitted via Instituto IESA / Grupo US partnership and (b) ASA — Anatomy Society of America — Fresh Specimens Course Certificate. Never reattribute certifications to Harvard, MEC alone, or any other institution.
- "Harmonização Facial, Corporal e Íntima" copy must always accompany the reminder that procedures must respect each professional council's regulation.
- Do not mention Dubai as a former planned venue in public copy — the relocation is internal context only.

## Product snapshot

- Program: OTB USA / OTB Estados Unidos.
- Category: MBA em Business Aesthetic Health.
- Parent brand: Grupo US.
- Format: 10 online modules + international immersion in Boston/EUA.
- Workload: 320 hours.
- Key differentiators: business, clinical management, premium positioning, advanced anatomical demonstration, international networking.
- Audience: habilitated health-aesthetics professionals.
- CTA: WhatsApp consultation with SDR.

## Bundled references

| File | Purpose |
|---|---|
| `references/manual-resumo.md` | Product facts, voice, audience, section intent |
| `references/edicao-3-boston.md` | Snapshot of the 3ª Edição (Boston, abril 2027) + Phase 0 stakeholder gaps |
| `references/produtos-e-rotas.md` | OTB route/canonical map |
| `references/conflitos-fontes.md` | Conflict policy and legal guardrails |
| `references/whatsapp-ssot.md` | WhatsApp helper/message rules |
| `references/cultura-activa.md` | Parent-brand culture context when needed |
