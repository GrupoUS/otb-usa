---
description: Adaptive UX production-readiness chain for the existing OTB landing. Phase 0 uses uxmaster to classify surgical vs structural changes; structural work compares three UX directions and requires approval before onboard → harden → typeset → layout → adapt → optimize → polish. Skills: uxmaster + impeccable 4.x + ui-ux-pro-max + gpus-theme + grupo-us. Ends with /verify quick.
workflow_type: prompt-chaining
---

# /design-fix — Production-Readiness Design Chain

**ARGUMENTS**: $ARGUMENTS

> Adaptive production-readiness chain for the existing GPUS Astro landing. Phase 0 loads `graph-powers:uxmaster`, inspects the resolved scope plus an optional functional brief, and locks a measurable UX direction before code changes. **Surgical** fixes get a compact UX contract and continue automatically; **structural** changes compare three genuinely different directions and require user selection before implementation. The impeccable chain then runs onboarding, hardening, typesetting, layout, adaptation, optimization, and polish, with `graph-powers:ui-ux-designer` read-only critique at both ends and a single `/verify quick` gate.

---

## Stopping Conditions

- STOP if any phase reports a Maestro gate FAIL → present report, ASK user before retry
- STOP before any implementation when a structural Phase 0 has no user-approved `decision.md`
- STOP if user, primary task, or expected result remains decision-relevant with confidence < 3 after scope inspection
- STOP on `--from` when `baseline.md`, `decision.md`, the scope manifest, or the required predecessor report is missing/incompatible
- STOP if Phase 2 (`harden`) introduces error/empty/loading-state regressions caught by `bunx astro check`
- STOP if Phase 6 (`optimize`) regresses the initial JS bundle > 5% → escalate to `/perf build`
- STOP if a phase introduces hardcoded hex (`#[0-9a-fA-F]{3,8}`) outside `src/styles/global.css`
- STOP if a phase introduces an inline `wa.me/` outside `src/lib/whatsapp.ts`
- STOP if a phase hardcodes product copy in `.astro`/`.tsx` instead of `src/content/products/otb.json`
- STOP if a phase touches files outside the resolved SCOPE glob
- STOP if a phase touches a protected file (`astro.config.mjs`, `src/lib/whatsapp.ts`, `src/content.config.ts`, `package.json`, `tsconfig.json`, `biome.json`, `lefthook.yml`) → ASK first
- STOP if scope resolves to 0 files
- STOP if `/verify quick` returns `NEEDS-WORK` → surface gate + all agent-memory reports, ASK user (no auto-retry)
- STOP if the `graph-powers:ui-ux-designer` review gate (Phase 7.5) reports Critical issues → present report, ASK user
- ASK if SCOPE points outside `src/**`, `public/**`, root `DESIGN.md`, or project docs (this chain is frontend-only)
- ASK if `--from=optimize` is invoked on > 50 files (recommend splitting the run)
- ASK if a phase would introduce a React island (`client:*`) — the landing is currently zero-island

---

## 0. Context load (WISC)

```typescript
Skill("superpowers:using-superpowers"); // meta — bootstrap (per _shared.md § 0.5)
Skill("graph-powers:uxmaster");                      // user/task/flow/measurement layer; NEVER a token source
```

1. Run `/prime frontend` — loads `.claude/rules/DESIGN.md`, `frontend.md`, `astro.md`.
2. If continuing a prior session → read `${rulesDir}/docs/evolution/HANDOFF.md` first.

**Tier 2 (auto-loaded on `src/**`):** `.claude/rules/DESIGN.md`, `.claude/rules/frontend.md`, `.claude/rules/astro.md`.

**Tier 3 references (read on demand inside the spawned agent):**
- Visual authority: root `DESIGN.md` + live `src/styles/global.css @theme` + `Skill("gpus-theme")`
- Positioning / copy / funnel / honesty guardrails: root `PRODUCT.md` + `Skill("grupo-us")`
- Astro static-only contracts: `Skill("graph-powers:astro")` + `.claude/rules/astro.md`
- impeccable methodology (**v4.1.1**): `Skill("impeccable")` (per-phase references at `.claude/skills/impeccable/reference/`). Setup script is `scripts/context.mjs`; **`load-context.mjs` no longer exists**. The `brand`/`product` **register** was replaced by four **modes** — this landing is **Persuade**. `reference/craft-floor.md` carries the quality floor + refuse list and loads **last**, right before editing UI.
- ui-ux-pro-max design intelligence: `Skill("ui-ux-pro-max")` — CLI `python .claude/skills/ui-ux-pro-max/scripts/search.py` (UX / typography / layout / landing / `--stack astro`; **palette suggestions discarded — GPUS tokens canonical**)
- uxmaster behavioral layer: the controller loads `Skill("graph-powers:uxmaster")`; each leaf agent loads `Skill("graph-powers:uxmaster")` itself and reads only the reference the controller routed it to, because subagents do not inherit parent skills. Never hand a leaf agent a literal path into the plugin: that path carries the plugin version and dangles on the next update
- For Phase 3 (typeset) ONLY: `clarify.md` loads alongside `typeset.md` (impeccable 4.x removed the standalone `typography.md` / `ux-writing.md`)

