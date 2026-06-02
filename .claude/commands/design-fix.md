---
description: Production-readiness design chain (onboard → harden → typeset → layout → adapt → optimize → polish). 7 phases spawn frontend-specialist foreground. typeset combines typeset.md + typography.md + ux-writing.md. Ends with /verify quick.
workflow_type: prompt-chaining
---

# /design-fix — Production-Readiness Design Chain

**ARGUMENTS**: $ARGUMENTS

> Sequential impeccable-skill chain focused on production-readiness gaps: onboarding flows, hardening (i18n / error / empty / dataset extremes), typography + microcopy, spatial layout, multi-device adaptation, runtime optimization, final polish. Each phase spawns `frontend-specialist` foreground (write-capable), produces a phase report under `${rulesDir}/agent-memory/design-fix/`. Single `/verify quick` gate at chain end. Resume with `--from=<phase>`.

---

## Stopping Conditions

- STOP if any phase reports a Maestro gate FAIL → present report, ASK user before retry
- STOP if Phase 2 (`harden`) introduces error / empty / loading-state regressions caught by `bunx astro check`
- STOP if Phase 5 (`adapt`) breaks the mobile scroll-owner rule from `DESIGN.md` (single `ScrollArea` at layout root)
- STOP if Phase 6 (`optimize`) regresses bundle size > 5% → escalate to `/perf build`
- STOP if a phase introduces hardcoded hex (`#[0-9a-fA-F]{3,8}`) in changed files
- STOP if a phase touches files outside the resolved SCOPE glob
- STOP if scope resolves to 0 files
- STOP if `/verify quick` returns `NEEDS-WORK` → surface gate + all agent-memory reports, ASK user (no auto-retry)
- ASK if SCOPE points outside `src/**`, `public/**`, `DESIGN.md`, or ${project.displayName} documentation (this chain is frontend-only)
- ASK if `--from=optimize` is invoked on > 50 files (recommend splitting the run)
- ASK if Phase 1 (`onboard`) targets a surface with no happy-path implementation yet (route to `/design` first instead)

---

## 0. Context load (WISC)

```typescript
Skill("superpowers:using-superpowers"); // meta — bootstrap (per _shared.md § 0.5)
```

1. Run `/prime frontend` — loads `.claude/rules/DESIGN.md`.
2. If continuing a prior session → read `${rulesDir}/docs/evolution/HANDOFF.md` first.

**Tier 2 (auto-loaded on `src/**`):** `.claude/rules/DESIGN.md`, `.claude/rules/frontend.md`, `.claude/rules/astro.md` — tokens, mobile scroll owner, motion canon, static Astro contract.

**Tier 3 references (read on demand inside the spawned agent):**
- Project design system foundation: `Skill("gpus-theme")` → Navy/Gold tokens and design canon
- Product/content guardrails: `Skill("grupo-us")`
- Astro implementation guardrails: `Skill("astro")`
- impeccable methodology: `Skill("impeccable")` (per-phase references at `.claude/skills/impeccable/reference/`)
- For Phase 3 (typeset) ONLY: `typography.md` + `ux-writing.md` loaded alongside `typeset.md`

---

## 1. Argument parsing

`$ARGUMENTS` shape: `<scope> [--from=<phase>]`

