---
description: Canonical design workflow for the GPUS Astro landing. Phase 0 (impeccable shape + ui-ux-pro-max design-system + explorer spec) → Phase 0.5 (ui-ux-designer spec critique) → Phase 1 (optional visual reference) → Phase 2 (frontend-specialist converts to code with impeccable new-work + craft-floor) → Phase 3 (detector + ui-ux-designer audit + gates). frontend-specialist runs foreground; ui-ux-designer is read-only.
workflow_type: prompt-chaining
---

# /design — GPUS Astro Landing Design Workflow

**ARGUMENTS**: $ARGUMENTS

> Orchestration-only. Visual policy lives in root `DESIGN.md` + `Skill("gpus-theme")`; creative execution in `Skill("impeccable")` (v4.0.4) + `Skill("ui-ux-pro-max")`; product truth in root `PRODUCT.md` + `Skill("grupo-us")`.
>
> Use for new or revised landing sections, components, visual hierarchy, motion, or copy/design alignment. For production-readiness passes on existing UI use `/design-fix`; for iterative enhancement use `/design-improve`.

---

## Stopping Conditions

- STOP if 3 design iterations fail the Template Test → present options, ASK user
- STOP if the work requires a color role with no token in `src/styles/global.css @theme` → ASK before adding
- STOP if the design contradicts existing patterns in `src/components/landing/` without a stated reason
- STOP if the design requires a new dependency, a React island, or an SSR/SPA behavior → ASK
- STOP if the design needs product facts (dates, prices, credentials, partners) absent from `src/content/products/otb.json` / root `PRODUCT.md` → ASK; unconfirmed copy ships as PROPOSTA
- STOP if a protected file would change (`astro.config.mjs`, `src/lib/whatsapp.ts`, `src/content.config.ts`, `package.json`, `tsconfig.json`, `biome.json`, `lefthook.yml`)

---

## 0. Context load (WISC)

```typescript
Skill("superpowers:using-superpowers"); // meta — bootstrap (per _shared.md § 0.5)
```

1. Run `/prime frontend` — loads `.claude/rules/DESIGN.md`, `frontend.md`, `astro.md`.
2. If continuing a prior session → read `${rulesDir}/docs/evolution/HANDOFF.md` first.

**Tier 2 (auto-loaded on `src/**`):** `.claude/rules/DESIGN.md`, `.claude/rules/frontend.md`, `.claude/rules/astro.md`.

**Tier 3 references (read on demand):**
- Visual authority: root `DESIGN.md` + live `src/styles/global.css @theme` + `Skill("gpus-theme")`
- Positioning / conversion / copy / voice: root `PRODUCT.md` + `Skill("grupo-us")`
- Astro static-only contracts: `Skill("astro")` + `.claude/rules/astro.md`
- Motion + depth canon: root `DESIGN.md § 9 Motion` + `§ 10 Depth & elevation`; runtime gotchas in `.claude/rules/stability.md § Debug triage matrix`
- Optional visual model repo: `${project.designModelRepo}` — reference only, never a token authority

**impeccable 4.x contract (read once, do not re-derive):** Setup is `scripts/context.mjs` (`load-context.mjs` was removed). The `brand`/`product` **register** was replaced by four **modes** — Persuade · Operate · Read · Experience. **This landing is Persuade**: the visitor decides and acts, design IS the product. `reference/new-work.md` owns direction for a new surface or replacement visual world; `reference/craft-floor.md` carries the quality floor + refuse list and loads **last**, immediately before editing UI. `craft` is a deprecated alias that adds nothing — never cite it as a methodology.

---

## 1. Assess complexity

Per `_shared.md` § 2.

| Complexity | Pattern | When |
|---|---|---|
| L1-L2 | Direct edit | Token tweak, spacing fix, single-line copy move |
| L3 | Single agent (foreground) | One component, known pattern |
| L4-L5 | Multiple agents | New section, multi-component work |
| L6+ | Full pipeline | New page or landing-wide redesign |

---

## 2. Design tool chain

