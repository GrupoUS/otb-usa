# Product — OTB USA

## Register

**Product:** OTB USA — MBA em Business Aesthetic Health do Grupo US.

**Canonical URL:** `https://otb.drasacha.com.br`.

## Users

Profissionais habilitados de Saúde Estética Avançada que já operam ou desejam operar em alto padrão clínico e empresarial:

- médicos;
- odontólogos;
- biomédicos;
- enfermeiros;
- fisioterapeutas;
- farmacêuticos.

O público chega por tráfego pago, indicação, lista de relacionamento ou canais do Grupo US. A decisão costuma começar no mobile e aprofundar no desktop quando a compra está próxima.

## Product Purpose

A landing apresenta o **OTB Estados Unidos**, posicionando o programa como uma formação executiva internacional para profissionais que querem unir técnica, business, gestão clínica, posicionamento premium e networking.

O site deve responder rápido:

1. o que é o OTB USA;
2. para quem é;
3. por que Boston/EUA e o ecossistema acadêmico de Harvard são relevantes;
4. o que compõe o programa de 320 horas;
5. como falar com a SDR pelo WhatsApp.

A página não deve inventar checkout, datas ou vínculo institucional externo. Quando houver incerteza operacional, o CTA correto é WhatsApp.

## Product Facts SSOT

Fonte da verdade de copy e conteúdo comercial: [`src/content/products/otb.json`](src/content/products/otb.json).

Campos críticos:

- `seo` — title, description e OG image.
- `hero` — promessa principal e CTA.
- `why`, `audience`, `programa`, `turmas`, `modulos`, `bostonHarvard`, `speakers`, `investimento`, `faq` — conteúdo de landing.
- `legal.disclaimer` — guardrail obrigatório sobre Harvard/Boston.

Schema: [`src/content.config.ts`](src/content.config.ts).

## Brand Personality

Tom de voz: **premium, claro, consultivo e internacional**.

- Autoridade sem arrogância.
- Sofisticação sem excesso.
- Clareza antes de hype.
- Business e segurança clínica caminham juntos.
- Grupo US é a marca-mãe; a narrativa principal é OTB USA.

## Legal / Harvard guardrail

Sempre manter explícito:

> Harvard é marca registrada de Harvard University. Esta experiência não implica vínculo, patrocínio, endosso ou certificação oficial por Harvard University.

Use “ecossistema acadêmico de Harvard”, “Boston”, “Cambridge” e “Estados Unidos” como contexto geográfico/institucional, nunca como certificação oficial.

## Design Principles

1. **Autoridade internacional.** Visual precisa sustentar Boston/EUA, business e saúde estética avançada.
2. **Ouro raro.** Gold marca decisões e hierarquia; não vira decoração de superfície.
3. **Dark-only premium.** Navy como base, contraste alto, foco visível.
4. **Mobile-first.** Um scroll owner, CTAs claros, alvos 44px+.
5. **Anti-template.** Se parecer landing genérica, redesenhar.

## Anti-references

Evitar:

- template SaaS genérico;
- estética de dashboard corporativo frio;
- excesso neon/crypto/fintech;
- estética pastel/lifestyle genérica;
- promessa médica sensacionalista;
- uso de Harvard como endosso oficial.

## Accessibility & Inclusion

- WCAG 2.2 AA em contrastes.
- Foco visível em todo elemento interativo.
- `prefers-reduced-motion` respeitado.
- Sem cor como único portador de significado.
- Sem texto crítico apenas em ícone.
- Alvos táteis ≥ 44 × 44px.

## Onde aprofundar

| Pergunta | Fonte |
|---|---|
| Copy, público, CTA e legal do OTB USA | `.claude/skills/otb-usa/` |
| Tokens visuais Navy/Gold | `.claude/skills/otb-theme/` |
| Regras universais de design | `.claude/rules/DESIGN.md` |
| Regras Astro e Content Collections | `.claude/rules/astro.md` + `.claude/skills/astro/` |
| Stack, comandos e estrutura | `README.md` |
