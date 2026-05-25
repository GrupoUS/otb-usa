# Plano — Atualizar OTB USA com Briefing 3ª Edição (Google Doc)

> **Fonte:** Google Doc "OTB EUA 3ª Edição — Kickoff Briefing Summary"
> **Hoje:** 2026-05-25 · **Complexidade:** Medium L4–L5 · **Branch:** `dev-test`

---

## Context

Briefing oficial da **3ª Edição do OTB EUA** entregou diferenças materiais vs SSOT atual em `src/content/products/otb.json`. A edição foi **realocada de Dubai para Boston/Harvard** por razões geopolíticas, com datas, preço, certificação dupla, detalhes de prática anatômica e parceiros operacionais novos. SSOT atual está com "datas em breve" e US$ 4.000 — desalinhado do briefing.

Objetivo: alinhar JSON, schema, skill e landing à 3ª edição sem violar guardrails Harvard/Boston nem cardinal rules.

---

## Delta — Doc vs SSOT atual

| Campo | SSOT atual | Briefing 3ª Edição |
|---|---|---|
| Edição | implícita | **3ª Edição** (relocada de Dubai) |
| Datas Boston | "em breve" | **19–21 abr 2027** |
| Preço | US$ 4.000 | **US$ 3.000 — Lote 0** (até 30 abr 2026) + 3 lotes escalonados |
| Certificação | MEC | **Dual: MBA + ASA** + MEC |
| Prática anatômica | "cadáver fresco" genérico | **Fresh Specimens ≤ 48h post-mortem** · alunos injetam **e** dissecam · acesso a todo o corpo docente nas estações |
| Anatomy Review | — | **Correspondente Harvard** (carece guardrail) |
| Agenda 3 dias | — | Dia 1 Harvard tour · Dia 2 business · Dia 3 cadáver lab |
| Audience | "Saúde Estética" | "harmonização facial, corporal **e íntima**" |
| Pilares | "diferenciais" | **3 pilares:** técnica avançada · branding internacional · networking global |
| Parcelamento | "consultar condições" | Cartão **ou** boleto **+ 5% taxa de processamento** |
| Parceiros | — | **Gabriela Souza (Travel Legacy)** travel · **Raquel Fleury** visto US |

---

## Assumptions [ASSUMED] — confirmar com stakeholder antes de codar

1. **[ASSUMED]** "ASA" = Associação/Society pela letra do briefing — sigla não expandida. Não publicar sem expansão oficial e confirmação de natureza/escopo da certificação.
2. **[ASSUMED]** Lote 0 venceu em **2026-04-30** (hoje é 2026-05-25). Site deve refletir **Lote 1** ativo. Preço/validade do Lote 1 e Lote 2 **não foram dados** no briefing — precisam ser fornecidos antes de publicar.
3. **[ASSUMED]** Taxa 5% aplica **só ao boleto** ou também ao cartão? Briefing ambíguo.
4. **[ASSUMED]** "Anatomy Review com correspondente Harvard" — natureza do correspondente (afiliação, vínculo, escopo). Sem confirmação só pode ser descrito como "revisão de anatomia conduzida por correspondente baseado em Boston" — **nunca** "Harvard endorsed" / "Harvard certified".
5. **[ASSUMED]** Contato dos parceiros (Travel Legacy / Raquel Fleury) — WhatsApp, Instagram, e-mail — não estão no briefing.
6. **[ASSUMED]** Imagens da 3ª edição (turmas anteriores Dubai, novo material Boston, fotos parceiros) — disponibilidade.

---

## Layers tocadas

```
Content (JSON SSOT)
  → Schema (content.config.ts — novos campos opcionais)
  → Componentes landing (Investimento, BostonHarvard, novo Parceiros)
  → Página /otb (compor novas seções)
  → Skill otb-usa (manual-resumo, novos guardrails)
  → Docs (PRODUCT.md se houver)
  → Verify gate
```

Projeto é presentation-only (`paths.backendRoot` e `paths.schemaRoot` vazios em `.claude/config.json`). Sem banco, sem API.

