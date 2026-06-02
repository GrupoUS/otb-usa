---
description: Iterative design enhancement chain (audit → bolder → animate → colorize → overdrive). 5 phases spawn frontend-specialist foreground. Use --from=<phase> to resume. Ends with /verify quick.
workflow_type: prompt-chaining
---

# /design-improve — Iterative Design Enhancement Chain

**ARGUMENTS**: $ARGUMENTS

> Sequential impeccable-skill chain. Each phase reads its reference file, spawns `frontend-specialist` (foreground, write-capable), produces a phase report under `${rulesDir}/agent-memory/design-improve/`, then advances. Single `/verify quick` gate at the end. Resume mid-chain with `--from=<phase>`.

---

## Stopping Conditions

- STOP if any phase reports a Maestro gate FAIL → present report, ASK user before retry
- STOP if a phase introduces hardcoded hex (`#[0-9a-fA-F]{3,8}`) in changed files
- STOP if a phase touches files outside the resolved SCOPE glob
- STOP if 2 consecutive phases produce zero file changes → ASK (likely scope mis-targeted)
- STOP after 3 phases if `bunx astro check` errors accumulate (do not let errors compound across phases)
- STOP if `/verify quick` returns `NEEDS-WORK` → surface gate + all agent-memory reports, ASK user (no auto-retry)
- ASK if glob resolves to 0 files
- ASK before Phase 5 (`overdrive`) when SCOPE includes protected GPUS Astro landing surfaces (`src/lib/whatsapp.ts`, `src/content.config.ts`, `astro.config.mjs`, `${content.productJson}`) because changes may affect CTA, schema, SEO, or build contract

---

## 0. Context load (WISC)

```typescript
Skill("superpowers:using-superpowers"); // meta — bootstrap (per _shared.md § 0.5)
```

1. Run `/prime frontend` — loads `.claude/rules/DESIGN.md` (merged web-layer rule).
2. If continuing a prior session → read `${rulesDir}/docs/evolution/HANDOFF.md` first.

**Tier 2 (auto-loaded on `src/**`):** `.claude/rules/DESIGN.md`, `.claude/rules/frontend.md`, `.claude/rules/astro.md` — tokens, mobile scroll owner, motion canon, static Astro contract.

**Tier 3 references (read on demand inside the spawned agent):**
- Project design system foundation: `Skill("gpus-theme")` → Navy/Gold tokens and design canon
- Anti-AI-slop/product gates: `Skill("gpus-theme")` + `Skill("grupo-us")`
- Astro implementation guardrails: `Skill("astro")`
- impeccable methodology: `Skill("impeccable")` (SKILL.md is the router; per-phase reference files live in `.claude/skills/impeccable/reference/`)

---

## 1. Argument parsing

`$ARGUMENTS` shape: `<scope> [--from=<phase>]`

| Token | Meaning | Default |
|---|---|---|
| first positional (no `--` prefix) | scope (alias · file path · or glob) | **required** |
| `--from=audit\|bolder\|animate\|colorize\|overdrive` | resume at named phase | `audit` |

### 1.1 Scope resolution

The first positional token is classified into one of three forms:

| Form | Detection | Resolution |
|---|---|---|
| **Glob** | contains `*`, `?`, `{`, `[` | used as-is via `Glob(pattern)` |
| **Path** | contains `/` OR ends with `.tsx`/`.ts`/`.css`/`.md` | used as-is (single-file or directory) |
| **Alias** | bare word, no `/`, no extension, no glob char | expanded via the alias map below |

### 1.2 Alias map (GPUS Astro landing surfaces)

> The section→anchor map below comes from `.claude/config.json` `content.sections`; anchors are referenced as `${content.sections.<key>}`.

For an alias, expand to the union of these globs/files (any that exist):

```
src/components/landing/<alias>.astro
src/components/landing/<alias>/**
src/components/shared/<alias>.astro
src/components/layout/<alias>.astro
src/pages/<alias>.astro
src/pages/index.astro
${content.productJson}
src/styles/global.css
```

Common aliases:

| Alias | Surface |
|---|---|
| `landing` / `aula` | Full ${project.displayName} landing (`src/pages`, `src/components/landing`, product JSON, global styles) |
| `hero` | Hero section and hero copy (`Hero.astro`, anchor `${content.sections.hero}`) |
| `audience` / `para-quem` | Audience section (`Audience.astro`, anchor `${content.sections.audience}`) |
| `learn` | What-you-learn section (`Learn.astro`, anchor `${content.sections.learn}`) |
| `authority` / `autoridade` | Dra. Sacha authority section (`Authority.astro`, anchor `${content.sections.authority}`) |
| `nextstep` | Next-step / program teaser section (`NextStep.astro`) |
| `form` / `inscricao` | Registration form section (`${lead.formComponent}`, anchor `${content.sections.form}`) |
| `faq` | FAQ section (`FAQ.astro`, anchor `${content.sections.faq}`) |
| `finalcta` | Final CTA section (`FinalCTA.astro`) |
| `mobilecta` | Sticky mobile CTA bar (`MobileCTABar.astro`) |
| `header` / `footer` | Layout shell (`src/components/layout/Header.astro`, `Footer.astro`) |

If the alias has no matching file → STOP and ASK ("scope `<alias>` did not match a GPUS Astro landing surface; pass a path or glob instead").

### 1.3 Examples

```
/design-improve landing                                  # full GPUS Astro landing surface
/design-improve hero --from=animate                       # hero + resume mid-chain
/design-improve src/components/landing/**                 # explicit glob
/design-improve src/components/landing/Hero.astro         # single file
/design-improve "src/components/landing/{Hero,FAQ}.astro" # multi-file glob
```

Resolve via `Glob(pattern)` (after alias expansion if applicable). If 0 files match → STOP and ASK.

---

## 2. Phase sequence (strict order)

| # | Phase | Reference | Owner | Phase-specific constraint |
|---|---|---|---|---|
| 1 | audit | `audit.md` | frontend-specialist | Report-only if zero defects found; fix in-phase if defects found |
| 2 | bolder | `bolder.md` | frontend-specialist | Gold accent budget ≤10% surface in premium/restrained mode |
| 3 | animate | `animate.md` | frontend-specialist | `prefers-reduced-motion` mandatory; prefira `transform`/`opacity`, layout/3D/parallax OK quando o efeito pedir |
| 4 | colorize | `colorize.md` | frontend-specialist | Semantic tokens only — no new hex |
| 5 | overdrive | `overdrive.md` | frontend-specialist | Maestro Template Test must still pass post-overdrive |

`--from=<phase>` skips earlier phases. Later phases never run before earlier ones.

---

## 3. Phase blocks

Each phase below uses the same template. Variables shown in `{{...}}`.

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

    LOAD BEFORE ANY EDIT (mandatory, in order):
      1. Skill("superpowers:using-superpowers")
      2. Skill("gpus-theme")                              // Navy/Gold tokens — NEVER substitute
      3. Skill("ui-ux-pro-max")                           // creative execution layer
      4. Skill("impeccable")                              // router (setup + register)
      5. Read .claude/skills/impeccable/reference/{{PHASE_FILE}}
      6. Read .claude/agent-memory/design-improve/{{prev-phase-slug}}.md (if N > 1)
      7. node .claude/skills/impeccable/scripts/load-context.mjs

    HARD CONSTRAINTS (cardinal rules — non-negotiable):
      - Hardcoded hex FORBIDDEN — semantic tokens only (bg-primary, text-foreground, border-border, etc.)
      - Bun only — never npm / pnpm / yarn
      - LF line endings (Biome rejects CRLF)
      - Maestro gates apply EVERY phase: Safe Split / Bento Trap / Blue Trap / Line Trap. Glass/Glow gates: flag glass/glow usado SEM intenção/camadas de apoio (não penalizar profundidade premium intencional — ver DESIGN.md § Depth)
      - Prefira GPU-composited (transform/opacity); layout props / 3D / parallax permitidos quando o efeito pedir — degrade sob prefers-reduced-motion
      - prefers-reduced-motion mandatory if you change motion
      - impeccable LAYERS ON TOP of gpus-theme — never replace Navy/Gold tokens, palette anchors, or motion canon

    PHASE-SPECIFIC CONSTRAINT:
      {{PHASE_SPECIFIC_CONSTRAINT}}

    DELIVERABLE (write to .claude/agent-memory/design-improve/{{phase-slug}}.md):
      - PHASE COMMITMENT (3–5 lines: what changes / what stays)
      - Files touched (absolute paths)
      - Diff summary (one line per file)
      - Deferred items (out-of-scope work owned by later phases)
      - Maestro self-check: 6 gates → PASS / N/A
      - Return < 2000 tokens to main context (per .claude/rules/agents.md)

    DO NOT:
      - Run /verify (chain controller runs it once at the end)
      - Spawn other agents (you are the leaf executor)
      - Touch files outside SCOPE glob
      - Substitute impeccable register for the Navy/Gold palette
  `,
});
```

