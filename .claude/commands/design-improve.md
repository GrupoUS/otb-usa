---
description: Iterative design enhancement chain (audit → bolder → animate → colorize → overdrive). Phase 1 audit = ui-ux-designer critique (read-only) + frontend-specialist fixes; phases 2-5 spawn frontend-specialist foreground; ui-ux-designer review gate closes the chain. Skills: impeccable 4.x + ui-ux-pro-max + gpus-theme + grupo-us. Use --from=<phase> to resume. Ends with /verify quick.
workflow_type: prompt-chaining
---

# /design-improve — Iterative Design Enhancement Chain

**ARGUMENTS**: $ARGUMENTS

> Sequential impeccable chain for the GPUS Astro landing. Phase 1 (audit) spawns `ui-ux-designer` (read-only critique) and, when defects exist, `frontend-specialist` fixes them; phases 2-5 spawn `frontend-specialist` (foreground, write-capable). Each phase reads its impeccable reference + a `ui-ux-pro-max` domain search, runs the impeccable mechanical detector, and writes a phase report under `.claude/agent-memory/design-improve/`. `ui-ux-designer` review gate (Phase 5.5) + single `/verify quick` close the chain. Resume mid-chain with `--from=<phase>`.

---

## Stopping Conditions

- STOP if any phase reports a Maestro gate FAIL → present report, ASK user before retry
- STOP if a phase introduces hardcoded hex (`#[0-9a-fA-F]{3,8}`) outside `src/styles/global.css`
- STOP if a phase introduces an inline `wa.me/` outside `src/lib/whatsapp.ts`
- STOP if a phase hardcodes product copy in `.astro`/`.tsx` instead of `src/content/products/otb.json`
- STOP if a phase touches files outside the resolved SCOPE glob
- STOP if a phase touches a protected file (`astro.config.mjs`, `src/lib/whatsapp.ts`, `src/content.config.ts`, `package.json`, `tsconfig.json`, `biome.json`, `lefthook.yml`) → ASK first
- STOP if 2 consecutive phases produce zero file changes → ASK (likely scope mis-targeted)
- STOP after 3 phases if `bunx astro check` errors accumulate (do not let errors compound across phases)
- STOP if `/verify quick` returns `NEEDS-WORK` → surface gate + all agent-memory reports, ASK user (no auto-retry)
- STOP if the `ui-ux-designer` review gate (Phase 5.5) reports Critical issues → present report, ASK user
- ASK if glob resolves to 0 files
- ASK before Phase 5 (`overdrive`) when SCOPE includes conversion-critical surfaces (`Hero.astro`, `Investimento.astro`, `Turmas.astro`, `WhatsAppFloatingButton.astro`) — overdrive can break the CTA path

---

## 0. Context load (WISC)

```typescript
Skill("superpowers:using-superpowers"); // meta — bootstrap (per _shared.md § 0.5)
```

1. Run `/prime frontend` — loads `.claude/rules/DESIGN.md`, `frontend.md`, `astro.md`.
2. If continuing a prior session → read `${rulesDir}/docs/evolution/HANDOFF.md` first.

**Tier 2 (auto-loaded on `src/**`):** `.claude/rules/DESIGN.md`, `.claude/rules/frontend.md`, `.claude/rules/astro.md` — tokens, motion canon, static-MPA contract.

**Tier 3 references (read on demand inside the spawned agent):**
- Visual authority: root `DESIGN.md` + live `src/styles/global.css @theme` + `Skill("gpus-theme")` (Navy/Gold token canon)
- Positioning / copy / funnel / honesty guardrails: root `PRODUCT.md` + `Skill("grupo-us")`
- Astro static-only contracts: `Skill("astro")` + `.claude/rules/astro.md`
- impeccable methodology (**v4.0.4**): `Skill("impeccable")` is the router; per-phase references live in `.claude/skills/impeccable/reference/`. Setup script is `scripts/context.mjs` — **`load-context.mjs` no longer exists**. The old `brand`/`product` **register** was replaced by four **modes**: this landing is **Persuade**. `reference/craft-floor.md` carries the quality floor + refuse list and loads **last**, immediately before editing UI.
- ui-ux-pro-max design intelligence: `Skill("ui-ux-pro-max")` — CLI `python .claude/skills/ui-ux-pro-max/scripts/search.py` (UX / typography / layout / landing / `--stack astro`; **palette suggestions discarded — GPUS Navy/Gold tokens are canonical**)
- Optional design model repo: `${project.designModelRepo}` — visual reference only, never a token authority