**uxmaster progressive-disclosure routing:**

| Surface signal | Additional reference |
|---|---|
| Every UI scope | `references/ux-foundations.md` |
| Measurement, comparison, persuasion, or final review | `references/metrics-ethics-process.md` |
| Hero, CTA, acquisition, conversion (**default for this landing**) | `references/conversion-and-landing.md` |
| First-view orientation, activation, aha moment | `references/onboarding-activation.md` |
| Positioning, differentiation, ICP, objection handling | `references/positioning-and-differentiation.md` |
| Pricing, lots, offer framing, retention | `references/pricing-retention-expansion.md` |
| Named behavioral lever | `references/engagement-psychology.md` |

Load only matched references. `graph-powers:uxmaster` supplies behavioral rationale and acceptance criteria; `gpus-theme` + root `DESIGN.md` remain canonical for palette, tokens, typography assets, and motion. The **honesty gate is hard**: no fabricated urgency, scarcity, proof, results, dates, or credentials — it also matches root `PRODUCT.md` ("copy não confirmada = PROPOSTA").

---

## 1. Argument parsing

`$ARGUMENTS` shape: `<scope> [brief livre...] [--from=<phase>]`

| Token | Meaning | Default |
|---|---|---|
| first positional (no `--` prefix) | scope (alias · file path · or glob) | **required** |
| remaining non-flag tokens | functional brief: audience, device, objection, offer stage, constraints, examples | infer from resolved code + JSON |
| `--from=onboard\|harden\|typeset\|layout\|adapt\|optimize\|polish` | resume at named phase | `onboard` |

After extracting the first positional token and supported flags, join the remaining non-flag text verbatim as `FEATURE_BRIEF`. Do not reinterpret words inside the brief as paths or aliases.

### 1.1 Scope resolution

| Form | Detection | Resolution |
|---|---|---|
| **Glob** | contains `*`, `?`, `{`, `[` | used as-is via `Glob(pattern)` |
| **Path** | contains `/` OR ends with `.astro`/`.ts`/`.tsx`/`.css`/`.json`/`.md` | used as-is |
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

If the alias has no matching file → STOP and ASK.

### 1.3 Examples

```
/design-fix landing
/design-fix investimento "reduzir dúvida sobre lotes e parcelamento no mobile"
/design-fix faq --from=typeset
/design-fix turmas "público decide no celular; priorizar clareza de datas" --from=layout
/design-fix src/components/landing/**
/design-fix src/components/landing/Speakers.astro
```

Resolve via `Glob(pattern)` (after alias expansion). If 0 files match → STOP and ASK. Persist the sorted resolved file list as `SCOPE_MANIFEST` in `baseline.md`, `decision.md`, and every phase report; this is the stable scope identity used by resume validation.

### 1.4 Brief inference and resume validation

- When `FEATURE_BRIEF` is empty, infer audience, primary decision, device assumptions, existing states, and constraints from `src/content/products/otb.json`, component markup, root `PRODUCT.md`, and neighboring patterns. Mark every non-evidenced inference `[ASSUMED]`.
- Ask only when an unknown would materially change the selected layout, section order, CTA hierarchy, or offer framing. Optional context may remain an explicit assumption.
- Any explicit `--from` skips Phase 0 only after `baseline.md` and `decision.md` exist, both contain the exact current `SCOPE_MANIFEST`, and `decision.md` is `USER-LOCKED` or `AUTO-LOCKED-SURGICAL`.
- Resuming after `onboard` also requires the immediately preceding phase report for the same manifest (`harden` requires `onboard.md`, `typeset` requires `harden.md`, and so on). Missing or incompatible artifacts → STOP and ask to rerun from the earliest valid phase.

---

## 2. Phase sequence (strict order)

