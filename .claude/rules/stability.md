---
globs: src/**, package.json, tsconfig.json
---

# Stability — Universal Tier 2 Rules

> Universal quality bar + smoke template + anti-patterns + debug triage. Portable to any project.
> Stack-specific smoke commands (build, type-check, framework checks) live in the matching tech-stack skill.
> Project tooling values resolve from `.claude/config.json::tooling`.

---

## Purpose

Minimum always-useful stability checks for any change in any project, plus pointers to deeper references when the issue is non-trivial.

---

## Core checklist (A–L)

- **A — Barrel exports.** When adding to a `<lib>/<domain>/index.ts` (or equivalent), confirm every new export is re-exported. Missing re-exports cause runtime failures inside dynamic imports.
- **B — No `!` assertions.** Never on optional results, env vars, or query results. Use `??`, type guards, or early returns.
- **C — Array / result guards.** Always guard collection / list / fetch results against empty before mapping. Guard optional fields before access.
- **D — Render mode integrity.** Static-only project: never override to SSR. SSR project: never override to static. MPA project: never introduce SPA router. Each invariant non-negotiable for the project's deployment contract.
- **E — Error handlers.** Inline scripts wrap IO (IntersectionObserver, fetch, parsing) in try/catch + degrade silently. Never `throw` in module-top scope of an inline script.
- **F — Env config.** Build-time env vars in `.env.example`. Required keys must fail-fast on first read. Never `process.env.X!` (use guarded read + descriptive error).
- **G — CORS.** When endpoints exist: explicit allowlist + credentials handling. When no endpoints: external links carry `rel="noopener noreferrer"` when `target="_blank"`.
- **H — No `console.log`** in shipped code. `console.warn` only inside no-op fallback branches.
- **I — No `as any`.** Use schema validators (Zod / Yup / Valibot) and let the type-checker generate types. Use `unknown` + type guards at boundaries.
- **J — Mutation errors.** Forms / submits wrap in try/catch with user-facing fallback. Never silently swallow.
- **K — No dead anchors.** Never `href="#"`. `<button>` for actions, real `<a href="...">` for navigation.
- **L — Error boundaries.** 404 / error pages show generic copy + recovery CTA. Production builds expose no stack traces.

---

## Render-mode invariants

Choose the project's mode at design time. Don't drift later:

1. **Static-only** — no SSR adapter, no `prerender = false` override, no SPA router, no API routes, no DB.
2. **SSR** — adapter installed, every dynamic page documented, never silently switch a page to static at build time.
3. **MPA** — full reload between routes; no client router, no `view-transition` event listeners that imply SPA.
4. **SPA** — single shell, client router only; no per-route `<head>` mutation outside the shell.
5. **Hybrid** — explicit per-page mode declaration; no implicit fallback.

Invariant per project lives in cardinal rules (`.claude/CLAUDE.md`).

---

## Performance gates (ADVISORY)

Core Web Vitals = **alvos orientativos: medir & anotar, NÃO travam merge** (doutrina "dinâmico forte" — motion/3D/parallax/glow podem trocar contra CWV; é decisão aceita de projeto):

| Metric | Advisory target |
|---|---|
| LCP | < 2.5s |
| CLS | ~0 (manter `width`/`height` em imagens, `--py` só em transform livre) |
| INP | ~200ms (afrouxado de 100ms para motion rico) |
| Initial JS on prerendered pages | < 50KB (libs de animação **dentro do island**, fora da entry da landing) |
| Lighthouse Perf / A11y / BP / SEO | ≥ 95 desejável em rotas críticas |

Project gates (route list, budget) → `.claude/config.json::gates` (advisory).

> **Hard floor (NÃO advisory — gate de merge):** a11y (`prefers-reduced-motion` estendido a 3D/parallax/glow, contraste, foco, labels), render-mode estático/MPA (sem SSR/SPA/`ClientRouter`), tokens-only (incl. sombra/glow/3D), Lucide-only, content/contato SSOT, contratos do Layout. Estes nunca afrouxam.

---

## Smoke test template

Run after any change. Stack-specific commands resolve via `.claude/config.json::tooling` placeholders.

### Forbidden hex outside design-token source

```bash
grep -rn "bg-\[#\|text-\[#\|border-\[#" <src>
# expect: empty (or only inside @theme / token source file)
```

### Icon library mix

```bash
grep -rn "material-symbols\|<i class=\"fa\|font-awesome\|@heroicons" <src>
# expect: empty when project chose a single library
```

### Heading discipline

```bash
grep -rnE "<h1[^>]*>" <src>/pages | wc -l
# expect: ≤ 1 per page
```

### Bundle audit

```bash
${tooling.packageManager} run ${tooling.buildTool}
# After build, audit largest chunks:
ls -lh <dist>/<assets>/*.js | sort -k5 -rh | head -5
# advisory: top initial-bundle files ~< 50KB on prerendered pages (anotar; libs de animação ficam no island)
```

### Type / lint / test gates

```bash
${tooling.packageManager} run ${tooling.linter}
${tooling.packageManager} run ${tooling.typeChecker}
${tooling.packageManager} run ${tooling.testRunner}    # when project has tests
${tooling.packageManager} run ${tooling.buildTool}
```

### Accessibility manual smoke (browser)

- Tab from page top → first focus is the skip link.
- Skip link Enter → focus jumps to `<main>` with `tabindex=-1`.
- Focus rings visible on every interactive element.
- FAQ / disclosure expands on Enter / Space; keyboard navigates between.
- Mobile menu opens with Enter; Escape closes.
- Disable JS in DevTools → page renders all reveal-on-scroll content.
- DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` → all animations off.

> Stack-specific smoke commands (framework type-check, build, link-check, sitemap diff) → load matching tech-stack skill.

---

## Anti-patterns by domain

### Render mode

- Override the project's render-mode invariant without explicit justification. Static stays static; SSR stays SSR.
- Introduce SPA router on an MPA project (or vice versa).

### Hydration

- Hydrate eagerly when result not yet needed (immediate-load directive on pure-visual islands).
- Use `client-only` directives when component can SSR. Pre-render every island that can be pre-rendered.
- Hydrate React when static markup suffices.

### Content drift

- Hardcode product / FAQ / testimonial / CTA copy in components instead of reading from typed data layer.
- Partial copy split (data layer + literal strings in component) — move literals into schema.
- External destination drift: changing destination without syncing (a) data field, (b) redirect config, (c) sitemap exclusion. Tri-sync moves together.

### Design

- Hardcoded hex outside design-token source.
- Mixing icon libraries.
- Missing `width` / `height` on images → CLS hazard.
- Pure black / white text on colored background.

### Accessibility

- Drop the skip link or move it past first focusable.
- Drop the `<noscript>` fallback when reveal-on-scroll patterns hide content.
- `href="#"` for actions.
- Ignore `prefers-reduced-motion`.
- Icon-only buttons missing `aria-label`.

### Tooling

- Skip pre-commit hooks (`--no-verify`).
- Manual edit of generated lock file.
- Use a package manager other than the project's declared one (`.claude/config.json::tooling.packageManager`).

---

## Debug triage matrix

| Symptom | First check |
|---|---|
| Section blank with JS off | `<noscript>` reveal fallback present? |
| FAQ stutters on expand | Layout thrash on low-end device? Switch to grid `0fr/1fr` or `transform` if needed — any approach is allowed |
| Hover/tilt "morto" após reveal | Reveal usa `animation: … forwards`? Trava o `transform` no fim do keyframe → mascara hover/3D. Remover `forwards`, fixar fim com `.revealed{opacity:1}` (gotcha #1, `docs/motion-depth-playbook.md`) |
| Tilt e hover-lift se anulam | Dois `transform` na mesma regra brigam — em card com `[data-tilt]`, o tilt É o hover (remover `card-hover-lift`) |
| Glow/`::before` tinge o texto | `[data-glow-card]::before` precisa de `z-index: -1` (pinta acima do fundo, atrás do conteúdo) |
| Parallax salta | `data-parallax` em elemento que já usa `transform` p/ posicionar — só onde o transform está livre |
| LCP regression | Hero image priority hint + island hydration directive (idle vs eager)? |
| CLS spike | Missing `width` / `height` on `<img>` / responsive image component? |
| 404 on bookmarked URL | Redirect config entry missing? |
| Duplicate index for product | Sitemap filter excluding redirect path? |
| Skip link not visible on Tab | First focusable in DOM order? `:focus-visible` not broken? |
| Build fails on data shape | Schema mismatched a JSON / YAML file — re-validate |
| Initial JS > 50KB | Heavy lib imported in main bundle (look for namespace imports) |
| Type-check fails after content edit | Schema vs data drift |
| Stack-specific failure | Load matching tech-stack skill for triage |

---

## Final gates

```bash
${tooling.packageManager} run ${tooling.linter}
${tooling.packageManager} run ${tooling.typeChecker}
${tooling.packageManager} run ${tooling.buildTool}
```

When the project ships tests / E2E / link checks, append those after build.

---

## Escalation triggers

Load deeper context **before** changing code when:

- Root cause unclear after initial inspection.
- Bug spans multiple layers (page + component + data schema + redirect).
- Change affects a cross-cutting SSOT (theme tokens, content layer, external surfaces).
- Change affects a layout that touches every page.
- Two consecutive fix attempts on the same hypothesis failed → invoke `evaluator` Mode 3 / `/debug recover`.

---

## Stack & project signals

| Surface | Load |
|---|---|
| Stack smoke commands (build, type-check, framework check, link-check, sitemap diff) | matching tech-stack skill |
| Project SSOT helpers (external surfaces, brand voice, design system) | matching project skill |
| Cardinal rules + routing matrix | `.claude/CLAUDE.md` |

---

## When to load more

| Need | Load |
|---|---|
| Pages, components, hydration, content data, a11y, perf | `.claude/rules/frontend.md` |
| Tokens, typography, motion | `.claude/rules/DESIGN.md` |
| SEO + JSON-LD + sitemap | `.claude/rules/seo.md` |
| Cardinal rules + routing matrix | `.claude/CLAUDE.md` + root `AGENTS.md` |
| Framework-specific patterns | matching tech-stack skill |
| Project tokens / brand voice | matching project skill |
