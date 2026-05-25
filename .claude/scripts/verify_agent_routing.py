#!/usr/bin/env python3
"""verify_agent_routing.py - Validates agent routing configuration.
Canonical routing reference: run this script to check all agents are correctly configured.
"""
import re
import sys
from pathlib import Path

# Expected background values per agent
EXPECT_BG: dict[str, bool] = {
    "explorer-agent": True,
    "librarian": True,
    "debugger": False,
    "evaluator": False,
    "frontend-specialist": False,
    "performance-optimizer": False,
    "project-planner": False,
    "mobile-developer": False,
}

# Write capability per agent
CAN_WRITE: dict[str, bool] = {
    "explorer-agent": False,
    "librarian": False,
    "debugger": True,
    "evaluator": True,
    "frontend-specialist": True,
    "performance-optimizer": True,
    "project-planner": True,
    "mobile-developer": True,
}

VALID_COLORS = {"red", "blue", "green", "yellow", "purple", "orange", "pink", "cyan"}

FRONTMATTER_PATTERN = re.compile(r"^---\s*$(.*?)^---\s*$", re.MULTILINE | re.DOTALL)
FIELD_PATTERN = re.compile(r"^(\w+):\s*(.+)$", re.MULTILINE)


def parse_frontmatter(content: str) -> dict[str, str]:
    m = FRONTMATTER_PATTERN.search(content)
    if not m:
        return {}
    fm_block = m.group(1)
    return {k: v.strip() for k, v in FIELD_PATTERN.findall(fm_block)}


def main() -> None:
    project_dir_env = ""
    import os
    project_dir_env = os.environ.get("CLAUDE_PROJECT_DIR", "")
    if not project_dir_env:
        # 3 levels up from .claude/scripts/verify_agent_routing.py
        project_dir_env = str(Path(__file__).parent.parent.parent)

    agents_dir = Path(project_dir_env) / ".claude" / "agents"
    errors = 0
    rows: list[dict] = []

    for agent_name in sorted(EXPECT_BG.keys()):
        agent_file = agents_dir / f"{agent_name}.md"

        if not agent_file.is_file():
            print(f"ERROR: Agent file not found: {agent_file}", file=sys.stderr)
            errors += 1
            continue

        content = agent_file.read_text(errors="replace")
        fm = parse_frontmatter(content)

        bg_raw = fm.get("background", "false").lower()
        bg = bg_raw == "true"
        color = fm.get("color", "MISSING")
        model = fm.get("model", "MISSING")
        spawn = "BACKGROUND" if bg else "FOREGROUND"
        write = "yes" if CAN_WRITE[agent_name] else "no"

        rows.append({
            "name": agent_name,
            "spawn": spawn,
            "write": write,
            "model": model,
            "color": color,
        })

        expected = EXPECT_BG[agent_name]
        if bg != expected:
            print(
                f"ERROR: {agent_name} has background={bg}, expected {expected}",
                file=sys.stderr,
            )
            errors += 1

        if color == "MISSING":
            print(f"ERROR: {agent_name} has no color field", file=sys.stderr)
            errors += 1
        elif color not in VALID_COLORS:
            print(
                f"ERROR: {agent_name} has invalid color '{color}'. Valid: {', '.join(sorted(VALID_COLORS))}",
                file=sys.stderr,
            )
            errors += 1

        if CAN_WRITE[agent_name] and bg:
            print(
                f"ERROR: Write-capable agent {agent_name} has background: true — writes will silently fail!",
                file=sys.stderr,
            )
            errors += 1

    # Print table
    sep = "-" * 70
    print(f"\nAgent Routing Taxonomy (Live State)")
    print(sep)
    print(f"| {'Agent':<22} | {'Spawn Mode':<10} | {'Write':<5} | {'Model':<6} | {'Color':<8} |")
    print(sep)
    for r in rows:
        print(f"| {r['name']:<22} | {r['spawn']:<10} | {r['write']:<5} | {r['model']:<6} | {r['color']:<8} |")
    print(sep)
    print()

    if errors > 0:
        print(f"FAIL: {errors} configuration error(s) found.", file=sys.stderr)
        sys.exit(1)
    else:
        print(f"PASS: All {len(EXPECT_BG)} agents correctly configured.")
        sys.exit(0)


if __name__ == "__main__":
    main()