---

## 1. Argument parsing

`$ARGUMENTS` shape: `<scope> [--from=<phase>]`

| Token | Meaning | Default |
|---|---|---|
| first positional (no `--` prefix) | scope (alias · file path · or glob) | **required** |
| `--from=audit\|bolder\|animate\|colorize\|overdrive` | resume at named phase | `audit` |

### 1.1 Scope resolution

| Form | Detection | Resolution |
|---|---|---|
| **Glob** | contains `*`, `?`, `{`, `[` | used as-is via `Glob(pattern)` |
| **Path** | contains `/` OR ends with `.astro`/`.ts`/`.tsx`/`.css`/`.json`/`.md` | used as-is (single file or directory) |
| **Alias** | bare word, no `/`, no extension, no glob char | expanded via the alias map below |

### 1.2 Alias map (OTB landing surfaces)

For an alias, expand to the union of these paths (any that exist):

```
src/components/landing/<Component>.astro
src/pages/index.astro
src/content/products/otb.json
src/styles/global.css
```

| Alias | Component | Anchor | JSON key |
|---|---|---|---|
| `landing` / `otb` | full landing (all components + page + JSON + global.css) | — | all |
| `hero` | `Hero.astro` | `#topo` | `hero` |
| `why` / `porque` | `WhyOTB.astro` | `#por-que-otb` | `why` |
| `audience` / `publico` | `TargetAudience.astro` | `#publico` | `audience` |
| `programa` | `Programa.astro` | `#programa` | `programa` |
| `turmas` | `Turmas.astro` | `#turmas` | `turmas`, `edicao` |
| `modulos` | `Modulos.astro` | `#modulos` | `modulos` |
| `boston` | `Boston.astro` | `#boston` | `boston`, `agenda` |
| `speakers` | `Speakers.astro` | `#speakers` | `speakers` |
| `investimento` | `Investimento.astro` | `#investimento` | `investimento`, `lotes` |
| `parceiros` | `Parceiros.astro` | `#parceiros` | `parceiros` |
| `faq` | `FAQ.astro` | `#faq` | `faq` |
| `footer` | `Footer.astro` | — | `legal` |
| `whatsapp` / `floating` | `WhatsAppFloatingButton.astro` | — | `hero.cta.whatsappMessage` |
| `divider` | `SectionDivider.astro` | — | — |
| `layout` / `shell` | `src/layouts/Layout.astro` | — | `seo` |

If the alias has no matching file → STOP and ASK ("scope `<alias>` did not match an OTB landing surface; pass a path or glob instead").

### 1.3 Examples

```
/design-improve landing                                   # full OTB landing
/design-improve hero --from=animate                        # hero + resume mid-chain
/design-improve src/components/landing/**                  # explicit glob
/design-improve src/components/landing/Speakers.astro      # single file
/design-improve "src/components/landing/{Hero,FAQ}.astro"  # multi-file glob
```

Resolve via `Glob(pattern)` (after alias expansion). If 0 files match → STOP and ASK.

---

## 2. Phase sequence (strict order)

| # | Phase | Reference | Owner | Phase-specific constraint |
|---|---|---|---|---|
| 1 | audit | `audit.md` | ui-ux-designer (critique) → frontend-specialist (fixes) | Critique is read-only; fixes only when defects found |
| 2 | bolder | `bolder.md` | frontend-specialist | Gold = hierarchy and impact; no fixed ceiling, but never decorative filler |
| 3 | animate | `animate.md` | frontend-specialist | `prefers-reduced-motion` mandatory; any property may animate |
| 4 | colorize | `colorize.md` | frontend-specialist | Semantic tokens only — no new hex |
| 5 | overdrive | `overdrive.md` | frontend-specialist | Maestro Template Test must still pass post-overdrive |

`--from=<phase>` skips earlier phases. Later phases never run before earlier ones.

---

## 3. Phase blocks

Each phase uses the same template. Variables shown in `{{...}}`.

### Shared phase-block template (DO NOT collapse)