---

## Plan

### Phase 0 — Stakeholder gate [BLOCKING]

Antes de qualquer código, obter do usuário:

- Preço, validade e label do **Lote 1 ativo hoje** (e do Lote 2 se já definido).
- Expansão e natureza oficial de **ASA**.
- Texto aprovado para descrever **Anatomy Review com correspondente Harvard** dentro do guardrail legal.
- Aplicabilidade da **taxa 5%** (boleto, cartão, ou ambos).
- Contatos dos **parceiros operacionais** (Gabi/Raquel) ou decisão de só mencionar nomes na FAQ.
- Datas oficiais do programa online (10 módulos) — início/duração — se relevante para o copy.
- Cópia exata da promessa de "harmonização íntima" (sensível — regulatório por conselho).

Sem os itens 1–4 não publica.

### Phase 1 — Schema (`src/content.config.ts`) [SEQUENTIAL]

Adicionar campos **opcionais** para preservar compat. Padrão: feature-flag por presença.

- [ ] `edicao` opcional: `{ numero: number, ano: number, local: string, badge?: string }`.
- [ ] `lotes` opcional: `z.array({ id: string, label: string, moeda: string, preco: string, validade?: string, status: z.enum(["ativo","encerrado","futuro"]), nota?: string })`.
- [ ] `agenda` opcional: `z.array({ dia: number, data: string, titulo: string, descricao: string, atividades: z.array(string) })` length 3 quando presente.
- [ ] `parceiros` opcional: `z.array({ nome: string, papel: string, descricao?: string, contato?: { whatsapp?: string, instagram?: string } })`.
- [ ] `pilares` opcional dentro de `why` ou novo: `z.array({ titulo, descricao }).length(3)` — alternativa: reescrever `why.cards` para os 3 pilares oficiais.
- [ ] Marcar `bostonHarvard.datas` continua livre (string) — recebe "19 a 21 de abril de 2027".
- [ ] Validar schema com `bunx astro check` antes de seguir.

### Phase 2 — Conteúdo (`src/content/products/otb.json`) [SEQUENTIAL]

Atualizar SSOT com payload da 3ª edição. Sem hardcode em `.astro`/`.tsx` (Cardinal rule 5).

- [ ] `seo.title` + `seo.description` — incluir "3ª Edição", "Boston", "abril de 2027".
- [ ] `hero.badges` — substituir por: `["3ª Edição — Boston, abr 2027", "Dual MBA + MEC", "320 horas de programa", "Fresh Specimens ≤ 48h", "Networking internacional"]` (sob confirmação ASA).
- [ ] `hero.subheadline` — citar 19–21 abr 2027 + dual cert.
- [ ] `hero.cta.whatsappMessage` — `"Olá, Laura! Quero saber mais sobre a 3ª Edição do OTB em Boston (abr 2027)."` (mantém prefixo SSOT).
- [ ] `why.cards` (3) — reescrever para os **3 pilares**: formação técnica avançada · branding internacional via corpo docente de referência · networking global de empreendedores de Saúde Estética.
- [ ] `audience.quote` — incorporar "harmonização facial, corporal e íntima" **somente** se Phase 0 item 7 for aprovado.
- [ ] `programa.descricao` — mencionar Fresh Specimens ≤ 48h + dual cert + agenda 3 dias.
- [ ] `programa.cards[2]` (Demonstração anatômica) — atualizar para detalhar Fresh Specimens ≤ 48h, alunos injetam **e** dissecam, acesso a todo corpo docente nas estações.
- [ ] `bostonHarvard.datas` — `"19 a 21 de abril de 2027 — Boston, Estados Unidos"`.
- [ ] `bostonHarvard.descricao` — citar 3 dias + Harvard tour Dia 1 + Anatomy Review com correspondente baseado em Boston (texto Phase 0 item 3).
- [ ] `bostonHarvard.cards[*]` — atualizar um card para "Anatomy Review" (sob copy aprovado), outro para Fresh Specimens, outro mantém networking.
- [ ] Adicionar **bloco novo** `agenda` no JSON (3 itens — Dia 1/2/3).
- [ ] `investimento.moeda` = `"US$"`, `investimento.preco` reflete **Lote 1 ativo** (Phase 0 item 1).
- [ ] `investimento.descricao` — explicar lotes escalonados.
- [ ] `investimento.parcelamento` — atualizar para refletir taxa 5% conforme Phase 0 item 4.
- [ ] `investimento.beneficios` — adicionar "Dual MBA + MEC", "Fresh Specimens ≤ 48h", "Anatomy Review (Boston)", remover linha redundante.
- [ ] Adicionar bloco novo `lotes` (array de 3) com `status: "encerrado" | "ativo" | "futuro"`.
- [ ] Adicionar bloco novo `parceiros` (Gabi · Raquel) com `contato` opcional.
- [ ] `faq` — adicionar perguntas:
  - "Quais as datas da próxima imersão?" → 19–21 abr 2027.
  - "O programa tem certificação dupla?" → dual MBA + MEC (e ASA se confirmado).
  - "Como funcionam os lotes de investimento?" → Lote 1 ativo, Lote 2 futuro.
  - "Como organizo viagem e visto?" → menciona Travel Legacy + Raquel Fleury (sem afirmar exclusividade).
  - "Como é o Anatomy Review?" → texto Phase 0 item 3.
  - Manter Q sobre Harvard reforçando guardrail.
