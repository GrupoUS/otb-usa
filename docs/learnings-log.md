# Grupo US — Learnings log

> Append-only chronological project decisions. New entries on top.
> Tier 3 — read on demand. Each entry: **date · area · problem · solution · validation**.
> Relocated from root `AGENTS.md` on 2026-05-02 to keep Tier 1 under the 500-line budget.

---

### [2026-05-02] AGENTS.md → behavioral + orchestrator (drop rule duplication)

**Problem:** Root `AGENTS.md` (345 lines) duplicated cardinal rules, behavior bullets, and decision-authority table already canonical in `.claude/CLAUDE.md`. Combined Tier 1 = 515 lines, over the 500-line budget. 240-line learnings log inside AGENTS.md was the main offender. No commands / agents / skills / MCPs / terminal-execution orchestration table — agents had to discover invocation patterns ad hoc.

**Solution:** Refactored modeled on `D:\Coders\neondash\AGENTS.md` (214-line behavioral + orchestrator). New AGENTS.md (~150 lines): tier-loading table, core principles, commands table (12), agents matrix (12 with Background flag), skills phase ordering, MCP servers, terminal execution discipline, debug-on-error PAUSE→THINK→HYPOTHESIZE→EXECUTE, authority precedence (7 levels), templates table, "where rules live" pointer, last-3 learnings + link to this log. Cardinals stay in CLAUDE.md (cardinals are project-invariant per Anthropic guidance). Learnings log relocated here. Plan: `docs/analise-o-d-coders-neondash-agents-md-pa-curious-wave.md`.

**Pattern:** AGENTS.md (agents.md spec) is a **behavioral + interop** layer also picked up by Cursor / Aider / Codex / Continue. It defines **how** the agent operates (commands, agents, skills, MCPs, terminal discipline, escalation) and **points to** technical rules — never duplicates them. Cardinal rules belong to CLAUDE.md. Learnings logs belong to a dedicated Tier-3 file. Tier 1 ceiling enforced via `wc -l AGENTS.md .claude/CLAUDE.md` < 350.

**Validation:** `bun run lint && bunx astro check && bun run build` clean.

---

### [2026-05-02] `.claude/rules/` generified — universal do/don't, Astro-specific to skill, project SSOT to grupo-us

**Problem:** As 5 regras em `.claude/rules/` (`frontend.md` 165 hits, `DESIGN.md` 114, `stability.md` 139, `seo.md` 32, `README.md` 10) carregavam mistura pesada de: (1) sintaxe Astro project-specific (`client:idle`/`client:load`/`client:visible`, `getCollection`, `astro.config.mjs::redirects`, `<ClientRouter />` proibido, `<Image>` discipline, `prerender = false` cardinal); (2) tokens hardcoded do projeto (Navy `#1a1a2e`, Gold `#d4af37`, Playfair Display, Inter, semantic HSL com valores específicos, `bg-whatsapp` `#25d366`); (3) operacional do projeto (WhatsApp SDR Laura SSOT — `WHATSAPP_SDR_E164`, `whatsappUrlWithText`, `isWhatsAppDestination`, "Olá, Laura!" prefix; redirect tri-sync; `Layout.astro` skip-link / `<noscript>` reveal / `<main id="conteudo-principal">`; brand voice "Olhar de dono"; product list TRINTAE3/Mentoria Black NEON/etc.); (4) tooling Bun-only (`bun run lint`, `bunx astro check`, `bun run build`). Quem copiasse `.claude/rules/` para outro projeto herdaria nomes de produto, comandos Bun, regras de hidratação Astro e SSOT do funil drasacha.

**Solution:** Auditoria 3-coluna em `docs/plans/2026-05-02-rules-generic-migration.md`. **Generic rules** rewrite (Sprint 3): `frontend.md` (~140 linhas) — universal frontend do/don't (component placement, hydration philosophy, content data SSOT, forms, external surfaces baseline, perf budget, a11y plumbing); `DESIGN.md` (~230 linhas) — universal color/typography/components/layout/iconography/motion/imagery/depth/focus do/don't sem hex específicos; `stability.md` (~210 linhas) — A–L checklist universal + render-mode invariants + CWV gates + smoke template com `${tooling.*}` placeholders + anti-patterns + debug triage cross-framework; `seo.md` (~140 linhas) — locale/routes/sitemap/robots/OG/JSON-LD shape sem URLs específicas; `README.md` rewrite — cross-project portability + tech-stack/project signal patterns. Cada regra termina com seção "Stack & project signals" apontando para skills.

