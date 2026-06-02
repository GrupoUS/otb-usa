# Product — GPUS

> **Brief de produto, posicionamento e conversão da casa — Grupo US / Dra. Sacha Gualberto.** Genérico para **todos os produtos GPUS**, usável em qualquer projeto/landing.
>
> **Load:** `Skill('grupo-us')` (voz, IDs de produto/pessoa, funil drasacha) + `Skill('gpus-theme')` (tokens Navy/Gold). Visual/interação em `DESIGN.md`. Este arquivo **aponta** para as skills — não duplica voz, IDs nem tokens.
>
> O **slot por projeto** fica em `## Register` + `## Por projeto`. As demais seções são **verdade GPUS compartilhada** (valem em todo projeto).
>
> Síntese de pesquisa: `docs/logos/landing-pages-design-conversao-2026-06-01.md`.

---

## Register

> **Slot por projeto** — cada landing preenche este bloco. (Exemplo de campos; substituir pelos valores reais do projeto.)

- **Product:** `<nome do produto>` (ex.: Aula Gratuita TRINTAE3, TRINTAE3, OTB, Comunidade US…).
- **Canonical URL:** `<https://…>`.
- **Estágio de funil:** `<entrada | aula gratuita | especialista | networking | escala | apex>`.
- **Content SSOT:** `src/content/products/<slug>.json` (validado em `src/content.config.ts`).
- **CTA primário:** `<texto do CTA>` (um por página, repetido com consistência).
- **WhatsApp:** mensagem em `cta.whatsappMessage` (prefixo obrigatório `Olá, Laura!`), via helper `src/lib/whatsapp.ts`. Nunca inline `wa.me/...`.

---

## Users

Público compartilhado GPUS: **profissionais habilitados de Saúde Estética Avançada** que operam ou desejam operar em alto padrão clínico e empresarial:

- enfermeiros;
- biomédicos;
- farmacêuticos;
- fisioterapeutas;
- odontólogos;
- médicos.

Chegam por tráfego pago, indicação, lista de relacionamento ou canais do Grupo US. A decisão costuma **começar no mobile** e aprofundar no desktop quando a compra está próxima.

**Jornada do aluno (ecossistema):** entrada (Comunidade US / cursos curtos / **aula gratuita**) → **TRINTAE3** (especialista: técnica + base de negócio) → **Na Mesa Certa** (networking) → **Mentoria Black NEON** (escala) → **OTB** (apex internacional). IDs oficiais de produto/pessoa e a jornada completa vivem em `Skill('grupo-us')` — referenciar, não copiar. Cada landing **declara seu estágio** em `## Register`.

---

## Brand Personality

Tom de voz: **premium, claro, consultivo e internacional**. Falar em **"nós"**.

- Autoridade sem arrogância.
- Sofisticação com presença (não timidez, não excesso).
- Clareza antes de hype — "clareza é a nova gentileza".
- Business e segurança clínica caminham juntos.
- Grupo US é a marca-mãe; a narrativa principal é o produto da página.

Voz canônica, valores (A.C.T.I.V.A.) e frases-guia vivem em `Skill('grupo-us')`.

---

## Conversion playbook

Arquitetura ideal de landing high-ticket GPUS (ordem por jornada):

1. **Hero** — promessa específica + público + mecanismo + CTA + microprova.
2. **Barra de confiança/qualificação** — números, selos, horas, turmas; filtro de público explícito no topo ("para quem é").
3. **Dor qualificada** — 3–4 dores específicas do profissional.
4. **Mecanismo proprietário** — por que funciona e por que é diferente (fórmula simples por produto).
5. **Jornada / como funciona** — timeline ou passos claros.
6. **Prova** — depoimentos, fotos reais, bastidores, prints autorizados.
7. **Oferta** — o que recebe (essencial / acompanhamento / bônus).
8. **Comparativo** — "sem método vs com método GPUS".
9. **Autoridade** — Dra. Sacha, mentores, parceiros, credenciais.
10. **Investimento / condições** — com clareza e redução de risco.
11. **FAQ por objeção** — preço, tempo, elegibilidade, prática, certificado, suporte.
12. **CTA final + WhatsApp contextual.**

**Fórmula de hero** — todo hero responde, em ≤5s: *para quem é? · que transformação entrega? · qual mecanismo torna diferente? · qual próximo passo? · por que confiar agora?*

**Mecanismo proprietário (padrão):** `Componente A + Componente B + Componente C = Resultado de autoridade`. Cada produto define a sua fórmula simples.

