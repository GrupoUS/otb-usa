# Plano — Instalar e configurar graph-powers no otb-usa (AGENT_SETUP.md)

## Context

O plugin `graph-powers@graph-powers` **já está instalado** globalmente (user scope, v1.3.1) e habilitado
nesta máquina. O que nunca foi executado é o playbook `AGENT_SETUP.md`, que é o passo que faz a
instalação valer alguma coisa: escrever os parâmetros do projeto, alinhar os arquivos de instrução, e
remover as cópias locais que sombreiam o plugin.

Duas consequências concretas disso hoje:

1. **Enxurrada de pedidos de aprovação de Bash** (queixa explícita do usuário). Causa raiz medida, não
   suposta: `.claude/config.json` **não declara a chave `autonomy`**, então `hooks/_config.py` cai nos
   defaults `level: "guarded"` + `allowPackageManagers: []`. Sob `guarded`, `bashDefault` é `ask` — todo
   comando composto, heredoc e loop vira prompt — e com a lista de package managers vazia, **todo
   `bun` / `bunx` também pede aprovação**, num projeto que é Bun-only e cujos gates são todos `bun run …`.
   Verificado com:
   ```
   python3 -c "import sys;sys.path.insert(0,'$PLUGIN/hooks');import _config as gp;print(gp.autonomy())"
   → {'bashDefault': 'ask', 'cleanup': 'ask', ..., 'level': 'guarded', 'allowPackageManagers': []}
   ```
2. **Hooks duplicados.** `~/.claude/settings.json` registra cópias próprias de `smart_bash_approver.py`,
   `ultracite.py`, `notify.py` e `session_context.py`, e o plugin registra as **dele** para os mesmos
   eventos. Hooks acumulam entre níveis em vez de sobrescrever: dois processos diferentes decidem cada
   chamada Bash, e a decisão mais restritiva vence. As duas versões de `smart_bash_approver.py` são
   comprovadamente diferentes (`diff -q` retorna "são diferentes"), então não é a mesma decisão tomada
   duas vezes — são duas políticas. Em cima disso, `.claude/settings.json` do projeto adiciona um
   **terceiro** `protect_files.py` em `Edit|Write`.

Resultado pretendido: gates e comandos do dia a dia rodam sem prompt, commit/push continuam com gate
humano, e o harness do plugin passa a ser a fonte de verdade para o que é genérico — com a
customização GPUS preservada intacta.

---

## Destination

**Pronto quando:** `gp.autonomy()['bashDefault'] == 'allow'` e `'bun' in gp.autonomy()['allowPackageManagers']`
neste repositório; `python3 $PLUGIN/hooks/test_hooks.py` sai 0; cada comando de `tooling.commands`
roda e reporta seu exit code; `git commit` sem chave é negado nomeando `OTBUSA_ALLOW_COMMIT`;
`Agent({subagent_type:"graph-powers:explorer"})` responde numa sessão reiniciada; e nenhuma cópia local
removida perdeu conteúdo que só existia nela (provado por `diff` na tela antes de cada remoção).

---

## Estado apurado (Step 0 + Step 2 do playbook)

| Item | Estado real |
|---|---|
| `$PLUGIN` | `~/.claude/plugins/cache/graph-powers/graph-powers/1.3.1` (contém `AGENT_SETUP.md` ✔) |
| graph-powers Claude | **user scope, 1.3.1, enabled** — metade global já feita, não reinstalar |
| Registros stale | 1.3.0 e 1.2.0 em scope `local` apontando para `/tmp/tmp.KbXPpM5P7x` e `/tmp/tmp.Wt4zv4Bg3J` — projetos que não existem mais; **não afetam este repo** |
| superpowers | `superpowers@claude-plugins-official` 6.3.0, user scope ✔ — nada a instalar |
| impeccable | global em `~/.claude/skills/impeccable` **4.1.1**; cópia do projeto em `.claude/skills/impeccable` **4.0.4** (stale, e é ela que vence); ausente do lado Codex (`~/.agents/skills`) |
| graph-powers Codex | instalado global em **1.3.0** (plugin já em 1.3.1) → drift |
| `.codex/` no projeto | não existe |
| Config | `.claude/config.json` (caminho legado, suportado) — rico em GPUS, **sem** `autonomy`, **sem** `tooling.commands` |
| `.graph-powers/` | não existe |
| Branch | `main` (work = protected, main-only por AGENTS.md) · `optInPrefix: OTBUSA` ✔ |
| Gates reais | `bun run lint` · `bunx astro check` · `bun run build` · `bun test` (4 arquivos em `tests/`) |
| Autoridades | `DESIGN.md` (490) ✔ · `PRODUCT.md` (254) ✔ · **`REVIEW.md` ausente** |
| Instrução | `AGENTS.md` root (147) + `.claude/CLAUDE.md` (o config aponta `claudeMdFile` para lá) |

