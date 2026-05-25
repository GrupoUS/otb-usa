# Sub-Agent Prompt Templates — OTB USA

Prompt templates for Phase 1 parallel research agents in the OTB static Astro repo.

---

## Sub-agent A: Evidence Collector

**For `frontend-debug`, `seo-debug`, and `systematic-audit`.** Captures public static-site evidence.

```typescript
Task({
  subagent_type: "debugger",
  name: "evidence-collector",
  description: "Capture public route evidence",
  run_in_background: true,
  prompt: `TASK: Capture browser/static evidence for OTB USA debugging

CONTEXT: [paste bug description or failing URL]
DEFAULT URL: http://localhost:4321

MISSION:
1. Inspect the generated/static route involved in the bug.
2. Capture screenshot/snapshot if browser tooling is available.
3. Check console/network symptoms if browser tooling is available.
4. For SEO issues, inspect dist/index.html, dist/otb/index.html, dist/sitemap-0.xml, dist/robots.txt.
5. Do not edit files.

VERIFY SPECIFICALLY:
- / renders the full funnel.
- #programa exists when Hero CTA points to it.
- /otb is noindex/redirect fallback and canonicalizes to /.
- No missing public assets for content JSON fields.

RETURN:
- Evidence source used (browser/CLI/dist)
- Screenshot path if captured
- Relevant generated HTML/sitemap findings
- Any console/network errors
- Confidence and recommended next investigation step`,
});
```

---

## Sub-agent B: Code Archaeologist

**For all packs.** Identifies code/content context around the failure.

```typescript
Task({
  subagent_type: "explorer-agent",
  name: "code-archaeologist",
  description: "Investigate failing OTB code path",
  run_in_background: true,
  prompt: `TASK: Investigate code context for OTB USA debugging

SYMPTOM: [paste error message or failing behavior]
AFFECTED AREA: [component/route/content field if known]

MISSION:
1. Search the repo for the failing component, route, content field, asset path, or config key.
2. Identify exact file:line where the error originates.
3. Run: git --no-pager log --oneline -10 -- <affected-files>.
4. Map the static dependency chain:
   - content field/config key
   - page/component consuming it
   - helper/layout involved
   - generated dist artifact to inspect
5. Check for recent changes that could have caused regression.

RETURN:
| # | Finding | Confidence (1-5) | Source | Impact |
|---|---|---:|---|---|

Plus:
- Affected file paths with line ranges
- Last 3 commits touching those files
- Dependency chain
- Knowledge gaps`,
});
```

---

## Sub-agent C: Regression Hunter

**For all packs.** Matches symptoms against OTB static-site patterns.

```typescript
Task({
  subagent_type: "explorer-agent",
  name: "regression-hunter",
  description: "Match against OTB static patterns",
  run_in_background: true,
  prompt: `TASK: Match debugging symptom against OTB static-site patterns

SYMPTOM: [paste error message or failing behavior]

MISSION:
1. Read .claude/skills/debugger/SKILL.md Common Root Causes Catalog.
2. Read .claude/skills/debugger/references/consolidated-domain-rules.md.
3. Check .claude/rules/stability.md for relevant rules.
4. Search active source/docs for matching legacy/domain/asset/route patterns.

If MATCH found:
- Return pattern name, root cause, recommended fix, file guidance.

If NO MATCH:
- Generate top 3 hypotheses ranked by probability.
- For each: evidence for/against and next investigation step.

RETURN:
- Match status: MATCHED / NO_MATCH
- Pattern details or ranked hypotheses
- Minimal verification command/smoke`,
});
```

---

## Sub-agent D: Content State Inspector

**For `content-debug`, `seo-debug`, and `systematic-audit`.** Verifies content/schema/assets/legal state.

```typescript
Task({
  subagent_type: "debugger",
  name: "content-state-inspector",
  description: "Inspect OTB content, schema, assets, and legal copy",
  run_in_background: true,
  prompt: `TASK: Inspect static content state related to the failure

SYMPTOM: [paste error]
AFFECTED CONTENT: [if known]

MISSION:
1. Read src/content.config.ts to understand the Content Collection schema.
2. Read src/content/products/otb.json and verify the failing field exists.
3. Check every referenced public asset exists.
4. Trace the consuming Astro component/page.
5. Verify WhatsApp messages start with: Olá, Laura!
6. Verify Harvard/legal copy does not imply affiliation, endorsement, certification, or partnership.
7. Do not edit files.

RETURN:
- Content/schema summary
- Missing/mismatched field or asset with file:line
- Legal/WhatsApp risk if any
- Recommended minimal fix`,
});
```
