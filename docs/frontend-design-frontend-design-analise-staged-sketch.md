# Plano — Aprimoramento forte da landing OTB USA (Boston · acento USA/Harvard)

## Contexto

A landing `otb-usa` (MBA em Business Aesthetic Health · 3ª Edição Boston, 19–21 abr 2027) já existe, dark-first Navy/Gold, bem estruturada (SSOT em `src/content/products/otb.json`, ~11 seções, `Layout.astro` com reveal + JSON-LD). O pedido: **aprimorada forte e geral** mantendo o canon GPUS Navy/Gold, porém **diferenciando** com cores dos EUA + **Harvard crimson**, direcionando o posicionamento para Boston/EUA; e **importar fotos e dados** do site irmão `https://institutoiese.com.br/otb/` (mesmo programa "OTB"), com **nova galeria de turmas**.

Decisões do usuário (confirmadas):
- **Cor**: acento *equilibrado* — vermelho ganha presença no hero + seções-chave (Boston·Harvard, badges, divisores, glows) ao lado do gold; navy continua base. Sem virar bandeira.
- **Fotos**: importar **todas** as categorias (campus/Boston/tour, alunos/networking, docentes, prática/cadaver lab), baixadas localmente em `public/images/otb/` (sem hotlink).
- **Conteúdo**: enriquecer seções existentes **+ nova galeria** de turmas. Alegações factuais novas só como **PROPOSTA** (não afirmar como fato).

Resultado pretendido: landing visualmente mais ousada e "americana/Boston", com prova social fotográfica real, mantendo Navy/Gold como DNA, a11y e contrato estático Astro intactos, e o disclaimer legal "sem vínculo oficial com Harvard" preservado.

---

## Estratégia de cor — acento equilibrado (sem hex hardcoded fora de `@theme`)

Adicionar em `src/styles/global.css` no bloco `@theme` (única fonte de hex permitida):

```css
/* Crimson / USA accent — Boston · Harvard positioning */
--color-crimson:        #A51C30; /* Harvard crimson — acento principal */
--color-crimson-bright: #C8102E; /* USA flag red — gradientes/realces */
--color-crimson-dark:   #6E1423; /* profundidade/sombra */
```

Novas `@utility` espelhando as de gold (mesmo padrão `color-mix`, zero hex inline):
- `bg-crimson-tint-10`, `border-crimson-mid-35`
- `text-gradient-crimson` (crimson → crimson-bright)
- variante de glow crimson (espelha `gold-pulse-glow` → ex. `crimson-pulse-glow`) para a seção Boston·Harvard e o `data-glow-card`
- variante de mesh: adicionar **um** radial crimson 6–8% ao `landing-mesh-bg` existente (ao lado dos gold), sem remover os atuais

Aplicação por seção (equilibrado):
- **Hero**: radial crimson sutil no mesh + eyebrow/badge "3ª Edição · Boston" em crimson; CTA primário **continua gold** (regra de conversão GPUS); linha/realce de acento crimson discreta.
- **BostonHarvard**: crimson vira acento principal (glow, underline dos stats, borda dos cards), gold mantido nos ícones de ação.
- **Badges/eyebrows/divisores**: alternar crimson em "Boston · EUA" / divisores-chave.
- **Investimento / Speakers / FAQ / WhyOTB / TargetAudience**: acentos crimson pontuais (bordas, hover-glow), gold preservado em CTA e hierarquia primária.

**Guardrails de cor (hard):**
- Gold permanece acento primário de CTA/conversão e do focus-ring; **não** substituir por crimson.
- **Contraste**: crimson (`#A51C30`) sobre navy `#1a1a2e` é baixo para texto de corpo → usar crimson em **bordas/glow/grandes display/acentos**, nunca como cor de body text em navy. Texto continua `text-primary`/gold; crimson em texto só em tamanho grande/superfície clara, validado WCAG.

---

## Fase 0 — Fundação (executar ANTES do chain de design)