### Decisão de local do config — **não criar `.graph-powers/config.json`**

`_config.py` resolve `CONFIG_PATHS = (".graph-powers/config.json", ".claude/config.json")` e **o primeiro
que existir vence**. Criar o arquivo novo faria o loader ignorar `.claude/config.json` por inteiro —
perdendo `optInPrefix: OTBUSA`, `protectedFiles`, e todos os `${...}` que `.claude/CLAUDE.md`,
`AGENTS.md` e `.claude/rules/*` resolvem a partir dele. O playbook aceita explicitamente o caminho
legado ("um projeto só-Claude não tem motivo para mudar"). **Um config só, em `.claude/config.json`.**

O `.claude/config.schema.json` local tem `additionalProperties: true` no root e em `tooling`, então
adicionar `autonomy` e `tooling.commands` não quebra validação.

---

## Reuse ledger

| # | Necessidade | Ativo existente | Verdicto |
|---|---|---|---|
| N1 | Parâmetros do projeto lidos pelos guardrails | `.claude/config.json` (loader já o lê — provado) | **EXTEND** — adicionar `autonomy` + `tooling.commands` + 2 campos de `tooling`/`paths` |
| N2 | Fim dos prompts de Bash | `autonomy` do próprio `_config.py` | **REUSE** — é configuração, não código novo |
| N3 | Allowlist de permissões | `~/.claude/settings.json` já tem as 124 regras que `bin/graph-powers.mjs` escreveria | **REUSE** — não rodar `--target claude` para permissões; já coberto |
| N4 | Dedup de hooks | `bin/audit-settings.mjs` do plugin | **REUSE** — ferramenta existe, é read-only |
| N5 | Autoridade de design/produto | `DESIGN.md`, `PRODUCT.md` na raiz | **REUSE** — melhorar em lugar, nunca substituir |
| N6 | Autoridade de review | (nenhuma; `.claude/rules/commit.md` tem o gate manual) | **NEW** — `REVIEW.md` derivado de `commit.md` + histórico git; extender `commit.md` falha porque ele é regra de formato de commit, não contrato de merge |
| N7 | impeccable atualizado | global 4.1.1 | **REUSE** — remover a cópia stale 4.0.4 do projeto é o upgrade |
| N8 | Wiring Codex | `bin/graph-powers.mjs --target codex` | **REUSE** — instalador idempotente |

---

## Fases

### Fase 1 — Backup (bloqueia tudo)

```bash
cp -r .claude ".claude.bak-$(date +%Y%m%d-%H%M%S)"
cp AGENTS.md "AGENTS.md.bak-$(date +%Y%m%d-%H%M%S)"
cp ~/.claude/settings.json ~/.claude/settings.json.bak-$(date +%Y%m%d-%H%M%S)
```

O backup do settings global é o que falta no playbook e é o único arquivo aqui que não está sob git.

### Fase 2 — Config: matar os prompts (`.claude/config.json`)

Merge campo a campo, preservando **todo** valor já escolhido. Adicionar apenas:

```jsonc
"autonomy": {
  "level": "autonomous",
  "destructiveFloor": true,
  "allowPackageManagers": ["bun", "bunx"],
  "git": { "commit": "ask", "push": "ask", "protectedBranch": "ask" }
}
```

`level: autonomous` resolve `bashDefault: allow` e `cleanup: allow`; o bloco `git` re-aperta commit e push
para `ask` por cima — que é exatamente o que `AGENTS.md § Branch workflow` exige (main-only, push só
quando pedido). `destructiveFloor: true` mantém a recusa do que git não desfaz.

E completar `tooling` / `paths` com o que foi lido do repositório:

```jsonc
"tooling": {
  "testRunner": "bun",                       // hoje "" — existem 4 testes em tests/
  "commands": {
    "lint":      "bun run lint",             // biome + oxlint
    "typeCheck": "bunx astro check",
    "test":      "bun test",
    "build":     "bun run build"
  }
},
"paths": { "backendRoot": "api" }            // hoje "" — api/leads.ts existe
```

