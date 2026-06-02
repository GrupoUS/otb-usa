# GPUS site optimization profile

Use this profile when `/evolve optimize site:<area>` targets the GPUS Astro landing. It is a commercial-first conversion profile for a high-ticket saúde-estética product. Pull the concrete product, audience, offer and guardrail facts from `.claude/config.json` and root `PRODUCT.md` — do not hardcode a specific product, claim, price, date or location here.

## Priority order

1. **Offer clarity** — visitor understands `${project.displayName}` and its value in seconds.
2. **Legal safety** — regulated-health (saúde estética) claims stay descriptive and compliant; no implied official affiliation, endorsement, certification or partnership (PRODUCT.md § Guardrails).
3. **CTA quality** — WhatsApp intent is specific, concise and routed through the SSOT helper (`src/lib/whatsapp.ts`, greeting `${lead.whatsappGreeting}`).
4. **Conversion UX** — mobile-first hierarchy, clear objections, minimal friction; lead form (`${lead.formComponent}`) accessible and consent-compliant.
5. **SEO/GEO** — page explains the product, audience and Grupo US / Dra. Sacha positioning consistently (per `PRODUCT.md`).
6. **Performance** — static Astro, low JS, image priority, LCP/CLS/INP gates.

## Experiment output shape

Use:

```xml
<answer>
  <baseline>What exists now and why it may underperform.</baseline>
  <experiment>Smallest safe on-product change.</experiment>
  <validation>How to verify behavior, copy, legal and build.</validation>
  <log_entry>Durable learning if the experiment succeeds.</log_entry>
</answer>
```

## Negative constraints

- Do not import other GPUS product journeys or CTAs.
- Do not make unsupported regulated-health affiliation/endorsement/certification claims.
- Do not add JS unless interaction requires it.
- Do not change price/date/location without source confirmation.