| # | Phase | Reference(s) | Owner |
|---|---|---|---|
| 0 | UX baseline + decision gate | uxmaster + code evidence + ui-ux-designer critique | controller + ui-ux-designer (read-only) |
| 1 | onboard | `onboard.md` | frontend-specialist |
| 2 | harden | `harden.md` | frontend-specialist |
| 3 | typeset | `typeset.md` + `clarify.md` | frontend-specialist |
| 4 | layout | `layout.md` | frontend-specialist |
| 5 | adapt | `adapt.md` | frontend-specialist |
| 6 | optimize | `optimize.md` | frontend-specialist |
| 7 | polish | `polish.md` | frontend-specialist |

Phase 3 is the only phase that loads two impeccable references: `typeset.md` owns type hierarchy / scale / line length, `clarify.md` owns labels, errors, microcopy, and tone. The standalone `typography.md` and `ux-writing.md` files were **removed in impeccable 4.x** — do not reference them.

`--from=<phase>` skips earlier phases only after the resume contract in §1.4 passes. Later phases never run before earlier ones, and no implementation phase runs without a locked `decision.md`.

---

## 3. Phase blocks

Each phase uses the same template. Variables shown in `{{...}}`.

Every `Agent()` call follows `.claude/skills/senior-prompt-engineer/references/agent-handoff-contracts.md` §§1–3. The controller injects the Mandatory Context block from §1 as `{{MANDATORY_CONTEXT_BLOCK}}` and requires the canonical Context Handoff from §2; do not redeclare either schema here.

### Shared phase-block template (DO NOT collapse)