- [ ] `legal.disclaimer` — manter cláusula Harvard atual + frase explícita: "A menção ao 'correspondente Harvard' no Anatomy Review tem fim descritivo do perfil profissional do palestrante e não implica vínculo, patrocínio ou endosso por Harvard University."

### Phase 3 — Componentes [PARALLEL onde independente]

- [ ] `src/components/landing/Investimento.astro` — renderizar `lotes` quando presente: timeline visual de 3 lotes com status (encerrado/ativo/futuro). Lote ativo destacado com gold token; encerrado em muted.
- [ ] `src/components/landing/BostonHarvard.astro` — renderizar bloco `agenda` quando presente: 3 cards de dia com data + título + atividades.
- [ ] Novo `src/components/landing/Parceiros.astro` — render `parceiros[]` com nome, papel, descricao opcional. Mobile-first, sem CTA inline (usar WhatsApp central).
- [ ] Tokens: só Navy/Gold do `@theme`. Sem hex inline (Cardinal rule 7).
- [ ] Motion: só `transform`/`opacity` (Cardinal rule 8).
- [ ] Sem React island a menos que interatividade comprovada — default Astro estático.

### Phase 4 — Página (`src/pages/otb.astro`)

- [ ] Carregar via `getEntry("products","otb")`.
- [ ] Compor nova seção `Parceiros` entre `Investimento` e `FAQ` (ou antes da FAQ).
- [ ] Passar `agenda` e `lotes` para os componentes existentes — sem nova prop derivada.
- [ ] Sem `prerender = false` (Cardinal rule 4).

### Phase 5 — Skill `otb-usa`

- [ ] `.claude/skills/otb-usa/references/manual-resumo.md` — atualizar:
  - Fatos do produto: datas, preço atual (Lote ativo), dual cert, Fresh Specimens ≤ 48h, edição = 3ª.
  - Público: incluir "harmonização íntima" sob aprovação.
  - Seções da landing: incluir Parceiros + Agenda.
- [ ] `.claude/skills/otb-usa/SKILL.md` — Non-negotiables: adicionar bullet "Anatomy Review com correspondente Harvard é descritivo do perfil profissional — proibido sugerir endosso/vínculo Harvard."
- [ ] Novo `.claude/skills/otb-usa/references/edicao-3-boston.md` consolidando: datas, lotes, agenda, parceiros, dual cert, Anatomy Review wording aprovado.
- [ ] `.claude/skills/otb-usa/references/conflitos-fontes.md` — registrar resolução desta versão como SSOT atual.

### Phase 6 — Docs

