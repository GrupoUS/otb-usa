# Sub-Agent Prompt Templates

Full TypeScript prompt templates for Phase 1 parallel research agents.

---

## Sub-agent A: Evidence Collector

**For `frontend-debug` and `systematic-audit` only.** Captures live browser state.

```typescript
Task({
  subagent_type: "debugger",
  name: "evidence-collector",
  description: "Capture browser evidence",
  run_in_background: true,
  prompt: `TASK: Capture browser evidence for debugging

CONTEXT: [paste bug description or failing URL]

BROWSER MODE SELECTION:
- Public page (landing, /pricing, public-facing routes) → agent-browser headless
- Authenticated page (/dashboard, /admin, app-internal routes) → python .claude/scripts/cdp.py

MODE A — HEADLESS (public pages):
  agent-browser open "[URL]" --headless
  agent-browser snapshot
  agent-browser screenshot e2e-screenshots/debug/00-initial.png
  agent-browser eval "document.querySelector('#react-error-overlay')?.textContent || 'no overlay'"
  agent-browser get title && agent-browser get url
  agent-browser close

MODE B — CDP (authenticated pages):
  python .claude/scripts/cdp.py check          # Verify Chrome CDP is running
  python .claude/scripts/cdp.py navigate "[URL]"
  python .claude/scripts/cdp.py analyze        # Page metrics (dead anchors, empty buttons, errors)
  python .claude/scripts/cdp.py screenshot e2e-screenshots/debug/00-initial.png
  python .claude/scripts/cdp.py eval "document.querySelector('#react-error-overlay')?.textContent || 'no overlay'"
  # Do NOT close Chrome — keeps the user's session alive

IMPORTANT: agent-browser does NOT support attaching to an existing Chrome session (no 'connect' subcommand). For authenticated pages, use cdp.py or claude --chrome.

RETURN:
- Browser mode used (headless / CDP)
- Screenshot path
- Page metrics from analyze (if CDP mode)
- React error overlay text if present
- Page URL and title

DO NOT fix anything. Evidence collection only.`,
});
```

---

## Sub-agent B: Code Archaeologist

**For all packs.** Identifies code context around the failure.

```typescript
Task({
  subagent_type: "explorer",
  name: "code-archaeologist",
  description: "Investigate failing code",
  run_in_background: true,
  prompt: `TASK: Investigate code context for debugging

SYMPTOM: [paste error message or failing behavior]
AFFECTED AREA: [component/route/procedure name if known]

MISSION:
1. Search codebase for the failing component, route, or procedure
2. Identify the EXACT file:line where the error originates
3. Run: git log --oneline -10 -- <affected-files> to find last commits
4. Map related dependencies:
   - tRPC procedures called by the component
   - Drizzle queries used by the procedure
   - Clerk middleware/auth checks in the path
   - Zod schemas validating input
5. Check for recent changes that could have caused regression

RETURN (Findings Table format):
| # | Finding | Confidence (1-5) | Source | Impact |
|---|---------|------------------|--------|--------|

Plus:
- Affected file paths with line ranges
- Last 3 commits touching those files
- Dependency chain (component → procedure → query → table)
- Knowledge Gaps identified`,
});
```

---

## Sub-agent C: Regression Hunter

**For all packs.** Matches symptom against known patterns.

```typescript
Task({
  subagent_type: "explorer",
  name: "regression-hunter",
  description: "Match against known patterns",
  run_in_background: true,
  prompt: `TASK: Match debugging symptom against known patterns

SYMPTOM: [paste error message or failing behavior]

MISSION:
1. Read .claude/skills/debugger/references/consolidated-domain-rules.md
2. Scan the Common Root Causes Catalog in this SKILL.md
3. Search MEMORY.md for matching patterns (project auto-memory)
4. Check \`.claude/rules/stability.md\` (Stability Audit Checklist A-L) for relevant rules

If MATCH found:
- Return: pattern name, root cause, recommended fix, file guidance

If NO MATCH:
- Generate top-3 hypotheses ranked by probability
- For each: hypothesis statement, evidence for/against, suggested investigation step

RETURN:
- Match status: MATCHED / NO_MATCH
- If matched: pattern details + fix guidance
- If not matched: ranked hypotheses with investigation plan`,
});
```

---

## Sub-agent D: DB State Inspector

**For `backend-debug` and `auth-db-debug`.** Replaces Sub-agent A (Evidence Collector) for backend/auth packs.

```typescript
Task({
  subagent_type: "debugger",
  name: "db-state-inspector",
  description: "Inspect database state",
  run_in_background: true,
  prompt: `TASK: Inspect database state related to the failure

SYMPTOM: [paste error]
AFFECTED TABLE(S): [if known]

MISSION:
1. Read apps/api/drizzle/schema.ts to understand table structure
2. Construct targeted SELECT queries to verify data state
3. Check for: orphaned rows, missing FK references, tenant_id gaps
4. Verify enum values match schema definition
5. Check indexes exist for all FK columns

IMPORTANT: Do NOT run psql directly. Return the queries you would run.
The lead agent will execute them after review.

RETURN:
- Table structure summary
- Diagnostic queries (ready to run)
- Suspected data inconsistencies`,
});
```
