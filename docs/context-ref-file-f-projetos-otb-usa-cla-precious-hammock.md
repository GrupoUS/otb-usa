# Plan — Visual + Copy + CTA uplift for `otb.drasacha.com.br/`

> Scope: aprimorar visual, copy e CTAs da landing pública servida no host canônico `otb.drasacha.com.br/`, seguindo `.claude/rules/DESIGN.md` + `Skill('otb-theme')` + `Skill('otb-usa')` + `Skill('astro')`.

---

## Context

**Host canônico do repo:** `https://otb.drasacha.com.br/`, alinhado com `.claude/config.json`, `README.md`, `PRODUCT.md`, `robots.txt` e `astro.config.mjs`.

Se algum alias legado ainda receber tráfego em produção, ele deve redirecionar com 301 para `otb.drasacha.com.br` na plataforma de hospedagem, sem voltar a ser fonte canônica no repo.

Antes da auditoria residual, `src/pages/index.astro` renderizava apenas **4 seções**:

```
Hero → WhyOTB → TargetAudience → Investimento
```

O funil completo (10 seções) existia em `src/pages/otb.astro`:

```
Hero → WhyOTB → TargetAudience → Programa → Turmas → Modulos →
BostonHarvard → Speakers → Investimento → FAQ
```

Resultado pré-correção: a URL principal ficava incompleta — sem prova social (Turmas), matriz curricular (Módulos), autoridade internacional (BostonHarvard), speakers e FAQ. A versão completa em `/otb` também criava risco de rota concorrente. A auditoria residual passou a considerar `/` como rota canônica do funil completo e `/otb` como compat route redirecionada para `/`.

Fundação técnica está sólida:
- Tokens Navy/Gold limpos (`src/styles/global.css` `@theme`)
- Animações safe (transform + opacity), `prefers-reduced-motion` coberto
- Sem hex hardcoded em componentes; sem `wa.me/` fora de `src/lib/whatsapp.ts`
- `glass-card-bright`, `landing-mesh-bg`, `text-shimmer`, `text-gradient-gold`, `gold-pulse-glow` já existem
- Tabular-nums já aplicado em Investimento e Programa
- `getEntry("products", "otb")` + schema validado

Logo: a alavanca de maior impacto é **unificação estrutural** + refinamento dirigido de copy/CTAs/hierarquia visual, sem reescrever o sistema.

---

## Recommended approach

### Pilar 1 — Unificar `/` e `/otb` (estrutural)

Tornar `src/pages/index.astro` espelho do funil completo de `src/pages/otb.astro` e redirecionar `/otb` → `/` (canônico no host raiz).

**Por quê:** o subdomínio do produto **é** OTB; uma rota interna duplicada (`/otb`) divide sinais de SEO, gera índice duplo no sitemap e força o Hero a apontar `#programa` para uma âncora inexistente.

**Como:**

1. Mover o corpo do `<Layout>` de `src/pages/otb.astro` para `src/pages/index.astro` (incluindo breadcrumb JSON-LD). Ajustar item 2 do breadcrumb para `name: "MBA em Business Aesthetic Health"` apontando para a própria URL (auto-canônica via `Astro.site`).
2. Configurar redirecionamento de `/otb` para `/` via `astro.config.mjs` e manter `src/pages/otb.astro` como fallback estático `noindex` com meta refresh para `/` enquanto não houver autorização explícita para deletar arquivo.
3. Adicionar `/otb` ao filtro de `@astrojs/sitemap` em `astro.config.mjs` (`filter: (page) => !/\/otb\/?$/.test(page)`) — evita split index.
4. Garantir `<link rel="canonical">` aponta sempre para `https://otb.drasacha.com.br` (já é o comportamento padrão de `Layout.astro` + `astro.config.mjs`).

### Pilar 2 — Hero: amarrar autoridade + remover dead anchor

**Arquivo:** `src/components/landing/Hero.astro`

- **Dead anchor:** `<a href="#programa">Conhecer o programa</a>` (linha 84–88) passa a funcionar após Pilar 1 — manter, mas garantir que `Programa.astro` exponha `id="programa"`. Se não houver, adicionar.
- **Sinal de autoridade acima do H1:** introduzir um *eyebrow* discreto antes do badge "Boston" — letter-spacing 0.32em, gold/80, texto: `Próxima edição internacional` (campo novo `hero.eyebrow` no schema + JSON).
- **Side-card metrics (linhas 102–113):** envolver os números (`320`, `10`, `5+`) em `<span class="tabular-nums">` para alinhamento tipográfico premium.
- **Hierarquia do CTA secundário:** "Conhecer o programa" hoje compete visualmente com o gold primário; manter ghost mas reduzir letter-spacing 0 e aumentar gap interno em 8px. Apenas o primário carrega o halo dourado (já é o caso — confirmar).
- **Reveal pattern:** `data-reveal-delay` na lista de badges hoje é `3` — manter; sincronizar lado direito (side-card) com `delay="2"` (já é) — checar visual em 1024px.

