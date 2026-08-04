#!/usr/bin/env python3
"""task_routing_guard.py - Validates Agent/task tool calls.
1. Validates subagent_type is in known list
2. Enforces run_in_background for research agents when the runtime exposes it
Trigger: PreToolUse (Agent) or Kilo task bridge
"""

import json
import sys
import typing


# Project agents (.claude/agents/*.md)
KNOWN_AGENTS = frozenset(
    {
        "code-reviewer",
        "debugger",
        "evaluator",
        "explore",
        "explorer-agent",
        "frontend-specialist",
        "librarian",
        "mobile-developer",
        "oracle",
        "orchestrator",
        "performance-optimizer",
        "project-planner",
        "ui-ux-designer",
        # Impeccable 4.x shipped subagents
        "impeccable-asset-producer",
        "impeccable-documenter",
        "impeccable-finish-reviewer",
        "impeccable-manual-edit-applier",
        # Built-in / generic task routes
        "general",
        "general-purpose",
        "Explore",
        "Plan",
        "claude-code-guide",
        "statusline-setup",
        # Alias
        "explorer",
        # Plugin-namespaced agents (codex-plugin-cc)
        "codex:codex-rescue",
        "codex-rescue",
        # Built-in additions surfaced by current Claude Code runtime
        "verification",
    }
)

# Read-only agents that SHOULD run in background (advisory — see ENFORCE_BACKGROUND)
# oracle removed — evaluator (Mode 3) handles architecture analysis and is NOT forced to background
MUST_BACKGROUND = frozenset({"explore", "explorer-agent", "explorer", "librarian"})

# Unattended mode: the background convention is a stderr note, never a deny.
# Set to False to silence the note entirely; there is no blocking variant —
# blocking a foreground spec-critique gate would stall an automated chain.
ENFORCE_BACKGROUND = True

VALID_LIST = ", ".join(sorted(KNOWN_AGENTS))


def read_input() -> dict[str, object]:
    try:
        raw = sys.stdin.read()
        return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        return {}


def allow() -> None:
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "allow",
                }
            }
        )
    )


def deny(reason: str) -> None:
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": reason,
                }
            }
        )
    )


def main() -> None:
    data: dict[str, object] = read_input()

    if not data:
        allow()
        return

    # Claude Code sends tool inputs nested under tool_input
    tool_input_val = data.get("tool_input", data)
    tool_input: dict[str, object] = (
        tool_input_val if isinstance(tool_input_val, dict) else {}
    )

    # Allow resume/SendMessage calls — they don't need subagent_type
    if tool_input.get("resume") or tool_input.get("to"):
        allow()
        return

    subagent = tool_input.get("subagent_type", "")
    run_bg = tool_input.get("run_in_background")
    runtime = str(data.get("runtime") or tool_input.get("runtime") or "")

    if subagent:
        # Validate against known agents
        if subagent not in KNOWN_AGENTS:
            deny(f"Unknown subagent_type '{subagent}'. Valid: {VALID_LIST}")
            return

        # Tier 1: read-only agents SHOULD use run_in_background: true. This is a
        # convention, not a gate — a blocking design gate (spec critique) legitimately
        # runs in the foreground, and denying it would stall an unattended chain.
        # Advisory only: emit a stderr note, never block.
        if (
            ENFORCE_BACKGROUND
            and subagent in MUST_BACKGROUND
            and run_bg is not None
            and run_bg is not True
            and runtime != "kilo"
        ):
            print(
                f"note: read-only agent '{subagent}' usually runs with run_in_background: true",
                file=sys.stderr,
            )

        allow()
        return

    # No subagent_type and no resume — Agent tool defaults to general-purpose; allow it
    allow()


if __name__ == "__main__":
    main()
    sys.exit(0)
