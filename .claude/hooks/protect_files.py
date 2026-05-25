#!/usr/bin/env python3
"""protect_files.py - Block modifications to sensitive files.
Trigger: PreToolUse (Edit|Write)

Generic defaults block .env, lockfiles, and .git/ directory.
Project-specific protected paths read from .claude/config.json::protectedFiles
(extends each list).
"""
import json
import os
import sys
import typing

from pathlib import Path, PurePath

# Generic exact filename matches — apply to every project
PROTECTED_EXACT_DEFAULT = {
    ".env",
    ".env.local",
    ".env.production",
    ".env.development",
    ".env.test",
    "bun.lockb",
    "bun.lock",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
}

# Generic path segment matches — block any directory named these
PROTECTED_SEGMENTS_DEFAULT = {"credentials", "secrets", "api-keys"}

# Generic directory containment — patterns with separators
PROTECTED_CONTAINS_DEFAULT = [
    ".git/",
    ".git\\",
]


def load_extra_protections() -> tuple[set[str], set[str], list[str]]:
    """Read .claude/config.json::protectedFiles to extend generic protections.
    Returns (exact, segments, contains).
    """
    extra_exact: set[str] = set()
    extra_segments: set[str] = set()
    extra_contains: list[str] = []

    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    config_path = Path(project_dir) / ".claude" / "config.json"

    if config_path.is_file():
        try:
            cfg = json.loads(config_path.read_text(errors="replace"))
            pf = cfg.get("protectedFiles", {}) or {}
            extra_exact.update(pf.get("exact", []) or [])
            extra_segments.update(pf.get("segments", []) or [])
            extra_contains.extend(pf.get("contains", []) or [])
        except Exception:
            pass

    return extra_exact, extra_segments, extra_contains


_extra_exact, _extra_segments, _extra_contains = load_extra_protections()
PROTECTED_EXACT = PROTECTED_EXACT_DEFAULT | _extra_exact
PROTECTED_SEGMENTS = PROTECTED_SEGMENTS_DEFAULT | _extra_segments
PROTECTED_CONTAINS = PROTECTED_CONTAINS_DEFAULT + _extra_contains


def read_input() -> dict[str, object]:
    try:
        raw = sys.stdin.read()
        return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        return {}


def deny(reason: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))


def allow() -> None:
    sys.exit(0)


def main() -> None:
    data: dict[str, object] = read_input()
    # Support both top-level and nested tool_input
    file_path = str(
        data.get("file_path")
        or typing.cast(dict[str, object], data.get("tool_input", {})).get("file_path", "")
    )

    if not file_path:
        allow()
        return

    # Exact filename check (avoids false positives like ".env" matching "environment.ts")
    if PurePath(str(file_path)).name in PROTECTED_EXACT:
        deny(f"BLOCKED: '{file_path}' is a protected file")
        return

    path_parts = set(PurePath(str(file_path)).parts)
    for segment in PROTECTED_SEGMENTS:
        if segment in path_parts:
            deny(f"BLOCKED: '{file_path}' contains protected path segment '{segment}'")
            return

    # Directory containment check for patterns that include separators
    for pattern in PROTECTED_CONTAINS:
        if pattern in file_path:
            deny(f"BLOCKED: '{file_path}' matches protected pattern '{pattern}'")
            return

    allow()


if __name__ == "__main__":
    main()
    sys.exit(0)
