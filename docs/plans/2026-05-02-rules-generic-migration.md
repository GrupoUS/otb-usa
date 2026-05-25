# OTB USA — rules migration note

## Decision

The active Tier-2 rules in `.claude/rules/` are now aligned with the OTB USA repo and point to project-specific skills only when needed.

## Current project skills

- `otb-usa` — product facts, audience, CTA and legal guardrails.
- `otb-theme` — Navy/Gold dark-only theme, typography and motion rules.
- `astro` — framework patterns with `references/otb-usa-overlay.md`.

## Guardrail

Do not reintroduce examples from unrelated products when updating rules or skills.
