# Product — OTB Estados Unidos (Grupo US)

<!-- impeccable:product-schema 1 -->

> Registro de produto desta landing. **Verdade de marca compartilhada GPUS** (público, voz, playbook de conversão, guardrails) permanece aqui porque vale para todo produto da casa; os blocos específicos do OTB estão marcados.
>
> **Load:** `Skill('grupo-us')` (voz, IDs de produto/pessoa, funil drasacha) + `Skill('gpus-theme')` (tokens Navy/Gold). Visual/interação em `DESIGN.md`. Este arquivo **aponta** para as skills — não duplica voz, IDs nem tokens.
>
> **Modo desta superfície (impeccable 4.x): Persuade** — o visitante decide e age; o design é o produto.

---

## Platform

web

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

**Público específico do OTB** (`otb.json § audience`): profissional com **carreira já estabelecida**, que domina a técnica e busca o próximo patamar — operação, posicionamento e alcance internacional. Não é público de entrada. Citação de posicionamento no produto: *"O OTB não é para quem está começando. É para quem já chegou longe e sabe que o próximo nível não está no Brasil."*

**Jornada do aluno (ecossistema):** entrada (Comunidade US / cursos curtos / aula gratuita) → **TRINTAE3** (especialista) → **Na Mesa Certa** (networking) → **Mentoria Black NEON** (escala) → **OTB (apex internacional — este produto)**. IDs oficiais de produto/pessoa vivem em `Skill('grupo-us')` — referenciar, não copiar.

---

## Product Purpose

Landing estática de **captação** para o **OTB — MBA em Business Aesthetic Health**, 3ª edição, com imersão internacional em **Boston, 19 a 21 de abril de 2027**.

O produto é um programa executivo de **320 horas**: 10 módulos online de business, gestão clínica, marketing e vendas (MBA Business Online, plataforma por 12 meses, Instituto IESA / Grupo US) + 3 dias de imersão presencial em Boston com prática demonstrativa **Fresh Specimens ≤ 48h post-mortem** e **Anatomy Review** com correspondente americano.

Sucesso da página = visitante qualificado inicia conversa no WhatsApp com a SDR Laura. **Não há formulário nem checkout** (`hero.cta.checkoutUrl` e `investimento.cta.checkoutUrl` são `null`): o WhatsApp é o único destino de conversão.

---

## Positioning

**O primeiro MBA do mundo em Business Aesthetic Health.** O mecanismo que um concorrente não copia com honestidade é a combinação: *formação executiva de business (320h, certificação MBA Instituto IESA) + prática anatômica em Fresh Specimens ≤ 48h com certificado ASA + imersão no ecossistema acadêmico de Boston/Cambridge*, entregue a um público de Saúde Estética que já tem carreira feita.

Três pilares declarados (`otb.json § why.cards`): **formação técnica avançada · branding internacional · networking global**.

**Limite duro de posicionamento:** Boston/Cambridge/Harvard são **contexto geográfico e acadêmico**, nunca certificação, vínculo, patrocínio ou endosso. O disclaimer integral vive em `otb.json § legal.disclaimer` e deve permanecer acessível na página.

---

## Operating Context

- **Decisão em duas telas:** descoberta e leitura no mobile (tráfego pago/indicação), aprofundamento e conversa no desktop ou no app do WhatsApp.
- **Ticket alto em dólar** (US$ 3.500 no Lote 1) com **lotes escalonados** — o visitante compara preço, parcelamento e prazo antes de falar com a SDR.
- **Compra internacional:** exige viagem, hospedagem e visto US. Dois parceiros operacionais atendem isso fora do escopo do Grupo US (Travel Legacy e assessoria de visto B1/B2), com contato próprio.
- **Ciclo longo:** a edição ocorre em abril de 2027; a página vende decisão antecipada, não urgência artificial.
- **Prova disponível:** duas edições anteriores já realizadas em Boston, com acervo fotográfico próprio.

---

## Capabilities and Constraints

**Confirmado (fonte: `src/content/products/otb.json`, `astro.config.mjs`):**