```typescript
Agent({
  subagent_type: "graph-powers:frontend-specialist",
  run_in_background: false,
  description: "design-fix / {{PHASE_NAME}} — {{resolvedScope}}",
  prompt: `
    {{MANDATORY_CONTEXT_BLOCK}}

    SCOPE: {{resolvedScope}}
    SCOPE_MANIFEST: {{scopeManifest}}
    PHASE: {{PHASE_NAME}} ({{N}}/7) — impeccable methodology
    CHAIN: design-fix
    MODE: Persuade (landing — the visitor decides and acts; design IS the product)

    LOAD BEFORE ANY EDIT (mandatory, in order):
      1. Skill("superpowers:using-superpowers")
      2. Skill("gpus-theme")                              // Navy/Gold tokens — NEVER substitute
      3. Skill("grupo-us")                                // voice, funnel, CTA, LGPD/legal guardrails
      4. Skill("graph-powers:astro")                                   // static MPA + Content Collections
      5. Skill("ui-ux-pro-max")                           // creative execution layer
      6. Skill("impeccable")                              // router (Setup + mode)
      7. node .claude/skills/impeccable/scripts/context.mjs --target {{firstScopeFile}}
         // impeccable 4.x Setup step 1 — replaces the removed load-context.mjs. Run ONCE per session.
         // It emits the full PRODUCT.md + DESIGN.md — never re-run it.
         // A CONTEXT_STALE finding is REPORTED, never repaired here.
      8. Read .claude/skills/impeccable/reference/{{PHASE_FILE}}
      9. {{EXTRA_REFS}}                                   // Phase 3 only: clarify.md
     10. {{UXMASTER_REFS}}                                // routed table below; empty for optimize
     11. Read .claude/agent-memory/design-fix/baseline.md
     12. Read .claude/agent-memory/design-fix/decision.md
     13. Read .claude/agent-memory/design-fix/{{prev-phase-slug}}.md (when a predecessor exists)
     14. Read .claude/skills/impeccable/reference/craft-floor.md  // LAST — right before editing UI
     15. python .claude/skills/ui-ux-pro-max/scripts/search.py "{{UIUX_QUERY}}" --domain {{UIUX_DOMAIN}}
         // consume UX / typography / layout / landing guidance ONLY;
         // any color/palette suggestion is DISCARDED (GPUS tokens canonical)

    HARD CONSTRAINTS (cardinal rules — non-negotiable):
      - Hardcoded hex FORBIDDEN outside src/styles/global.css @theme — semantic tokens only
        (documented exception: <meta theme-color> literal mirroring --color-navy)
      - Product copy lives in src/content/products/otb.json (schema src/content.config.ts).
        New field = schema + JSON + reader in ONE change. Never hardcode commercial copy in .astro
      - WhatsApp SSOT: src/lib/whatsapp.ts only. Never inline wa.me/. Messages keep the "Olá, Laura!" prefix
      - Astro static MPA only: no ClientRouter, no SSR adapter, no `prerender = false`
      - Prefer zero React islands; a client:* directive requires proven interactivity — ASK first
      - Icons: Lucide / inline SVG. NEVER emoji as UI icon
      - Bun only — never npm / pnpm / yarn
      - LF line endings (Biome rejects CRLF)
      - Maestro gates apply EVERY phase: Safe Split / Bento Trap / Blue Trap / Line Trap.
        Glass/Glow gates: flag glass/glow used WITHOUT intent or supporting layers — do NOT penalize
        deliberate premium depth (root DESIGN.md § Depth)
      - MOTION IS EXPRESSIVE: any property may be animated, `transition: all` is allowed,
        dramatic depth/shadow/glow/glass allowed. Prefer transform/opacity when equivalent, NOT mandatory.
        The single hard requirement is honoring prefers-reduced-motion (a11y)
      - Reveal-on-scroll uses [data-reveal] + IntersectionObserver behind the `.js` gate,
        with the <noscript> fallback in Layout.astro intact
      - Images always carry explicit width/height (CLS = 0); above-fold eager + fetchpriority="high"
      - impeccable LAYERS ON TOP of gpus-theme — never replace tokens, palette anchors, or motion canon
      - ui-ux-pro-max contributes UX/typography/layout intelligence — its palette output NEVER lands in code
      - uxmaster contributes user/task/flow/error-prevention criteria — never a palette source
      - Implement only the locked decision; never invent unsupported claims, dates, credentials, or offers
      - Persuasion must pass uxmaster's honesty gate: no fabricated urgency, proof, scarcity, progress,
        or hidden cost/exit. Unconfirmed copy ships as PROPOSTA, flagged in the report
      - Protected files (astro.config.mjs, src/lib/whatsapp.ts, src/content.config.ts, package.json,
        tsconfig.json, biome.json, lefthook.yml): do not edit — report and stop

    PHASE-SPECIFIC CONSTRAINT:
      {{PHASE_SPECIFIC_CONSTRAINT}}

    BEFORE WRITING THE REPORT (mechanical gate):
      node .claude/skills/impeccable/scripts/detect.mjs --json {{changedFiles}}
      // impeccable 4.x mechanical detector. Run ONCE, after the UI edits are finished.
      // Record the finding count in the report; fix P0/P1 in-phase.

    DELIVERABLE (write to .claude/agent-memory/design-fix/{{phase-slug}}.md):
      - PHASE COMMITMENT (3–5 lines: what changes / what stays)
      - SCOPE_MANIFEST (verbatim)
      - Files touched (absolute paths)
      - Diff summary (one line per file)
      - UX traceability: locked task/action/criterion → implemented change
      - State + error-prevention coverage affected by this phase
      - Detector result (finding count + fixed / remaining with reason)
      - Metric or usability hypothesis preserved for validation (never report estimates as observed data)
      - Deferred items (out-of-scope work owned by later phases)
      - Maestro self-check: 6 gates → PASS / N/A
      - Return < 2000 tokens to main context

    DO NOT:
      - Run /verify (chain controller runs it once at the end)
      - Spawn other agents (you are the leaf executor)
      - Touch files outside SCOPE glob
      - Substitute the impeccable mode's color strategy for the GPUS palette
      - Re-run context.mjs after step 7, or run "/impeccable doctor" or "/impeccable hooks"
  `,
});
```

**ui-ux-pro-max query per phase (`{{UIUX_QUERY}}` / `{{UIUX_DOMAIN}}`):**

| Phase | Query (adapt to surface) | Domain |
|---|---|---|
| onboard | "landing first viewport orientation scroll cue" | `landing` |
| harden | "error feedback validation empty state" | `ux` |
| typeset | "premium editorial font pairing line-height" | `typography` |
| layout | "landing section rhythm spacing hierarchy" | `landing` |
| adapt | "responsive touch mobile sticky cta" | `ux` |
| optimize | "image font loading performance" | `web` |
| polish | "accessibility focus contrast cursor" | `ux` |

Supplement with `--stack astro` for implementation patterns.

**uxmaster references per phase (`{{UXMASTER_REFS}}`):**

| Phase | References |
|---|---|
| onboard | `ux-foundations.md` + `conversion-and-landing.md` + `onboarding-activation.md` when first-view orientation applies |
| harden | `ux-foundations.md` |
| typeset | `ux-foundations.md` + `conversion-and-landing.md` (CTA / headline copy) |
| layout | `ux-foundations.md` + `conversion-and-landing.md` |
| adapt | `ux-foundations.md` |
| optimize | none — consume the locked UX criteria from artifacts; keep this phase performance-focused |
| polish | `ux-foundations.md` + `metrics-ethics-process.md` |

