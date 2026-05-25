# Plano — Aprimorar Design + Conteúdo OTB USA alinhado a institutoiese.com.br/otb/

> Sessão: `/design-improve aprimore o design e conteudo do site seguindo informações e copy do https://institutoiese.com.br/otb/`
> Branch: `dev-test` · Data: 2026-05-25 · Edição alvo: 3ª Edição Boston 19–21 abr 2027

---

## 1. Context

O usuário pediu aprimoramento de **design e conteúdo** da landing OTB USA tomando como referência a página `https://institutoiese.com.br/otb/` (página IESE da mesma 3ª Edição).

A landing atual (`src/content/products/otb.json` v1.1.0-edicao-3 + 14 componentes em `src/components/landing/**`) já está estruturalmente alinhada à 3ª Edição Boston abr 2027: preço Lote 1 US$ 3.500, agenda 3 dias, 10 módulos, 5 speakers, Fresh Specimens ≤ 48h, Anatomy Review com Mike.

A diferença que importa entre as duas páginas é tonal e estrutural:

- IESE usa copy mais provocativa de posicionamento ("O OTB não é para quem está começando. É para quem já chegou longe…", "$3.500 é investimento estratégico, não gasto"), persona-driven em vez de profession-driven.
- IESE expõe bloco visual de stats Fresh Specimens (48h / 100% / ASA) ausente na nossa landing.
- IESE tem narrativa de "duas turmas, um legado" antes da agenda — nossa Turmas é curta.
- IESE benefícios de investimento (9 itens) cobrem mais frentes que os nossos 7.

Em paralelo, audit técnico revelou desvios pontuais do canon de design (inline `color-mix()` em class attrs, `#1a1a2e` hardcoded em meta tag, utilitários definidos e nunca usados) que merecem polish.

Resultado esperado: landing mais bold em posicionamento, com bloco de stats Fresh Specimens, persona-driven audience, melhorias de benefícios — sem regredir guardrails Harvard/ASA, sem quebrar o contrato static-only Astro, dentro do canon Navy/Gold.

---

## 2. Guardrails não-negociáveis

Bloqueadores absolutos. Qualquer mudança que toque estes itens **PARA e PERGUNTA** antes de aplicar.

| Item | Origem | Regra |
|---|---|---|
| Harvard non-affiliation disclaimer | `src/content/products/otb.json::legal.disclaimer` | Manter na íntegra. IESE não tem; **nós temos e mantemos**. |
| ASA / Anatomy Society of America wording | Stakeholder gate (memória 2026-05-25) | Não reformular. Copy "ASA Fresh Specimens Course Certificate" intocada. |
| "Anatomy Review com correspondente americano" | Stakeholder gate | Wording exato. Mike = correspondente, sem vínculo Harvard. |
| Copy "íntima" (Harmonização Íntima) | Stakeholder gate | Manter wording atual em `audience.quote` + FAQ. |
| Taxa 5% sobre parcelas boleto | Stakeholder gate | Wording atual em `investimento.parcelamento` + FAQ. |
| Datas online (acesso plataforma) | Stakeholder gate | Não inventar/reformular janela de acesso. |
| Contatos parceiros (Gabriela, Raquel) | Stakeholder gate | Telefones atuais intocados. |
| Lote 0 US$ 3.000 encerrado em 30 abr 2026 | Memória | Manter contexto histórico em FAQ. |
| WhatsApp SSOT | `.claude/CLAUDE.md` cardinal #6 | Nunca inline `wa.me/`; só via `src/lib/whatsapp.ts`. |
| Hex outside `@theme` | Cardinal #7 | Zero hex novo em `.astro` / `.tsx`. |
| Static MPA contract | Cardinal #4 | Sem `prerender = false`, sem `ClientRouter`, sem SSR. |

---

## 3. Estratégia em dois trilhos

### Trilho A — Content alignment (executado antes da chain)

Mudanças concentradas em `src/content/products/otb.json` + ajustes mínimos nos componentes que consomem novos campos. Schema em `src/content.config.ts` recebe campos opcionais aditivos.

