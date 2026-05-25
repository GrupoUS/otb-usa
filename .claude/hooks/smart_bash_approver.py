#!/usr/bin/env python3
"""smart_bash_approver.py - Selective autonomy for Bash commands.
Receives JSON via stdin, outputs JSON decision.
Trigger: PreToolUse (Bash)
"""

import json
import re
import sys
import typing


LEADING_CD_PATTERN = re.compile(r"^cd\s+[^&;]+\s+&&\s+")


def normalize_command(raw_command: str) -> str:
    command = raw_command.strip()

    while True:
        normalized = LEADING_CD_PATTERN.sub("", command, count=1).strip()
        if normalized == command:
            return command
        command = normalized


# ── Safe deletion patterns (auto-allow node_modules cleanup — check FIRST) ──
SAFE_DELETE_PATTERNS = [
    re.compile(r"node_modules"),
    re.compile(r"/node_modules"),
    re.compile(r"\.cache"),
    re.compile(r"/\.turbo"),
]

# ── Dangerous patterns (always block) ──
DANGEROUS_PATTERNS = [
    re.compile(r"^rm -rf /"),
    re.compile(r"^rm -rf ~"),
    re.compile(r"^rm -rf \$HOME"),
    re.compile(r"^:\(\)\{ :\|:& \};:"),
    re.compile(r"^chmod -R 777 /"),
    re.compile(r"^dd if=.*of=/dev/"),
    re.compile(r"^> /dev/sd"),
    re.compile(r"^DROP DATABASE"),
    re.compile(r"^DROP TABLE"),
    re.compile(r"^TRUNCATE"),
    re.compile(r"^git push --force.*(main|master)"),
    re.compile(r"^git reset --hard HEAD~"),
    re.compile(r"^sudo rm"),
    re.compile(r"^truncate -s 0"),
    re.compile(r"^> /etc/"),
    re.compile(r"^mkfs"),
    re.compile(r"^dd if=/dev/zero"),
    re.compile(r"^git push -f.*(main|master)"),
    re.compile(r"rm --no-preserve-root"),
    re.compile(r"chmod -R 000"),
]

# ── Cleanup patterns (require user approval) ──
CLEANUP_PATTERNS = [
    re.compile(r"\.turbo/.*\.log"),
    re.compile(r"\.old_modules"),
    re.compile(r"\.sisyphus/.*\.log"),
    re.compile(r"node_modules/\.cache"),
    re.compile(r"\.turbo$"),
    re.compile(r"__pycache__"),
    re.compile(r"\.next/cache"),
    re.compile(r"dist/.*\.log"),
]

# ── Safe patterns (auto-approve) ──
SAFE_PATTERNS = [
    # Git read commands
    re.compile(r"^git( --no-pager)? status"),
    re.compile(r"^git( --no-pager)? diff"),
    re.compile(r"^git( --no-pager)? log"),
    re.compile(r"^git( --no-pager)? branch"),
    re.compile(r"^git( --no-pager)? fetch"),
    re.compile(r"^git( --no-pager)? show"),
    re.compile(r"^git( --no-pager)? stash"),
    re.compile(r"^git( --no-pager)? remote"),
    re.compile(r"^git( --no-pager)? reflog"),
    re.compile(r"^git( --no-pager)? rev-parse"),
    re.compile(r"^git( --no-pager)? blame"),
    re.compile(r"^git( --no-pager)? grep"),
    re.compile(r"^gh pr (view|list)"),
    re.compile(r"^gh run (view|list)"),
    re.compile(r"^gh issue (view|list)"),
    re.compile(r"^gh repo view"),
    re.compile(r"^gh pr status"),
    # Filesystem read
    re.compile(r"^ls"),
    re.compile(r"^cat "),
    re.compile(r"^head "),
    re.compile(r"^tail "),
    re.compile(r"^grep "),
    re.compile(r"^rg "),
    re.compile(r"^find "),
    re.compile(r"^which "),
    re.compile(r"^pwd"),
    re.compile(r"^echo "),
    re.compile(r"^tree "),
    re.compile(r"^stat "),
    re.compile(r"^wc -"),
    re.compile(r"^cut "),
    re.compile(r"^sort "),
    re.compile(r"^uniq "),
    re.compile(r"^column -t"),
    re.compile(r"^less "),
    re.compile(r"^more "),
    # Package manager development commands (Bun / npm / pnpm / yarn)
    re.compile(r"^(bun|npm|pnpm|yarn) (run )?(test|check|lint|build|dev|start|type-check|format)"),
    re.compile(r"^(bun|npm|pnpm|yarn) install"),
    re.compile(r"^bun test"),
    re.compile(r"^bun run"),
    re.compile(r"^bun -"),
    re.compile(r"^bun x "),
    re.compile(r"^bunx "),
    re.compile(r"^npx "),
    re.compile(r"^pnpm dlx "),
    re.compile(r"^yarn dlx "),
    re.compile(r"^tsgo"),
    re.compile(r"^tsc(\s|$)"),
    re.compile(r'^python(3)?( -X [^ ]+)? "?\.claude/'),
    re.compile(r'^python(3)?( -X [^ ]+)? "?scripts/'),
    re.compile(r'^py -3 "?\.claude/'),
    re.compile(r'^py -3 "?scripts/'),
    # Database / cloud CLIs (read-only introspection)
    re.compile(r"^(neonctl|supabase|fly|vercel|railway|wrangler) "),
    re.compile(r"^(psql|mysql|sqlite3) "),
    # Version checks
    re.compile(r"^(python3?|bun|node|deno|npm|pnpm|yarn|docker|git|tsgo|tsc) --version"),
    # File operations (safe)
    re.compile(r"^mkdir -p"),
    re.compile(r"^touch "),
    re.compile(r"^cp (-r )?"),
    re.compile(r"^mv "),
    re.compile(r"^chmod \+x"),
    re.compile(r"^chmod (755|644)"),
    re.compile(r"^chown "),
    re.compile(r"^rsync"),
    # Process / system read
    re.compile(r"^ps (aux|-ef)"),
    re.compile(r"^(top|htop|free|df|du|uptime|whoami|id) "),
    re.compile(r"^(free|df|du|uptime|whoami|id)$"),
    # Network read
    re.compile(r"^curl -"),
    re.compile(r"^wget -"),
    re.compile(r"^ping -"),
    re.compile(r"^(ssh -V|nc -zv|telnet)"),
    # Build / lint tools
    re.compile(r"^biome"),
    re.compile(r"^tsgo --"),
    re.compile(r"^vite --version"),
    # Test / coverage
    re.compile(r"^(bun test --coverage|vitest --coverage|playwright test)"),
]