**`format` fica deliberadamente de fora.** `tooling.commands.format` roda depois de *cada* edit; o único
candidato do projeto é `bun run lint:fix`, que reescreve `src` inteiro — caro e com efeito colateral em
arquivo que o agente não tocou. O hook `ultracite.py` do plugin já cobre formatação por arquivo.

Provar que é lido, com saída na tela:

```bash
python3 -c "
import sys; sys.path.insert(0,'$PLUGIN/hooks'); import _config as gp
print(gp.config_path(), gp.work_branch(), gp.opt_in('COMMIT')); print(gp.autonomy())"
# esperado: .../.claude/config.json  main  OTBUSA_ALLOW_COMMIT
#           bashDefault=allow, commit=ask, push=ask, allowPackageManagers=['bun','bunx']
```

### Fase 3 — Hooks: remover a duplicação (a outra metade da queixa)

Rodar primeiro o auditor read-only: `node "$PLUGIN/bin/audit-settings.mjs"`.

**Em `~/.claude/settings.json`** — remover as 4 entradas que o plugin já registra para o mesmo evento
(cada remoção com o `diff` na tela antes):

| Evento | Entrada global a remover | Por quê |
|---|---|---|
| `PreToolUse` / `Bash` | `~/.claude/hooks/smart_bash_approver.py` | A do plugin lê `autonomy` do config do projeto; a global tem política própria e diferente, e é ela que estava dizendo `ask` |
| `PostToolUse` / `Write\|Edit` | `~/.claude/hooks/ultracite.py` | Duplicado exato de evento |
| `Notification` | `~/.claude/hooks/notify.py` | Duplicado exato de evento |
| `SessionStart` | `~/.claude/hooks/session_context.py` | Duplicado exato de evento |

**Preservar** (são exclusivos, o plugin não tem equivalente): `agent_routing_hint.py`,
`memory_compiler_delegate.py`, `session_baseline.py`, `task_routing_guard.py`, `subagent_start.py`,
`subagent_stop.py`, `task_completed.py`, `tool_failure_guard.py`, e **`pre_write_guard.py`** — este último
é *superset* do `protect_files.py` do plugin (adiciona `plan_validator`), então fica, e a sobreposição
restante é só stderr, nunca prompt. Não tocar em `permissions`, `env`, `statusLine`, `enabledPlugins`.

**Em `.claude/settings.json` (projeto)** — remover o bloco `hooks.PreToolUse` inteiro: o
`.claude/hooks/protect_files.py` local é subconjunto do do plugin, que lê `protectedFiles` do mesmo
`config.json`. Isso derruba de 3 para 2 os processos de proteção por Edit/Write. O arquivo
`.claude/hooks/protect_files.py` **permanece no disco** (o `.claude/hooks/README.md` o documenta);
só deixa de ser registrado.

Validar: `python3 -c "import json;json.load(open('.claude/settings.json'))"` e o mesmo para o global.

### Fase 4 — Autoridades (Step 6)

- `DESIGN.md` (490) e `PRODUCT.md` (254): ler `$PLUGIN/DESIGN.md` e `$PLUGIN/PRODUCT.md` (que são
  **especificações**, não templates), comparar seção a seção, e **melhorar em lugar**. Cada decisão
  existente sobrevive verbatim. Lacuna vira `Não decidido — <o que resolveria>`, nunca um default
  plausível. Divergência entre documento e repositório é **reportada**, não corrigida por conta própria.
- `REVIEW.md`: criar. Fontes reais — `.claude/rules/commit.md` (gate manual de 8 itens, arquivos
  protegidos, workflow main-only, a seção sobre o push que falha em silêncio), `lefthook.yml`,
  `.claude/agents/code-reviewer.md`, e o histórico git para a lista de bloqueio.
- Fechar apontando as regras para os três arquivos em vez de repeti-los.

### Fase 5 — Limpeza conservadora (Step 7 — decisão do usuário)

Remover **apenas** skills locais cuja versão do plugin/global é igual ou melhor, com `diff` na tela antes
de cada uma:

`.claude/skills/{impeccable, ui-ux-pro-max, astro, debugger, planning, performance-optimization,
senior-prompt-engineer, skill-creator, uxmaster}`

Notas que mudam a ordem de execução:

- **impeccable primeiro roda `npx impeccable install --providers=claude,codex --scope=global`** — hoje o
  lado Codex não tem impeccable e `~/.claude/agents/` está vazio, então os 4 agentes
  `.claude/agents/impeccable-*.md` são a **única** cópia existente. Só remover a skill do projeto depois
  que o instalador global tiver colocado skill **e** agentes no lugar; se ele não colocar os agentes,
  os 4 arquivos ficam.
- `planning` local (234 linhas) é **maior** que a do plugin (153) e é o alvo do `/plan` do projeto —
  antes de remover, `diff` e migrar qualquer linha que só exista nela.
- `performance-optimization` (207 local vs 442 plugin) e `astro` (110 vs 152): plugin é superset provável,
  mas confirmar no diff.

**Preservado sem discussão:** todos os `.claude/agents/*` (17), todos os `.claude/commands/*` (15,
incluindo `design-fix.md`, `design-improve.md`, `_shared.md` que não têm equivalente), e as skills
`evolution-core`, `gpus-theme`, `xlsx` (só existem aqui). Os artefatos do plugin são namespaced
(`/graph-powers:plan`, `graph-powers:debugger`) e já convivem com os locais — nada quebra ao manter.

Os registros stale de plugin 1.3.0/1.2.0 apontando para `/tmp/tmp.*` são só entrada de registry de
projetos mortos; **não** afetam este repo. Mencionar no relatório, não mexer.

### Fase 6 — Codex (decisão do usuário: atualizar e wirar)

```bash
node "$PLUGIN/bin/graph-powers.mjs" --target codex
```

Roda **depois** do `npx impeccable install` (ordem do playbook: impeccable também escreve
`~/.codex/hooks.json`, e assim o merge acontece uma vez). Atualiza a metade global 1.3.0 → 1.3.1 e
escreve, no projeto, `.codex/rules/` + o bloco `<!-- graph-powers:start -->` em `AGENTS.md` (não editar
dentro dos marcadores). Depois, dizer ao usuário **em voz alta**: abrir `/hooks` no Codex e aprovar —
até lá esses guardrails não rodam.

Acrescentar ao `.gitignore` (hoje não tem nenhuma das duas linhas):

```gitignore
.graph-powers/logs/
AGENT_STOP
```

### Fase 7 — Verificação (Step 10, cada uma com a saída na tela)

```bash
grep -rn '{{' .claude/ .codex/ AGENTS.md 2>/dev/null || echo "sem placeholders pendentes"
python3 "$PLUGIN/hooks/test_hooks.py"                      # esperado: exit 0
python3 -c "import sys;sys.path.insert(0,'$PLUGIN/hooks');import _config as gp;print(gp.config_path(),gp.work_branch(),gp.opt_in('COMMIT'));print(gp.autonomy())"
python3 -c "
import sys;sys.path.insert(0,'$PLUGIN/hooks');import _config as gp
for k,c in ((gp.load().get('tooling') or {}).get('commands') or {}).items():
    m=gp.missing_tool(str(c)); print(f'{k:10} {c!r:24} '+(f'MISSING: {m}' if m else 'ok'))"
bun run lint && bunx astro check && bun run build && bun test    # os 4 gates, de verdade
git commit --allow-empty -m "guardrail check"              # esperado: negado, nomeando OTBUSA_ALLOW_COMMIT
```

Depois **reiniciar a sessão** (hooks e skills são lidos no startup) e, na sessão nova:

- `Agent({ subagent_type: "graph-powers:explorer", prompt: "list the files in agents/" })` — se o erro
  disser `Unknown subagent_type … Valid: …` com nomes sem namespace, o culpado é
  `~/.claude/hooks/task_routing_guard.py`, **não** a sessão (reiniciar não resolve). O código dele já foi
  lido: a partir de 2026-08-20 ele varre `agents/*.md` dos plugins, então deve passar — confirmar.
- `/plan` em tarefa L4+ deve alcançar `graph-powers:ultra-plan`.
- Confirmar na prática o objetivo da queixa: rodar 3–4 comandos Bash compostos e verificar **zero**
  prompt de aprovação.

### Fase 8 — Relatório e parar

Emitir o relatório no formato do Step 11 e **não commitar nada**. As mudanças ficam na árvore de
trabalho; o usuário commita depois de ver o diff — regra do `AGENTS.md` deste repo, que o plugin não
pode ser o único a driblar.

---

## Execution graph