```typescript
Agent({
  subagent_type: "frontend-specialist",
  run_in_background: false,
  description: "design-improve / {{PHASE_NAME}} — {{resolvedScope}}",
  prompt: `
    SCOPE: {{resolvedScope}}
    PHASE: {{PHASE_NAME}} ({{N}}/5) — impeccable methodology
    CHAIN: design-improve
    MODE: Persuade (landing — the visitor decides and acts; design IS the product)

    LOAD BEFORE ANY EDIT (mandatory, in order):
      1. Skill("superpowers:using-superpowers")
      2. Skill("gpus-theme")                              // Navy/Gold tokens — NEVER substitute
      3. Skill("grupo-us")                                // voice, funnel, CTA, honesty guardrails
      4. Skill("astro")                                   // static MPA + Content Collections
      5. Skill("ui-ux-pro-max")                           // creative execution layer
      6. Skill("impeccable")                              // router (Setup + mode)
      7. node .claude/skills/impeccable/scripts/context.mjs --target {{firstScopeFile}}
         // impeccable 4.x Setup step 1 — replaces the removed load-context.mjs.
         // Run ONCE per session: it emits the full PRODUCT.md + DESIGN.md, so re-running just burns context.
         // Follow its directives. A CONTEXT_STALE finding is REPORTED, never repaired here.
      8. Read .claude/skills/impeccable/reference/{{PHASE_FILE}}
      9. Read .claude/agent-memory/design-improve/{{prev-phase-slug}}.md (if N > 1)
     10. Read .claude/skills/impeccable/reference/craft-floor.md  // LAST — load immediately before editing UI
     11. python .claude/skills/ui-ux-pro-max/scripts/search.py "{{UIUX_QUERY}}" --domain {{UIUX_DOMAIN}}
         // consume UX / typography / layout / landing guidance ONLY;
         // any color/palette suggestion from the CLI is DISCARDED (GPUS tokens canonical)

    HARD CONSTRAINTS (cardinal rules — non-negotiable):
      - Hardcoded hex FORBIDDEN outside src/styles/global.css @theme — semantic tokens only
        (documented exception: <meta theme-color> literal mirroring --color-navy)
      - Product copy lives in src/content/products/otb.json (schema src/content.config.ts).
        New field = schema + JSON + reader in ONE change. Never hardcode commercial copy in .astro
      - WhatsApp SSOT: src/lib/whatsapp.ts only. Never inline wa.me/. Messages keep the "Olá, Laura!" prefix
      - Astro static MPA only: no ClientRouter, no SSR adapter, no `prerender = false`
      - Prefer zero React islands; add a client:* directive only when interactivity is proven
      - Icons: Lucide / inline SVG. NEVER emoji as UI icon
      - Bun only — never npm / pnpm / yarn
      - LF line endings (Biome rejects CRLF)
      - Maestro gates apply EVERY phase: Safe Split / Bento Trap / Blue Trap / Line Trap.
        Glass/Glow gates: flag glass/glow used WITHOUT intent or supporting layers — do NOT penalize
        deliberate premium depth (see root DESIGN.md § Depth)
      - MOTION IS EXPRESSIVE: any property may be animated (incl. width/height/top/left/padding/margin),
        `transition: all` is allowed, dramatic depth/shadow/glow/glass allowed.
        Prefer transform/opacity when the effect is equivalent, NOT mandatory.
        The single hard requirement is honoring prefers-reduced-motion (a11y)
      - Reveal-on-scroll uses [data-reveal] + IntersectionObserver behind the `.js` gate,
        with the <noscript> fallback in Layout.astro intact
      - impeccable LAYERS ON TOP of gpus-theme — never replace Navy/Gold tokens, palette anchors,
        or the motion canon
      - ui-ux-pro-max contributes UX/typography/layout intelligence — its palette output NEVER lands in code
      - Protected files (astro.config.mjs, src/lib/whatsapp.ts, src/content.config.ts, package.json,
        tsconfig.json, biome.json, lefthook.yml): do not edit — report and stop

    PHASE-SPECIFIC CONSTRAINT:
      {{PHASE_SPECIFIC_CONSTRAINT}}

    BEFORE WRITING THE REPORT (mechanical gate):
      node .claude/skills/impeccable/scripts/detect.mjs --json {{changedFiles}}
      // impeccable 4.x mechanical detector. Run ONCE, after the UI edits are finished
      // (never during concept selection). Paste the finding count into the report and fix P0/P1 in-phase.

    DELIVERABLE (write to .claude/agent-memory/design-improve/{{phase-slug}}.md):
      - PHASE COMMITMENT (3–5 lines: what changes / what stays)
      - Files touched (absolute paths)
      - Diff summary (one line per file)
      - Detector result (finding count + what was fixed / what remains and why)
      - Deferred items (out-of-scope work owned by later phases)
      - Maestro self-check: 6 gates → PASS / N/A
      - Return < 2000 tokens to main context

    DO NOT:
      - Run /verify (chain controller runs it once at the end)
      - Spawn other agents (you are the leaf executor)
      - Touch files outside SCOPE glob
      - Substitute the impeccable mode's color strategy for the GPUS palette
      - Re-run context.mjs after step 7, or run "/impeccable doctor" or "/impeccable hooks"
        (drift repair is NEVER a side effect of a design task)
  `,
});
```