**Astro skill expansion** (Sprint 2): novo `.claude/skills/astro/references/gpus-overlay.md` (~200 linhas) carregando render-mode invariants do site, redirect tri-sync (`externalSiteUrl` + `astro.config.mjs::redirects` + sitemap `filter()`), hydration project rules (`client:load` só `WhatsAppFloatingButton`, hero islands `client:idle`), `Layout.astro` contracts (skip link first focusable, `<main id="conteudo-principal" tabindex="-1">`, `<noscript>` reveal, `[data-reveal]` IntersectionObserver, Google Fonts preconnect), Content Collections SSOT crossref, image discipline (NeonStory below-fold), smoke commands (`bun run check:external-urls`). `astro/SKILL.md` ganhou linha `references/gpus-overlay.md` na tabela Detailed References + 6 novas linhas em Common Mistakes (client:load creep, prerender override, ClientRouter forbidden, hardcoded landing copy, image priority drift, redirect tri-sync). `astro/references/content-collections.md` ganhou seção SSOT pattern com anti-pattern vs SSOT example + Quick edit paths table.

**Project SSOT migration** (Sprint 4): novo `.claude/skills/grupo-us/references/whatsapp-ssot.md` (~170 linhas) consolidando WhatsApp SDR Laura — `WHATSAPP_SDR_E164` valor + `whatsappUrlWithText` + `WHATSAPP_DEFAULT_SITE_MESSAGE` + `isWhatsAppDestination` dedup + "Olá, Laura!" convention + `aria-label` includes "Laura" + 4 anti-patterns + 3 smoke commands + debug triage. `grupo-us/SKILL.md` ganhou linha `whatsapp-ssot.md` em Bundled references. CLAUDE.md routing matrix reescrita: 14 das 17 rows agora apontam para (generic rule + relevant skill); novo header "Tech-stack skills auto-trigger" + Pointers section reorganizada em 3 grupos (Generic universal rules / Tech-stack skills / Project skills). AGENTS.md "Where rules live" table igualmente atualizado com linhas separadas para gpus-overlay + whatsapp-ssot.

**Pattern:** **Skills cross-project** carregam universal do/don't + ponteiros para skills tech-stack ou project; **tech-stack skills** carregam framework patterns + opcional `references/<project>-overlay.md` para overrides do projeto host; **project skills** carregam SSOT operacional (helpers como WhatsApp builder, CTA dedup, brand voice). Anthropic skills auto-trigger (description match) + progressive disclosure: ~100 tokens/skill no startup, body load só sob demanda — net token equivalente ou menor que regras monolíticas. **Universal substance** (hydration philosophy, content SSOT concept, layout-property animation forbidden, semantic tokens > hex, ONE icon library, WCAG AA minimums, skip-link first focusable, `prefers-reduced-motion`, `<noscript>` fallback, FAQ grid `0fr/1fr`, `href="#"` forbidden) preservada nas rules. **Project specifics** (`client:idle` vs `client:load` exact directive names, `WHATSAPP_SDR_E164` specific value, redirect tri-sync exact code paths, Navy/Gold hex values, "Olá, Laura!" exact phrase) migrada para skills. **Cardinals (8)** ficam em CLAUDE.md tier-1 sempre carregados — skills carregam *implementação detail*, cardinais carregam *invariante*.

**Validation:** `bunx astro check` → 0 errors / 0 warnings / 92 hints; `bun run build` → 9 pages built clean (2.72s). Lint failures pré-existentes (CRLF em `src/styles/global.css`) — esta PR só toca `.claude/rules/`, `.claude/CLAUDE.md`, `AGENTS.md`, `.claude/skills/{astro,grupo-us}/`. Grep verification: `grep -E "(?i)\bAstro\b|\bbun\b|\bbunx\b|client:|getCollection|getEntry|@theme|tailwind|playfair|inter\b|lucide|whatsapp|wa\.me|laura|sacha|drasacha|grupous|gpus|grupo us|navy|gold|mentoria|trintae3|comunidade-us|otb-dubai|namesa|kiwify|black neon|<Image|prerender|ClientRouter|data-reveal|conteudo-principal|pt-BR|grupous\.com\.br" .claude/rules/` retorna apenas hits intencionais em "Stack signals" tables (e.g., "load `astro` skill quando `*.astro`") e exemplos de mixing libraries (`Lucide + Material Symbols`) — todas como teaching anchors, não como rules project-specific.

### [2026-05-02] planning + senior-prompt-engineer skills — generic / portable

**Problem:** Após o slim de `planning`, ambas as skills carregavam exemplos hardcoded do gpus-site (Astro Content Collections, `bunx astro check`, `bun run build`, `client:load`/`client:idle`, `wa.me`, Lucide, Navy/Gold, hex outside `@theme`, redirect tri-sync, "Olá, Laura!", brand voice manual). Isso travava o reuso em outros projetos — quem copiasse `.claude/skills/planning/` ou `.claude/skills/senior-prompt-engineer/` herdaria nomes de produtos, comandos Bun, regras de hidratação Astro e sample data do funil drasacha.

