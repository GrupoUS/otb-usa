#!/usr/bin/env python3
"""cdp.py - CDP wrapper — controls Chrome via Node.js CDP client (Windows native).
Usage: python .claude/scripts/cdp.py <command> [args...]

Commands:
  check                      Verify CDP is running on port 9222
  launch                     Launch Chrome with remote debugging
  navigate <url> [waitMs]    Navigate to URL
  screenshot <output.png>    Capture screenshot
  analyze                    Page metrics (dead anchors, empty buttons, JS errors)
  eval "<expression>"        Evaluate JS expression in page context
  info                       Current URL + title
  cookies                    Export session cookies
"""
import subprocess
import sys
import urllib.request
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
CDP_TOOL = SCRIPT_DIR / "cdp-tool.js"
CDP_PORT = 9222


def node(*args: str) -> subprocess.CompletedProcess:
    """Run cdp-tool.js via node directly (no PowerShell, no WSL bridge)."""
    return subprocess.run(
        ["node", str(CDP_TOOL), *args],
        capture_output=False,
        text=True,
        timeout=30,
    )


def check_cdp() -> bool:
    """Check if Chrome CDP is running on the debug port."""
    try:
        urllib.request.urlopen(f"http://localhost:{CDP_PORT}/json/version", timeout=3)
        return True
    except Exception:
        return False


def main() -> None:
    args = sys.argv[1:]
    command = args[0] if args else "help"
    rest = args[1:]

    if command == "check":
        if check_cdp():
            print(f"CDP is running on port {CDP_PORT}")
        else:
            print(f"CDP is NOT running. Run: python .claude/scripts/cdp.py launch")
            sys.exit(1)

    elif command == "launch":
        launch_script = SCRIPT_DIR / "launch_chrome_debug.py"
        subprocess.run([sys.executable, str(launch_script)])

    elif command == "navigate":
        url = rest[0] if rest else ""
        wait_ms = rest[1] if len(rest) > 1 else ""
        cmd_args = ["navigate", url]
        if wait_ms:
            cmd_args.append(wait_ms)
        node(*cmd_args)

    elif command == "screenshot":
        path = rest[0] if rest else "screenshot.png"
        node("screenshot", path)

    elif command == "analyze":
        node("analyze")

    elif command == "eval":
        expr = rest[0] if rest else ""
        node("eval", expr)

    elif command == "info":
        node("info")

    elif command == "cookies":
        node("cookies")

    else:
        print("CDP Browser Tool — Windows native (node-based, no PowerShell)")
        print("")
        print("Usage: python .claude/scripts/cdp.py <command> [args...]")
        print("")
        print("Commands:")
        print("  check                      Verify CDP is running on port 9222")
        print("  launch                     Launch Chrome with remote debugging")
        print("  navigate <url> [waitMs]    Navigate to URL")
        print("  screenshot <output.png>    Capture screenshot")
        print("  analyze                    Page metrics (dead anchors, errors, etc)")
        print("  eval '<expression>'        Evaluate JS in page context")
        print("  info                       Current URL + title")
        print("  cookies                    Export session cookies")
        print("")
        print("Authenticated page workflow:")
        print("  1. python .claude/scripts/cdp.py launch  (Chrome opens)")
        print("  2. Login manually in Chrome window")
        print("  3. python .claude/scripts/cdp.py check   (verify ready)")
        print("  4. python .claude/scripts/cdp.py navigate/screenshot/analyze")


if __name__ == "__main__":
    main()
    sys.exit(0)