```
Phase 0:   impeccable shape + ui-ux-pro-max CLI --design-system + explorer + gpus-theme → design spec
Phase 0.5: ui-ux-designer (read-only) → spec critique (NN/g + Maestro gates + WCAG 2.2 + DESIGN.md)
Phase 1:   optional — ${project.designModelRepo} or an approved comp → visual reference
Phase 2:   frontend-specialist + impeccable new-work + craft-floor + gpus-theme → Astro code
Phase 3:   impeccable detect.mjs + ui-ux-designer audit + performance-optimizer → validate
```

**Key rule:** `gpus-theme` + root `DESIGN.md` own the *tokens and palette*. `impeccable` owns the *creative direction and craft floor*. `ui-ux-pro-max` contributes UX / typography / layout / landing-structure intelligence — **never palette**: on any color conflict, GPUS tokens win. `ui-ux-designer` critiques and audits (read-only); `frontend-specialist` is the only write-capable executor.

---

## 3. Pre-flight: design research (mandatory L3+)

### 3.1 Brainstorm → spec

```typescript
Skill("superpowers:brainstorming"); // → docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md
```

Walks project context → clarifying questions (one at a time) → 2-3 approaches with tradeoffs → spec sections with an approval gate.

**Skip only for:** L1-L2 token/spacing/copy-move edits.

### 3.2 impeccable `shape` enrichment (additive, runs BEFORE explorer)

```typescript
Skill("impeccable");                                          // router (Setup + mode)
Read(".claude/skills/impeccable/reference/shape.md");
// Setup step 1: node .claude/skills/impeccable/scripts/context.mjs --target src/components/landing/<Component>.astro
//   Loads PRODUCT.md + DESIGN.md + the surface brief when one exists.
//   Run ONCE per session — it emits the full PRODUCT.md, so re-running just burns context.
//   Follow its directives. A CONTEXT_STALE finding is REPORTED, never repaired as a side effect.
```

Apply the shape flow (Phase 1 discovery interview → Phase 2 resolve direction → Phase 3 write the brief → confirm and stop), then hand BOTH the brainstorming spec AND the shape brief to `explorer`.

For a **new surface or a replacement visual world**, also load `reference/new-work.md` and run its direction sequence (§1 what is already true · §2 what will change the work · §3 amount of invention · §4 commit the world · §5 record the decision). Refinement preserves the incumbent identity; redesign replaces it — never split the difference into polish on a discarded look.

**Critical:** `shape` enriches Phase 0 — it does NOT replace `gpus-theme`. Compressing the shape gates because the brainstorming brief "feels complete" is the dominant failure mode. Do not skip.

### 3.3 ui-ux-pro-max design-system baseline (additive, runs BEFORE explorer)

The controller (main thread — has Bash) generates the baseline recommendation:

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "<surface> premium dark landing saúde estética" --design-system -p "OTB <surface>"
# supplement on demand:
python .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --domain ux|typography|color|landing|style|web
python .claude/skills/ui-ux-pro-max/scripts/search.py "<keyword>" --stack astro
```

**Authority rule:** ui-ux-pro-max contributes UX guidelines, typography pairing logic, landing section order, and anti-patterns. **Palette and tokens come from `gpus-theme` + root `DESIGN.md`** — they override any color suggestion from the CLI. The output is one more INPUT to the explorer prompt.

### 3.4 Spawn explorer (design spec synthesis)

Spawn `explorer` (**`run_in_background: true`** — `~/.claude/hooks/task_routing_guard.py` forces read-only research agents to background) and wait for its returned spec before advancing.

```
Invoke Skill("gpus-theme") and Skill("grupo-us"), then analyze: [user request]

Generate a complete design spec for a Persuade-mode surface:
1. Direction (what visual world this commits to, and what it explicitly rejects)
2. Color usage (semantic tokens only — never hardcode hex; state the gold hierarchy)
3. Typography (Playfair Display display / Inter body; scale + weight decisions)
4. Layout system (grid, spacing rhythm on the 8px scale, breakpoints, asymmetric splits)
5. Component inventory (reuse from src/components/landing/ + shared primitives; what is new)
6. Content contract (every string maps to a key in src/content/products/otb.json; new field =
   schema + JSON + reader in one change)
7. Interaction + state coverage (hover, focus-visible, JS-off, reduced-motion, long text, missing image)
8. Accessibility requirements (WCAG AA contrast, focus ring, touch targets, heading order)
9. Motion strategy (reveal choreography, depth, glow — any property may animate;
   prefers-reduced-motion fallback is mandatory)
