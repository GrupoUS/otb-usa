---
description: Capture learnings, run Karpathy-style optimize loops, and trigger GPUS site autoresearch. All routes load `evolution-core` once.
workflow_type: prompt-chaining
---

# /evolve — Learning Capture + Optimize + Autoresearch

**ARGUMENTS**: $ARGUMENTS

---

## 0. Mode detection

| Token in `$ARGUMENTS` | Behavior |
|---|---|
| (none) | Manual capture flow (§ 1–5) |
| `auto [<skill>]` | Skip § 1–5; run AutoResearch Loop per `_shared.md` § 10. Sub-arg targets one skill. Default: every skill with `evals.json`. |
| `optimize <target>` | **Karpathy `<evolve_request>` loop** — load `evolution-core/references/optimizer.md`. Target = skill name (e.g. `optimize debugger`) or `site:<area>` (e.g. `optimize site:home-hero` → also load `references/gpus-profile.md`). |
| `handoff` | Write session state per `.claude/templates/handoff-template.md` |

**Implicit override:** if the user pasted an `<evolve_request>...</evolve_request>` XML block anywhere in `$ARGUMENTS`, switch to `optimize` mode regardless of token. If `<input><area>...</area></input>` appears, switch to `optimize site:<area>` mode.

---

## 1. First action

```typescript
Skill("evolution-core"); // single load — covers memory, optimizer, gpus-profile via references/
```

The skill's routing table picks the right `references/<file>.md` for the detected mode. Do not load deleted skills (`auto-research-gpus`, `evolve-autoresearch`) — they were absorbed into `evolution-core` on 2026-05-01.

---

## 2. Capture flow

### 2.1 Gather session context

Analyze the current conversation to identify:

```markdown
## Session Context

### Task completed
[brief description]

### Problem found
[bug/error/issue]

### Root cause
[identified root cause]

### Solution applied
[code or specific changes]

### Validation
[commands run: type-check, lint, test, etc.]
```

### 2.2 Persist to evolution-core memory

```bash
python .claude/skills/evolution-core/scripts/memory_manager.py capture \
  "[learning description]" \
  -t bug_fix \
  --files "[modified files]" \
  --root-cause "[root cause]"
```

---

## 3. Skill / target routing

Based on modified file paths + `_shared.md` § 6 (Skill-to-Domain Matrix), identify affected skills.

Generic mapping (override via `${overlay}/routing-supplements.md` if present):

| Path / target | Reference loaded |
|---|---|
| `${paths.backendRoot}` | `debugger` |
| `${paths.schemaRoot}` | `debugger` (+ `supabase-postgres-best-practices` for Postgres) |
| `${paths.frontendRoot}` | `debugger` + `ui-ux-pro-max` (if styling/design) |
| Performance changes | `performance-optimization` |
| Skill files themselves | `skill-creator` |
| Memory infrastructure | `evolution-core/references/memory.md` |
| `optimize <skill-name>` | `evolution-core/references/optimizer.md` |
| `optimize site:<area>` or `<input><area>` | `evolution-core/references/optimizer.md` + `evolution-core/references/gpus-profile.md` |

Ask user which skills to update if multiple are relevant and not obvious.

---

## 4. Improve skills

For each selected skill, add to `references/` or relevant SKILL.md section:

```markdown
## Case: [Bug/Problem Name]

**Symptom:** [user-perceived]
**Root cause:** [technical]
**Fix:** [solution applied]
**Files:** [file list]
**Validation:** [gates run]

### Anti-pattern discovered

// ❌ WRONG
[problematic code]

// ✅ CORRECT
[correct code]
```

Categorize:

| Type | Where | When |
|---|---|---|
| Stability rule | dedicated section | Rules to prevent crashes |
| Anti-pattern | existing section | Problematic patterns |
| Known case | `references/` | Complex documented cases |
| Quick reference | existing table | Quick tips |

---

## 5. Append to learnings log

Project chronological learnings live in **`docs/learnings-log.md`** (append-only, new entries on top). Subdirectory `AGENTS.md` files (when present in `${paths.backendRoot}` / `${paths.frontendRoot}` / `${paths.schemaRoot}`) carry domain-specific learnings only; otherwise route everything to `docs/learnings-log.md`.

Append at the **top** of the log (under the header):

```markdown
### [YYYY-MM-DD] [Learning Title]

> Added after bug fix in `[file]`.

**Problem:** [description]
**Cause:** [root cause]
**Solution:** [fix applied]
**Validation:** [commands run]
```

Also surface the new entry as a one-liner in the root `AGENTS.md § Recent learnings (last 3)` section — replace the oldest of the three with the new entry.

---

## 6. Optimize mode (Karpathy autoresearch)

When `optimize <target>` was selected (or `<evolve_request>` was detected):

1. Bootstrap run from request:
   ```bash
   python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_harness.py init-run \
     --file /tmp/evolve-request.xml
   ```
2. Seed deterministic candidates:
   ```bash
   python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_mutate.py seed-candidates \
     --run-dir evals/<skill-slug>/runs/<run-id>
   ```
3. Score baseline + each candidate (full sample budget, no shortcut):
   ```bash
   python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_score.py score-candidate \
     --run-dir evals/<skill-slug>/runs/<run-id> \
     --grade-file evals/<skill-slug>/runs/<run-id>/grades/<id>.json
   ```
4. Build response XML + append backlog:
   ```bash
   python3 .claude/skills/evolution-core/scripts/evolve_autoresearch_report.py build-response \
     --run-dir evals/<skill-slug>/runs/<run-id> \
     --append-backlog
   ```
5. Emit `<evolve_response>` in chat **before** running the §2 capture flow on the winning prompt.

**Operational rules** (mirror `references/optimizer.md`):

- One scored target artifact per run. Sibling-file syncs (e.g. updating this command after the optimizer skill changes) happen **between** runs as `program.md`-class edits — never as a second scored target.
- Crash candidate → at most one quick local fix retry, else log `crash` row in `experiments.tsv` and move on. Never mutate harness / criteria / sample budget to rescue.
- Self-improvement runs (target = this command or `references/optimizer.md`) require sample pool with at least: 1 ordinary optimize case + 1 self-improvement boundary + 1 crash/failure case.

For `optimize site:<area>`, the GPUS profile drives the priority order (copy → SEO → sales/funnel → conversion UX → performance) and the `<answer>` output shape — see `references/gpus-profile.md`.

---

## 7. Summary

```
Learning captured successfully.

Memory: evolution-core updated
Mode: [capture | auto | optimize | handoff]
Run dir (if optimize): evals/<skill-slug>/runs/<run-id>
Skills improved: [list]
Learnings log: docs/learnings-log.md (entry [YYYY-MM-DD] [title])
AGENTS.md recent-learnings refreshed: [yes/no]
```

---

## References

- `evolution-core` skill: `.claude/skills/evolution-core/SKILL.md`
- Memory layer: `.claude/skills/evolution-core/references/memory.md`
- Karpathy optimizer: `.claude/skills/evolution-core/references/optimizer.md`
- GPUS site profile: `.claude/skills/evolution-core/references/gpus-profile.md`
- Autoresearch scripts README: `.claude/skills/evolution-core/scripts/AUTORESEARCH_README.md`
- `skill-creator` skill: `.claude/skills/skill-creator/SKILL.md`
- AutoResearch Loop: `.claude/commands/_shared.md` § 10
- Handoff template: `.claude/templates/handoff-template.md`