**Disciplina de CTA:**
- **um CTA primário por página**, repetido com consistência (não deixar cada seção inventar um CTA);
- **WhatsApp = secundário/objeção**, com mensagens por intenção ("sou elegível?", "condições de pagamento", "próxima turma");
- prova social **perto do CTA**: 3 estatísticas verificáveis + 1 depoimento curto (foto/profissão/cidade) + selos com nota.

**Mobile-first:** sticky CTA bar (inscrever + WhatsApp), header compacto com logo legível, seções longas em tabs/accordion, formulário curto, **estado de sucesso rico** (confirmação + lembrete WhatsApp + add-to-calendar).

> Como esses padrões se parecem e se movem → `DESIGN.md § Component catalog` + `§ Motion`.

---

## Guardrails

Ofertas envolvem saúde estética, harmonização e formação profissional regulada → linguagem segura, sempre:

- **Sem promessa clínica garantida.** Sem promessa financeira absoluta ("fature X em Y meses" como headline).
- **Público elegível claro** conforme legislação e conselho aplicável.
- **Separar resultado de aluno de promessa universal** — depoimento ≠ garantia de reprodução.
- **Prova social com contexto:** nome, profissão, cidade, situação inicial, evolução.
- **Claims sensíveis** — "única", "reconhecida pelos Conselhos", "MEC", "Harvard", "ASA" — só com documentação / nota legal adequada. Referências internacionais (Harvard, Boston) como **contexto geográfico/acadêmico**, nunca como certificação oficial.
- **Copy não confirmada = PROPOSTA.** Datas/valores não confirmados = placeholder explícito.

---

## Anti-references

Evitar:

- template SaaS genérico;
- estética de dashboard corporativo frio;
- excesso neon/crypto/fintech;
- estética pastel/lifestyle genérica;
- promessa médica sensacionalista;
- tom e visual agressivo de infoproduto (CTA laranja/vermelho, urgência exagerada, dor por culpa/medo);
- uso de endosso/certificação oficial sem base;
- logos/parceiros sem autorização ou contexto.

---

## CRO

**Eventos de analytics (instrumentar por página):** `click_cta_hero`, `click_cta_sticky_mobile`, `click_whatsapp_hero`, `click_whatsapp_investimento`, `form_start`, `form_submit_success`, `form_submit_error`, `faq_open`, `section_view_*`, `scroll_25/50/75/90`.

**Prioridades de A/B:** CTA (consultivo vs direto) · hero visual (textual vs foto/vídeo vs card+depoimento) · formulário (campos curtos vs completos) · prova acima da dobra (com vs sem).

**Métricas por página:** CTR de CTA/WhatsApp, leads qualificados, custo por lead, scroll até investimento/FAQ, conversão pós-prova/garantia.

> IDs de tracking (GA4/Pixel) e endpoint vivem em **env**, nunca commitados — ver `.claude/rules/seo.md` + `.claude/config.json`. Mudá-los = aprovação.

---

## Accessibility & Inclusion

- WCAG 2.2 AA em contrastes.
- Foco visível em todo elemento interativo.
- `prefers-reduced-motion` respeitado.
- Sem cor como único portador de significado.
- Sem texto crítico apenas em ícone.
- Alvos táteis ≥ 44 × 44px.

---

## Por projeto

> Checklist de fatos a confirmar antes de publicar (preencher no projeto):

- [ ] Credenciais (MEC, conselho) verificadas ou marcadas como "a confirmar".
- [ ] Duração / datas / valores com fonte; divergências entre manual e site sinalizadas.
- [ ] Claims atribuídos a herança de marca, não a certificação fabricada.
- [ ] Contato (SDR Laura / WhatsApp) bate com `.claude/config.json` + `Skill('grupo-us')`.
- [ ] Oferta/inclusões com "confirmar oficialmente" onde não houver fonte.
- [ ] CTA primário único definido; mensagens WhatsApp por intenção no JSON.

---

## Onde aprofundar

| Pergunta | Fonte |
|---|---|
| Copy, público, CTA, voz, funil, IDs | `Skill('grupo-us')` |
| Tokens visuais Navy/Gold | `Skill('gpus-theme')` |
| Como parece / se move (visual, componentes, motion) | `DESIGN.md` |
| Regras universais de design (qualquer stack) | `.claude/rules/DESIGN.md` |
| Astro / Content Collections / static | `.claude/rules/astro.md` + `Skill('astro')` |
| SEO / tracking / env | `.claude/rules/seo.md` + `.claude/config.json` |
| Conteúdo/copy do produto | `src/content/products/<slug>.json` |
| Pesquisa de conversão (fonte) | `docs/logos/landing-pages-design-conversao-2026-06-01.md` |
