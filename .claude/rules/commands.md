---
globs: .claude/**
---

# Slash Commands + Skill Phase Ordering — GPUS Astro Landing

## Commands

| Command | When to invoke |
|---|---|
| `/plan [task]` | L3+ task before code |
| `/prime [auto\|frontend]` | Cross-domain or unclear-scope start |
| `/research [question]` | External docs/practice gap |
| `/design [task]` | New UI page/section/component |
| `/implement [plan-path]` | Execute approved plan |
| `/debug [audit\|frontend\|recover]` | Error, crash, regression |
| `/perf [build]` | Lighthouse, bundle, runtime performance |
| `/verify [quick\|spec-only\|paranoid]` | Post-implementation gate |
| `/evolve [auto\|handoff]` | Learning capture/autoresearch |
| `/delegate` | Explicit specialist handoff |
| `/recover` | Recovery after 2+ failed attempts |

Skip commands for L1–L2 trivial edits.

## Skill phase ordering

| Phase | Skills |
|---|---|
| Process | `senior-prompt-engineer`, `planning`, `evolution-core`, `debugger` |
| Tech-stack | `astro` |
| Project | `grupo-us`, `gpus-theme` |
| Implementation | `ui-ux-pro-max`, `performance-optimization`, `skill-creator` |

## Agent ↔ skill default pairings

| Skill loaded | Paired agent | Spawn when |
|---|---|---|
| `debugger` | `debugger` | L3+ bug/crash/regression |
| `performance-optimization` | `performance-optimizer` | L3+ perf/bundle/Lighthouse |
| `gpus-theme` | `frontend-specialist` | L3+ UI/page/component |
| `astro` | `frontend-specialist` | L3+ `.astro`, Content Collections, `client:*` |
| `planning` | `project-planner` | L4+ plan handoff |
| `verification-before-completion` | `verification-agent` | L3+ pre-merge gate |
| unclear L3+ scope | `explorer-agent` + `librarian` | parallel read-only research |

## Stopping conditions

- Max 3 fix attempts on same hypothesis → `evaluator` Mode 3 + `/debug recover`.
- Max 5 agent spawns per request → checkpoint with user.
- 2 consecutive failures of same approach → `/recover`.
