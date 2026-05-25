#!/usr/bin/env python3
"""frontend_test.py - Debug Skill - Frontend Testing with agent-browser.
Supports two modes:
  Headless (default): agent-browser opens its own Chrome
  CDP (--cdp):        checks Chrome CDP, then falls back to headless agent-browser

Default URL resolves from .claude/config.json::project.stagingUrl.
Override via positional argv[1].
"""
import argparse
import json
import os
import subprocess
import sys
import urllib.request
from pathlib import Path


def resolve_default_url() -> str:
    """Read project.stagingUrl from .claude/config.json; fall back to localhost."""
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    config_path = Path(project_dir) / ".claude" / "config.json"
    if config_path.is_file():
        try:
            cfg = json.loads(config_path.read_text(errors="replace"))
            url = cfg.get("project", {}).get("stagingUrl", "").strip()
            if url:
                return url
        except Exception:
            pass
    return "http://localhost:3000"


DEFAULT_URL = resolve_default_url()
DEFAULT_SCREENSHOT = "./debug-screenshot.png"


def has_command(cmd: str) -> bool:
    return subprocess.run(["which", cmd], capture_output=True).returncode == 0


def cdp_is_running() -> bool:
    try:
        urllib.request.urlopen("http://localhost:9222/json/version", timeout=3)
        return True
    except Exception:
        return False


def run_cmd(args: list[str]) -> None:
    subprocess.run(args, check=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Frontend Testing with agent-browser")
    parser.add_argument("url", nargs="?", default=DEFAULT_URL)
    parser.add_argument("screenshot", nargs="?", default=DEFAULT_SCREENSHOT)
    parser.add_argument("--cdp", action="store_true", help="Connect to Windows Chrome via CDP")
    parser.add_argument("--headless", action="store_true", help="Launch headless browser (default)")
    opts = parser.parse_args()

    mode = "cdp" if opts.cdp else "headless"
    url = opts.url
    screenshot_path = opts.screenshot

    print("Frontend Testing with agent-browser")
    print("=======================================")
    print(f"Mode: {mode}")
    print()

    if not has_command("agent-browser"):
        print("agent-browser not installed")
        print()
        print("Install with:")
        print("  bun install -g agent-browser")
        print("  agent-browser install")
        sys.exit(1)

    if mode == "cdp":
        print("1. Checking CDP on port 9222...")
        if cdp_is_running():
            print("   CDP is running")
        else:
            print("   CDP not available. Launch Chrome with:")
            print("   python3 .claude/scripts/launch_chrome_debug.py")
            sys.exit(1)

        print()
        print("2. NOTE: agent-browser cannot attach to an existing Chrome session via CDP.")
        print("   Falling back to launching a headless agent-browser session instead.")

        print()
        print(f"3. Opening (headless fallback): {url}")
        run_cmd(["agent-browser", "open", url, "--headless"])

        print()
        print("4. Taking snapshot (accessibility tree)...")
        run_cmd(["agent-browser", "snapshot"])

        print()
        print("5. Taking screenshot...")
        run_cmd(["agent-browser", "screenshot", screenshot_path])
        print(f"   Saved to: {screenshot_path}")

        print()
        print("6. Closing browser...")
        run_cmd(["agent-browser", "close"])

        print()
        print("Frontend test complete (CDP flag used, headless fallback mode)")

    else:
        print(f"1. Opening: {url}")
        run_cmd(["agent-browser", "open", url, "--headless"])

        print()
        print("2. Taking snapshot (accessibility tree)...")
        run_cmd(["agent-browser", "snapshot"])

        print()
        print("3. Taking screenshot...")
        run_cmd(["agent-browser", "screenshot", screenshot_path])
        print(f"   Saved to: {screenshot_path}")

        print()
        print("4. Closing browser...")
        run_cmd(["agent-browser", "close"])

        print()
        print("Frontend test complete (headless mode)")

    print()
    print("Next steps:")
    print(f"  - Review screenshot: {screenshot_path}")
    print("  - Use refs from snapshot for interactions:")
    print('    agent-browser click @e2')
    print('    agent-browser fill @e3 "text"')


if __name__ == "__main__":
    main()