- Slug de conteúdo `otb`; SSOT em `src/content/products/otb.json`, validado por `src/content.config.ts`.
- Canonical: `https://otb.gpus.com.br`. Redirect `/otb` → `/` (excluído do sitemap).
- Rota única `/` — **não existem** páginas legais (`/termos`, `/politica-de-privacidade`) nem `/404` neste repo.
- CTA primário único: **"Falar com Laura no WhatsApp"** (hero e investimento). CTA secundário: "Conhecer o programa".
- WhatsApp SSOT: `src/lib/whatsapp.ts` (`WHATSAPP_SDR_E164 = 556294705081`); toda mensagem começa com `Olá, Laura!` (validado em runtime).
- Lotes: Lote 0 US$ 3.000 (encerrado 30 abr 2026) · **Lote 1 US$ 3.500 (ativo, desde 01 mai 2026)** · Lote 2 US$ 4.000 (liberação por volume ou data, ainda não ativado).
- Parcelamento: cartão de crédito (parcelas conforme operadora) e boleto parcelado com taxa de 5% sobre o número de parcelas.
- Certificações declaradas: MBA em parceria **Instituto IESA / Grupo US**; certificado de prática anatômica **Fresh Specimens pela Anatomy Society of America (ASA)**.
- Agenda de 3 dias (19–21 abr 2027) descrita em `otb.json § agenda`; visita guiada ao campus tem caráter **descritivo**, sem atividade acadêmica oficial.
- Corpo docente publicado: 4 nomes em `otb.json § speakers.lista`.
- Parceiros operacionais: 2, com WhatsApp próprio (roteados por `whatsappPartnerUrl`).

**Restrições técnicas:**

- Astro estático MPA, zero ilha React hoje. Sem SSR, sem `ClientRouter`, sem `prerender = false`.
- Sem backend, sem banco, sem endpoint de lead. Sem GA4/Pixel instrumentado (`import.meta.env` não é lido em `src/`).
- Copy comercial nunca vive em `.astro` — campo novo = schema + JSON + leitor numa só mudança.

**Explicitamente indefinido — não fabricar:**

- Data/critério de ativação do Lote 2 ("liberação por volume ou data").
- Número de vagas por turma.
- Página de política de privacidade / termos (não existe rota).
- Instrumentação de analytics (IDs em env, ainda não conectados).

---

## Brand Commitments

Tom de voz: **premium, claro, consultivo e internacional**. Falar em **"nós"**.

- Autoridade sem arrogância.
- Sofisticação com presença (não timidez, não excesso).
- Clareza antes de hype — "clareza é a nova gentileza".
- Business e segurança clínica caminham juntos.
- Grupo US é a marca-mãe; a narrativa principal é o produto da página.

Voz canônica, valores (A.C.T.I.V.A.) e frases-guia vivem em `Skill('grupo-us')`. Tokens visuais (Navy/Gold + acento crimson Harvard/USA) em `DESIGN.md` + `src/styles/global.css @theme`.

---

## Evidence on Hand

**Existe e pode ser usado:**

- Acervo fotográfico próprio de duas edições anteriores em Boston: `src/assets/images/otb/gallery/` (8 fotos — aula, prática, networking, turma). Consumido por `astro:assets` via `src/lib/images.ts`; o JSON guarda o caminho `/images/otb/**` e o resolver mapeia para o asset.
- Retratos do corpo docente: `src/assets/images/otb/speakers/` (4).
- `src/assets/images/_retired/` — fora do glob do resolver, logo **não** vai para o build. Fotos aposentadas por trazerem wordmark de instituição legível; ver o `README.md` da pasta.
- Teto de resolução do acervo: **1600px**. Não existe original maior no repo nem no histórico do git — plate full-bleed em tela grande exige pedir os arquivos ao fotógrafo.
- Marca: `public/images/otb/otb-logo-gold.png`. Identidade Grupo US (logos + PDFs de identidade, ~43MB) vive **fora do repositório**, em `otb-usa-brand-assets/` ao lado dele.
- Números verificáveis declarados no JSON: 320 horas, 10 módulos, 3 dias, 2 edições anteriores, Fresh Specimens ≤ 48h.

**Ausências que trabalho futuro NÃO pode inventar:**

- **Sem depoimentos de alunos** (nenhum campo de testimonial no JSON) — não fabricar prova social nominal.
- **Sem números de resultado de aluno** (faturamento, ROI, casos).
- Sem selo/documento público de MEC ou conselho anexado ao repo.
- OG image (`public/og/otb-default.jpg`, 1200×630) é composição de marca — fundo navy do hero + logo gold + filete gold/crimson. **Não** é foto de Boston: `boston-skyline-hero.jpg` é arte abstrata, não fotografia.

---

## Product Principles

1. **Apex, não entrada.** Cada seção fala com quem já chegou longe; nada de didatismo de topo de funil.
2. **Um CTA, um destino.** WhatsApp com Laura é o único caminho de conversão — nenhuma seção inventa CTA próprio.
3. **Contexto internacional, nunca credencial emprestada.** Harvard/Boston descrevem o cenário; certificação real é IESA + ASA e é dita com essas palavras.
4. **Preço é argumento, não constrangimento.** Lotes e parcelamento aparecem com clareza; escassez só quando o JSON a confirma.
5. **Prova é o acervo real.** Fotos das edições anteriores carregam a credibilidade que depoimento fabricado carregaria — e não temos depoimento.

---

## Conversion playbook

Arquitetura ideal de landing high-ticket GPUS (ordem por jornada):