**Solution:** Generificadas para serem portáveis. **`planning`:** SKILL.md restaurou referência a `${overlay}/layer-map.md` como fonte project-specific da layer chain; layer template fallback voltou genérico (Data → Service → Router → Client → Presentation → Cross-cutting → Verification); auth scope marcado opcional ("skip when project has no auth"); `Self-Review Checklist` referencia "host project's cardinal rules" em vez de listar os 8 do gpus-site; comandos verify usam `${tooling.packageManager} run ${tooling.typeChecker}` em vez de `bunx astro check`. `references/02-plan.md` reescrito com placeholders `<src>/<module>/<file>.<ext>`, `${tooling.testRunner}`. `references/03-risk.md` reescrito com falhas genéricas (build/logic/integration/data/auth/perf/security/a11y/SEO/cross-cutting) e remete falhas project-specific ao host `.claude/rules/stability.md` ou `${overlay}/layer-map.md`. **`senior-prompt-engineer`:** SKILL.md tagline "any host project"; agent-assignments table abstrata (orchestrator / planner / evaluator / debugger por *role*, não por nome); body-forbidden list trocou "wa.me URLs, hex codes, product copy" por "project-specific values that belong in `.claude/CLAUDE.md` / `.claude/rules/`". `references/agent-handoff-contracts.md` JSON example com placeholders. `references/parallel-batch-contracts.md` example trocou `LandingCTA.astro` por `<src>/<file>:<line>`. `references/agentic_system_design.md` removeu nomes hardcoded de agentes (`explorer`, `librarian`, `oracle`, `frontend-specialist`) — substituiu por descrições funcionais. `references/prompt_engineering_patterns.md` reescrito sem voice anchors do grupo-us / produtos / Laura. `references/llm_evaluation_frameworks.md` reescrito sem links para `.claude/skills/evolve-autoresearch/` (skill exclusiva ao gpus-site).

**Pattern:** Skills cross-project SSOT (orquestração de agentes, planejamento) devem usar **placeholders + ponteiros para `${overlay}/layer-map.md` e `.claude/CLAUDE.md` host**, nunca exemplos hardcoded. Scripts utilitários e voice anchors específicos do projeto ficam em skills domain do host (e.g., `grupo-us`, `gpus-theme`, `evolution-core`) — não vazam para skills genéricas. Validação: `grep -E "GPUS|Astro|bunx|bun run|WhatsApp|wa\.me|Lucide|Navy|Gold|drasacha|grupo-us|Laura|Sacha|@theme" .claude/skills/{planning,senior-prompt-engineer}/` → empty.

**Validation:** `bunx astro check` → 0 errors / 0 warnings / 92 hints; `bun run build` → 9 pages built clean. Grep cross-check para tokens project-specific em ambas as skills retorna vazio.

### [2026-05-02] planning skill — slim, project-aware, orphan cleanup

**Problem:** Auditoria do `.claude/skills/planning/`: (1) `${overlay}/layer-map.md` referenciado 3× — overlay nunca configurado, fallback caía no template genérico DB→API→UI errado para Astro estático; (2) `references/02-plan.md` e `03-risk.md` com falhas de stack obsoletas (Drizzle / tRPC / Clerk / Neon / Stripe) sem qualquer presença no projeto; (3) `02-plan.md` com exemplos `bun test` apesar de `tooling.testRunner` vazio em `.claude/config.json`; (4) `crawl4ai-sdk.md` (230 KB) órfão — não referenciado por nenhum SKILL.md / agente / comando; (5) cluster `notebooklm.md` + `notebooklm-cli.md` + `notebooklm-hooks.md` + `planning-skill-from-notebooklm-prompt.md` + `optional-tools.md` (~27 KB) órfãos — Tavily MCP cobre o caso; (6) `scripts/` Python (Crawl4AI) nunca invocados pelo repo; (7) `evals.json` órfão — `/evolve` usa `evals/` na raiz, não local; (8) `02-plan.md` duplicava muito do `SKILL.md` (complexity table, parallel/sequential phases); (9) zero cross-ref ao `senior-prompt-engineer/references/agent-handoff-contracts.md` apesar de `orchestrator` e `project-planner` carregarem ambas as skills via `skills:` frontmatter.

**Solution:** SKILL.md reescrito (~180 linhas) com layer chain inline para Astro estático (`Content Collection JSON → schema → component → page → SEO → a11y → perf → smoke`), drop do `${overlay}/layer-map.md` morto, seção "Auth scope" removida (projeto é anônimo), `Self-Review Checklist` ancorada nos 8 cardinals, cross-ref explícito ao handoff schema do `senior-prompt-engineer`. `references/02-plan.md` reescrito com exemplos Astro Content Collection + `LandingHero.astro` + `bunx astro check` (não `bun test`). `references/03-risk.md` reescrito com 12 falhas reais do stack (Zod schema drift, `client:load` creep, hex outside `@theme`, redirect tri-sync broken, sitemap não excluindo redirect, Framer height tween, etc.). Deletados 10 arquivos órfãos (`crawl4ai-sdk.md` + cluster notebooklm + `optional-tools.md` + `evals.json` + 3 scripts Python) e diretório `scripts/`. Layout final: `SKILL.md` + `references/{01-discover,02-plan,03-risk,04-harness-patterns}.md`. ~257 KB removidos.

