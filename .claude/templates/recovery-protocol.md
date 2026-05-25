# Recovery Protocol — Failure Recovery Template

> Reference structure invoked by `/debug recover` after **2+ failed fix attempts on the same hypothesis**.
> Stops the loop, documents state, escalates to evaluator.

## Trigger conditions

- Two consecutive fix attempts failed on the same hypothesis
- Quality gate fails 2× consecutively
- User says "this isn't working"
- Confidence < 3 on root cause after multi-file investigation

## Step 1 — STOP

- Halt all current fix attempts immediately
- Do not make further changes
- Do not retry the same approach

## Step 2 — DOCUMENT

Output a structured failure report:

```markdown
## Failure Report

**Original bug/error:**
{exact error message + reproduction trigger}

**Fixes attempted:**
1. {what} — failed because {why}
2. {what} — failed because {why}
3. ...

**Current state:**
- Files modified: {list}
- Commit since last clean state: {git log range}
- Tests still failing: {list}
- New errors introduced: {list, if any}

**Hypothesis tree:**
- H1: {original} — falsified by {evidence}
- H2: {pivot} — falsified by {evidence}
- ...
```

## Step 3 — REVERT (if applicable)

- If changes made the codebase **worse** than baseline, revert to last clean state
- Show `git diff HEAD` first
- **Confirm with user before reverting** if uncertain

```bash
git stash               # if you want to keep failed attempts for reference
# OR
git checkout -- .       # discard uncommitted changes (DESTRUCTIVE — confirm first)
```

## Step 4 — CONSULT evaluator (Mode 3: Architecture Analysis)

Spawn evaluator agent with the failure report:

```
TASK: Architecture analysis of unresolvable failure
INPUT: [failure report from Step 2]
EXPECTED: Root cause analysis + recommended approach (not just code fix)
TOOLS: Read, Grep, Glob, WebSearch
```

## Step 5 — REPORT TO USER

- Present evaluator analysis verbatim
- List options with effort estimates (S / M / L)
- Ask user which approach to pursue
- **Do not silently retry**

## Anti-patterns

- Looping on the same hypothesis past 2 attempts
- Skipping documentation step ("I know what's wrong")
- Reverting without showing diff first
- Asking evaluator a vague question ("why doesn't this work")