10. CTA hierarchy (one primary per view; WhatsApp copy via src/lib/whatsapp.ts helpers)

Context: existing patterns in src/components/landing/, tokens in src/styles/global.css @theme,
content SSOT src/content/products/otb.json
Inputs: brainstorming spec + impeccable shape brief + ui-ux-pro-max design-system output
        (§3.3 — UX/typography/layout intelligence only; GPUS tokens win on palette)
Return: structured design spec (no code yet)
```

### 3.5 Spec critique gate (`ui-ux-designer` — read-only)

After the explorer returns the spec (mandatory L4+; recommended L3), spawn `ui-ux-designer` BEFORE any code:

```typescript
Agent({
  subagent_type: "ui-ux-designer",
  run_in_background: false, // blocking gate
  description: "design / spec critique — [surface]",
  prompt: `
    Critique this design spec (evidence-backed, NN/g-cited):
    [Phase 0 spec inline]

    Check against:
    (a) Maestro gates — Safe Split / Bento / Blue / Line, plus Glass/Glow used WITHOUT intent
        (deliberate premium depth is allowed — root DESIGN.md § Depth);
    (b) root DESIGN.md (creative north star, tokens, typography, depth, motion) and
        .claude/rules/DESIGN.md (universal do/don't);
    (c) WCAG 2.2 AA (SC 2.4.11 / 2.5.7 / 2.5.8 / 3.3.7);
    (d) usability heuristics (F-pattern, left-side bias, Fitts, Hick);
    (e) Persuade-mode contract: one primary CTA per view, honest claims, copy sourced from
        src/content/products/otb.json.

    READ-ONLY: no Write/Edit/Bash — never propose running commands.
    RETURN: verdict + prioritized issues (Critical/High/Medium) + One Big Win. < 2000 tokens.
  `,
});
```

**Gate:** Critical issues → the controller revises the spec (re-run explorer with the findings) before Phase 2. A spec with open Critical issues never reaches `frontend-specialist`.

---

## 4. Agent selection

| Task type | Agent | Background? |
|---|---|---|
| Component or new section | `frontend-specialist` | **No — foreground (Write/Edit required)** |
| Spec critique / UX-visual audit (read-only) | `ui-ux-designer` | Foreground for blocking gates; background OK when advisory |
| Codebase pattern research | `explorer` | Yes |
| External docs / library questions | `librarian` | Yes |
| Accessibility / runtime bug | `debugger` | Yes |
| Performance, SEO, CWV | `performance-optimizer` | Yes |

For parallel execution of write-capable agents: multiple foreground `Agent()` calls in **one message**.

---

## 5. Execution patterns

### 5.1 L1-L2 (token / spacing / copy move)

Edit directly. Skip Phase 0 and background agents. Still run the gates in Phase 3.

### 5.2 L3 (component / known pattern)

1. Pre-flight: `shape` (§3.2) + ui-ux-pro-max `--design-system` (§3.3) + `explorer` (background, aguardar retorno)
2. Wait for spec (critique §3.5 recommended, not mandatory)
3. Spawn `frontend-specialist` foreground with the spec

### 5.3 L4-L5 (new section / multi-component)

1. Pre-flight: brainstorming + `shape` + ui-ux-pro-max + `explorer`
2. Spec critique gate (§3.5, mandatory)
3. Spawn `frontend-specialist` agents foreground (one per component/section) in the same message

### 5.4 L6+ (new page / landing-wide redesign)

1. Pre-flight as above, plus `new-work.md` direction sequence
2. Spec critique gate (§3.5, mandatory)
3. Phase 1 visual reference when a model exists (`${project.designModelRepo}` or an approved comp)
4. `Skill("superpowers:writing-plans")` → implementation plan before code
5. Spawn `frontend-specialist` agents per section as foreground parallel calls

---

## 6. Skills to load

```
Phase 0 (controller):             Skill("impeccable") + shape.md (+ new-work.md for a new world)
                                  Skill("ui-ux-pro-max") → CLI --design-system (§3.3)
