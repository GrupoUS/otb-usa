#!/usr/bin/env python3
"""subagent_start.py - Inject short context tag when subagents start.

Strings are intentionally short — they are injected as additionalContext into
the subagent's system prompt. Keys must match agent_type values surfaced by
the runtime AND match the SubagentStart matcher in .claude/settings.json.

Trigger: SubagentStart
"""
import json
import sys
import typing


AGENT_CONTEXT = {
    "frontend-specialist": "Bun | semantic tokens | Lucide only | Astro static | end with ## Context Handoff",
    "debugger":            "Systematic RCA | check+lint+build | logs in .claude/logs/ | end with ## Context Handoff",
    "performance-optimizer": "Measure-first | OWASP+CWV+SEO | <50KB JS | end with ## Context Handoff",
    "explorer-agent":      "Codebase only | Grep+Glob+Read | paths+evidence | end with ## Context Handoff",
    "explorer":            "Codebase only | Grep+Glob+Read | paths+evidence | end with ## Context Handoff",
    "project-planner":     "D.R.P.I.V | atomic tasks | dependencies | end with ## Context Handoff",
    "mobile-developer":    "Mobile-first | touch+perf+offline | end with ## Context Handoff",
    "evaluator":           "Adversarial | Mode1 plan / Mode2 sprint / Mode3 architecture | file:line evidence | end with ## Context Handoff",
    "librarian":           "External docs only | Tavily+Context7 | <2000 tokens | never touch FS | end with ## Context Handoff",
    "verification":        "Verify UI flows | Playwright MCP | screenshots+console+network evidence | end with ## Context Handoff",
}


def read_input() -> dict[str, object]:
    try:
        raw = sys.stdin.read()
        return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        return {}


def main() -> None:
    data: dict[str, object] = read_input()
    agent_type = str(data.get("agent_type", ""))

    context = AGENT_CONTEXT.get(agent_type)
    if not context:
        sys.exit(0)

    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "SubagentStart",
            "additionalContext": context,
        }
    }))


if __name__ == "__main__":
    main()
    sys.exit(0)