# ── Semi-safe patterns (allow unless force-push/hard-reset) ──
SEMI_SAFE_PATTERNS = [
    re.compile(r"^git add"),
    re.compile(r"^git commit"),
    re.compile(r"^git checkout"),
    re.compile(r"^git switch"),
    re.compile(r"^git restore"),
    re.compile(r"^git clean"),
    re.compile(r"^git rebase"),
    re.compile(r"^git merge"),
    re.compile(r"^git pull"),
    re.compile(r"^git push"),
    re.compile(r"^gh pr (create|merge|approve)"),
    re.compile(r"^gh issue create"),
]

FORCE_PUSH_PATTERN = re.compile(
    r"(push --force|reset --hard|--hard:(main|master)|-f (main|master))"
)
DANGEROUS_BUN_PATTERN = re.compile(r"(rm -rf|cache clean|publish.*--force)")


def read_input() -> dict[str, object]:
    try:
        raw = sys.stdin.read()
        return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        return {}


def _allow() -> None:
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "allow",
                }
            }
        )
    )


def _deny(reason: str) -> None:
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": reason,
                }
            }
        )
    )


def _ask(reason: str | None = None) -> None:
    payload: dict[str, object] = {
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "ask",
        }
    }
    if reason:
        typing.cast(dict[str, object], payload["hookSpecificOutput"])[
            "permissionDecisionReason"
        ] = reason
    print(json.dumps(payload))


def main() -> None:
    data: dict[str, object] = read_input()
    command: str = normalize_command(
        str(
            data.get("command")
            or typing.cast(dict[str, object], data.get("tool_input", {})).get(
                "command", ""
            )
        )
    )

    if not command:
        _ask()
        return

    # 1. Safe deletions (check first — override later dangerous check)
    for pattern in SAFE_DELETE_PATTERNS:
        if pattern.search(str(command)):
            _allow()
            return

    # 2. Dangerous — always block
    for pattern in DANGEROUS_PATTERNS:
        if pattern.search(str(command)):
            _deny("BLOCKED: Dangerous command pattern detected")
            return

    # 3. Cleanup — ask
    for pattern in CLEANUP_PATTERNS:
        if pattern.search(str(command)):
            _ask("Cleanup operation - requires user approval")
            return

    # 4. Safe — auto-approve
    for pattern in SAFE_PATTERNS:
        if pattern.search(str(command)):
            _allow()
            return

    # 5. Semi-safe — allow unless force operations
    for pattern in SEMI_SAFE_PATTERNS:
        if pattern.search(str(command)):
            if FORCE_PUSH_PATTERN.search(command):
                _deny("BLOCKED: Force push or hard reset detected")
                return
            _allow()
            return

    # 6. Default: allow package-manager commands (block dangerous subcommands)
    if re.match(r"^(bun|bunx|npm|npx|pnpm|yarn) ", command):
        if DANGEROUS_BUN_PATTERN.search(command):
            _deny("BLOCKED: Dangerous package manager command")
            return
        _allow()
        return

    # 7. Unknown: require user approval. Never fall through to allow — unknown
    # commands may be new destructive tools, typos, or untrusted invocations.
    _ask()


if __name__ == "__main__":
    main()
    sys.exit(0)