Each path is rooted at `.claude/skills/uxmaster/references/`. Add `positioning-and-differentiation.md` or `pricing-retention-expansion.md` when the scope signal matches (e.g. `investimento`, `turmas`, `why`).

**Gate before advancing to Phase N+1:**

1. Expected agent-memory file exists at `.claude/agent-memory/design-fix/{{phase-slug}}.md`
2. Report `SCOPE_MANIFEST` matches locked `baseline.md` and `decision.md`
3. UX traceability contains at least one locked criterion or an evidence-backed `N/A`
4. Maestro self-check section shows no FAIL
5. `Grep("#[0-9a-fA-F]{3,8}")` on changed files (excluding `src/styles/global.css`) = 0 matches
6. `Grep("wa\\.me/")` on changed files (excluding `src/lib/whatsapp.ts`) = 0 matches
7. Detector result recorded, with P0/P1 findings resolved or justified
8. Phase-specific gate (below) passes
9. If any gate fails → STOP, surface report, ASK user

### Phase 0 — UX baseline + adaptive decision gate

**Skip when:** explicit `--from` passes every resume check in §1.4. Otherwise Phase 0 always runs before edits.

#### 0A. Evidence-backed feature understanding (controller)

The controller reads the resolved files, `src/content/products/otb.json`, root `PRODUCT.md`, and the matched uxmaster references, then writes `.claude/agent-memory/design-fix/baseline.md` before spawning a critic. The artifact must contain:

1. Metadata: `SCOPE_MANIFEST`, `FEATURE_BRIEF`, classification, confidence, and evidence paths.
2. Section objective and the observable visitor outcome (what decision this surface must produce).
3. Visitor types, funnel stage, frequency/context of visit, and primary device assumptions (GPUS default: decision starts on mobile).
4. Primary decision plus primary, secondary, and exit actions (CTA hierarchy).
5. Required, optional, and supporting information — and which of it lives in the JSON SSOT today.
6. States present/absent: first viewport, scroll-reveal, JS-off (`<noscript>`), reduced-motion, long text, missing image, empty list, and (where a form exists) loading/error/success.
7. Objections, friction points, missing proof, and clearly labeled assumptions.
8. Baseline hypotheses: comprehension of the offer, scroll depth to CTA, clicks to WhatsApp/enrollment, perceived clarity. Estimates are hypotheses, never observed results.
9. Findings bucketed by onboard/harden/typeset/layout/adapt/optimize/polish with Critical/High/Medium priority and One Big Win.

Do not invent products, dates, credentials, prices, or partners. When code + JSON evidence cannot resolve a decision-relevant gap with confidence ≥3, STOP and ask one focused question.

#### 0B. Adaptive classification

Classify as **SURGICAL** only when every condition holds:

- The existing visitor path (scroll → understand → CTA) remains intact.
- The change is isolated to one component or one interaction/state.
- Section order, page composition, anchor map, and CTA hierarchy remain unchanged.
- No coordinated multi-component behavior and no offer/pricing framing change.

Classify as **STRUCTURAL** when any condition above fails, or when the request changes section order, page composition, anchor map, CTA hierarchy, or offer framing. Ambiguous/mixed scopes default to STRUCTURAL, because silent layout selection is the higher-risk choice.

#### 0C. Direction output

For **SURGICAL**, append a compact UX contract to `baseline.md`:

- Smallest coherent change, preserved strengths, decision/action affected, state coverage, error prevention, desktop/mobile behavior, acceptance criterion, and metric hypothesis.
- Do not generate three artificial layouts.
- Write `.claude/agent-memory/design-fix/decision.md` with `STATUS: AUTO-LOCKED-SURGICAL`, exact `SCOPE_MANIFEST`, chosen change, non-goals, assumptions, target actions, state checklist, and validation metrics.

For **STRUCTURAL**, append three genuinely different proposals to `baseline.md`, using only existing or explicitly requested content:

1. **Decisão rápida** — visitor already convinced; shortest path to CTA, front-loaded offer, minimal scroll.
2. **Clareza e prova** — skeptical/new visitor; progressive disclosure, objection handling, proof and authority before the ask.
3. **Narrativa premium** — experience-led; editorial pacing, imagery and motion carry the authority, CTA lands on emotional peaks.

For each proposal include: concept; section structure and order; information hierarchy; components reused/created; primary-CTA placement; the step-by-step visitor path; required states; validation/error-prevention rules; desktop/mobile behavior; advantages; disadvantages; best-fit visitor; and where it should not be used. Add one textual wireframe per proposal.

Then add:

- A 1–10 comparison for clarity, offer comprehension, path-to-CTA efficiency, trust/proof, scannability, mobile UX, brand distinctiveness, accessibility, implementation cost, and risk to the current conversion path, with a brief reason for every score.
- Recommended direction, reusable elements from the alternatives, and a final hybrid when it is more effective.
- Five hypotheses to validate with real visitors.
- A simple comparative usability test: tasks, participants, devices, success criteria, metrics.

#### 0D. Read-only critique and lock

After the controller writes the draft baseline, spawn `graph-powers:ui-ux-designer` foreground/read-only.

```typescript
Agent({
  subagent_type: "graph-powers:ui-ux-designer",
  run_in_background: false,
  description: "design-fix / UX baseline critique — {{resolvedScope}}",
  prompt: `
    {{MANDATORY_CONTEXT_BLOCK}}

    READ-ONLY: no Write/Edit/Bash.
    Read .claude/agent-memory/design-fix/baseline.md,
         .claude/skills/uxmaster/references/ux-foundations.md,
         .claude/skills/uxmaster/references/conversion-and-landing.md,
         .claude/skills/uxmaster/references/metrics-ethics-process.md,
         root DESIGN.md, root PRODUCT.md, and the resolved SCOPE files.
    Also read only the surface-specific uxmaster references routed by §0.

    Critique evidence quality, classification, visitor/decision model, CTA hierarchy, state coverage,
    scroll-path reasoning, desktop/mobile behavior, WCAG 2.2 AA, uxmaster honesty gate,
    the Maestro gates, and fidelity to root DESIGN.md. Structural baselines must contain three
    meaningfully different proposals without invented content; surgical baselines must not
    manufacture alternatives. Flag any claim, date, price, or credential not backed by
    src/content/products/otb.json or PRODUCT.md.

    Return the canonical Context Handoff with prioritized Critical/High/Medium findings,
    missing evidence, and One Big Win. Keep the handoff < 2000 tokens.
  `,
});
```

The controller appends the critique and resolves Critical findings in the baseline before presenting a decision. Maximum two critique/revision passes; after that, STOP with the unmet criteria.

- **SURGICAL:** once critique has no Critical issues, keep `decision.md` auto-locked and proceed to Phase 1.
- **STRUCTURAL:** present the three proposals, comparison, recommendation, and hybrid; ASK the user to select proposal 1/2/3 or the hybrid. Do not spawn a write-capable agent yet. After selection, write `decision.md` with `STATUS: USER-LOCKED`, exact `SCOPE_MANIFEST`, selected/hybrid direction, accepted/rejected trade-offs, visitor path and CTA hierarchy, required states, assumptions, non-goals, and validation metrics. Then proceed.

### Phase 1 — onboard (`graph-powers:frontend-specialist` + impeccable/onboard.md)

**Skip when:** `--from` resolves to any later phase.
**Inputs:** resolved scope + `baseline.md` + locked `decision.md`.
**PHASE_SPECIFIC_CONSTRAINT:** On a static landing, "onboarding" is **first-view orientation**, not a product tour: what the first viewport promises, whether the visitor knows where they are and what to do next, scroll affordance, anchor navigation, and the JS-off / reduced-motion entry state. Nothing added may block or gate content, and nothing may be dismissible-only. If the scope has no orientation surface at all (e.g. `SectionDivider.astro`), record an evidence-backed `N/A` and advance — do not invent an overlay.

### Phase 2 — harden (`graph-powers:frontend-specialist` + impeccable/harden.md)

**Skip when:** `--from` resolves to `typeset` or later.
**Inputs:** `baseline.md` + locked `decision.md` + `onboard.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Cover the hardening dimensions that exist on a static landing: text overflow (long PT-BR strings, accents, CJK/emoji in user-supplied fields), missing/failed images, empty or single-item lists from the JSON SSOT, very long FAQ answers, JS-off, reduced-motion, and a11y semantics. Run `bunx astro check` mid-phase; STOP on regression. Where a lead form exists, cover real `<label>`, validation, error/success states, LGPD consent + privacy link.

### Phase 3 — typeset (`graph-powers:frontend-specialist` + impeccable/typeset.md + clarify.md)

**Skip when:** `--from` resolves to `layout` or later.
**Inputs:** `baseline.md` + locked `decision.md` + `harden.md`.
**EXTRA_REFS:** `Read .claude/skills/impeccable/reference/clarify.md` (the UX-copy half of the pass). The standalone `typography.md` and `ux-writing.md` were **removed in impeccable 4.x**.
**PHASE_SPECIFIC_CONSTRAINT:** Type hierarchy (≥1.25 scale between steps) + body line length 65–75ch + weight consistency + Playfair/Inter pairing per root `DESIGN.md` + microcopy (labels, CTAs, error text) in the same phase. `tabular-nums` on dates, prices, and lot counters. Copy IS half the typeset pass — never treat it as a font swap. Any copy change lands in `src/content/products/otb.json`, never in the component.

### Phase 4 — layout (`graph-powers:frontend-specialist` + impeccable/layout.md)

**Skip when:** `--from` resolves to `adapt` or later.
**Inputs:** `baseline.md` + locked `decision.md` + `typeset.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Spatial design — rhythm, proximity, grouping, 8px grid. Vary spacing; no monotone card grids. Hierarchy via space, not borders or background shifts unless justified. Section vertical spacing ≥96px desktop / ≥64px mobile. Asymmetric hero splits (7/5, 8/4) over 50/50.

