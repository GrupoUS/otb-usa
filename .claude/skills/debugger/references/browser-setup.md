# Browser Setup — Authenticated vs Public

## Browser Mode Selection

| Page Type | Tool | Command |
|-----------|------|---------|
| **Public** (landing, pricing) | Playwright MCP | `mcp__playwright__browser_navigate` + `browser_snapshot` + `browser_take_screenshot` |
| **Public** (alternative) | agent-browser | `agent-browser open URL --headless` |
| **Authenticated** (dashboard, CRM, financeiro) | Claude Chrome extension | `claude --chrome` (official — works with Clerk session) |
| **Authenticated** (fallback) | cdp.py + node | `python .claude/scripts/cdp.py launch` → login → `cdp.py navigate/analyze` |

---

## Authenticated Browser Setup

Pages behind Clerk auth require an active login session. Use one of these approaches:

### Option A — Claude Code Chrome Extension (recommended)

```bash
# Requires Claude Chrome extension installed in Chrome (chrome.google.com/webstore)
claude --chrome
# → Claude attaches to existing Chrome session with Clerk login already active
# → Use /chrome slash command or --chrome flag
```

### Option B — cdp.py with node (advanced CDP)

```bash
# Step 1: Check if Chrome CDP is already running
python .claude/scripts/cdp.py check

# Step 2: If NOT running, launch Chrome with debugging
python .claude/scripts/cdp.py launch
# → User completes login in the Chrome window
# → Session persists in C:\Users\Mauri\chrome-debug-profile

# Step 3: Use CDP commands for browser automation
python .claude/scripts/cdp.py info                     # Current URL + title
python .claude/scripts/cdp.py navigate "<url>"         # Navigate to URL
python .claude/scripts/cdp.py screenshot /tmp/out.png  # Capture screenshot
python .claude/scripts/cdp.py analyze                  # Page metrics (dead anchors, empty buttons, errors)
python .claude/scripts/cdp.py eval "<js expression>"   # Run JS in page context
```

### Key Constraints

- Chrome MUST use `--user-data-dir=C:\Users\Mauri\chrome-debug-profile` — otherwise `--remote-debugging-port` is ignored by existing Chrome instances
- Clerk JWT tokens auto-refresh — cookie export to headless does NOT work reliably
- `agent-browser` is standalone and does NOT support attaching to existing Chrome (no `connect` subcommand)
- In CDP mode, do NOT call `agent-browser close` — it kills the user's Chrome session
