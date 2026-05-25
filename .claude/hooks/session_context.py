#!/usr/bin/env python3
"""session_context.py - Minimal SessionStart context tag.

Outputs a short additionalContext tag (project + package manager + branch + gates).

AGENTS.md, .claude/CLAUDE.md, and overlay markdown are loaded by the runtime
via the claudeMd mechanism. This hook intentionally does NOT duplicate them
in additionalContext — that would double-load the same content into every
turn's system prompt.

Trigger: SessionStart (startup | resume | compact)
"""
import json
import os
import subprocess
import sys
import typing

from pathlib import Path


def read_input() -> dict[str, object]:
    try:
        import select
        if select.select([sys.stdin], [], [], 0.2)[0]:
            raw = sys.stdin.read()
            return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        pass
    return {}


def get_git_branch(project_dir: str) -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            capture_output=True, text=True, timeout=3, cwd=project_dir,
        )
        return result.stdout.strip() or "unknown"
    except Exception:
        return "unknown"


def get_project_dir() -> str:
    if d := os.environ.get("CLAUDE_PROJECT_DIR"):
        return d
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True, text=True, timeout=3,
        )
        return result.stdout.strip() or os.getcwd()
    except Exception:
        return os.getcwd()


def load_project_config(project_dir: str) -> dict[str, object]:
    config_path = Path(project_dir) / ".claude" / "config.json"
    if not config_path.is_file():
        return {}
    try:
        return typing.cast(dict[str, object], json.loads(config_path.read_text(errors="replace")))
    except Exception:
        return {}


def main() -> None:
    data: dict[str, object] = read_input()
    source = str(data.get("source", "startup"))

    project_dir = get_project_dir()
    branch = get_git_branch(project_dir)

    config = load_project_config(project_dir)
    project = typing.cast(dict[str, object], config.get("project", {}))
    project_name = str(project.get("name", "")).strip().upper() or Path(project_dir).name.upper()
    tooling = typing.cast(dict[str, object], config.get("tooling", {}))
    pkg_mgr = str(tooling.get("packageManager", "")).strip()
    pkg_tag = pkg_mgr.capitalize() if pkg_mgr else ""

    base_tag = f"[{project_name}]" + (f" {pkg_tag}" if pkg_tag else "")
    prefixes = {
        "startup": f"{base_tag} | branch:{branch} | gates: check+lint+test",
        "compact": f"{base_tag} | branch:{branch} | gates: check+lint+test (post-compact)",
        "resume":  f"{base_tag} resumed | branch:{branch}",
    }
    additional_context = prefixes.get(source, f"{base_tag} | branch:{branch}")

    output = {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": additional_context,
        }
    }
    print(json.dumps(output))


if __name__ == "__main__":
    main()
    sys.exit(0)