| Token | Meaning | Default |
|---|---|---|
| first positional (no `--` prefix) | scope (alias · file path · or glob) | **required** |
| `--from=onboard\|harden\|typeset\|layout\|adapt\|optimize\|polish` | resume at named phase | `onboard` |

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
/design-fix landing                                      # full GPUS Astro landing surface
/design-fix hero --from=polish                            # hero + final polish only
/design-fix faq --from=harden                             # FAQ + start at hardening
/design-fix src/components/landing/**                     # explicit glob
/design-fix src/components/landing/Hero.astro             # single file
```

Resolve via `Glob(pattern)` (after alias expansion if applicable). If 0 files match → STOP and ASK.

---

## 2. Phase sequence (strict order)

| # | Phase | Reference(s) | Owner |
|---|---|---|---|
| 1 | onboard | `onboard.md` | frontend-specialist |
| 2 | harden | `harden.md` | frontend-specialist |
| 3 | typeset | `typeset.md` + `typography.md` + `ux-writing.md` | frontend-specialist |
| 4 | layout | `layout.md` | frontend-specialist |
| 5 | adapt | `adapt.md` | frontend-specialist |
| 6 | optimize | `optimize.md` | frontend-specialist |
| 7 | polish | `polish.md` | frontend-specialist |

Phase 3 is the only phase that loads three reference files. `typeset.md` provides the orchestrator overview; `typography.md` owns type hierarchy / scale / line length; `ux-writing.md` owns labels / errors / microcopy / tone.

`--from=<phase>` skips earlier phases. Later phases never run before earlier ones.

---

## 3. Phase blocks

Each phase below uses the same template. Variables shown in `{{...}}`.

### Shared phase-block template (DO NOT collapse)

```typescript
Agent({
  subagent_type: "frontend-specialist",
  run_in_background: false,
  description: "design-fix / {{PHASE_NAME}} — {{resolvedScope}}",
  prompt: `
    SCOPE: {{resolvedScope}}
    PHASE: {{PHASE_NAME}} ({{N}}/7) — impeccable methodology
    CHAIN: design-fix

    LOAD BEFORE ANY EDIT (mandatory, in order):
      1. Skill("superpowers:using-superpowers")
      2. Skill("gpus-theme")                              // Navy/Gold tokens — NEVER substitute
      3. Skill("ui-ux-pro-max")                           // creative execution layer
      4. Skill("impeccable")                              // router (setup + register)
      5. Read .claude/skills/impeccable/reference/{{PHASE_FILE}}
      6. {{EXTRA_REFS}}                                   // Phase 3 only: typography.md + ux-writing.md
      7. Read .claude/agent-memory/design-fix/{{prev-phase-slug}}.md (if N > 1)
      8. node .claude/skills/impeccable/scripts/load-context.mjs

    HARD CONSTRAINTS (cardinal rules — non-negotiable):
      - Hardcoded hex FORBIDDEN — semantic tokens only
      - Bun only — never npm / pnpm / yarn
      - LF line endings (Biome rejects CRLF)
      - Maestro gates apply EVERY phase: Safe Split / Bento Trap / Blue Trap / Line Trap. Glass/Glow gates: flag glass/glow usado SEM intenção/camadas de apoio (não penalizar profundidade premium intencional — ver DESIGN.md § Depth)
      - Prefira GPU-composited (transform/opacity); layout props / 3D / parallax permitidos quando o efeito pedir — degrade sob prefers-reduced-motion
      - prefers-reduced-motion mandatory if you change motion
      - impeccable LAYERS ON TOP of gpus-theme — never replace Navy/Gold tokens, palette anchors, or motion canon
      - Single ScrollArea per layout root (mobile scroll owner rule from DESIGN.md)

    PHASE-SPECIFIC CONSTRAINT:
      {{PHASE_SPECIFIC_CONSTRAINT}}

    DELIVERABLE (write to .claude/agent-memory/design-fix/{{phase-slug}}.md):
      - PHASE COMMITMENT (3–5 lines: what changes / what stays)
      - Files touched (absolute paths)
      - Diff summary (one line per file)
      - Deferred items (out-of-scope work owned by later phases)
      - Maestro self-check: 6 gates → PASS / N/A
      - Return < 2000 tokens to main context

    DO NOT:
      - Run /verify (chain controller runs it once at the end)
      - Spawn other agents (you are the leaf executor)
      - Touch files outside SCOPE glob
      - Substitute impeccable register for the Navy/Gold palette
  `,
});
```

**Gate before advancing to Phase N+1:**

1. Expected agent-memory file exists at `.claude/agent-memory/design-fix/{{phase-slug}}.md`
2. Maestro self-check section shows no FAIL
3. `Grep("#[0-9a-fA-F]{3,8}")` on changed files = 0 matches
4. Phase-specific gate (below) passes
5. If any gate fails → STOP, surface report, ASK user

### Phase 1 — onboard (`frontend-specialist` + impeccable/onboard.md)

**Skip when:** `--from` resolves to any later phase.
**Inputs:** `$ARGUMENTS` SCOPE only.
**PHASE_SPECIFIC_CONSTRAINT:** Onboarding additions must be skippable + dismissable; never block. Returning users see it at most once (persist dismissal state). If surface has no happy-path implementation yet → STOP and ASK.

### Phase 2 — harden (`frontend-specialist` + impeccable/harden.md)

**Skip when:** `--from` resolves to `typeset` or later.
**Inputs:** `.claude/agent-memory/design-fix/onboard.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Cover the 8 hardening dimensions (text overflow, i18n + RTL, error handling, edge cases, large datasets, permissions, input validation, a11y). Run `bunx astro check` mid-phase; STOP on regression. Expected extremes: 0 items, 1000+ items, very long text, emoji, CJK.

### Phase 3 — typeset (`frontend-specialist` + impeccable/typeset.md + typography.md + ux-writing.md)

**Skip when:** `--from` resolves to `layout` or later.
**Inputs:** `.claude/agent-memory/design-fix/harden.md`.
**EXTRA_REFS:** `Read .claude/skills/impeccable/reference/typography.md` + `Read .claude/skills/impeccable/reference/ux-writing.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Type hierarchy (≥1.25 scale) + line length (65–75ch body) + weight consistency + microcopy (labels, error messages, CTAs) in same phase. Copy IS half the typeset pass — never treat as font-swap only.

### Phase 4 — layout (`frontend-specialist` + impeccable/layout.md)

**Skip when:** `--from` resolves to `adapt` or later.
**Inputs:** `.claude/agent-memory/design-fix/typeset.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Spatial design (rhythm, proximity, grouping). Vary spacing — no monotone card grids. Hierarchy via space, not borders or bg shifts unless justified.

### Phase 5 — adapt (`frontend-specialist` + impeccable/adapt.md)

**Skip when:** `--from` resolves to `optimize` or `polish`.
**Inputs:** `.claude/agent-memory/design-fix/layout.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Multi-device adaptation (mobile 320–767, tablet 768–1023, desktop 1024+). Touch targets ≥44×44px. **Mobile scroll-owner rule:** single `ScrollArea` at layout root — verify before report.

### Phase 6 — optimize (`frontend-specialist` + impeccable/optimize.md)

**Skip when:** `--from` resolves to `polish`.
**Inputs:** `.claude/agent-memory/design-fix/adapt.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Image / JS / CSS / font / animation perf. If bundle regresses > 5% during this phase → STOP and escalate to `/perf build`. Run `bun run build` mid-phase to validate.

### Phase 7 — polish (`frontend-specialist` + impeccable/polish.md)

**Skip when:** never (last phase).
**Inputs:** `.claude/agent-memory/design-fix/optimize.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Final 20-item checklist from `polish.md`. Polish runs AFTER optimize — never reverse the order; polish targets need a stable bundle. Drift root-cause fixes only — replace one-offs with tokens, do not patch around them.

---

## 4. End-of-chain verification

After the last executed phase completes its gate:

```typescript
SlashCommand("/verify quick");
```

`/verify quick` runs the project gates (`bun run lint`, `bunx astro check`, `bun run build`) + spec compliance only — single gate at chain end, NOT per phase.

On `NEEDS-WORK`:
- Report the failing gate
- Surface every `.claude/agent-memory/design-fix/<phase>.md` from this run
- ASK user (do not auto-retry)

On `VERIFIED` / `VERIFIED-WITH-NOTES`:
- Summarize files touched per phase
- Hand off to `/evolve` if the user wants learning capture

---

## 5. Anti-patterns

| Don't | Do |
|---|---|
| Run phases out of order | Strict onboard → harden → typeset → layout → adapt → optimize → polish |
| Run `frontend-specialist` background | Foreground only (background silently denies Write/Edit) |
| Skip `Skill("gpus-theme")` in phase prompts | Load EVERY phase — impeccable LAYERS on top |
| Treat `typeset` as font-swap only | Load `typography.md` AND `ux-writing.md` — copy is half of typeset |
| Run `polish` before `optimize` | Polish runs LAST — needs a stable bundle |
| Harden greenfield code with no happy-path states | Route to `/design` first if no implementation exists |
| Substitute impeccable palette for Navy/Gold anchors | impeccable enriches; Navy/Gold stays canonical |
| Run `/verify` per phase | Single `/verify quick` at end-of-chain |
| Use `tsc --noEmit` / `bunx tsc` | `bunx astro check` per AGENTS.md |
| Hardcode hex anywhere in the chain | Semantic tokens only |
| Break single-ScrollArea-per-layout rule during `adapt` | Verify scroll owner before phase report |
| Auto-retry on `/verify quick` failure | ASK user — never silent retry |
| Spawn other agents from inside a phase | Leaf executor only — chain controller orchestrates |