```
Fase1(backup) ──→ [Fase2(config) ‖ Fase3(hooks) ‖ Fase4(autoridades)] ──→ Fase5(limpeza)
                                                                            │
                                        (npx impeccable global) ────────────┘
                                                                            ↓
                                                                      Fase6(codex)
                                                                            ↓
                                                            ⟨RESTART⟩ ──→ Fase7 ──→ Fase8
```

| Aresta | O que o destino lê da origem | Verdicto |
|---|---|---|
| Fase1 → todas | o backup precisa existir antes do primeiro write | REAL |
| Fase2 → Fase7 | `autonomy` e `tooling.commands` são o que a verificação mede | REAL |
| Fase2 → Fase3 | nada — config JSON e settings de hooks são arquivos e decisões independentes | **FALSA — apagada, rodam em paralelo** |
| Fase4 → Fase5 | nada — autoridades na raiz, limpeza em `.claude/skills` | **FALSA — apagada** |
| impeccable-global → Fase5 | os agentes/skill globais precisam existir antes de remover a única cópia local | REAL |
| Fase5 → Fase6 | ordem do playbook: impeccable escreve `~/.codex/hooks.json` antes do instalador do Codex | REAL |
| Fase6 → Fase7 | `.codex/` e o bloco do `AGENTS.md` são parte do que a verificação varre | REAL |

`[Fase2 ‖ Fase3 ‖ Fase4]`: nenhuma lê a saída da outra — config do projeto, settings de hooks (um deles
fora do repo) e documentos de autoridade na raiz. Paralelismo real, arquivos disjuntos.

⟨RESTART⟩ é o único gate obrigatório: o registry de workflows e os hooks são construídos no startup.

---

## Regression watchlist

| # | Comportamento que precisa continuar funcionando | Como provar | Fase de risco |
|---|---|---|---|
| W1 | `${...}` de `.claude/CLAUDE.md`, `AGENTS.md` e `.claude/rules/*` resolvem do config | `python3 -c "import json;c=json.load(open('.claude/config.json'));print(c['content']['productJson'],c['lead']['whatsappGreeting'],c['project']['displayName'])"` | Fase 2 |
| W2 | `protectedFiles` continua avisando em `astro.config.mjs`, `src/lib/whatsapp.ts` etc. | Edit num arquivo protegido → aviso em stderr (não bloqueio) | Fase 3 |
| W3 | Commit em `main` continua exigindo `OTBUSA_ALLOW_COMMIT` | `git commit --allow-empty` → negado nomeando a chave | Fases 2 e 3 |
| W4 | `bun run predeploy` (lint + astro check + build + test) passa igual a antes | `bun run predeploy` | Fase 2 |
| W5 | Comandos `/design`, `/design-fix`, `/design-improve` do projeto continuam resolvendo a skill impeccable | invocar `/design-improve` e ver a skill carregar (agora 4.1.1) | Fase 5 |
| W6 | `/plan`, `/verify`, `/implement` locais seguem funcionando | invocar `/verify quick` | Fase 5 |
| W7 | statusLine (`context-monitor.py`) e lefthook seguem ativos | statusLine desenha; `git commit` dispara `bun run lint` | Fase 3 |

W5 é a que mais pode quebrar: os 4 agentes `impeccable-*` locais são hoje a única cópia. Provar antes
de remover a skill, não depois.

---

## Rollback

| Fase | Como desfazer |
|---|---|
| 2, 3(projeto), 5 | `git checkout -- .claude/` ou `rm -rf .claude && mv .claude.bak-<ts> .claude` |
| 3 (global) | `cp ~/.claude/settings.json.bak-<ts> ~/.claude/settings.json` — único arquivo fora do git |
| 4 | `git checkout -- DESIGN.md PRODUCT.md && rm -f REVIEW.md` |
| 6 (Codex) | `~/.codex/graph-powers-installed.json` registra exatamente o que foi adicionado; `rm -rf .codex` e remover o bloco entre os marcadores do `AGENTS.md` |
| impeccable global | reinstalar a versão do projeto a partir do backup de `.claude` |

Nada aqui é forward-only e nada sai da máquina antes de um commit explícito.

---

## Out of scope

- **Criar `.graph-powers/config.json`.** Reabre se o projeto passar a precisar dos dois harnesses com
  parâmetros divergentes — hoje faria o loader ignorar `.claude/config.json` inteiro.
- **Remover agents e commands locais** (a resposta foi "conservador"). Reabre se o usuário pedir a
  limpeza agressiva depois de comparar `/plan` local (78 linhas) com `/graph-powers:plan` (478).