**Gate before advancing to Phase N+1 (chain controller checks):**

1. Expected agent-memory file exists at `.claude/agent-memory/design-improve/{{phase-slug}}.md`
2. Maestro self-check section shows no FAIL
3. `Grep("#[0-9a-fA-F]{3,8}")` on changed files = 0 matches
4. If any gate fails → STOP, surface report, ASK user before retry

### Phase 1 — audit (`frontend-specialist` + impeccable/audit.md)

**Skip when:** `--from` resolves to `bolder`, `animate`, `colorize`, or `overdrive`.
**Inputs:** `$ARGUMENTS` SCOPE only (first phase).
**PHASE_SPECIFIC_CONSTRAINT:** If zero defects found → produce report only, do NOT change files. If defects found → fix in-phase before producing report.

### Phase 2 — bolder (`frontend-specialist` + impeccable/bolder.md)

**Skip when:** `--from` resolves to `animate`, `colorize`, or `overdrive`.
**Inputs:** `.claude/agent-memory/design-improve/audit.md` (Phase 1 deferred bold-up opportunities).
**PHASE_SPECIFIC_CONSTRAINT:** Respect the gold accent budget ≤10% surface (premium/restrained register). Only adjust intensity, weight, contrast, and structural boldness — never replace token anchors.

### Phase 3 — animate (`frontend-specialist` + impeccable/animate.md)

**Skip when:** `--from` resolves to `colorize` or `overdrive`.
**Inputs:** `.claude/agent-memory/design-improve/bolder.md`.
**PHASE_SPECIFIC_CONSTRAINT:** `prefers-reduced-motion` block mandatory in every motion change. Prefira `transform`/`opacity` por performance; layout props / 3D / parallax permitidos quando o efeito pedir (ver `docs/motion-depth-playbook.md`).

### Phase 4 — colorize (`frontend-specialist` + impeccable/colorize.md)

**Skip when:** `--from` resolves to `overdrive`.
**Inputs:** `.claude/agent-memory/design-improve/animate.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Semantic tokens only. No new hex values. If a color role is missing → STOP and ASK before introducing a new token.

### Phase 5 — overdrive (`frontend-specialist` + impeccable/overdrive.md)

**Skip when:** never (last phase).
**Inputs:** `.claude/agent-memory/design-improve/colorize.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Maestro Template Test must still pass post-overdrive. Re-run the 6-gate self-check after the change. Pre-flight ASK gate fires if SCOPE includes protected GPUS Astro landing surfaces (`src/lib/whatsapp.ts`, `src/content.config.ts`, `astro.config.mjs`, `${content.productJson}`).

---

## 4. End-of-chain verification

After the last executed phase (full chain OR last phase when `--from` was used) completes its gate:

```typescript
SlashCommand("/verify quick");
```

`/verify quick` runs the project gates (`bun run lint`, `bunx astro check`, `bun run build`) + spec compliance only — single gate at chain end, NOT per phase.

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
| Run `frontend-specialist` background | Foreground only (background silently denies Write/Edit) |
| Skip `Skill("gpus-theme")` in phase prompts | Load EVERY phase — impeccable LAYERS on top of gpus-theme |
| Substitute impeccable palette for Navy/Gold anchors | impeccable enriches color strategy; Navy/Gold stays canonical |
| Run `/verify` per phase | Single `/verify quick` at end-of-chain (locked decision) |
| Use `tsc --noEmit` / `bunx tsc` | `bunx astro check` per AGENTS.md cardinal rules |
| Hardcode hex during `colorize` / `bolder` | Semantic tokens (`bg-primary`, `text-gold-500`, etc.) |
| Skip Maestro Template Test after `overdrive` | Re-run all 6 gates after overdrive — it's the highest-risk phase |
| Auto-retry on `/verify quick` failure | Stopping conditions require ASK — never silent retry |
| Spawn other agents from inside a phase | Leaf executor only — chain controller orchestrates |