### Trilho B — Design improvement chain

`/design-improve landing` em 5 fases (audit → bolder → animate → colorize → overdrive) executando sobre escopo já com copy atualizada, garantindo que a polish visual acompanhe a copy nova.

Ordem importa: copy primeiro, design depois. Refatorar visual em cima de copy desatualizada custa retrabalho.

---

## 4. Trilho A — Plano de content alignment

### A.1 Hero — opcional: variante de subhead

Atual: `subheadline` denso de proof points. IESE: subhead curto e direto.

Decisão recomendada: **manter atual**. A versão atual carrega mais sinal (Fresh Specimens, Anatomy Review, profissionais Saúde Estética Avançada) que precede o scroll. Variante mais curta vira A/B futuro, não desta passada.

Sem mudança.

### A.2 WhyOTB — adicionar positioning intro

Adicionar campo opcional `positioningQuote` em `why` para puxar a frase-âncora antes dos 3 pilares.

```jsonc
// otb.json
"why": {
  "positioningQuote": "O OTB não é para quem está começando. É para quem já chegou longe e sabe que o próximo nível exige uma visão diferente de tudo.",
  "headline": "Os três pilares do",
  "highlight": "OTB Estados Unidos",
  "cards": [ ... ]
}
```

- Schema: campo `positioningQuote: z.string().min(60).max(200).optional()` em `src/content.config.ts::whySchema`.
- Render: novo `<p>` em `src/components/landing/WhyOTB.astro` acima do headline, com utilitário `.text-gradient-gold` em palavras-chave ou apenas `text-foreground` + `font-serif italic`. Sem nova hex.

### A.3 TargetAudience — adicionar persona bullets (additive, não substitutivo)

IESE persona bullets têm tração comercial alta. Manter as 6 `categorias` (icons de profissões — boa scannability) **e** adicionar bloco `personaBullets` abaixo.

```jsonc
// otb.json::audience
"audience": {
  ...
  "personaIntro": "Se você tem carreira estabelecida em Saúde Estética e sente que domina a técnica, mas percebe que ainda falta posicionamento de negócio, visão de mercado global e o networking que move carreiras — você está no lugar certo.",
  "personaBullets": [
    "Médico, biomédico, dentista, farmacêutico ou fisioterapeuta com prática clínica consolidada em Saúde Estética.",
    "Profissional que quer ampliar a visão além do consultório — entendendo business, posicionamento e escala.",
    "Quem busca conexão com padrão internacional de excelência, não apenas atualização técnica.",
    "Profissional que entende que US$ 3.500 é investimento estratégico de carreira — e quer tomar a decisão com consciência.",
    "Quem deseja ser visto e reconhecido nos maiores palcos da Saúde Estética mundial."
  ]
}
```

- Schema: `personaIntro: z.string().min(80).max(280).optional()` + `personaBullets: z.array(z.string().min(40).max(220)).min(3).max(6).optional()`.
- Render: extender `src/components/landing/TargetAudience.astro` com bloco condicional após `categorias`: intro em font-serif/italic, bullets em lista vertical com bullet icon Lucide (`check-circle` ou `arrow-up-right`). Respeitar gold accent budget ≤10%.
- Preservar `quote` atual (carrega copy "íntima" — guardrail).

### A.4 Programa — narrativa "Duas turmas, um legado"

Atual `descricao` é funcional. Adicionar campo opcional `narrativa` para frase de cohort history.

```jsonc
// otb.json::programa
"programa": {
  ...
  "narrativa": "Duas turmas já levaram empreendedores a Boston — palestras com experts globais, prática em Fresh Specimens e vivências reais em Cambridge. A 3ª Edição vai ainda mais longe."
}
```

- Schema: `narrativa: z.string().min(100).max(320).optional()`.
- Render: `<p>` em `Programa.astro` entre headline e cards, font-serif italic, text-text-muted.

### A.5 Fresh Specimens — bloco de stats visual