**Pattern:** Skills devem inline o layer chain do projeto quando overlay nunca foi criado — fallback genérico engana mais do que ajuda. Process skills com cross-ref explícito a outras skills preloadeadas (`senior-prompt-engineer/references/*`) reduzem drift quando dois agents (`orchestrator` + `project-planner`) carregam ambas via `skills:` frontmatter. References órfãos sem ponto de entrada no `SKILL.md` ou em comandos viram dead weight — deletar antes que cresçam.

**Validation:** `bunx astro check` → 0 errors / 0 warnings / 92 hints; `bun run build` → 9 pages built clean; `ls .claude/skills/planning/` → SKILL.md (10 KB) + `references/` (4 files, ~27 KB total). Verificações: `grep -rln "Drizzle\|tRPC\|Clerk\|Neon\|Stripe" .claude/skills/planning/` → empty; `grep -l "\${overlay}" .claude/skills/planning/` → empty.

### [2026-05-01] senior-prompt-engineer rewired as Claude Code agent-orchestration SSOT

> Registro: `docs/analise-as-melhores-praticas-vectorized-fog.md` + execução desta sessão.

**Problem:** Auditoria contra docs oficiais Anthropic (sub-agents, skills) revelou: (1) **zero de 12 agents referenciava `senior-prompt-engineer`** — skill morta no sistema; (2) `SKILL.md` era boilerplate ML/MLOps genérico (Python K8s, Prometheus, latency targets) sem contratos de subagent / handoff schema; (3) os 4 agents que invocavam skills (`orchestrator`, `project-planner`, `evaluator` ad hoc, `debugger`) usavam `Skill()` no body em vez do campo `skills:` frontmatter (Anthropic-recommended preload pattern); (4) handoff contracts eram prosa markdown variando entre `debugger`, `frontend-specialist`, `mobile-developer` — consolidação manual; (5) coordinator do `/implement § 6` sem max-iteration → REVISION_REQUIRED loops infinitos; (6) `/perf fix` spawn 1 agente por rota sem clusterizar por root cause; (7) `/verify` Phases 5-6 com fallback silencioso quando codex plugin ausente.

**Solution:** `senior-prompt-engineer` reescrito como SSOT canônico para subagent design + handoff. SKILL.md (244 linhas) com 11 seções (purpose, subagent file contract, description guidelines, spawn template, handoff schema, parallel-batch contract, coordinator failure recovery, skill preload pattern, application-level prompt eng, references, anti-patterns). Dois novos `references/`: `agent-handoff-contracts.md` (Context Handoff schema markdown+JSON, status invariants, coordinator recovery rule) e `parallel-batch-contracts.md` (findings table schema, severity P0-P3, consolidation rules, tool precedence). Os 4 agents `orchestrator`, `project-planner`, `evaluator`, `debugger` ganharam `skills: [senior-prompt-engineer, …]` em frontmatter — removidos calls duplicados de `Skill()` no body. `_shared.md § 7.5` insere link SSOT; § 6 marca skill como mandatory para tasks com ≥2 agents; nova row "Multi-agent orchestration / handoff design". CLAUDE.md routing matrix ganhou 2 rows (agent prompt + multi-agent command); stopping conditions ganhou regra "Coordinator max-iteration"; skill invocation note clarifica preload vs body-level. Commands: `/delegate` substitui o block manual de 5 fields por link SSOT; `/implement § 6` adiciona max-iteration coordinator (2 resubmissions → BLOCKED → main → /debug recover); `/research` injeta tool-precedence guidance no prompt do librarian (Context7 first → Tavily fallback) + linka `parallel-batch-contracts.md`; `/perf § 2.5` cluster-by-root-cause antes de spawnar; `/verify § 0.2` codex plugin pre-check (ask user antes de fall through silencioso).

**Pattern:** Process skills usados em todo invocação devem ser **preloaded via `skills:` frontmatter** (Anthropic-recommended); domain skills condicionais ficam em `Skill()` body. Handoff schema é SSOT único — agents linkam, não redeclaram. Parallel-batch returns conformam ao mesmo column shape para consolidação mecânica. Coordinators têm max-iteration explícito antes de escalar para `/debug recover`. Tool precedence (Context7 vs Tavily) é injetado no prompt do agente, não enforced pelo agent definition.

**Validation:** `bunx astro check && bun run build` clean (0 errors, 9 pages built). Lint failures (CRLF em CSS) são pré-existentes em `src/` — esta PR só toca `.claude/`. Verificações: `grep "senior-prompt-engineer" .claude/agents/*.md` → 4 hits (orchestrator, project-planner, evaluator, debugger); `grep "agent-handoff-contracts" .claude/commands/*.md` → 4+ hits; `grep -c "MANDATORY CONTEXT" .claude/` → 3 esperados (orchestrator spawn template, handoff-contracts SSOT, SKILL.md quick ref) — eliminado de delegate, implement, _shared.