Phase 0 (in explorer)      :      Skill("gpus-theme") + Skill("grupo-us")
Phase 0.5 (ui-ux-designer):       read-only — receives the spec + gates inline (no Skill/Bash tool)
Phase 2 (in frontend-specialist): Skill("gpus-theme") + Skill("grupo-us") + Skill("astro")
                                  + Skill("impeccable") → new-work.md, then craft-floor.md LAST
                                  + ui-ux-pro-max via Bash: search.py "<keyword>" --stack astro
Phase 3 (validate):               impeccable detect.mjs + ui-ux-designer audit + performance-optimizer
```

---

## 7. 4-phase pipeline

### Phase 0 — Design research

Always for L3+. Controller runs `shape` + the ui-ux-pro-max `--design-system` search; `explorer` synthesizes the structured spec from brainstorming + shape + design-system inputs. The spec then passes the `ui-ux-designer` critique gate (§3.5).

### Phase 1 — Visual reference (optional)

**When:** a new page or section has a comp, or `${project.designModelRepo}` is defined and present. Skip for components and small fixes.

Treat it as **visual reference only**: recreate with project primitives + semantic tokens. Never copy prototype hex, glass, or markup wholesale — root `DESIGN.md` Hard Rules win over any reference.

### Phase 2 — Convert to code

`frontend-specialist` MUST load, in order, before writing any code:

```typescript
Skill("gpus-theme");                                          // Navy/Gold token canon
Skill("grupo-us");                                            // voice, funnel, CTA, legal
Skill("astro");                                               // static MPA + Content Collections
Skill("impeccable");                                          // router (Setup + mode)
Read(".claude/skills/impeccable/reference/new-work.md");      // §1-§5 direction flow
Read(".claude/skills/impeccable/reference/craft-floor.md");   // LAST — right before editing UI
```

`craft-floor.md` carries the quality floor (contrast · depth · spacing · type · motion · states · copy · coverage) and the refuse list (gradient text, side-stripe borders, hero-metric template, identical card grids, glass-as-decoration, emoji-as-icons). Load it for build work only, never for planning-only passes.

#### Declare DESIGN COMMITMENT (mandatory — before the first line of code)

```
DESIGN COMMITMENT: [direction name]
  Geometry:    [specific layout — not "clean grid"]
  Typography:  [Playfair/Inter roles + scale decision]
  Palette:     [specific semantic tokens + the gold hierarchy]
  Depth:       [elevation strategy — tonal / shadow / glow / glass, and why]
  Motion:      [reveal choreography + reduced-motion fallback]
  Content:     [which otb.json keys feed this surface]
  Anti-cliché: NOT bento / decorative glass / mesh gradient / safe 50-50 split
