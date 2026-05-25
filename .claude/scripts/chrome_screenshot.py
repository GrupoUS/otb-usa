#!/usr/bin/env python3
"""chrome_screenshot.py - Take screenshot of a page in Chrome (CDP on port 9222).
Usage: python3 chrome_screenshot.py <output-path> [url-substring]
Requires: Chrome running with --remote-debugging-port=9222

Page detection: matches the URL substring from argv[2], or falls back to the
host portion of .claude/config.json::project.stagingUrl. If both absent,
returns the first non-extension page.
"""
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path


def get_url_match() -> str:
    """Resolve URL substring: argv[2] > config stagingUrl host > '' (any page)."""
    if len(sys.argv) > 2 and sys.argv[2]:
        return sys.argv[2]
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR", os.getcwd())
    config_path = Path(project_dir) / ".claude" / "config.json"
    if config_path.is_file():
        try:
            cfg = json.loads(config_path.read_text(errors="replace"))
            url = cfg.get("project", {}).get("stagingUrl", "").strip()
            if url:
                return urllib.parse.urlparse(url).netloc or url
        except Exception:
            pass
    return ""


def get_page_id(url_match: str) -> str | None:
    """Find a target page ID via CDP /json/list."""
    try:
        with urllib.request.urlopen("http://localhost:9222/json/list", timeout=3) as resp:
            pages = json.loads(resp.read())
        for p in pages:
            if p.get("type") != "page":
                continue
            url = p.get("url", "")
            if url.startswith(("chrome-extension://", "chrome://", "devtools://")):
                continue
            if not url_match or url_match in url:
                return p["id"]
    except Exception:
        pass
    return None


def main() -> None:
    output = sys.argv[1] if len(sys.argv) > 1 else "screenshot.png"
    url_match = get_url_match()

    page_id = get_page_id(url_match)
    if not page_id:
        target = url_match or "(any non-extension page)"
        print(f"No page matching '{target}' found in Chrome (CDP on 9222)")
        sys.exit(1)

    print(f"Found page: {page_id} (output: {output})")
    print("Use agent-browser or cdp.py for full interaction")


if __name__ == "__main__":
    main()
