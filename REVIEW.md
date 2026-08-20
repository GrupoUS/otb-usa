# REVIEW.md — o que este projeto recusa mergear

> Contrato de revisão do **OTB Estados Unidos — Grupo US**. Responde a uma pergunta só: o que não
> entra. O *processo* de revisão (caminhos independentes, consolidação, veredito) vem do plugin
> graph-powers via `/pr-review`; este arquivo não o repete.
>
> Escopo do produto: raiz `PRODUCT.md`. Sistema visual: raiz `DESIGN.md`. Formato de commit e gate
> manual: `.claude/rules/commit.md`.

---

## 1. Os gates, e o que cada um prova

| Gate | Comando | Prova | **Não cobre** |
|---|---|---|---|
| Lint | `bun run lint` | Biome + oxlint em `src` e `astro.config.mjs` | `src/layouts/*` está fora do oxlint (`--ignore-pattern`); nada em `scripts/`, `api/`, `tests/`, `integrations/` |
| Type check | `bunx astro check` | Props, frontmatter e o schema de `src/content.config.ts` fecham | Dado que chega em runtime — payload do form, resposta do Apps Script, env ausente |
| Build | `bun run build` | Compila e gera `dist/` | Que a página **funciona**: layout, dobra, motion e contraste não são vistos por ele |
| Testes | `bun test` | 4 arquivos sobre o `dist/` construído: grafo JSON-LD, indexabilidade, origens de CTA, writer do Apps Script | Qualquer componente da landing — não existe teste de componente. Nenhum teste de navegador |
| Smoke responsivo | `bun run smoke` (com `bun run preview` de pé) | Dobra, overflow, modal e foco em 6 viewports reais | Só roda quando alguém lembra: **não está em `predeploy`** |
| Lighthouse | `bun run lighthouse:audit` | Perf/A11y/BP/SEO em servidor local | Números de campo; CWV aqui é advisory (`gates.advisory: true`) |
| Deploy | `bun run deploy:verify` | O HTML servido em produção bate byte a byte com `dist/` | Nada antes do push — ver B7 |

`bun run predeploy` encadeia lint → astro check → build → test. **O smoke e o Lighthouse ficam de
fora dele**, e é aí que moram os defeitos das linhas B4 e B5 abaixo.

## 2. Achados que bloqueiam — a lista deste repositório

Cada linha cita o commit que a originou. Regra sem incidente aparece marcada como *preferência*.

| # | Achado bloqueante | Por que bloqueia |
|---|---|---|
| B1 | Redirect de conversão que não espera o callback do GTM | O evento `lead_submit` corria com o redirect e se perdia — `798a572`. Toda mudança em `src/pages/redirecionando.astro` prova que o evento sai antes da navegação |
| B2 | Máscara/normalização de telefone que assume formato brasileiro | `+1 617 555 0134` chegou à SDR como `(1) 61755-50134`, com o próprio placeholder do campo convidando o DDI — `920811b`. Lead internacional é público-alvo, não exceção |
| B3 | `site`/canonical/`og:url`/JSON-LD/sitemap apontando para host que não é nosso | `astro.config.mjs` declarava `otb.drasacha.com.br`, um WordPress de terceiro; toda página deployada mandava o Google para a página de outra pessoa — `a242f15`. Mudança de host toca `astro.config.mjs` + sitemap + `robots.txt` na mesma mudança |
| B4 | CTA primário fora da dobra em viewport curto | Ficou inteiramente abaixo da dobra em 1366×768, 1440×789, 1280×800 e 375×553 — `bd91311`. `min-h-[100svh]` é piso, não teto |
| B5 | Texto de KPI/kicker que estoura a própria célula do grid | "CERTIFICAÇÕEⓂSESES DE PLATAFORMA" renderizou sobreposto em toda largura ≥1024px, **em produção** — `8156b58` |
| B6 | Regressão de CLS acima de 0 | Fonte da dobra sem preload levou CLS de 0 → 0.06 no mobile — `85a6472`. CLS é o único número da tabela de CWV que não é advisory |
| B7 | Commit que fica só local quando o deploy foi pedido | O Vercel constrói de `origin/main`; um commit sem push publica nada parecendo pronto. `scripts/push-reminder.sh` avisa e **não** bloqueia — ver `.claude/rules/commit.md § Deploy` |
| B8 | Padrão de exclusão não ancorado em `.vercelignore` | `scripts` sem barra inicial casou em qualquer profundidade, o Vercel removeu `src/scripts/` e o build morreu em "Could not resolve ../scripts/motion" — `752f328` |
| B9 | `<script>` de JSON-LD auto-fechado | HTML não permite; o parser trata o resto do `<head>` como conteúdo — `bccf6fd` |
| B10 | Payload de lead alterado em um lado só | `src/lib/leads.ts`, `api/leads.ts`, o `Code.js` do Apps Script e `tests/` andam juntos — `b43ddf3`. Mexer em `LEAD_SHEET_HEADERS` ainda exige migrar a planilha |
| B12 | `git checkout -- <path>` ou `git restore <path>` com a árvore suja | Destroem trabalho não commitado e o git não traz de volta — não existe reflog para o que nunca foi commitado. Achado pela verificação de 2026-08-20, **sem incidente aqui**: o piso destrutivo do graph-powers lista `clean -f`, `reset --hard`, `stash drop` e `filter-branch` mas devolve `allow` para estes dois, e um `allow` de hook passa por cima de `permissions.ask`. Coberto por `.claude/hooks/guard_worktree_discard.py`, que só nega com a árvore suja; opt-in `OTBUSA_ALLOW_DISCARD=1` |
| B11 | *(preferência, sem incidente)* Copy de produto hardcoded em `.astro`/`.tsx`, `wa.me` fora de `src/lib/whatsapp.ts`, hex fora do `@theme`, `prerender = false`, `ClientRouter` | Invariantes cardinais de `.claude/CLAUDE.md`. Nunca quebraram aqui — entram como preferência forte, não como cicatriz |