### 0a. Importar fotos do IESE → `public/images/otb/`
Baixar (PowerShell `Invoke-WebRequest`) as melhores ~8–12 fotos das URLs mapeadas; preferir as versões `-scaled`. Destinos sugeridos:
- Galeria/eventos → `public/images/otb/gallery/turma-evento-{n}.jpg`
  (ex.: `.../2025/10/0-scaled.jpg`, `7-2-scaled.jpg`, `DSC08469-scaled.jpg`, `DSC07775-scaled.jpg`, `DSC07747-scaled.jpg`, `DSC07619-scaled.jpg`)
- Aula/campus → `public/images/otb/gallery/aula-{n}.jpg` (ex.: `38-scaled.jpg`, `site-pratica.png`)
- Prática/cadaver lab → `public/images/otb/gallery/pratica-{n}.jpg` (ex.: `DSC07320-scaled.jpg`, `DSC07420-scaled.jpg`) — **ver risco abaixo**
- Docente Carol Teixeira (se incluída como autoridade) → `public/images/otb/speakers/speaker-carol.jpg` (`.../2024/11/Foto-Carol-1024x1024.png`)

Depois: **otimizar** (resize ≤1600px lado maior, recompressão) via script one-off `bun` + `sharp` (ou ferramenta equivalente). Registrar dimensões reais para usar `width`/`height` explícitos (CLS = 0).

### 0b. Tokens + utilities crimson em `src/styles/global.css`
Adicionar os 3 tokens `@theme` + utilities descritos acima. **Não** alterar nenhum token/utility gold existente. (Arquivo **não** é protegido.)

### 0c. Enriquecer conteúdo + galeria em `src/content/products/otb.json`
- Expandir o bloco **`turmas`** (que já é `array de fotos`) para uma **galeria** mais rica: adicionar as fotos importadas + copy melhorada ("Veja como foi. Imagine onde você estará."). **Sem alterar schema** se `turmas.fotos` aceitar N itens (preferido — evita tocar arquivo protegido).
- Melhorar copy/dados das seções existentes (hero, why, audience, programa, bostonHarvard, investimento, faq) inspirado no tom premium/aspiracional do IESE, **sem inventar fatos**.
- `otb.json` **não** é protegido; pode editar direto.

> Se a galeria exigir campo novo no schema (ex.: legenda por foto), isso toca `src/content.config.ts` (**arquivo protegido** — `protect_files.py` vai pedir confirmação). Preferência: **evitar**, expandindo `turmas.fotos`. Se inevitável, fazer schema + JSON + leitor numa só mudança, com razão explícita.

---

## Fase 1–5 — Chain `/design-improve` (full landing, frontend-specialist foreground)

Escopo: `src/components/landing/**` + `src/pages/index.astro` + `src/styles/global.css` + `src/content/products/otb.json`. Cada fase grava report em `.claude/agent-memory/design-improve/<fase>.md`. `/verify` roda **uma vez** no fim.

1. **audit** — varrer todos os componentes da landing: defeitos de hierarquia, a11y, CLS, contraste, motion, consistência de tokens. Corrige in-phase se achar defeito.
2. **bolder** — ousar na hierarquia/peso/profundidade: hero mais marcante, cards Boston·Harvard, stats fresh specimens, presença dos speakers. Gold + crimson disponíveis; respeitar canon.
3. **animate** — reveals/parallax/glow expressivos via `[data-reveal]` + utilities; `prefers-reduced-motion` obrigatório em toda mudança de motion; preferir transform/opacity.
4. **colorize** — aplicar a estratégia crimson "equilibrado" por seção (tokens já existem da Fase 0b → sem STOP). Só tokens semânticos, zero hex novo.
5. **overdrive** — passe dramático final; reexecutar os 6 gates Maestro. **Pré-flight ASK** dispara se tocar superfícies protegidas (`content.config.ts`, `astro.config.mjs`, `whatsapp.ts`) — confirmar antes.