### Pilar 3 — Copy SSOT (`src/content/products/otb.json`)

**Princípio:** copy de produto fica em JSON; UI chrome (labels de botão genéricos) também. Schema em `src/content.config.ts` precisa ser estendido para qualquer campo novo.

Mudanças propostas (sujeitas a confirmação do stakeholder por envolverem dates/promessa):

- **Hero**
  - Novo campo: `hero.eyebrow` — string curta (ex.: `"Próxima edição internacional — 2026"`).
  - Subheadline: substituir frase atual por versão mais nítida no outcome:
    > "Imersão internacional em Boston, no ecossistema acadêmico de Harvard. Para profissionais de Saúde Estética Avançada que querem **operar em outro patamar: técnica avançada, visão de negócio e referência internacional**."
  - Confirmar com Laura/Sacha antes de publicar.

- **Investimento**
  - Adicionar `investimento.escassez` (string opcional, ex.: `"Vagas limitadas por edição"`) — renderizada como microcopy abaixo do preço.
  - Garantir que o secundário `secondaryLabel` apareça quando `checkoutUrl` for `null` mas o stakeholder quiser um CTA de "Receber proposta por e-mail" — opcional, **não** implementar nesta rodada sem decisão.

- **FAQ** — adicionar 2 perguntas que reduzem objeção sem violar legal Harvard:
  - "Como funciona a logística da imersão (passagem, hospedagem, traslados)?"
  - "Quantas vagas existem por edição?"
  - Respostas devem terminar com CTA WhatsApp e respeitar guardrails de `Skill('otb-usa') → references/conflitos-fontes.md`.

- **BostonHarvard**
  - `datas` hoje é `"Próxima edição — datas em breve"` — manter até stakeholder confirmar janela; se houver mês/ano, atualizar com `tabular-nums` no componente.

Toda mudança de copy comercial requer confirmação do usuário antes do commit (regra OTB USA: dates/price/legal são protegidos).

### Pilar 4 — Polimento visual dirigido (componentes existentes)

Edições cirúrgicas, sem reescrever:

- **Hero (`Hero.astro`)** — adicionar `<p>` eyebrow + `tabular-nums` no side-card; corrigir overflow do H1 em 360px com `text-balance` no `<h1>`.
- **WhyOTB / TargetAudience / Programa / Modulos / Speakers** — auditar cards para garantir:
  - `card-hover-lift` (já existe utility) presente em todos os cards interativos.
  - Borda neutra padrão; gold-border ativa só em hover/focus.
  - Ícones Lucide com `currentColor`, herdando `text-gold` no hover do container.
- **Modulos.astro** — números `01..10` em `font-serif tabular-nums` + tamanho destacado para criar ritmo editorial.
- **Speakers.astro** — avatars 1:1 com border-ring sutil em gold/25%, hover em gold/45%; nome em `font-serif`, área em `text-xs uppercase tracking-[0.22em] text-gold/80`.
- **FAQ.astro** — manter padrão `<details>` nativo (motion-safe). Confirmar zero animação de `height`.
- **SectionDivider.astro** — garantir alto/baixo contraste alternado entre seções (tonal step nível 1 de DESIGN.md §9). Não animar.
- **Investimento.astro**
  - Acrescentar microcopy de escassez abaixo do preço (vazio se `investimento.escassez` ausente).
  - Trocar bolinha do parcelamento (atual `bg-gold` w-1) por mini ícone `chevron-right` em gold/60 — leitura mais executiva.
- **Footer.astro** — checar que `tabular-nums` está em qualquer número (telefone, ano copyright).

### Pilar 5 — CTAs (disciplina de hierarquia)

Garantir que em **cada viewport**:

- **Apenas 1 CTA primário gold + halo** visível por dobra.
- Floating WhatsApp button continua como CTA persistente low-emphasis, sem halo (não compete com o primário inline).
- Todo CTA WhatsApp passa por `whatsappUrlWithText()` (já é o caso).
- `aria-label` presente em todos os anchors com ícone-prefixo (já é o caso no Hero/Investimento).
- Foco visível: ring 2px gold + offset 2px (`:focus-visible` global, ok).

---

## Critical files