### [2026-05-01] AGENTS.md slim — behavioral focus + .claude/rules SSOT

**Problem:** Root `AGENTS.md` (638 lines) duplicated `.claude/rules/{frontend,DESIGN,stability,seo}.md` and `.claude/CLAUDE.md` (architecture map, design tokens, section orders, accessibility specs, performance gates, negative constraints). Drift risk + every agent loaded redundant content.
**Solution:** Trimmed to behavioral guide (~320 lines) per [agents.md](https://agents.md/) spec — kept cardinals (8 numbered), behavior, decision authority, MCP IDs, commit format, learnings log. Dropped duplicated tables (tech stack, architecture map, full design system, section orders, performance/accessibility specs). Added explicit subdirectory-override note.
**Validation:** All rule content preserved at `.claude/rules/*` and `.claude/config.json`; `bun run lint && bunx astro check && bun run build` clean.

### [2026-05-01] evolution-core absorbs auto-research-gpus + evolve-autoresearch (skill consolidation)

> Registro: `docs/plans/2026-05-01-consolidar-evolution-core.md` + execução desta sessão.

**Problema:** Três skills sobrepostos (`evolution-core` para memória, `evolve-autoresearch` para Karpathy loop, `auto-research-gpus` para autoresearch comercial do site) duplicavam descrição de gatilho, dispersavam scripts em dois diretórios e obrigavam o agente a saber qual carregar para cada sub-task de `/evolve`.

**Solução:** Consolidar em `evolution-core` com três `references/*.md` (memory / optimizer / gpus-profile) + scripts unificados em `.claude/skills/evolution-core/scripts/`. `SKILL.md` raiz vira router conciso (≤600 palavras). `/evolve` ganha modo `optimize <target>` com sub-arg `site:<area>`; um único `Skill("evolution-core")` cobre todos os caminhos. `evals.json` estendido para A09–A14 (frozen harness, append-only TSV, Karpathy mapping, cardinal rules do site, output `<answer>`). `evals/README.md` atualizado para os novos caminhos. Diretórios antigos `auto-research-gpus/` e `evolve-autoresearch/` removidos.

**Pattern:** Skills com gatilhos sobrepostos viram router + `references/` em vez de N skills paralelos. Mantém uma única superfície de descoberta para o LLM e preserva detalhe técnico atrás de carga sob demanda. Histórico imutável em `evals/<...>/runs/` permanece intocado — apenas referências forward-going migram.

**Validation:** `python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_harness.py --help` smoke + `bun run lint && bunx astro check && bun run build`.

### [2026-03-26] Mentoria Black NEON: copy de-duplication — echo reduction + dead data cleanup

> Registro: `evals/site/mentoria-black-neon-evolve/runs/2026-03-26-copy-dedup/run.md`.

**Hypothesis:** Reducing phrase repetition and removing dead data makes each landing section read with distinct voice, improving perceived offer depth.
**Result:** "escalar com estratégia" 4x → 2x | "sem abrir mão da sua essência" 2x → 1x | dead benefits[] 10 items → 0 | decision: **keep**
**Pattern:** When `deliverables[]` shadows `benefits[]` via conditional render, keep both with distinct content (outcomes vs activities). Core brand phrases max 2x — primary positioning + user-language mirror. Bio and story.highlight need autonomous closings.
**Validation:** `bun run lint && bunx astro check && bun run build`

### [2026-03-26] EVOLVE_AUTORESEARCH: ciclo real de autoaprimoramento da skill

> Run: `evals/_archive/evolve-autoresearch-self-improve/runs/2026-03-26-self-skill-cycle/`.

**Problema:** Mesmo após alinhar a skill ao `karpathy/autoresearch`, faltavam duas regras operacionais que o `program.md` upstream deixa mais nítidas: (1) em autoaprimoramento, **um único artefato pontuado por run**; qualquer sync do arquivo irmão é camada `program.md`; (2) disciplina explícita para **crash** com retry limitado e histórico append-only preservado.

**Solução:** Rodado um ciclo local com `<evolve_request>` sobre a própria `SKILL.md` (3 amostras, 6 critérios binários). Baseline marcou **11/18**; `c_program_sync` subiu para **17/18**; vencedor `c_program_sync_crash` marcou **18/18**. Aplicadas à skill (agora `evolution-core/references/optimizer.md`) as seções **Self-improvement runs (program.md-class)** e **Crash discipline**. `.claude/commands/evolve.md` ganhou a regra operacional equivalente: um alvo pontuado por run e `crash` com no máximo uma correção rápida antes de descartar.

**Validação:** `python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_harness.py init-run ...`; `evolve_autoresearch_score.py score-candidate` para baseline + 2 candidatos; `evolve_autoresearch_report.py build-response`; `bun run lint`.

### [2026-03-26] EVOLVE_AUTORESEARCH: toolchain local para harness, candidatos, scoring e response

> Scripts Python stdlib em `.claude/skills/evolution-core/scripts/`.

**Problema:** O workflow já documentava `<evolve_request>`, `experiments.tsv` e `evolve-response.xml`, mas na prática só existia o logger/importador TSV. Faltavam scripts para **congelar o harness**, **seedar candidatos**, **validar o orçamento fixo de grading** e **montar o XML final** sem trabalho manual excessivo.

**Solução:** `evolve_autoresearch_harness.py` (`init-run`), `evolve_autoresearch_mutate.py` (`seed-candidates`), `evolve_autoresearch_score.py` (`score-candidate`), `evolve_autoresearch_report.py` (`build-response`) + `scripts/AUTORESEARCH_README.md`. `evolution-core/SKILL.md`, `.claude/commands/evolve.md` e `evals/README.md` referenciam o fluxo: request → harness congelado → candidatos → grade sheets → `experiments.tsv` → `evolve-response.xml`.

**Validação:** `python3 -m py_compile` nos scripts; smoke ponta a ponta com `<evolve_request>` mínimo em `/tmp`; `bun run lint`.

### [2026-03-26] EVOLVE_AUTORESEARCH: alinhamento explícito ao karpathy/autoresearch

**Problema:** A meta-skill já citava Karpathy, mas não deixava explícito o modelo de **três superfícies** (`prepare.py` congelado, `train.py` = artefato único do agente, `program.md` = contexto humano) nem o paralelo **orçamento fixo** (lá: janela de treino; aqui: mesmo `samples_per_iteration` e pool por candidato).

**Solução:** Seção *Karpathy autoresearch — structural mapping*, regra *Fixed grading budget per candidate* e referência ao branch `master` em `evolution-core/references/optimizer.md`. `.claude/commands/evolve.md` §1.2 e §1.5: paralelo resumido, link `tree/master`, correção da numeração duplicada.

**Validação:** revisão textual; `bun run lint`.

### [2026-03-25] Curso de Aurículo: checkout-first com Kiwify + FAQ de compra

> Registro: `evals/site/curso-auriculo-conversion/runs/2026-03-25-checkout-cta/run.md`.

**Problema:** A landing de `curso-auriculo` ainda levava para HubSpot, com CTA genérico e copy menos alinhada à oferta visível no checkout da Kiwify; title da página também seguia genérico.

**Solução:** `src/content/products/curso-auriculo.json` passou a vender explicitamente o **Curso de Aurículo com Técnica de Perfuração Auricular**, com `cta.url` para `https://pay.kiwify.com.br/kMXdriO`, label de compra direta, mensagem de WhatsApp para dúvidas pré-inscrição, FAQ orientada a objeção de compra e hero/meta mais próximos da intenção comercial. `LandingCTA` ajusta a microcopy quando o primário é checkout externo, deixando WhatsApp como suporte.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-25] Curso de Aurículo: batch 10x de copy, narrativa e CTA