Novo componente (se galeria virar seção própria): `src/components/landing/Galeria.astro`, plugado em `src/pages/index.astro` na ordem (sugestão: logo após `BostonHarvard` ou substituindo/expandindo `Turmas`). Alternativa preferida: **evoluir `Turmas.astro`** numa galeria em grid/masonry (sem novo arquivo, sem mexer em `index.astro`).

### Arquivos críticos a modificar
- `src/styles/global.css` — tokens + utilities crimson (Fase 0b) e ajustes de motion/depth (Fase 3/5).
- `public/images/otb/` + `public/images/otb/gallery/` — fotos importadas/otimizadas (Fase 0a).
- `src/content/products/otb.json` — copy enriquecida + galeria (Fase 0c).
- `src/components/landing/{Hero,BostonHarvard,Turmas,Speakers,Investimento,WhyOTB,TargetAudience,Programa,Modulos,FAQ,SectionDivider,Footer}.astro` — colorize/bolder/animate.
- `src/pages/index.astro` — apenas se adicionar/reordenar seção de galeria.
- `src/content.config.ts` — **evitar**; só se schema novo for inevitável (protegido).

---

## Verificação (fim do chain)

`/verify quick` → gates do projeto:
1. `bun run lint`
2. `bunx astro check`
3. `bun run build`

Smoke manual adicional:
- **Hex scan**: nenhum `#[0-9a-fA-F]{3,8}` em `.astro`/`.tsx`/fora de `global.css @theme` (exceção `<meta theme-color>`).
- **WhatsApp scan**: nenhum `wa.me/` fora de `src/lib/whatsapp.ts`; mensagem CTA começa com `"Olá, Laura!"`.
- **Contraste WCAG**: pares crimson/navy validados (crimson só em acento/borda/glow/large; nunca body text em navy).
- **Reduced-motion**: DevTools → emular `prefers-reduced-motion: reduce` → animações off; reveals visíveis.
- **JS off**: todas as seções (incl. galeria) renderizam (fallback `<noscript>`/`.js`).
- **Imagens**: `width`/`height` explícitos em todas as novas fotos (CLS = 0); hero eager + `fetchpriority="high"`, galeria `loading="lazy"`.
- **Disclaimer legal**: "sem vínculo oficial com Harvard" preservado em FAQ[0] + BostonHarvard card.

---

## Riscos e guardrails

- **Cadaver lab / fresh specimens (você pediu incluir)**: imagens clínicas gráficas podem **violar políticas de anúncios** (Meta Pixel/Google Ads presentes via tracking) e impactar o tom premium. Mitigação: usar na galeria com enquadramento sóbrio, **não** above-fold, e tratar como diferencial técnico discreto. Recomendo reavaliar se a página roda tráfego pago.
- **Harvard (legal)**: acento "Harvard crimson" reforça associação visual a Boston/Harvard — **manter** o disclaimer de não-afiliação. Não usar logos/marcas de Harvard.
- **Direitos das fotos**: assumido que IESE é site irmão (mesma titularidade/uso); confirmar se houver dúvida antes de publicar.
- **Arquivos protegidos** (`content.config.ts`, `astro.config.mjs`, `whatsapp.ts`, `package.json`, etc.): hook `protect_files.py` bloqueia Write/Edit — evitar; se necessário, razão explícita + confirmação.
- **Contrato estático**: sem SSR/SPA/`ClientRouter`; galeria deve ser Astro puro (sem ilha React salvo interatividade provada).
- **Peso de imagem/LCP**: otimizar todas as fotos importadas; orçamento de bundle inalterado (sem libs novas).

---

## Sequência de execução
1. Fase 0a → baixar + otimizar fotos.
2. Fase 0b → tokens/utilities crimson em `global.css`.
3. Fase 0c → enriquecer `otb.json` + galeria.
4. Chain `/design-improve` Fases 1–5 (audit → bolder → animate → colorize → overdrive), frontend-specialist foreground, reports em `.claude/agent-memory/design-improve/`.
5. `/verify quick` + smoke manual.
6. (Opcional) `/evolve` para capturar aprendizado.