### Phase 5 — adapt (`graph-powers:frontend-specialist` + impeccable/adapt.md)

**Skip when:** `--from` resolves to `optimize` or `polish`.
**Inputs:** `baseline.md` + locked `decision.md` + `layout.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Multi-device adaptation (mobile 320–767, tablet 768–1023, desktop 1024+). Touch targets ≥44×44px. The page body must never scroll horizontally — wide content (tables, agenda grids, speaker rails) scrolls inside its own `overflow-x: auto` container. Sticky/floating CTA must not obscure focus (WCAG 2.2 SC 2.4.11).

### Phase 6 — optimize (`graph-powers:frontend-specialist` + impeccable/optimize.md)

**Skip when:** `--from` resolves to `polish`.
**Inputs:** `baseline.md` + locked `decision.md` + `adapt.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Image / CSS / font / animation performance. Above-fold LCP image eager + `fetchpriority="high"`; below-fold lazy + low priority; explicit `width`/`height` everywhere. Run `bun run build` mid-phase and compare `dist/` asset sizes; if initial JS regresses > 5% → STOP and escalate to `/perf build`. CWV targets are **advisory** per `.claude/rules/stability.md` — do not strip intentional motion or depth to chase a Lighthouse number.

### Phase 7 — polish (`graph-powers:frontend-specialist` + impeccable/polish.md)

**Skip when:** never (last phase).
**Inputs:** `baseline.md` + locked `decision.md` + `optimize.md`.
**PHASE_SPECIFIC_CONSTRAINT:** Final checklist from `polish.md`. Polish runs AFTER optimize — never reverse the order; polish targets need a stable bundle. Drift root-cause fixes only: replace one-offs with tokens, do not patch around them.

### Phase 7.5 — design review gate (`graph-powers:ui-ux-designer`, read-only)

**Skip when:** never (runs after the last executed phase, full chain or `--from` resume).

Spawn `graph-powers:ui-ux-designer` (foreground) over the files touched in this run:
- Receives the Mandatory Context block and returns the canonical Context Handoff;
- Reads `baseline.md`, locked `decision.md`, `ux-foundations.md`, `metrics-ethics-process.md`, the touched files, and applicable surface-specific uxmaster references;
- Re-checks the Maestro gates + Template Test + WCAG 2.2 + production-readiness dimensions against the Phase 0 baseline (which findings were resolved?), citing root `DESIGN.md` sections and `file:line`;
- Verifies fidelity to the locked direction, visitor path, CTA hierarchy, required states, desktop/mobile behavior, and the uxmaster honesty gate;
- Keeps scroll-depth/click/time estimates labeled as hypotheses unless browser or user evidence actually measured them;
- Returns verdict + prioritized issues (< 2000 tokens); the controller writes it to `.claude/agent-memory/design-fix/review.md`;
- **Critical** issues → STOP, surface report, ASK user;
- No Critical → proceed to `/verify quick`.

---

## 4. End-of-chain verification

After the last executed phase completes its gate AND the Phase 7.5 review gate passes:

```bash
node .claude/skills/impeccable/scripts/detect.mjs --json <all files touched this run>
```

```typescript
SlashCommand("/verify quick");
```

`/verify quick` runs the project gates (`bun run lint`, `bunx astro check`, `bun run build`) + invariant smoke checks — single gate at chain end, NOT per phase.

On `NEEDS-WORK`:
- Report the failing gate
- Surface every `.claude/agent-memory/design-fix/<phase>.md` from this run
- ASK user (do not auto-retry)