> Registro: `evals/site/curso-auriculo-conversion/runs/2026-03-25-10x-copy-loop/run.md`.

**Problema:** Mesmo após alinhar o checkout, a página podia ganhar clareza em transformação, qualificação do visitante, linguagem do botão e ordem de objeções. A promessa seguia parcialmente feature-first e faltava contexto operacional perto do CTA.

**Solução:** 10 loops com base em boas práticas de landing pages de curso: `LandingHero` mostra a `tagline`; `cta.helperText` opcional em `src/content.config.ts` permite contexto operacional perto do botão; `curso-auriculo.json` recebeu headline com prazo, CTA "Garantir minha inscrição", helper text, benefícios orientados a resultado e FAQ em ordem de decisão (fit, inclusão da técnica, formato, comparação com `TRINTAE3`, condições comerciais e suporte no WhatsApp). Title da rota refinado.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-26] Curso de Aurículo: EVOLVE_AUTORESEARCH em CTA e copy (âncora temporal + checkout explícito)

> Registro: `evals/site/curso-auriculo-conversion/runs/2026-03-26-evolve-autoresearch-cta/run.md`.

**Problema:** H1 começava com benefício genérico ("Adicione…"), atrasava a leitura do prazo/formato; CTA "Garantir minha inscrição" era válido porém menos explícito em primeira pessoa; meta e helper podiam ser mais diretos sobre checkout vs Laura.

**Solução:** Harness binário (7 critérios × 3 personas); candidato `c_timeframe_action` promovido. `hero.headline` abre com **"Em 3 dias presenciais,"**; `cta.label` **"Quero me inscrever agora"**; `helperText` e `description` nomeiam checkout/valores atualizados; FAQ de inscrição alinhada ao texto do CTA; title da rota com "inscrição" para SERP.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-26] Landings: um único CTA quando `cta.url` já é WhatsApp