Aceleração de copy → componente. IESE mostra 48h / 100% / ASA como statement visual. Adicionamos como novo bloco dentro de `bostonHarvard` (Cardiac já está lá conceitualmente).

```jsonc
// otb.json::bostonHarvard
"bostonHarvard": {
  ...
  "freshStats": [
    { "valor": "≤ 48h", "rotulo": "Frescor máximo dos specimens" },
    { "valor": "100%", "rotulo": "Dos alunos injetam e dissecam" },
    { "valor": "ASA", "rotulo": "Anatomy Society of America" }
  ]
}
```

- Schema: `freshStats: z.array(z.object({ valor: z.string().min(2).max(12), rotulo: z.string().min(10).max(80) })).length(3).optional()`.
- Render: nova grid 3-col em `src/components/landing/BostonHarvard.astro` abaixo dos `cards`. Cada stat em `.glass-card` com `valor` em `font-serif` `text-5xl text-gradient-gold`, `rotulo` em `text-sm uppercase tracking-widest text-text-muted`. Sem novo hex; só tokens.
- ASA wording **intacto** ("Anatomy Society of America" — guardrail).

### A.6 Investimento — estender beneficios para 9 itens

Atuais 7 itens não cobrem "12 meses MBA online", "Prática Demonstrativa" como linha separada nem "Injetar + Dissecar" explícito. IESE separa para ganhar densidade percebida de valor.

Atualizar `investimento.beneficios` para 9 itens (mantendo ASA wording exato):

```jsonc
"beneficios": [
  "MBA Business Online — 12 meses de plataforma (Instituto IESA / Grupo US)",
  "Imersão internacional de 3 dias em Boston",
  "Palestras com corpo docente referência",
  "Prática demonstrativa com Fresh Specimens ≤ 48h post-mortem",
  "Anatomy Review com correspondente americano",
  "Aluno injeta e disseca a mesma peça",
  "ASA Fresh Specimens Course Certificate",
  "Networking internacional premium",
  "Suporte acadêmico durante todo o programa"
]
```

- Schema: revisar `beneficios.max()` para acomodar 9 (caso esteja capado em 7/8). Manter `min(5)`.
- Render: `Investimento.astro` já itera lista; sem mudança de componente além de revisar grid (provavelmente passar de 2-col para 3-col responsiva acima de `lg:` para evitar coluna desbalanceada).
- "Aluno injeta e disseca a mesma peça" e "Anatomy Review com correspondente americano" — wording aprovado, manter exato.

### A.7 Brand voice — micro-injeções de tom premium

Não-bloqueante. Polish opcional após design chain rodar:

- Hero badge ou subhead pode incorporar "próximo nível" se passar pelo gate de copy.
- Footer/Investimento tagline pode mencionar "isso muda tudo" como CTA secundário.

Defer para `/design-improve bolder` (Fase 2 da chain), que decide se vale a injeção.

### A.8 Itens **NÃO** alterados

- Headline hero ("O primeiro MBA do mundo em Business Aesthetic Health") — já alinhado.
- Edição/datas/local — já alinhado.
- Speakers (5, com bios atuais) — já alinhado a IESE.
- 10 módulos titles — já alinhados (mínima divergência "Expansão e Franquias" vs "Expansão de Franquias" — manter atual com `e` que é gramaticalmente correto pt-BR).
- FAQ (9 itens, mais completo que IESE) — não regredir.
- Legal disclaimer — manter, IESE não tem mas nós sim (guardrail Harvard).
- Lotes (3) e lote 0 histórico — manter.
- Parceiros (Gabriela, Raquel) — manter (guardrail).

---

## 5. Trilho B — Design improvement chain

Após Trilho A merged, executar a chain `/design-improve` em fase única (não rodar plan again):

```
/design-improve landing
```

SCOPE resolvido: `landing` alias → união de:
- `src/pages/index.astro`
- `src/components/landing/**`
- `src/content/products/otb.json` (apenas leitura nas fases ≤ colorize; overdrive bloqueia ASK conforme stopping condition do command)
- `src/styles/global.css`

