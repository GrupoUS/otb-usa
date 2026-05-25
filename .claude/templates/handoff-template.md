# Handoff Template — Session State Externalization

> Reference structure for writing session state when context is degrading or work spans multiple sessions.
> Loaded by `/evolve` (handoff mode) or invoked manually before `/clear`.

## When to use

- Session getting long and context starting to drift
- Work blocked overnight / over weekend
- Handing off between agents or humans
- Before invoking `/clear` mid-task

## Output location

`.claude/docs/evolution/HANDOFF.md` (overwrites previous handoff).

## Structure

```markdown
# Handoff — {YYYY-MM-DD HH:MM}

## Task
{What was being done — one paragraph, no jargon}

## Status
{In progress | Blocked | Nearly complete | Awaiting review}

## Files Changed
{List from `git diff --name-only` — group by domain}

## Decisions Made
{Key choices and rationale — focus on the WHY}

## Dead Ends
{What was tried and failed, so the next session doesn't repeat}

## Next Steps
{Exactly what to do next, in priority order — concrete actions, not vague intentions}

## Context to Load
{Which `/prime` variant, which Tier 2 rules, which docs the next session should read first}

## Open Questions
{Any user decisions still pending}
```

## Gather inputs

```bash
git status --short
git diff --stat HEAD
git log --oneline -10
```

## After writing

- Confirm file written
- Show the "Next Steps" section to the user as preview
- Optionally invoke `/evolve` to also capture learnings