## 3. Checagens mecânicas

Rodadas em 2026-08-20; a saída é o que está na coluna da direita.

| Checagem | Comando | Resultado hoje · o que um hit significa |
|---|---|---|
| Hex fora dos tokens | `grep -rnE '#[0-9a-fA-F]{3,8}\b' src --include='*.astro' --include='*.tsx' --include='*.ts' \| grep -v src/styles/global.css` | **1 hit**, o `<meta name="theme-color" content="#080808">` de `Layout.astro:111` — exceção documentada. Qualquer outro hit bloqueia |
| WhatsApp fora do SSOT | `grep -rn 'wa\.me/' src \| grep -v src/lib/whatsapp.ts` | **0**. Um hit bloqueia |
| Ruído de produção | `grep -rnE '\bconsole\.log\(' src --include='*.astro' --include='*.tsx' --include='*.ts'` | **0**. Um hit bloqueia |
| Origens de CTA nos dois lados | comparar `LEAD_CTA_ORIGINS` (`src/lib/leads.ts:1`) com `CTA_ORIGINS_` (`integrations/google-apps-script/otb-leads/Code.js:20`) | Nomes diferentes de propósito — o que precisa bater é o **conteúdo** dos arrays. Divergência bloqueia (B10) |
| Descarte de árvore suja | `.claude/hooks/guard_worktree_discard.py` (PreToolUse Bash) | Nega `git checkout -- <path>` e `git restore <path>` enquanto houver mudança não commitada. Árvore limpa não gera prompt. Ver B12 |
| Um `<h1>` por página | `grep -rc '<h1' src/pages/*.astro` + o componente de herói | `index.astro` tem 0 porque o `<h1>` mora em `Hero.astro:119`. Dois `<h1>` na mesma página bloqueiam |

## 4. Superfícies com barra mais alta

| Superfície | Caminhos | Exigir a mais |
|---|---|---|
| Lead / PII | `src/lib/leads.ts`, `src/lib/lead-client.ts`, `api/leads.ts`, `integrations/google-apps-script/otb-leads/Code.js`, `src/components/landing/{LeadFormDialog,Aplicacao}.astro` | Os quatro lados na mesma mudança + teste. `<label>` real, validação, erro acessível e consent LGPD em todo campo novo. Nenhum PII em log |
| Tracking | `src/layouts/Layout.astro` (GTM inline), `src/pages/redirecionando.astro` | Evento novo = aprovação. Provar que o callback do GTM roda antes do redirect (B1) |
| SEO / canonical | `astro.config.mjs`, `src/layouts/Layout.astro`, `src/pages/index.astro` | Host, sitemap e `robots.txt` numa mudança só; conferir que o canonical é `otb.gpus.com.br` (B3) |
| Deploy | `astro.config.mjs`, `vercel.json`, `.vercelignore` | Padrão de exclusão ancorado com barra inicial (B8) e `bun run deploy:verify` depois do push |
| Dobra e responsivo | `src/components/landing/Hero.astro`, `StickyCta.astro`, `src/styles/global.css` | `bun run smoke` rodado, não presumido (B4, B5, B6) |
| Conteúdo | `src/content/products/otb.json` + `src/content.config.ts` | Schema e JSON juntos. Data, lote, credencial e promessa são fatos verificáveis — não confirmado entra como PROPOSTA |

## 5. Autoridade de aprovação

Repositório de um dono só; por papel:

| Mudança | Quem aprova |
|---|---|
| Dentro de padrão existente, local e reversível | O agente entrega com gates verdes; o dono do repositório aprova no diff |
| Dependência nova, deleção de arquivo, mudança de forma de schema | Dono do repositório, antes |
| Destino de lead, payload, IDs de pixel/tag, variável de ambiente | Dono do repositório, sempre e explicitamente |
| `astro.config.mjs`, `vercel.json`, commit, push, deploy | Dono do repositório, no turno em que foi pedido — os guardrails exigem `OTBUSA_ALLOW_COMMIT` / `OTBUSA_ALLOW_PUSH` |
| Copy, oferta, datas, credenciais, qualquer promessa na landing | Dono do repositório, como voz da marca (Dra. Sacha · Grupo US) |

## 6. O que este projeto **não** revisa

Formatação (Biome resolve), preferências já decididas na raiz `DESIGN.md`, e o teto de motion —
animar qualquer propriedade é doutrina aqui, então "isso deveria ser `transform`" não é achado.
Números de CWV que não sejam CLS são advisory: medir e anotar, nunca travar merge. Rediscutir
decisão fechada treina as pessoas a passarem o olho na revisão.