1. **Hero** — promessa específica + público + mecanismo + CTA + microprova.
2. **Barra de confiança/qualificação** — números, selos, horas, turmas; filtro de público explícito no topo ("para quem é").
3. **Dor qualificada** — 3–4 dores específicas do profissional.
4. **Mecanismo proprietário** — por que funciona e por que é diferente.
5. **Jornada / como funciona** — timeline ou passos claros.
6. **Prova** — fotos reais, bastidores, acervo autorizado.
7. **Oferta** — o que recebe (essencial / acompanhamento / bônus).
8. **Comparativo** — "sem método vs com método GPUS".
9. **Autoridade** — Dra. Sacha, corpo docente, parceiros, credenciais.
10. **Investimento / condições** — com clareza e redução de risco.
11. **FAQ por objeção** — preço, tempo, elegibilidade, prática, certificado, suporte.
12. **CTA final + WhatsApp contextual.**

**Ordem implementada hoje** (`src/pages/index.astro`): Hero → WhyOTB → TargetAudience → Programa → Turmas → Modulos → BostonHarvard → Speakers → Investimento → Parceiros → FAQ → Footer, com `WhatsAppFloatingButton` persistente.

**Fórmula de hero** — todo hero responde, em ≤5s: *para quem é? · que transformação entrega? · qual mecanismo torna diferente? · qual próximo passo? · por que confiar agora?*

**Disciplina de CTA:**
- **um CTA primário por página**, repetido com consistência;
- **WhatsApp por intenção** — mensagens distintas por seção (saber mais · garantir vaga no lote), sempre com o prefixo obrigatório;
- prova perto do CTA: números verificáveis + acervo fotográfico real.

> Como esses padrões se parecem e se movem → `DESIGN.md § Components` + `§ Motion`.

---

## Guardrails

Ofertas envolvem saúde estética, harmonização e formação profissional regulada → linguagem segura, sempre:

- **Sem promessa clínica garantida.** Sem promessa financeira absoluta como headline.
- **Público elegível claro** conforme legislação e conselho aplicável.
- **Separar resultado de aluno de promessa universal.**
- **Prova social com contexto:** nome, profissão, cidade, situação inicial, evolução — e só quando existir de fato.
- **Claims sensíveis** — "única", "reconhecida pelos Conselhos", "MEC", "Harvard", "ASA" — só com documentação / nota legal adequada. Harvard e Boston são **contexto geográfico/acadêmico**, nunca certificação.
- **Copy não confirmada = PROPOSTA.** Datas/valores não confirmados = placeholder explícito.
- **Disclaimer legal** (`otb.json § legal.disclaimer`) permanece visível e não pode ser encurtado por motivo estético.

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

**Eventos de analytics a instrumentar** (nenhum implementado hoje): `click_cta_hero`, `click_whatsapp_hero`, `click_whatsapp_investimento`, `click_whatsapp_floating`, `faq_open`, `section_view_*`, `scroll_25/50/75/90`.

**Prioridades de A/B:** CTA (consultivo vs direto) · hero visual (foto Boston vs editorial tipográfico) · posição da prova (galeria antes vs depois do programa) · framing do investimento (lote ativo vs benefício total).

**Métricas por página:** CTR de WhatsApp por seção, scroll até investimento/FAQ, conversas iniciadas com a SDR, qualificação da conversa.

> IDs de tracking (GA4/Pixel) vivem em **env**, nunca commitados — ver `.claude/rules/seo.md` + `.claude/config.json`. Mudá-los = aprovação.

---

## Accessibility & Inclusion

- WCAG 2.2 AA em contrastes.
- Foco visível em todo elemento interativo.
- `prefers-reduced-motion` respeitado em toda animação (único requisito duro do motion).
- Sem cor como único portador de significado.
- Sem texto crítico apenas em ícone.
- Alvos táteis ≥ 44 × 44px.
- Conteúdo revelado por scroll permanece legível com JS desligado (`<noscript>` em `Layout.astro`).

---

## Onde aprofundar

| Pergunta | Fonte |
|---|---|
| Copy, público, CTA, voz, funil, IDs | `Skill('grupo-us')` |
| Tokens visuais Navy/Gold/Crimson | `Skill('gpus-theme')` + `src/styles/global.css @theme` |
| Como parece / se move (visual, componentes, motion) | `DESIGN.md` |
| Regras universais de design (qualquer stack) | `.claude/rules/DESIGN.md` |
| Astro / Content Collections / static | `.claude/rules/astro.md` + `Skill('astro')` |
| SEO / tracking / env | `.claude/rules/seo.md` + `.claude/config.json` |
| Conteúdo/copy do produto | `src/content/products/otb.json` |
| Valores de instância (rotas, âncoras, componentes) | `.claude/config.json` |