On `VERIFIED` / `VERIFIED-WITH-NOTES`:
- Summarize files touched per phase
- Summarize locked UX criteria satisfied, remaining hypotheses, and the recommended real-visitor validation; never present unmeasured metrics as achieved
- Hand off to `/evolve` if the user wants learning capture

---

## 5. Anti-patterns

| Don't | Do |
|---|---|
| Force three layouts for an isolated UI fix | Use the SURGICAL contract when every §0B condition holds |
| Implement a structural direction before user selection | Lock proposal 1/2/3 or the hybrid in `decision.md` first |
| Guess a decision-relevant visitor or objection with low confidence | Ask one focused question; mark other inferences `[ASSUMED]` |
| Resume from stale or mismatched artifacts | Validate `SCOPE_MANIFEST`, lock status, and predecessor report |
| Treat estimated scroll depth/clicks as observed results | Keep them as hypotheses until real evidence measures them |
| Invent dates, prices, credentials, or partners | Everything factual comes from `src/content/products/otb.json` / `PRODUCT.md`; unconfirmed copy = PROPOSTA |
| Run phases out of order | Strict onboard → harden → typeset → layout → adapt → optimize → polish |
| Run `graph-powers:frontend-specialist` in background | Foreground only (background silently denies Write/Edit) |
| Skip `Skill("gpus-theme")` in phase prompts | Load EVERY phase — impeccable LAYERS on top |
| Treat `typeset` as a font swap | Load `typeset.md` AND `clarify.md` — copy is half of typeset |
| Reference `typography.md` / `ux-writing.md` | Removed in impeccable 4.x — use `typeset.md` + `clarify.md` |
| Call `load-context.mjs` (removed in impeccable 4.x) | `node .claude/skills/impeccable/scripts/context.mjs --target <file>`, once per session |
| Treat the surface as `Operate` mode | This landing is **Persuade** |
| Let an agent run `/impeccable doctor` or `hooks` mid-phase | Drift repair is never a side effect of a design task — report `CONTEXT_STALE`, don't act on it |
| Ban layout-property animation or `transition: all` | Motion is expressive here — the only hard gate is `prefers-reduced-motion` |
| Strip motion/depth to chase a Lighthouse score | CWV are advisory; a11y and layout hygiene are hard |
| Run `polish` before `optimize` | Polish runs LAST — needs a stable bundle |
| Add a React island to solve a static problem | Astro-first; `client:*` requires proven interactivity + ASK |
| Substitute the impeccable palette for Navy/Gold | impeccable enriches; Navy/Gold stays canonical |
| Run `/verify` per phase | Single `/verify quick` at end-of-chain |
| Use `tsc --noEmit` / `bunx tsc` | `bunx astro check` per AGENTS.md |
| Hardcode hex anywhere in the chain | Semantic tokens only |
| Inline `wa.me/` in a component | `src/lib/whatsapp.ts` helpers only |
| Auto-retry on `/verify quick` failure | ASK user — never silent retry |
| Spawn other agents from inside a phase | Leaf executor only — the controller spawns `graph-powers:ui-ux-designer` |
| Let `graph-powers:ui-ux-designer` edit files or run scripts | Read-only critic; the controller persists its reports |
| Apply ui-ux-pro-max palette output | CLI contributes UX/typography/layout; GPUS tokens are canonical |
| Use uxmaster as a visual-token source | It owns visitor/task/flow/measurement criteria; `gpus-theme` + `DESIGN.md` own visuals |
| Duplicate agent context/handoff schemas | Reference `senior-prompt-engineer/references/agent-handoff-contracts.md` |
| Skip Phase 0 baseline or Phase 7.5 review | The adaptive UX gate opens the chain and `graph-powers:ui-ux-designer` always closes it |

---

## 6. Acceptance scenarios

| Scenario | Expected controller behavior |
|---|---|
| Button spacing, focus ring, or one empty state | Classify SURGICAL, produce the compact UX contract, auto-lock, do not fabricate three layouts |
| Landing changes section order, CTA hierarchy, or offer framing | Classify STRUCTURAL, produce three proposals + wireframes + scored comparison + hybrid, block edits until user selection |
| Brief omitted but JSON + markup identify visitor/decision | Infer from `otb.json`, markup, and `PRODUCT.md`; label unsupported details `[ASSUMED]`; proceed if confidence ≥3 |
| Decision-relevant intent cannot be inferred | STOP and ask one focused question; never invent offer content |
| `--from=layout` with matching baseline/decision/typeset report | Resume at layout and preserve the locked UX contract |
| `--from=layout` with missing/mismatched artifacts | STOP and request rerun from the earliest valid phase |
