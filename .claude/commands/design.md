---
description: Canonical design workflow. Phase 0 (design spec) → Phase 1 (prototype, optional) → Phase 2 (convert to code) → Phase 3 (validate). frontend-specialist runs in foreground (requires file write permissions).
workflow_type: prompt-chaining
---

# /design — Design Workflow

**ARGUMENTS**: $ARGUMENTS

> Orchestration-only. Deep policy lives in `ui-ux-pro-max` (spec) + `frontend-design` (creative execution).

---

## Stopping Conditions

- STOP if 3 design iterations fail Template Test → present options, ask user
- ASK if no design tokens exist for the required color role
- ASK if design contradicts existing component patterns in `${paths.componentsRoot}/`

---

## 0. Context load (WISC)

1. Run `/prime frontend` — loads frontend rules first, then only the required references on demand.
2. If continuing a prior session → read `.claude/docs/evolution/HANDOFF.md` first.

**Tier 3 references (read on demand only):**
- Project design system foundation (e.g., `docs/design-specs/00-design-system-foundation.md` or `.claude/rules/DESIGN.md` if exists)
- LEVER / extend-vs-create philosophy doc — only when deciding extend vs create new component
- Relevant feature spec — only for the surface being designed

---

## 1. Assess complexity

Per `_shared.md` § 2.

| Complexity | Pattern | When |
|---|---|---|
| L1-L2 | Direct code | Bug fix, simple tweak |
| L3 | Single agent (foreground) | Component, known pattern |
| L4-L5 | Multiple agents | New feature, multi-component |
| L6+ | Agent Team | Full page, complex UX |

---

## 2. Design tool chain

```
Phase 0: explorer + Skill("ui-ux-pro-max") → design spec
Phase 1: optional — prototype tool (Stitch / Figma plugin / manual) → reference layout
Phase 2: frontend-specialist + Skill("frontend-design") → component code
Phase 3: debugger + performance-optimizer → validate
```

**Key rule:** `ui-ux-pro-max` generates the *spec* (Phase 0). `frontend-design` drives the *creative execution* (Phase 2). They never swap phases.

### 2.1 Phase 1 prototype tool selection

| Tool | When |
|---|---|
| `mcp__stitch__*` (if available) | New pages with available design system asset IDs in project's design-tokens skill |
| Figma / external prototype | When designer hands off in another tool |
| Manual reference | Skip Phase 1 — proceed directly to Phase 2 with the Phase 0 spec |

Pass `--prototype-tool=stitch|figma|manual` in `$ARGUMENTS` to force a specific tool. Default = `auto` (use Stitch if MCP available + design-system asset IDs known, else `manual`).

---

## 3. Pre-flight: design research (mandatory L3+)

Before ANY implementation, spawn `explorer` (foreground) to generate a design specification.

Prompt template:

```
Invoke Skill("ui-ux-pro-max") and analyze: [user request]

Using ui-ux-pro-max, generate a complete design spec:
1. Style selection (justify against request context)
2. Color palette (semantic design tokens — never hardcode hex)
3. Typography pairing (name + scale)
4. Layout system (grid, spacing, breakpoints)
5. Component inventory (list primitives to use — shadcn/ui or equivalent)
6. Interaction patterns (hover, focus, loading, error, empty states)
7. Accessibility requirements (WCAG AA minimum)
8. Animation strategy (entrance, micro-interactions, prefers-reduced-motion)

Context: existing patterns in ${paths.componentsRoot}/, current design tokens in ${paths.stylesRoot}/global.css (or equivalent)
Return: structured design spec (no code yet)
```

**Skip only for:** bug fixes (L1-L2) or trivial CSS tweaks.

---

## 4. Agent selection

| Task type | Agent | Background? |
|---|---|---|
| Component or new page | `frontend-specialist` | **No — foreground (Write/Edit required)** |
| Accessibility test | `debugger` | Yes |
| Performance review | `performance-optimizer` | Yes |
| SEO meta | `performance-optimizer` | Yes |

For parallel execution of write-capable agents: multiple foreground `Agent()` calls in **one message**.

---

## 5. Execution patterns

### 5.1 L1-L2 (bug fix / tweak)

Fix directly. Skip Phase 0 + background agents.

### 5.2 L3 (component / known pattern)

1. Pre-flight: spawn `explorer` foreground with design spec prompt
2. Wait for spec
3. Spawn `frontend-specialist` foreground with spec

### 5.3 L4-L5 (multi-component / feature)

1. Pre-flight: spawn `explorer` foreground with design spec prompt
2. Wait for spec
3. Spawn multiple `frontend-specialist` agents foreground (one per component/section) in same message

### 5.4 L6+ (full page / complex UX)

1. Pre-flight: spawn `explorer` foreground with design spec prompt
2. Phase 1 prototype (if new page + tool available): use Stitch MCP with project's design-tokens skill (`gpus-theme`, `design-tokens`, etc.)
3. Spawn `frontend-specialist` agents per section as foreground parallel calls

---

## 6. Skills to load

