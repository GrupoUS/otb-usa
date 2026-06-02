# Debug Methodology — GPUS Astro landing

> Systematic debugging for a static Astro landing: Investigate → Analyze Patterns → Hypothesize → Implement → Verify.

---

## Phase 1: Investigate

**Before attempting any fix:**

```text
1. What should happen? Exact page, route, CTA, asset, or build result.
2. What actually happens? Error output, broken URL, visual symptom, or generated HTML.
3. Where do they diverge? File path, content field, component, or generated `dist` artifact.
```

### Read Error Messages Completely

- Read `bun run lint`, `bunx astro check`, and `bun run build` output fully.
- For browser issues, capture console/network/screenshot evidence before editing.
- For SEO issues, inspect generated `dist/index.html`, `dist/sitemap-0.xml`, and `dist/robots.txt`.

### Reproduce Consistently

- Can you trigger it with a command or a local URL?
- What exact route/viewport/action is involved?
- If not reproducible, gather more evidence instead of guessing.

### Check Recent Changes

```bash
git --no-pager diff -- <affected-files>
git --no-pager log --oneline -10 -- <affected-files>
```

### Static-Site Tracing

Trace data flow through the static stack:

```text
${content.productJson}
  → src/content.config.ts schema
  → Astro page/component prop
  → generated dist HTML/CSS/assets
```

For route/SEO issues, trace:

```text
astro.config.mjs site/redirects/sitemap
  → src/layouts/Layout.astro canonical/OG/JSON-LD
  → public/robots.txt
  → dist output
```

---

## Phase 2: Analyze Patterns

1. **Find working examples** — similar component, section, CTA, or asset path.
2. **Compare differences** — imports, props, content field, route, canonical, generated HTML.
3. **Understand constraints** — on-product copy, static Astro, Bun-only, no inline `wa.me`, regulated-health legal guardrails (PRODUCT.md § Guardrails).

---

## Phase 3: Hypothesize

Use one variable at a time:

1. Form one hypothesis: “X is the root cause because Y.”
2. Test minimally: one targeted file/change.
3. Verify before continuing:
   - Worked? → Phase 4.
   - Failed? → new hypothesis; do not stack patches.

### Cognitive Biases to Avoid

| Bias | Symptom | Countermeasure |
|---|---|---|
| Confirmation | Seeking proof, ignoring disproof | Ask what would disprove the hypothesis |
| Anchoring | Fixating on first error | Read complete output before choosing fix |
| Fixation | Persisting with wrong approach | Change hypothesis after 2 failed attempts |
| Ownership | Assuming your code is fine | Review your changes as unfamiliar code |
| Optimism | “That should fix it” | Run the gate every time |

---

## Phase 4: Implement

### 1. Prefer a Repro or Static Assertion

Examples:

```bash
bun run lint
bunx astro check
bun run build
grep -RIn "missing-term" dist/index.html dist/sitemap-0.xml
```

For content/assets, a quick path check is useful:

```bash
python -c "import json, pathlib; data=json.load(open('${content.productJson}', encoding='utf-8')); paths=[data['seo']['ogImage']]; missing=[p for p in paths if not pathlib.Path('public', p.lstrip('/')).exists()]; print(missing)"
```

### 2. Implement Single Fix

- One change at a time.
- No “while I’m here” improvements.
- Keep product copy in `${content.productJson}` unless the text is generic routing/redirect chrome.

### 3. Verify Gates

```bash
bun run lint && bunx astro check && bun run build
```

### 3-Fix Escalation Rule

- **< 3 fixes failed** → return to Phase 1.
- **≥ 3 fixes failed** → stop and discuss architecture/requirements with the user.

---

## Root Cause Tracing

### 5-Step Backward Trace

```text
1. Observe symptom      → “Hero CTA target does nothing on /”
2. Immediate cause      → href="#<anchor>" exists but section missing in dist/index.html
3. Caller/source        → Hero.astro consumes hero CTA from the product JSON
4. Upstream structure   → index.astro rendered only partial funnel
5. Root trigger         → canonical `/` diverged from the full route
```

**Fix at source:** put the full funnel on canonical `/`, canonicalize any stale route, and verify `dist/index.html` contains the expected anchor.

---

## Templates

### 5 Whys

```markdown
**Problem**: [Describe error]
1. Why? → [First cause]
2. Why? → [Deeper cause]
3. Why? → [Underlying issue]
4. Why? → [Systemic reason]
5. Why? → [Root cause]

**Root Cause**: [Final determination]
**Fix**: [Solution implemented]
```

### Debug Report

```markdown
## Debug Report

**Issue**: [Description]
**Bug Type**: Content | SEO | Visual | Build | Runtime
**Root Cause**: [5 Whys result]
**Fix**: [What changed]
**Verification**:
- [ ] `bun run lint` ✅
- [ ] `bunx astro check` ✅
- [ ] `bun run build` ✅
- [ ] Specific smoke: [grep/browser/output evidence]

**Remaining warnings**: [List only if present]
```

### Commit Message

```text
fix(site): brief description

Root cause: [5 Whys result]
Fix: [What changed]

Tested: bun run lint ✅, bunx astro check ✅, bun run build ✅
```
