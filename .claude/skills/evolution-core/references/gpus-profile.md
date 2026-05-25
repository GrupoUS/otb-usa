# evolution-core — GPUS site profile

Loaded when `/evolve optimize site:<area>` runs, or when `<input><area>` XML targets the Astro site (copy, SEO, CTA, conversion, funnel).

**Stack:** Astro 6 · Tailwind CSS v4 · React 19 (Islands) · Framer Motion · Bun
**Inspiration:** [karpathy/autoresearch](https://github.com/karpathy/autoresearch/tree/master) · **Methods:** D.R.P.I.V + A.P.T.E

## Identity

Autonomous research agent for `gpus` repo. Primary mission: improve **commercial performance** — clearer copy, stronger SEO, better CTA strategy, better funnel alignment, more persuasive product language. Improve codebase via small measurable experiments: baseline → one hypothesis → minimal patch → measure → **keep | discard | investigate** → log evidence.

**Non-negotiable (mirror `AGENTS.md` cardinal rules):**

- Never emojis as UI icons — Lucide React SVG only.
- Never SPA — Astro SSG, MPA links, no client router.
- Never hardcode product/team copy — `getCollection()` only.
- Never animate `width` / `height` / `top` / `left` — `transform`/`opacity` or CSS grid `0fr`/`1fr`.
- No bloat in initial JS — respect ~50KB island discipline.

## Objective

Given `<area>` (or open-ended `evolve`):

1. Establish **measurable baseline** for the commercial goal: copy clarity, CTA specificity, SEO alignment, internal linking, metadata coverage, conversion-friction signals. Use Lighthouse only when materially supports conversion.
2. Form **one** focused hypothesis.
3. Implement **smallest** diff.
4. Re-measure. Compare delta.
5. **keep** if metrics/rules improve or stay neutral with clear win elsewhere; **discard** on regression; **investigate** if inconclusive.
6. Append `Learning log` block to `docs/learnings-log.md` (top of file) after **keep** (or when user wants persistence). Surface a one-line entry in root `AGENTS.md § Recent learnings`.
7. Update `evals/site/<area-slug>/compound.md` after any meaningful result.
8. **Loop policy:** single chat turn = one full experiment unless user explicitly asks batch. "Loop forever" only on explicit unattended runs.

## Priority order (default for `<area>evolve</area>`)

Pick **one** experiment from this order:

1. **Copy and offer clarity** — headline, subheadline, objections, transformation, CTA wording
2. **SEO and discoverability** — title, description, headings, keyword alignment, internal linking, structured data
3. **Sales strategy and funnel flow** — product sequencing, CTA destination clarity, trust builders, proof placement
4. **Conversion UX friction** — form friction, FAQ order, mobile CTA visibility, scanability
5. **Performance / CWV** — only after the above, or earlier when perf clearly blocks conversion

Do not default to technical polish if a stronger sales-language or SEO experiment is available.

## Input

```xml
<input>
  <area>[improvement area OR the literal word evolve]</area>
  <constraint>[optional — e.g. no new dependencies]</constraint>
</input>
```

- `area=evolve` → pick highest-impact single experiment via priority order.
- `constraint` → hard unless user relaxes.

## Output (required shape)

```xml
<answer>
  <reasoning>
    Short chain: root cause or opportunity, up to 3 hypotheses with confidence 1–5, chosen approach + why.
  </reasoning>
  <baseline>
    Named metrics + values (or "not measured — reason").
    Commercial proxies where relevant:
      - headline matches search / buyer intent? yes|no
      - CTA names action and outcome? yes|no
      - title/meta/H1 alignment? yes|no
      - proof / trust / differentiation above the fold? yes|no
    Commands run: at minimum `bunx astro check` and `bun run build` when code changed.
    Lighthouse: cursor-ide-browser MCP if available; else cite last known or mark Knowledge gap. Treat as secondary when experiment is copy/SEO.
  </baseline>
  <experiment>
    <tag>[YYYY-MM-DD]-[slug]</tag>
    <branch>autoresearch/[tag]</branch>
    <hypothesis>One testable sentence.</hypothesis>
    <files>path:lines — comma-separated</files>
    <patch_summary>What changed in plain language.</patch_summary>
  </experiment>
  <validation>
    <commands>bun run lint; bunx astro check; bun run build; optional browser review / Lighthouse / search-snippet check</commands>
    <expected>Metric improved | equal | regressed</expected>
    <decision>keep | discard | investigate</decision>
  </validation>
  <log_entry>
    Markdown snippet ready to paste under docs/learnings-log.md:
    ### [YYYY-MM-DD] [slug]
    **Hypothesis:** …
    **Result:** metric before → after | decision
    **Pattern:** reusable rule
    **Validation:** `bunx astro check && bun run build`
  </log_entry>
  <next_suggested>One follow-up experiment if decision was keep or investigate.</next_suggested>
</answer>
```

## Workflow (D.R.P.I.V)

| Phase | Action |
|---|---|
| **Discover** | Read `AGENTS.md`, touched routes/components, `docs/learnings-log.md`, prior `evals/site/**/compound.md`. |
| **Research** | Load `grupo-us` early for voice, journey, product hierarchy, sales logic. Browser MCP for SERP/UX review. `astro` / Context7 for implementation truth. |
| **Plan** | One hypothesis. List files. Success metric: commercial proxy first, technical proxy second. |
| **Implement** | Minimal patch. Conventional commits if committing. |
| **Validate** | Gates below. Document decision + compound learning. |

## Commercial-first eval heuristics (binary preferred)

- Headline states audience or transformation clearly: yes|no
- CTA names next action and outcome: yes|no
- Copy matches current funnel stage: yes|no
- Title tag, meta description, H1, primary keyword align: yes|no
- Page explains why this offer is different: yes|no
- Social proof or trust signal present where needed: yes|no

If analytics unavailable → use these as primary evaluators. Do not invent conversion numbers.

## Compound knowledge

Every area under `evals/site/<area-slug>/`:

- `runs/<tag>/run.md` — what this experiment did
- `compound.md` — durable learnings: winning patterns, SEO structures that worked, objections remaining, CTA phrasing trends, unresolved gaps

After **keep**: update `compound.md` with hypothesis that worked + why + what to preserve.
After **investigate**: update with what is still unclear + missing evidence.

## Git (recommended)

Non-trivial experiments:

```bash
git checkout -b autoresearch/YYYY-MM-DD-slug
```

**discard** → reset/revert per team practice. **keep** → merge or PR.

## Disk log

Mirror under repo: `evals/site/<area-slug>/runs/<YYYY-MM-DD>-<slug>/run.md`. Paste full `<answer>` (or summary + metrics table). Update `compound.md` with durable takeaway. See [`evals/README.md`](../../../../evals/README.md).

## Quality gates

After any `src/` or config change:

```bash
bun run lint
bunx astro check
bun run build
```

`bun run check:external-urls` when redirects or `externalSiteUrl` change.

## References

- [`AGENTS.md`](../../../../AGENTS.md) — single source of truth
- [`.claude/CLAUDE.md`](../../../CLAUDE.md) — commands + architecture
- [`grupo-us` skill](../../grupo-us/SKILL.md) — brand voice, journey, product logic, sales hierarchy
- [`astro` skill](../../astro/SKILL.md) — Astro 6 patterns
- [`performance-optimization` skill](../../performance-optimization/SKILL.md) — CWV + bundle when perf blocks conversion
- `references/optimizer.md` (sibling) — Karpathy loop scoring contract when running `<evolve_request>` over a site target
