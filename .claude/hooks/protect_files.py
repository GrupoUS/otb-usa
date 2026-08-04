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

# Two tiers so the project runs unattended:
#   HARD  — credentials, lockfiles, .git. Never editable, no exceptions.
#   SOFT  — the project's own `config.json::protectedFiles` (astro.config.mjs,
#           whatsapp.ts, content.config.ts, package.json, …). Editing these is a
#           real decision, so the hook logs a stderr warning and lets it through
#           instead of blocking an automated chain. Flip WARN_ONLY_PROJECT_FILES
#           to False to restore hard blocking.
WARN_ONLY_PROJECT_FILES = True

PROTECTED_EXACT = set(PROTECTED_EXACT_DEFAULT)
PROTECTED_SEGMENTS = set(PROTECTED_SEGMENTS_DEFAULT)
PROTECTED_CONTAINS = list(PROTECTED_CONTAINS_DEFAULT)

SOFT_EXACT: set[str] = set()
SOFT_SEGMENTS: set[str] = set()
SOFT_CONTAINS: list[str] = []

if WARN_ONLY_PROJECT_FILES:
    SOFT_EXACT = _extra_exact - PROTECTED_EXACT_DEFAULT
    SOFT_SEGMENTS = _extra_segments - PROTECTED_SEGMENTS_DEFAULT
    SOFT_CONTAINS = [p for p in _extra_contains if p not in PROTECTED_CONTAINS_DEFAULT]
else:
    PROTECTED_EXACT |= _extra_exact
    PROTECTED_SEGMENTS |= _extra_segments
    PROTECTED_CONTAINS += _extra_contains


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

    # Soft tier: project-declared protected files. Warn on stderr, never block.
    # Entries may be bare filenames ("package.json") or repo-relative paths
    # ("src/lib/whatsapp.ts"), so match both the basename and a path suffix.
    name = PurePath(str(file_path)).name
    normalized = str(file_path).replace("\\", "/")
    if (
        name in SOFT_EXACT
        or any(
            "/" in entry and normalized.endswith(entry.replace("\\", "/"))
            for entry in SOFT_EXACT
        )
        or path_parts & SOFT_SEGMENTS
        or any(pattern in file_path for pattern in SOFT_CONTAINS)
    ):
        print(
            f"note: '{file_path}' is listed in config.json::protectedFiles — "
            "edit it with an explicit reason and re-run the gates",
            file=sys.stderr,
        )

    allow()


if __name__ == "__main__":
    main()
    sys.exit(0)
