#!/usr/bin/env python3
"""fetch_logs.py - Debug Skill - Error Log Fetcher.
Aggregates logs from GitHub Actions, VPS containers, and Neon for error analysis.

Repo and VPS host are read from environment variables:
  - GITHUB_REPO              owner/repo (defaults to git remote origin)
  - PROJECT_VPS_HOST         SSH host for container inspection (optional)
"""
import json
import os
import subprocess
import sys
from pathlib import Path


def detect_repo() -> str:
    """Resolve owner/repo: $GITHUB_REPO > git remote origin > config.json::project.name."""
    if os.environ.get("GITHUB_REPO"):
        return os.environ["GITHUB_REPO"]
    try:
        r = subprocess.run(
            ["git", "remote", "get-url", "origin"],
            capture_output=True, text=True, timeout=3,
        )
        url = r.stdout.strip()
        if url.startswith("git@github.com:"):
            return url.split(":", 1)[1].rstrip(".git")
        if url.startswith("https://github.com/"):
            return url.removeprefix("https://github.com/").rstrip(".git")
    except Exception:
        pass
    return ""


REPO = detect_repo()
VPS_HOST = os.environ.get("PROJECT_VPS_HOST", "")


def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, capture_output=True, text=True, timeout=30, **kwargs)


def has_command(cmd: str) -> bool:
    return subprocess.run(["which", cmd], capture_output=True).returncode == 0


def fetch_gh_actions() -> None:
    print("🔄 GitHub Actions — Recent Runs:")
    print("─────────────────────────────────")
    if not has_command("gh"):
        print("⚠️  GitHub CLI not installed")
        print("   Install: brew install gh")
        print()
        return

    r = run([
        "gh", "run", "list", "--repo", REPO, "-L", "5",
        "--json", "status,conclusion,name,headBranch,createdAt",
        "--template",
        "{{range .}}{{.name}} | {{.headBranch}} | {{.conclusion}} | {{.createdAt}}\n{{end}}",
    ])
    print(r.stdout or "No runs available")
    print()

    # Last failed run
    r2 = run([
        "gh", "run", "list", "--repo", REPO, "-L", "1",
        "--status", "failure",
        "--json", "databaseId",
        "--template", "{{range .}}{{.databaseId}}{{end}}",
    ])
    failed_run = r2.stdout.strip()

    if failed_run:
        print(f"❌ Last Failed Run (ID: {failed_run}):")
        print("─────────────────────────────────")
        r3 = run(["gh", "run", "view", failed_run, "--repo", REPO, "--log-failed"])
        lines = r3.stdout.splitlines()
        print("\n".join(lines[-50:]))
        print()
    else:
        print("✅ No recent failed runs")
        print()


def fetch_vps_status() -> None:
    print("🖥️  VPS Container Status:")
    print("─────────────────────────")

    if not VPS_HOST:
        print("⚠️  VPS host not configured")
        print("   Set PROJECT_VPS_HOST to enable SSH log collection")
        print()
        return

    r = subprocess.run(
        ["ssh", "-o", "ConnectTimeout=5", "-o", "BatchMode=yes",
         f"root@{VPS_HOST}",
         "docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'"],
        capture_output=True, text=True, timeout=15,
    )
    if r.returncode == 0:
        print(r.stdout)
    else:
        print("⚠️  Cannot connect to VPS (SSH key, host, or network issue)")
        print(f"   Try: ssh root@{VPS_HOST}")
    print()


def fetch_neon_status() -> None:
    print("🐘 Neon Database Status:")
    print("────────────────────────")
    if not has_command("neonctl"):
        print("⚠️  Neon CLI not installed")
        print("   Install: brew install neonctl")
        print()
        return

    r = run(["neonctl", "projects", "list"])
    print(r.stdout or "No Neon projects available")
    print()
    print("💡 For slow queries, run: psql $(neonctl connection-string) -c "
          '"SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC LIMIT 10;"')


def main() -> None:
    print("📋 Fetching error logs...")
    print()
    fetch_gh_actions()
    fetch_vps_status()
    fetch_neon_status()
    print("✅ Log fetch complete!")


if __name__ == "__main__":
    main()