5 fases sequenciais, cada uma com `frontend-specialist` foreground:

| Fase | Foco específico nessa rodada |
|---|---|
| **1. audit** | Validar tokens, hierarquia tipográfica, gold budget ≤10%, contrast AA. Catalogar defeitos remanescentes. |
| **2. bolder** | Aumentar peso visual do positioningQuote novo + freshStats. Hero shimmer mais decisivo se gate passar. Manter restrained. |
| **3. animate** | Reveal stagger nos persona bullets + freshStats. Apenas `transform`/`opacity`. `prefers-reduced-motion` em todas adições. |
| **4. colorize** | Refatorar inline `color-mix()` em class attrs (Modulos:33,37 / Turmas:30 / Programa:35-36 / TargetAudience:45) → novos `@utility` em `global.css`. Substituir `#1a1a2e` em `src/layouts/Layout.astro:60` por leitura de var CSS no build (ou inline-style com `var(--color-navy)`). Remover `.gold-glow` / `.animate-spotlight` / `.animate-aurora` não-usadas (ou documentar reserva). |
| **5. overdrive** | Hero gold-pulse-glow + freshStats stats com text-shimmer. **ASK gate dispara** porque SCOPE inclui `src/content/products/otb.json`. Aguardar aprovação user antes de overdrive. |

Cada fase escreve `.claude/agent-memory/design-improve/<fase>.md`. Chain controller faz gate Maestro + hex scan entre fases. Falha em qualquer gate → STOP, surface report, ASK.

End-of-chain: um único `/verify quick` (lint + astro check + build + spec compliance). Sem auto-retry em NEEDS-WORK.

---

## 6. Critical files a modificar

| Arquivo | Trilho | Mudança |
|---|---|---|
| `src/content/products/otb.json` | A | Adicionar `why.positioningQuote`, `audience.personaIntro`, `audience.personaBullets`, `programa.narrativa`, `bostonHarvard.freshStats`. Estender `investimento.beneficios` para 9 itens. |
| `src/content.config.ts` | A | Adicionar 5 campos opcionais (positioningQuote, personaIntro, personaBullets, narrativa, freshStats) em seus respectivos schemas. Revisar `beneficios.max` se aplicável. |
| `src/components/landing/WhyOTB.astro` | A | Renderizar `positioningQuote` condicionalmente acima do headline. |
| `src/components/landing/TargetAudience.astro` | A | Renderizar `personaIntro` + `personaBullets` condicionalmente abaixo de `categorias` (preservar `quote` existente). |
| `src/components/landing/Programa.astro` | A | Renderizar `narrativa` condicionalmente entre headline e cards. |
| `src/components/landing/BostonHarvard.astro` | A | Adicionar grid de `freshStats` (3-col) abaixo dos cards atuais. |
| `src/components/landing/Investimento.astro` | A | Verificar grid responsiva para 9 itens (possivelmente `md:grid-cols-2 lg:grid-cols-3`). |
| `src/components/landing/Modulos.astro` | B (colorize) | Refatorar inline `color-mix()` em linhas 33, 37 → utility class. |
| `src/components/landing/Turmas.astro` | B (colorize) | Refatorar inline `color-mix()` em linha 30 → utility class. |
| `src/components/landing/Programa.astro` | B (colorize) | Refatorar inline `color-mix()` em linhas 35–36 → utility class. |
| `src/components/landing/TargetAudience.astro` | B (colorize) | Refatorar inline `color-mix()` em linha 45 → utility class. |
| `src/layouts/Layout.astro` | B (colorize) | Linha 60: substituir `#1a1a2e` por leitura de `--color-navy` (via inline-style ou data-attribute pattern). |
| `src/styles/global.css` | B (colorize) | Adicionar 1–2 `@utility` para encapsular os `color-mix()` refatorados. Remover/comentar `.gold-glow`, `.animate-spotlight`, `.animate-aurora` se realmente sem consumidor planejado. |