> Registro: `evals/site/cta-whatsapp-dedup/runs/2026-03-26-dedup/run.md`.

**Problema:** `LandingHero` e `LandingCTA` mostravam botão primário (ouro) e botão verde "Falar com a Laura" mesmo quando ambos apontavam para WhatsApp — redundante.

**Solução:** `isWhatsAppDestination()` em `src/lib/whatsapp.ts` (`wa.me`, `api.whatsapp.com`, `wa.link`); se verdadeiro, o botão verde secundário não renderiza. `LandingCTA` ajusta o subtítulo quando só há um botão. Produtos com `cta.url` externa (HubSpot, site) mantêm os dois CTAs.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-26] `.planning/` e roadmap sincronizados com o repo

**Problema:** `PROJECT.md` / `ROADMAP` / `REQUIREMENTS` citavam 11 páginas, View Transitions obrigatório, WhatsApp antigo, e planos de fase sem refletir MPA + 8 páginas + 5 redirects + Laura.

**Solução:** Atualizar estado validado (TECH-01/04 feitos; TECH-03 superseded); corrigir contagens de rotas; nota em `01-PLAN-1.3` **SUPERSEDED**; `STACK`/`STRUCTURE`/`CONVENTIONS` com `whatsapp.ts` e redirects; `gpus-company-info.md` com canal institucional vs legado.

**Validação:** revisão textual; sem regressão de build.

### [2026-03-25] WhatsApp institucional: SDR Laura (+55 62 9470-5081)

> Registro: `evals/site/sdr-laura-whatsapp/runs/2026-03-25-sdr-whatsapp/run.md`.

**Problema:** Vários `wa.me/5511920474028` hardcoded (Hero, LandingCTA, home CTA, contato, footer, JSON-LD); mentoria com `wa.link`; mensagens genéricas sem direcionar ao atendimento SDR.

**Solução:** `src/lib/whatsapp.ts` como fonte única (`WHATSAPP_SDR_E164`, `whatsappUrlWithText`, `WHATSAPP_DEFAULT_SITE_MESSAGE`); landings e layout apontando para Laura; copy de CTA e `aria-label` com "Laura"; todos os `whatsappMessage` nos JSON com prefixo "Olá, Laura!"; mentoria `cta.url` em `wa.me`; footer e Organization schema com telefone (62) e `wa.me/556294705081`.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-25] Mentoria Black NEON: SEO, copy, CTA, FAQ de funil e LCP (NeonStory)

> Registro: `evals/site/mentoria-black-neon-evolve/runs/2026-03-25-20x-loop/run.md`.

**Problema:** Title da página só repetia o nome do produto; H1 longo com destaque dourado na última palavra pouco memorável ("você"); meta e CTA menos alinhados a dono de clínica e qualificação no WhatsApp; FAQs sem objeção TRINTAE3 vs mentoria nem formato gravado vs vivo; `NeonStory` com `bg-[#fafaf9]` (hex solto) e imagem `eager`/`fetchpriority=high` competindo com hero texto-first.

**Solução:** Title dedicado com keywords de escala + saúde estética; `description` com 6 meses, ICP e micro-CTA; hero reescrito terminando em **NEON**; story e highlight com "olhar de dono" e nome do produto; duas FAQs de funil; CTA alinhado à Laura (SDR) + mensagem pré-preenchida com vagas/ciclo; `ogImage={d.image}` na página; `NeonStory` com `bg-text-primary`, imagem `lazy`/`fetchpriority=low`, alt descritivo.

**Validação:** `bun run lint && bunx astro check && bun run build`.

**Nota:** O lote anterior citava `NeonStory` com `eager`+`high` para outro contexto; nesta rota o hero é texto-first e a imagem está abaixo da dobra — priorizar LCP com `lazy`+`low`.

### [2026-03-26] Lote 10× performance: debug off, idle hydration, preconnect, prioridades de imagem

> Registro: `evals/site/performance-batch-2026-03-26/runs/2026-03-26-10x-perf/run.md`.

**Problema:** `fetch` para `127.0.0.1:7777` em `astro.config`, `productsNav`, `text-generate-effect`, `lamp`; Hero com `client:load` em ilhas só visuais; listeners `astro:after-swap` sem `ClientRouter`; candidatos a LCP sem `fetchpriority`.

**Solução:** Remover instrumentação; `AuroraBackground` e `TextGenerateEffect` com `client:idle`; `preconnect` Google Fonts; remover `astro:after-swap` em Layout e Header; logo com `fetchpriority="high"`; `NeonStory` imagem `eager`+`high`; avatares/about preview com `fetchpriority="low"`.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-26] Lote 10× evolve: home institucional, CTA, meta de produtos e 404

> Registro agregado: `evals/site/evolve-batch-2026-03-26/runs/2026-03-26-10x-loop/run.md`.