**ui-ux-pro-max query per phase (`{{UIUX_QUERY}}` / `{{UIUX_DOMAIN}}`):**

| Phase | Query (adapt to surface) | Domain |
|---|---|---|
| audit | "accessibility contrast focus loading" | `ux` |
| bolder | "premium dark landing bold hierarchy" | `style` |
| animate | "animation timing reduced-motion scroll reveal" | `ux` |
| colorize | "dark premium palette accessibility" | `color` (reference only — GPUS tokens win) |
| overdrive | "<surface> distinctive editorial style" | `style` |

Supplement on demand with `--stack astro` for implementation patterns.

**Gate before advancing to Phase N+1 (chain controller checks):**

1. Expected agent-memory file exists at `.claude/agent-memory/design-improve/{{phase-slug}}.md`
2. Maestro self-check section shows no FAIL
3. `Grep("#[0-9a-fA-F]{3,8}")` on changed files (excluding `src/styles/global.css`) = 0 matches
4. `Grep("wa\\.me/")` on changed files (excluding `src/lib/whatsapp.ts`) = 0 matches
5. Detector result recorded, with P0/P1 findings resolved or justified
6. If any gate fails → STOP, surface report, ASK user before retry

### Phase 1 — audit (`ui-ux-designer` critique → `frontend-specialist` fixes + impeccable/audit.md)

**Skip when:** `--from` resolves to `bolder`, `animate`, `colorize`, or `overdrive`.
**Inputs:** `$ARGUMENTS` SCOPE only (first phase).

**Step 1 — critique (read-only):** spawn `ui-ux-designer` (foreground) with the SCOPE file list. It reads the files (Read/Grep/Glob only — no Bash/Write), applies the `impeccable/audit.md` dimensions + NN/g heuristics + WCAG 2.2 + the Maestro gates, cites root `DESIGN.md` sections and `file:line`, and returns prioritized findings (Critical/High/Medium, < 2000 tokens). The **chain controller** writes the return into `.claude/agent-memory/design-improve/audit.md` — the agent cannot write files itself.

**Step 2 — fixes (write, conditional):** defects found → spawn `frontend-specialist` (shared template above) with the critique findings as input, fixing in-phase before the final report. Zero defects → report-only, no file changes.

**PHASE_SPECIFIC_CONSTRAINT (frontend-specialist):** Fix ONLY the critique findings — no scope creep; bold-up opportunities go to Deferred (owned by Phase 2).

### Phase 2 — bolder (`frontend-specialist` + impeccable/bolder.md)

**Skip when:** `--from` resolves to `animate`, `colorize`, or `overdrive`.
**Inputs:** `.claude/agent-memory/design-improve/audit.md` (deferred bold-up opportunities).
**PHASE_SPECIFIC_CONSTRAINT:** Gold is hierarchy and impact, not decoration — there is no fixed coverage ceiling (root `DESIGN.md`), but every gold surface must earn attention. Adjust intensity, weight, contrast, and structural boldness; never replace token anchors. Anti-genérico: if the section could be any template, redesign it.

### Phase 3 — animate (`frontend-specialist` + impeccable/animate.md)

**Skip when:** `--from` resolves to `colorize` or `overdrive`.
**Inputs:** `.claude/agent-memory/design-improve/bolder.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Every motion change ships a `prefers-reduced-motion` fallback — that is the only hard gate. Any property may be animated; prefer `transform`/`opacity` when the effect is equivalent. Motion + depth canon: root `DESIGN.md § 9 Motion` and `§ 10 Depth & elevation`; the reveal/tilt/glow gotchas are in `.claude/rules/stability.md § Debug triage matrix` (reveal must not use `animation: … forwards`, tilt and hover-lift never share a `transform` rule, `[data-glow-card]::before` needs `z-index: -1`).

### Phase 4 — colorize (`frontend-specialist` + impeccable/colorize.md)

**Skip when:** `--from` resolves to `overdrive`.
**Inputs:** `.claude/agent-memory/design-improve/animate.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Semantic tokens only. No new hex. If a color role is missing → STOP and ASK before adding a token to `@theme`. Validate every new foreground/background pair against WCAG AA before reporting.