- [ ] `PRODUCT.md` (raiz) — se existir e divergir, atualizar para refletir 3ª edição.
- [ ] `AGENTS.md § Recent learnings` — appendar bullet datada 2026-05-25 com o realinhamento.

### Phase 7 — Verify [SEQUENTIAL — gate cardinal rule 2]

```bash
bun run lint
bunx astro check
bun run build
```

Smoke manual no preview:

- [ ] `bun run dev` → `/otb` carrega sem console error.
- [ ] Hero mostra "3ª Edição — Boston, abr 2027".
- [ ] Boston/Harvard mostra agenda 3 dias.
- [ ] Investimento mostra timeline de 3 lotes; ativo destacado.
- [ ] Nova seção Parceiros aparece.
- [ ] FAQ contém novas perguntas; disclaimer Harvard reforçado.
- [ ] WhatsApp CTA abre com mensagem nova começando "Olá, Laura!".
- [ ] Lighthouse no `/otb`: perf/a11y/bp/seo ≥ 95 (gate `.claude/config.json`).
- [ ] Grep `bg-\[#|text-\[#|border-\[#` em `src/components` → vazio.
- [ ] Grep `wa.me/` em `src/components` → vazio.
- [ ] Grep copy hardcoded da 3ª edição (`19 a 21|3.000|Lote`) em `.astro`/`.tsx` → vazio (deve vir só do JSON).

---

## Critical files

| Arquivo | Mudança |
|---|---|
| `src/content/products/otb.json` | Reescrita parcial — dados 3ª edição |
| `src/content.config.ts` | Campos opcionais `edicao`, `lotes`, `agenda`, `parceiros` |
| `src/components/landing/Investimento.astro` | Render timeline de lotes |
| `src/components/landing/BostonHarvard.astro` | Render agenda 3 dias |
| `src/components/landing/Parceiros.astro` (novo) | Seção parceiros operacionais |
| `src/pages/otb.astro` | Compor nova seção |
| `.claude/skills/otb-usa/references/manual-resumo.md` | Reescrita parcial |
| `.claude/skills/otb-usa/SKILL.md` | Guardrail Anatomy Review |
| `.claude/skills/otb-usa/references/edicao-3-boston.md` (novo) | Snapshot 3ª edição |
| `.claude/skills/otb-usa/references/conflitos-fontes.md` | Registrar SSOT atual |
| `AGENTS.md` | Bullet em Recent learnings |

---

## Risks & mitigations

| Risco | Mitigação |
|---|---|
| Publicar Lote 0 expirado em 2026-05-25 | Bloquear Phase 2 até receber dados do Lote 1 ativo (Phase 0 item 1). |
| Copy "Harvard correspondent" sugerir endosso | Phase 0 item 3 + bullet novo em Non-negotiables + disclaimer ampliado. |
| "ASA" publicado sem expansão e fonte | Não incluir até Phase 0 item 2 resolvido — manter só MEC visível. |
| "Harmonização íntima" sem suporte de conselho | Phase 0 item 7 + reforço de "regulamentação do respectivo conselho" no copy. |
| Schema breaking change (campos novos `length(3)`) | Todos novos campos são `.optional()` no schema; componentes degradam quando ausentes. |
| 5% taxa aplicada errado em copy | Phase 0 item 4 — exigir confirmação por escrito antes de publicar. |
| Imagens placeholder Dubai aparecendo | Auditar `public/images/otb/*` na Phase 7; substituir ou esconder seção "Turmas" se sem material. |

---

## Verification — end-to-end

1. Gate cardinal: `bun run lint && bunx astro check && bun run build` passa.
2. `/otb` carrega no preview com todas as novas seções renderizadas.
3. Conteúdo idêntico ao briefing após aprovação stakeholder.
4. Nenhum hardcode de copy/hex/`wa.me` fora dos SSOTs.
5. Lighthouse ≥ 95 nas 4 categorias em `/otb`.
6. JSON-LD + OG/Twitter refletem novo título e datas.
7. Disclaimer legal Harvard expandido cobre Anatomy Review.