**Escopo:** dez ciclos seguidos (copy/SEO/conversão): grid de produtos (sem `fetch` de debug em localhost), seção CTA, preview "Sobre", stats com `h2` acessível, meta de contato e sobre, blurb do rodapé, campo `description` em `trintae3`, `curso-auriculo` e `mentoria-black-neon`, copy e meta da 404.

**Padrão:** `description` nos JSON de produto alimenta `<meta name="description">` nas landings que passam `description={d.description}` — tratar como **superfície SEO** junto com hero/tagline.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-26] Home: alinhar SERP, Hero e jornada à trilha comercial

> Run: `evals/site/home-narrative-seo/runs/2026-03-26-evolve-home/run.md`.

**Problema:** Title/description da home e copy do Hero não guiavam com clareza a **intenção de busca** (formação + negócios em saúde estética) nem o **próximo passo**; timeline da jornada com pt-BR sem acento e subtítulo com vocabulário de implementação ("manual", URLs).

**Solução:** Title/meta da `index` e defaults do `Layout` (incl. JSON-LD Organization) com narrativa única; Hero com headline "referências na estética avançada", subtítulo com pilares e trilha; CTA primário "Ver trilha de programas"; resumos da jornada revisados e subtítulo voltado ao visitante. Comando `/evolve`: **§1.0** trata pedidos em linguagem natural de evolução do site como `<area>evolve</area>`.

**Validação:** `bun run lint && bunx astro check && bun run build`.

### [2026-03-25] Sincronizar roteiro de vendas e persona com o código

**Contexto:** O roteiro prescreve blocos (hero, dor, pilares, vídeo, benefícios, palestrantes, cronograma, ingressos, hostess, FAQ, CTA). A persona reforça tom (mesa certa, luz/brilho, "você", frases de impacto) e uso de emoji **no social** — não na UI do site.

**Padrões:**
- **Palestrante em destaque:** `src/content/speakers/sacha.json` (`bio`, `title`, `learn_text`) alimenta `SpeakersGrid` e o JSON-LD de `index.astro`. Manter nome de produtos consistente (ex.: **Mentoria BLACK NEON**, não só "NEON").
- **Preços (evento BR):** Exibir **parcela 12x em destaque** e valor à vista como linha secundária, quando o material de vendas assim definir.
- **Countdown / checklist:** Data do evento no Hero, `CountdownTimer` e checklist deste arquivo coincidem (atual: **18–19/09/2026**).
- **Pesquisa de copy em Docs:** Preferir export em texto (`/document/d/…/export?format=txt`).

**Validação:** `bunx astro check && bun run build`.

### [2026-03-25] Pós-auditoria: FAQ, a11y, jurídico, Lucide, rotas

**Problema:** Acordeão com Framer animando altura do painel; placeholders `#` em links legais; ícone Lucide deprecado; CTA WhatsApp com hex solto; conteúdo `[data-reveal]` invisível sem JS.

**Solução:** Painel FAQ com **CSS grid** `0fr`/`1fr`; rotas `/termos` e `/politica-de-privacidade`; `AtSign` no carrossel de depoimentos; tokens `--color-whatsapp*` no `@theme`; skip link + `noscript` para reveal; navegação entre páginas por **full reload** (sem `ClientRouter`, alinhado à regra anti-SPA).

**Validação:** `bunx astro check && bun run build`.

### [2026-03-25] Produtos com site externo (Na Mesa Certa + OTB Dubai)

**Contexto:** Conteúdo canônico em apps separados; site institucional só encaminha.

**Padrões:**
- **`externalSiteUrl`** no JSON do produto: grid da home, header e footer apontam para o site externo (`target="_blank"`, `rel="noopener noreferrer"`); texto `sr-only` no card quando externo.
- **`redirects` em `astro.config.mjs`:** mesma URL que `externalSiteUrl` para `/na-mesa-certa` e `/otb` — HTML estático com `noindex`, `canonical` para o destino e meta refresh.
- **Sitemap:** `filter` em `@astrojs/sitemap` exclui essas duas rotas (evita indexar páginas só de redirect).
- **Sincronizar destinos:** ao trocar URL de produção, atualizar `externalSiteUrl`, `cta.url`, `redirects` e o `filter` se o path mudar.

**Validação:** `bun run check:external-urls && bunx astro check && bun run build` (ver [`docs/solutions/integration-issues/astro-static-external-product-routing.md`](docs/solutions/integration-issues/astro-static-external-product-routing.md)).

### [2026-03-25] Plugins Cursor: MCP, skills e Tavily

**Contexto:** Alinhar agentes ao uso correto de MCP (`serverIdentifier`), skills do ecossistema e CLI.

**Padrões:** Ler descriptor JSON antes de `call_mcp_tool`; Tavily via servidor `plugin-tavily-tavily`; skills `tavily-*` para procedimento; `tvly` no terminal como fallback. Sem expandir escopo do site estático para auth/DB/pagamentos sem pedido explícito.