Reuso obrigatório (não recriar):
- `src/lib/whatsapp.ts` para qualquer link WhatsApp (já SSOT).
- Tokens existentes em `@theme` (`--color-navy`, `--color-gold`, etc.) — não declarar novo hex.
- Utilitários existentes: `.glass-card`, `.card-glow-hover`, `.text-gradient-gold`, `.card-hover-lift` — reaproveitar para freshStats/personaBullets antes de inventar novo.
- Lucide icons via named imports já em uso.

---

## 7. Verification end-to-end

Ordem de execução do gate, em sequência:

1. **Schema valida JSON:**
   ```
   bunx astro check
   ```
   Falha se algum campo novo em `otb.json` ferir schema atualizado.

2. **Lint + type check + build (gate canônico):**
   ```
   bun run lint
   bunx astro check
   bun run build
   ```

3. **Hex scan (cardinal #7):**
   ```
   grep -rnE "#[0-9a-fA-F]{3,8}" src --include="*.astro" --include="*.tsx" --exclude="*.css"
   ```
   Expect: zero matches.

4. **WhatsApp SSOT scan (cardinal #6):**
   ```
   grep -rn "wa.me" src --exclude="src/lib/whatsapp.ts"
   ```
   Expect: zero matches.

5. **Content drift scan (cardinal #5):**
   ```
   grep -rnE "OTB|Harvard|Boston|R\$|US\$|3\.500|3500" src/components --include="*.astro"
   ```
   Permitido apenas em comentários/atributos não-renderizados; copy renderizada vem de `getEntry`.

6. **`/verify quick`** — gate único final da chain conforme `.claude/commands/design-improve.md` § 4.

7. **Smoke manual (navegador):**
   - Tab top of page → primeiro foco = skip link.
   - JS off → seções com reveal aparecem (noscript fallback).
   - DevTools → emular `prefers-reduced-motion: reduce` → animações desligam.
   - WhatsApp CTAs abrem URL com mensagem "Olá, Laura!".
   - Mobile (375px width): freshStats e personaBullets legíveis sem overflow.
   - Hero shimmer ainda fluido (LCP < 2.5s).

---

## 8. Stopping conditions específicas deste plano

Além das stopping conditions da própria chain `/design-improve`:

- STOP se qualquer mudança de copy tocar item da § 2 (guardrails). ASK user antes.
- STOP se schema update quebrar `bunx astro check` por mais de um cycle de iteration. Investigar root cause em vez de relaxar schema.
- STOP se Trilho A introduzir conteúdo que **regrida** a densidade/qualidade atual (e.g. remover FAQ items, encurtar disclaimer). Wins são aditivos.
- STOP antes de Fase 5 (overdrive) — ASK gate do command já cobre, mas reafirmar: scope inclui protected file `src/content/products/otb.json`.
- STOP se overdrive sugerir trocar paleta Navy/Gold por qualquer outra leitura — impeccable LAYERS sobre OTB theme, nunca substitui.

---

## 9. Ordem de execução recomendada

1. Aprovação deste plano via ExitPlanMode.
2. Trilho A.2–A.6 commits sequenciais ou um commit "feat(content): aprimora copy OTB alinhado a IESE — positioning, persona, stats Fresh Specimens, benefícios" — uma logical change.
3. Rodar gate canônico (`bun run lint && bunx astro check && bun run build`) antes de continuar.
4. Smoke manual mobile + desktop.
5. Disparar Trilho B via `/design-improve landing`.
6. Aguardar gate Phase 5 ASK (overdrive). Aprovar ou skip.
7. `/verify quick` automaticamente no fim da chain.
8. Se VERIFIED → opcional `/evolve` para capturar aprendizados.
9. PR para `main` com escopo cobrindo as duas trilhas separadas.

Duração estimada: Trilho A ~45–60 min (schema + json + 5 componentes + smoke), Trilho B ~60–90 min (chain de 5 fases). Total ~2h sob condições normais, mais se ASK gates demorarem.