- **Reescrever `.claude/CLAUDE.md` / `AGENTS.md` para o template do plugin (Step 4).** Ambos já estão
  em ~150 linhas, são específicos do produto e o `AGENTS.md` vai receber o bloco delimitado do Codex na
  Fase 6. Reabre se depois da Fase 6 sobrar duplicação entre os dois.
- **Substituir `.claude/rules/*` pelos templates (Step 5).** As 9 regras já têm `globs:` reais e carregam
  invariantes GPUS (`[HARD]`) que os templates não têm. Reabre por pedido explícito.
- **Podar os registros de plugin 1.3.0/1.2.0 apontando para `/tmp/*`.** Não afetam este repo.
- **Qualquer commit ou push.**

## Not yet specified

- Qual é a lista real de bloqueio do `REVIEW.md` — o que este projeto **recusa** mergear. O `commit.md`
  dá o gate mecânico; o que só existe na cabeça do usuário é o critério de produto. Será uma pergunta
  na Fase 4, uma de cada vez, e o que não for respondido vira `Não decidido — <o que resolveria>`.
- Se `DESIGN.md`/`PRODUCT.md` divergem do repositório em algum ponto. Só aparece na leitura comparada
  da Fase 4; qual dos dois lados está velho é decisão do usuário, não conserto automático.

---

# Registro de execução — 2026-08-20

Quatro desvios do plano aprovado, cada um por medição e não por preferência.

**1. A Fase 3 mudou de metade.** O plano mandava desregistrar o `protect_files.py` do projeto por ser
subconjunto do plugin. Medido, é o contrário: o do plugin **nega** os 7 arquivos de
`protectedFiles.exact`, enquanto `.claude/rules/commit.md` promete **aviso sem bloqueio** — instalar
o plugin converteu warn→deny em silêncio, e `astro.config.mjs` deixou de ser editável por qualquer
agente. Correção: a lista foi dividida em `protectedFiles.warn` (aviso, lida pelo hook do projeto,
que **fica registrado**) e `exact`/`contains` (bloqueio duro, lida pelo plugin — hoje só `bun.lock`,
`.env*`, `.git/`). O hook do projeto foi ajustado para ler `warn`, e `commit.md` documenta a divisão.

**2. A Fase 5 quase não existiu, e é o resultado certo.** Das 9 skills candidatas: `astro` e
`debugger` locais são adaptadas a GPUS (6 e 12 arquivos citam OTB/Sacha), `performance-optimization`
carrega `references/react-doctor.md` que só existe aqui, e `planning`, `senior-prompt-engineer`,
`uxmaster`, `impeccable` e `ui-ux-pro-max` são citadas **por caminho literal** em `/design`,
`/design-improve`, `/design-fix` e `/plan` — removê-las quebraria os comandos. Regra do playbook:
local com algo a mais não se remove. Nada foi removido; o impeccable stale foi **atualizado no
lugar**, 4.0.4 → 4.1.1, e as três referências a "v4.0.4" nos comandos acompanharam.

**3. Os templates do Codex contradiziam invariantes deste projeto.** Três seções foram adaptadas em
vez de preenchidas: `design.md` mandava animar só `transform`/`opacity` (contra a regra cardinal 8),
`execution.md` prescrevia branch → PR → review (contra main-only), e `stability.md` trazia regras de
banco num projeto sem banco. Os 20 `{{PLACEHOLDER}}` foram substituídos por valores lidos do
repositório; nenhum sobrou.

**4. Dois drifts encontrados e corrigidos.** `.claude/agents/code-reviewer.md` afirmava
`leadFlow: "whatsapp-only"` e "there is no form, endpoint, or database in this repo" — falso desde
que o form existe. `PRODUCT.md § CRO` dizia "nenhum evento implementado hoje" com o GTM e o
`lead_submit` já no ar.

**Achado pré-existente, não corrigido, fora do escopo desta tarefa:**
`src/components/landing/Investimento.astro:273-275` tem um comentário JSX **dentro** da lista de
atributos do `<button>`, entre `class=` e `aria-label=`. `bun run build` passa (o compilador do Astro
é tolerante), mas `bunx astro check` dá 6 erros — logo **`bun run predeploy` está vermelho no `main`
de hoje**, desde `bd91311`. O arquivo está idêntico ao HEAD: nada deste trabalho o tocou. Correção é
mover o comentário para cima da tag de abertura.