### Phase 5 — overdrive (`frontend-specialist` + impeccable/overdrive.md)

**Skip when:** never (last phase).
**Inputs:** `.claude/agent-memory/design-improve/colorize.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Maestro Template Test must still pass post-overdrive; re-run the 6-gate self-check after the change. The CTA path (primary CTA copy, WhatsApp message, form/turmas entry points) must remain intact and reachable. Pre-flight ASK gate fires when SCOPE includes `Hero.astro`, `Investimento.astro`, `Turmas.astro`, or `WhatsAppFloatingButton.astro`.

### Phase 5.5 — design review gate (`ui-ux-designer`, read-only)

**Skip when:** never (runs after the last executed phase, full chain or `--from` resume).

Spawn `ui-ux-designer` (foreground) over the files touched in this run:
- Re-checks the Maestro gates + Template Test + WCAG 2.2 + usability heuristics, citing root `DESIGN.md` sections and `file:line`;
- Verifies the Persuade-mode contract: one primary CTA per view, honest claims (no fabricated urgency/scarcity/proof/dates), copy still sourced from `src/content/products/otb.json`;
- Returns verdict + prioritized issues (< 2000 tokens); controller writes it to `.claude/agent-memory/design-improve/review.md`;
- **Critical** issues → STOP, surface report, ASK user (per Stopping Conditions);
- No Critical → proceed to `/verify quick`.

---

## 4. End-of-chain verification

After the last executed phase completes its gate AND the Phase 5.5 review gate passes:

```bash
node .claude/skills/impeccable/scripts/detect.mjs --json <all files touched this run>
```

```typescript
SlashCommand("/verify quick");
```

`/verify quick` runs the project gates (`bun run lint`, `bunx astro check`, `bun run build`) + invariant smoke checks — single gate at chain end, NOT per phase.

On `NEEDS-WORK`:
- Report the failing gate
- Surface every `.claude/agent-memory/design-improve/<phase>.md` from this run
- ASK user (do not auto-retry)

On `VERIFIED` / `VERIFIED-WITH-NOTES`:
- Summarize files touched per phase
- Hand off to `/evolve` if the user wants learning capture

---

## 5. Anti-patterns

| Don't | Do |
|---|---|
| Run phases out of order | Strict audit → bolder → animate → colorize → overdrive |
| Run `frontend-specialist` in background | Foreground only (background silently denies Write/Edit) |
| Skip `Skill("gpus-theme")` in phase prompts | Load EVERY phase — impeccable LAYERS on top |
| Substitute the impeccable color strategy for Navy/Gold | impeccable enriches; Navy/Gold stays canonical |
| Call `load-context.mjs` (removed in impeccable 4.x) | `node .claude/skills/impeccable/scripts/context.mjs --target <file>`, once per session |
| Treat the surface as `Operate` mode | This landing is **Persuade** — the visitor decides and acts |
| Load `craft-floor.md` during planning | Load it LAST, right before editing UI |
| Let an agent run `/impeccable doctor` or `hooks` mid-phase | Drift repair is never a side effect of a design task — report `CONTEXT_STALE`, don't act on it |
| Ban layout-property animation or `transition: all` | Motion is expressive here — the only hard gate is `prefers-reduced-motion` |
| Run `/verify` per phase | Single `/verify quick` at end-of-chain |
| Use `tsc --noEmit` / `bunx tsc` | `bunx astro check` per AGENTS.md |
| Hardcode hex during `colorize` / `bolder` | Semantic tokens; new roles go into `@theme` only after ASK |
| Hardcode landing copy while restyling | Copy lives in `src/content/products/otb.json` |
| Inline `wa.me/` in a component | `src/lib/whatsapp.ts` helpers only |
| Skip the Maestro Template Test after `overdrive` | Re-run all gates — it's the highest-risk phase |
| Auto-retry on `/verify quick` failure | ASK user — never silent retry |
| Spawn other agents from inside a phase | Leaf executor only — the controller spawns `ui-ux-designer`, never `frontend-specialist` |
| Let `ui-ux-designer` edit files or run scripts | Read-only critic — fixes belong to `frontend-specialist`; the controller persists its reports |
| Apply ui-ux-pro-max palette output | CLI contributes UX/typography/layout; GPUS tokens are canonical |
| Skip the Phase 5.5 review gate | `ui-ux-designer` closes the chain before `/verify quick` |
