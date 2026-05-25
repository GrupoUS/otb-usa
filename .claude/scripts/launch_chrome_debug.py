#!/usr/bin/env python3
"""launch_chrome_debug.py - Launch Chrome with remote debugging (Windows native).
Usage: python .claude/scripts/launch_chrome_debug.py [URL]
After launching, log in manually, then use cdp.py commands.

Reads start URL from .claude/config.json::project.stagingUrl unless overridden via argv.
Profile dir defaults to ~/chrome-debug-profile (override via $CHROME_DEBUG_PROFILE env var).
"""
import json
import os
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

CHROME_PATHS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
]
PROFILE_DIR = os.environ.get(
    "CHROME_DEBUG_PROFILE",
    str(Path.home() / "chrome-debug-profile"),
)
DEBUG_PORT = int(os.environ.get("CHROME_DEBUG_PORT", "9222"))


def get_start_url() -> str:
    """Resolve start URL: argv[1] > config.json::project.stagingUrl > localhost:3000."""
    if len(sys.argv) > 1 and sys.argv[1].startswith(("http://", "https://")):
        return sys.argv[1]
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


START_URL = get_start_url()


def find_chrome() -> str:
    for path in CHROME_PATHS:
        if Path(path).exists():
            return path
    return "chrome"  # fallback: assume chrome is in PATH


def main() -> None:
    print("Killing existing Chrome instances...")
    subprocess.run(
        ["taskkill", "/F", "/IM", "chrome.exe"],
        capture_output=True,
    )
    time.sleep(2)

    chrome = find_chrome()
    print(f"Launching Chrome: {chrome}")
    subprocess.Popen(
        [
            chrome,
            f"--remote-debugging-port={DEBUG_PORT}",
            "--remote-allow-origins=*",
            "--no-first-run",
            f"--user-data-dir={PROFILE_DIR}",
            START_URL,
        ],
        creationflags=subprocess.DETACHED_PROCESS if sys.platform == "win32" else 0,
    )
    time.sleep(5)

    print("Verifying CDP port...")
    try:
        urllib.request.urlopen(
            f"http://localhost:{DEBUG_PORT}/json/version", timeout=5
        )
        print(f"✓ Port {DEBUG_PORT} open — CDP ready")
    except Exception:
        print(f"✗ Port {DEBUG_PORT} not responding — check Chrome startup")
        sys.exit(1)

    print("")
    print("Chrome launched. Now:")
    print("  1. Complete any challenge + log in manually in the Chrome window")
    print("  2. Session persists in:", PROFILE_DIR)
    print("  3. Then use: python .claude/scripts/cdp.py navigate/screenshot/analyze")
    print("  4. OR use Playwright MCP tools directly (mcp__playwright__browser_*)")


if __name__ == "__main__":
    main()