```

> If you can describe the layout as "clean and minimal" without specifics, you haven't committed — restart thinking.

#### Implement (hard constraints)

1. Astro static MPA only — no `ClientRouter`, no SSR adapter, no `prerender = false`
2. Prefer zero React islands; a `client:*` directive requires proven interactivity → ASK first
3. Product data via `getEntry("products", "otb")`; components receive `.data` sub-objects, never the entry
4. All copy in `src/content/products/otb.json`; new field = schema + JSON + reader in ONE change
5. WhatsApp URLs only via `src/lib/whatsapp.ts`; messages keep the `Olá, Laura!` prefix
6. Semantic tokens only — no hardcoded hex outside `src/styles/global.css @theme`
7. Icons: Lucide / inline SVG. Never emoji as a UI icon
8. Images: explicit `width`/`height`; above-fold eager + `fetchpriority="high"`, below-fold lazy
9. Motion is expressive — any property may animate, `transition: all` allowed, dramatic depth allowed.
   Prefer `transform`/`opacity` when the effect is equivalent. `prefers-reduced-motion` is mandatory
10. Reveal via `[data-reveal]` + IntersectionObserver behind the `.js` gate; keep the `<noscript>` fallback
11. Focus ring on `:focus-visible` (2px + 2px offset); touch targets ≥44×44px
12. Components stay readable — split when a section file grows past ~200 lines
13. LF line endings (Biome rejects CRLF)

### Phase 3 — Validate

```bash
node .claude/skills/impeccable/scripts/detect.mjs --json <changed files>   # mechanical design detector
bun run lint
bunx astro check
bun run build
```

```typescript
Skill("superpowers:verification-before-completion"); // evidence before completion claims
```

Run the detector **once**, after the UI is finished — never during concept selection. Fix P0/P1 findings; justify anything left.

#### UX / visual audit (`ui-ux-designer`, read-only — may run in background here)

Spawn over the implemented files: usability heuristics + WCAG 2.2 + aesthetic assessment + Template Test, citing root `DESIGN.md` sections and `file:line`. Critical findings → `frontend-specialist` fixes before the verdict; never let the auditor edit files.

#### Maestro gates (auto-rejection)

If ANY trigger is true → rework that element:

| Trigger | Fail condition | Fix |
|---|---|---|
| Safe Split | 50/50, 60/40, 70/30 two-column layouts | 90/10, stacked, or overlapping |
| Bento Trap | Safe rounded grid boxes, identical cards | Fragment the grid, break alignment intentionally |
| Blue Trap | Default blue/teal as primary | Navy/Gold tokens per `@theme` |
| Line Trap | `1px solid` dividers doing all the separating | Background shifts, thick padding, ghost borders |
| Glass/Glow (soft) | Glass/glow used **without intent or supporting layers** | Keep deliberate premium depth; cut decorative blur |

**Template test:** "Could this be a generic infoproduct/Vercel template?" → YES = FAIL.

#### Checklists

**UX**
- [ ] Focus not obscured by sticky/floating elements (WCAG 2.2 SC 2.4.11)
- [ ] Touch targets ≥44×44px (SC 2.5.8)
- [ ] Key content left-aligned; choices grouped when >7 options
- [ ] JS-off renders all reveal content (`<noscript>` fallback intact)
- [ ] Reduced-motion emulation kills every animation
- [ ] One primary CTA per view; CTA copy matches `otb.json`

**Visual**
- [ ] Semantic tokens only (hex scan clean outside `global.css`)
- [ ] Contrast validated for every new foreground/background pair
- [ ] Responsive breakpoints verified; no horizontal body scroll

**Code**
- [ ] `bun run lint`, `bunx astro check`, `bun run build` all pass in this session
- [ ] No `wa.me/` outside `src/lib/whatsapp.ts`
- [ ] No hardcoded product copy in `.astro`
- [ ] No `console.log` / `debugger`

#### Tail — request a review

For L4+ surfaces (new section, page redesign), invoke `Skill("superpowers:requesting-code-review")` before handing off to `/verify`. Skip for L3 single-component edits.

---

## 8. Anti-patterns

| Don't | Do |
|---|---|
| Start coding without a DESIGN COMMITMENT | Declare geometry/typography/palette/depth/motion/content first |
| Skip Phase 0 for L3+ | Run `shape` + ui-ux-pro-max + explorer first |
| Cite `craft` as a methodology | Deprecated alias in impeccable 4.x — use `new-work.md` |
| Call `load-context.mjs` | `node .claude/skills/impeccable/scripts/context.mjs --target <file>`, once per session |
| Load `craft-floor.md` while planning | Load it LAST, right before editing UI |
| Treat the landing as `Operate` mode | It is **Persuade** — the visitor decides and acts |
| Run `frontend-specialist` in background | Foreground only (background silently denies Write/Edit) |
| Let `ui-ux-designer` write code | Read-only critic — all writes go through `frontend-specialist` |
| Adopt ui-ux-pro-max palette suggestions | `gpus-theme` + root `DESIGN.md` are the token authority |
| Add SPA/SSR behavior | Keep Astro static MPA |
| Add a React island by reflex | Astro-first; `client:*` needs proven interactivity + ASK |
| Hardcode commercial copy in components | Move it to `src/content/products/otb.json` |
| Inline `wa.me/` URLs | Use `src/lib/whatsapp.ts` |
| Hardcode hex | Semantic tokens from `@theme` |
| Ban layout-property animation or `transition: all` | Motion is expressive; only `prefers-reduced-motion` is hard |
| Use gold as decoration | Gold is hierarchy and impact |
| Invent dates, prices, credentials, partners | Product facts come from `otb.json` / `PRODUCT.md`; unconfirmed = PROPOSTA |
| Skip the detector because "it looks fine" | Run `detect.mjs` once on the finished UI |
| Claim done without running the gates | Evidence before assertions |
