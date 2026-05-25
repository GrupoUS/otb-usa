# Mentoria Black NEON — compound (evolve)

Reutilizar em próximos ciclos de autoresearch comercial.

## Padrões que funcionam

- **Title dedicado na página** (não só `name — Grupo US`): incluir “escala”, “clínicas”, “saúde estética” e marca **Black NEON** para alinhar SERP à intenção de dono de clínica.
- **`ogImage` do produto** quando existir `image` no JSON — melhor compartilhamento que o OG genérico.
- **H1 + destaque dourado no último token** (`LandingHero`): terminar o headline com **NEON** (marca) em vez de “você”, para reforço visual da oferta.
- **Meta `description`**: duração (6 meses), ICP (donos de clínica), promessa (gestão/vendas/posicionamento), micro-CTA (WhatsApp, vagas/próximo ciclo).
- **CTA primário**: verbo + canal + contexto humano (“Falar com o time no WhatsApp”) + mensagem pré-preenchida rica (vagas, investimento, ciclo) para qualificar lead.
- **FAQ de funil**: pergunta explícita **Black NEON vs TRINTAE3** e **mentoria viva vs curso gravado** — reduz objeção e captura long-tail.
- **Story (H2)**: ângulo “olhar de dono” + highlight que nomeia o produto e os pilares (gestão, marketing de relacionamento).

## Performance (NeonStory)

- Em landings com **hero só texto** acima da dobra, imagem da faixa `NeonStory` fica **abaixo da dobra** em muitos viewports: usar `loading="lazy"` e `fetchpriority="low"` para não competir com LCP; manter `width`/`height` para CLS 0.
- Fundo claro da faixa: `bg-text-primary` (token `--color-text-primary`) em vez de hex solto.

## Copy de-duplication (2026-03-26)

- **benefits[] vs deliverables[] shadow:** When `deliverables` exists, the page renders it and ignores `benefits`. Keep both arrays with **distinct content** — benefits = outcomes, deliverables = specific sessions/activities.
- **Phrase echo limit:** Core brand phrases ("escalar com estratégia") should appear max 2x — in the primary positioning (tagline) and in user-language mirrors (painPoints). Description, audience, and bio should vary.
- **Story highlight autonomy:** `story.highlight` should carry its own closing, not repeat `bio` verbatim. The bio is personal (Dra. Sacha's voice), the story is structural (product pitch).

## Backlog sugerido

- Medir SERP real / CTR após deploy (Search Console).
- Testar variação de CTA A/B apenas com copy (sem mudar `wa.me`/número sem alinhamento com time comercial — fonte: `src/lib/whatsapp.ts`).
- JSON-LD `Course` ou `Product` específico da mentoria (se stakeholder pedir rich results).