```
Phase 0 (in explorer):           Skill("ui-ux-pro-max")
Phase 1 (if Stitch):              Skill("<project-design-tokens-skill>")  // provides asset IDs
Phase 2 (in frontend-specialist): Skill("frontend-design") + Skill("<project-design-tokens-skill>")
```

If project lacks a design-tokens skill, the design tokens come from `${paths.stylesRoot}/global.css` `@theme` (or equivalent) — pass them explicitly to the agent.

---

## 7. 4-phase pipeline

### Phase 0 — Design research (`explorer` + `ui-ux-pro-max`)

Always for L3+. Generates structured design spec. Pass spec to frontend-specialist prompt.

### Phase 1 — Prototype (optional)

**When:** new pages or landing pages where the design system supports prototype generation. Skip for components and bug fixes.

If using Stitch MCP:
1. Invoke project design-tokens skill — loads design system asset IDs
2. `mcp__stitch__generate_screen_from_text` with design prompt
3. `mcp__stitch__apply_design_system` using project asset IDs
4. Iterate with `mcp__stitch__edit_screens` if needed
5. `mcp__stitch__get_screen` → download HTML reference

If skipping prototype: pass Phase 0 spec directly to Phase 2.

### Phase 2 — Convert to code

**`frontend-specialist` MUST invoke BOTH `Skill("frontend-design")` and the project design-tokens skill BEFORE writing any code.**

#### Declare DESIGN COMMITMENT (mandatory — before first line of code)

```
DESIGN COMMITMENT: [Style Name]
  Geometry:    [specific layout — not "clean grid"]
  Typography:  [font + scale decision]
  Palette:     [specific design tokens]
  Effects:     [specific animations / micro-interactions]
  Anti-cliché: NOT Bento / glass / mesh / safe 50-50 split
```

> If you can describe the layout as "clean and minimal" without specifics, you haven't committed — restart thinking.

#### Implement

1. Break into components (max ~150 lines each)
2. Use design system primitives (shadcn/ui or project equivalent)
3. All colors → semantic design tokens (never hardcode hex)
4. Add data queries (per project's data layer — tRPC / server actions / loaders / fetch)
5. TypeScript interfaces
6. Scroll-triggered entrance animations (staggered) — gated by `prefers-reduced-motion`
7. Micro-interactions (`scale` / `translate` / `opacity` only — never animate layout properties)
8. `prefers-reduced-motion` support mandatory

### Phase 3 — Validate

#### Maestro auditor (auto-rejection gates)

If ANY trigger is true → delete the implementation and restart:

| Trigger | Fail condition | Fix |
|---|---|---|
| Safe Split | `grid-cols-2`, 50/50, 60/40, 70/30 layouts | Switch to 90/10, 100% stacked, or overlapping |
| Glass Trap | `backdrop-blur` without solid borders | Remove blur → solid colors + raw 1-2px borders |
| Glow Trap | Soft gradients to "pop" elements | High-contrast solid colors or grain textures |
| Bento Trap | Safe rounded grid boxes | Fragment grid, break alignment intentionally |
| Blue Trap | Default blue/teal as primary | Use project tokens or distinctive accent |
| Line Trap | `1px solid` border dividers | Background shifts, thick padding, ghost borders |

**Template test:** "Could this be a Vercel/Stripe template?" → YES = FAIL.

#### UX quality

- [ ] Loading states (skeletons shaped like expected output — not spinners)
- [ ] Error states
- [ ] Empty states with user guidance
- [ ] Keyboard navigation + focus not obscured by sticky elements (WCAG 2.2 SC 2.4.11)
- [ ] Touch targets ≥ 44×44px; minimum 24×24px with spacing (WCAG 2.2 SC 2.5.8)
- [ ] Drag interactions have non-drag alternatives (WCAG 2.2 SC 2.5.7)
- [ ] Key content left-aligned (NN Group: 69% more attention on left half)
- [ ] Choices grouped if >7 options (Hick's Law)
- [ ] Hover/state animations via CSS transitions, not JS (protects INP < 200ms at p75)

#### Visual quality

- [ ] Semantic tokens only (no hardcoded hex)
- [ ] Dark mode tested (if dark mode is in scope)
- [ ] Responsive breakpoints verified

#### Code quality (per `_shared.md` § 1)

- [ ] Design system primitives used
- [ ] Type-check passes
- [ ] Lint passes

---

## Anti-patterns

| Don't | Do |
|---|---|
| Skip Phase 0 for L3+ | Always run explorer + ui-ux-pro-max first |
| Run frontend-specialist in background | Foreground only (background silently denies Write/Edit) |
| Skip Skill("frontend-design") | Invoke before any code in frontend-specialist |
| Write code before DESIGN COMMITMENT | Declare geometry/typography/palette/effects first |
| Use ui-ux-pro-max in frontend-specialist | Phase 0 (explorer) only |
| Hardcode colors | Semantic design tokens |
| Custom modal from scratch | Design system Dialog primitive |
| Nested ScrollArea | Single at layout level |
| Components in `ui/` | `components/[feature]/` |