| Arquivo | Mudança |
|---|---|
| `src/pages/index.astro` | Reescrever para espelhar o funil completo de `otb.astro` + breadcrumb JSON-LD autoreferente |
| `src/pages/otb.astro` | Fallback estático `noindex` com meta refresh para `/`; deletar somente com confirmação explícita |
| `astro.config.mjs` | Corrigir `site` para host canônico real + `redirects: { "/otb": "/" }` + filtro `@astrojs/sitemap` exclude `/otb` |
| `src/content.config.ts` | Estender schema: `hero.eyebrow` opcional, `investimento.escassez` opcional |
| `src/content/products/otb.json` | Eyebrow, subheadline refinada, escassez, +2 FAQs (pendente confirmação stakeholder) |
| `src/components/landing/Hero.astro` | Eyebrow render, `tabular-nums` no side-card, `text-balance` no H1 |
| `src/components/landing/Programa.astro` | Garantir `id="programa"` na `<section>` |
| `src/components/landing/Investimento.astro` | Render condicional de `escassez`, ícone `chevron-right` no parcelamento |
| `src/components/landing/Modulos.astro` | Numeração `01..10` em `font-serif tabular-nums` realçada |
| `src/components/landing/Speakers.astro` | Avatar ring gold, tipografia editorial nome/área |
| `src/components/landing/SectionDivider.astro` | Confirmar tonal step contraste alto/baixo |
| `src/components/landing/FAQ.astro` | Confirmar `<details>` nativo, sem height tween |

Utilidades já existentes a reutilizar (de `src/styles/global.css`): `landing-mesh-bg`, `glass-card`, `glass-card-bright`, `card-hover-lift`, `card-glow-hover`, `gold-pulse-glow`, `float-gentle`, `text-shimmer`, `text-gradient-gold`, `gold-glow`.

Helpers já existentes a reutilizar: `whatsappUrlWithText()` em `src/lib/whatsapp.ts`, `Icon` em `src/components/icons/Icon.astro`, `getEntry("products", "otb")` em `astro:content`.

---

## Order of execution

1. **Pilar 1** — Unificação estrutural (`index.astro` + redirect + sitemap exclude). Validar build + crawl local antes de seguir. **Sem mudança de copy ainda.**
2. **Pilar 4** — Polimento visual componente-a-componente (Hero side-card → Modulos → Speakers → Investimento). Cada componente em commit isolado conforme `commit.md` (scope: `feat(site)` ou `style(site)`).
3. **Pilar 3** — Atualização de copy + schema (`hero.eyebrow`, `investimento.escassez`, +2 FAQs). **Bloqueador:** confirmação do stakeholder Laura/Sacha sobre frase do hero, escassez e novas FAQs.
4. **Pilar 2** — Hero copy + dead anchor (depende de Pilar 1 ter movido `Programa` para `/`).
5. **Pilar 5** — Auditoria final de hierarquia CTA visualmente, viewport por viewport (mobile 360, 768, 1024, 1280).

---

## Verification

Após cada pilar:

```bash
bun run lint
bunx astro check
bun run build
```

Smoke específico:

```bash
# Hex fora do @theme (esperado vazio):
grep -rnE "#[0-9a-fA-F]{3,8}" src --include="*.astro" --include="*.tsx" \
  | grep -v "global.css" | grep -v "theme-color"

# wa.me fora do helper (esperado vazio):
grep -rn "wa.me/" src --include="*.astro" --include="*.tsx" --include="*.ts" \
  | grep -v "src/lib/whatsapp.ts"

# âncoras vazias (esperado vazio):
grep -rnE 'href="#"' src/components src/pages

# Heading discipline — 1 H1 por página:
grep -rnE "<h1[^>]*>" src/pages | wc -l   # esperado: 1
```

Validação manual em `bunx --bun astro dev`:

- `/` renderiza o funil completo (Hero → FAQ).
- `/otb` redireciona 301 para `/` (testar via curl/devtools Network panel).
- Tab pela página: primeiro focus é o skip link; Enter pula para `#conteudo-principal`.
- DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`: zero animação de reveal/mesh/shimmer.
- DevTools → Network → throttle Slow 4G + cache disabled: LCP < 2.5s no Hero image; CLS = 0.
- DevTools → JS off: noscript fallback revela todo conteúdo.

Final gate antes de PR:

```bash
bun run lint && bunx astro check && bun run build
bun run lighthouse:audit   # se script existir em package.json
```

Branch: `dev-test` (atual) → PR para `main`. Nunca merge direto. Commit format: Conventional Commits com scope `site`/`content`/`config` conforme `.claude/rules/commit.md`.

---

## Out of scope (não fazer nesta rodada)

- Adicionar adapter SSR ou `ClientRouter` (proibido por `.claude/rules/astro.md`).
- Novas dependências (Framer Motion, etc.) — animações via CSS+IntersectionObserver já bastam.
- Redesign do sistema de tokens — palette/typography mantida.
- Checkout próprio — fluxo continua via WhatsApp Laura.
- Mudança em legal disclaimer Harvard — só com autorização explícita.
- Reescrita do Hero background image / asset binário.

---

## Open questions para o usuário

1. **Pilar 3 copy** — autoriza a redação refinada de subheadline + `eyebrow` "Próxima edição internacional — 2026", ou prefere texto neutro sem ano (`"Próxima edição internacional"`)?
2. **Escassez** — pode publicar `"Vagas limitadas por edição"` sem número exato, ou prefere omitir até confirmar nº de vagas?
3. **FAQ logística** — pode publicar resposta "Passagem e hospedagem são responsabilidade do participante. Sob consulta para o pacote opcional via Laura" ou deixar como TBD?
