#!/usr/bin/env python3
"""ultracite.py - Unified Biome formatter + OXLint checker.

Branches on `hook_event_name` from stdin payload:

  • PostToolUse (Write|Edit) → format the single edited file with
        `bunx biome format <file> --write`  (cosmetic only)

  • Stop                     → run `bunx oxlint <modified TS/JS files>`
        over up to 20 git-modified files; if any errors, block the stop
        with the last 30 lines of output (truncated to 2KB).

Why format-only on PostToolUse:
  `biome check --write` runs the linter + assists with auto-fix. Rules like
  `noUnusedImports` (level error, fix safe) DELETE imports they consider
  unused. Across multi-step edits, an import added in step N may not have
  its usage code written until step N+1 — Biome would remove it between
  steps and cascade errors. `biome format --write` only touches whitespace,
  indentation, quotes, semicolons, trailing commas, line width.

  OXLint `--fix` is intentionally NOT used in PostToolUse for the same reason.
  Lint fixes only run at Stop (read-only check) or manually
  (`bunx biome check --write && bun run lint:oxlint`).

Triggers:
  PostToolUse (Write|Edit) — format mode
  Stop                     — lint check mode

Always fails open: any internal error → exit 0 (never wedge a session).
"""
import json
import re
import subprocess
import sys
import typing
from pathlib import Path

TS_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".json"}
LINT_EXTENSIONS = (".ts", ".tsx", ".js", ".jsx")
MAX_LINT_FILES = 20
LINT_TIMEOUT_S = 30
FORMAT_TIMEOUT_S = 30
GIT_DIFF_TIMEOUT_S = 10


def read_input() -> dict[str, object]:
    try:
        raw = sys.stdin.read()
        return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        return {}


# ─────────────────────────────────────────────────────────────────────────────
# PostToolUse — biome format --write on a single file
# ─────────────────────────────────────────────────────────────────────────────
def run_format(data: dict[str, object]) -> None:
    file_path = str(
        data.get("file_path")
        or typing.cast(dict[str, object], data.get("tool_input", {})).get("file_path", "")
    )
    if not file_path:
        return
    if Path(file_path).suffix.lower() not in TS_EXTENSIONS:
        return

    try:
        subprocess.run(
            ["bunx", "biome", "format", file_path, "--write"],
            capture_output=True,
            timeout=FORMAT_TIMEOUT_S,
        )
    except Exception:
        pass


# ─────────────────────────────────────────────────────────────────────────────
# Stop — oxlint over git-modified files; block on errors
# ─────────────────────────────────────────────────────────────────────────────
def get_modified_files() -> list[str]:
    try:
        result = subprocess.run(
            ["git", "diff", "--name-only", "--diff-filter=ACM"],
            capture_output=True, text=True, timeout=GIT_DIFF_TIMEOUT_S,
        )
        files = result.stdout.strip().splitlines()
        return [f for f in files if f.endswith(LINT_EXTENSIONS)][:MAX_LINT_FILES]
    except Exception:
        return []


def run_check(data: dict[str, object]) -> None:
    # Avoid infinite stop-hook loop
    if data.get("stop_hook_active") is True:
        return

    modified = get_modified_files()
    if not modified:
        return

    try:
        result = subprocess.run(
            ["bunx", "oxlint", *modified],
            capture_output=True, text=True, timeout=LINT_TIMEOUT_S,
        )
        raw_output = result.stdout + result.stderr
    except Exception:
        return  # don't block if oxlint can't run

    error_match = re.search(r"(\d+) error", raw_output)
    error_count = int(error_match.group(1)) if error_match else 0
    if error_count <= 0:
        return

    truncated = "\n".join(raw_output.splitlines()[-30:])[:2000]
    print(json.dumps({
        "decision": "block",
        "reason": f"OXLint found {error_count} error(s). Fix them before stopping:\n\n{truncated}",
    }))


# ─────────────────────────────────────────────────────────────────────────────
# Dispatch
# ─────────────────────────────────────────────────────────────────────────────
def main() -> None:
    data: dict[str, object] = read_input()
    event = str(data.get("hook_event_name", "")).strip()

    # Explicit override via CLI arg ("format" | "check") for manual testing
    if len(sys.argv) > 1:
        event_override = sys.argv[1].strip().lower()
        if event_override == "format":
            event = "PostToolUse"
        elif event_override == "check":
            event = "Stop"

    try:
        if event == "PostToolUse":
            run_format(data)
        elif event == "Stop":
            run_check(data)
        # Unknown / missing event: silent no-op (fail open)
    except Exception:
        pass


if __name__ == "__main__":
    main()
    sys.exit(0)
