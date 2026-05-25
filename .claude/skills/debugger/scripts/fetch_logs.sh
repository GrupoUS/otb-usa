#!/bin/bash
# Debug Skill - Build & Deploy Log Fetcher
# Aggregates build output and deploy status for Na Mesa Certa

set -e

echo "Fetching build and deploy logs..."
echo ""

# ──────────────────────────────────────────────
# Astro Build Status
# ──────────────────────────────────────────────
echo "Astro Build Check:"
echo "─────────────────────────────────"
if command -v bun &> /dev/null; then
    bun run build 2>&1 | tail -20
    echo ""
else
    echo "Bun not installed. Install: curl -fsSL https://bun.sh/install | bash"
    echo ""
fi

# ──────────────────────────────────────────────
# Git Status — Recent changes
# ──────────────────────────────────────────────
echo "Recent Commits:"
echo "─────────────────────────────────"
git log --oneline -10 2>/dev/null || echo "Not a git repository"
echo ""

# ──────────────────────────────────────────────
# Railway Deploy Status (if configured)
# ──────────────────────────────────────────────
if command -v railway &> /dev/null; then
    echo "Railway Deploy Status:"
    echo "────────────────────────"
    railway status 2>/dev/null || echo "Railway CLI available but no project linked"
    echo ""
else
    echo "Railway CLI not installed (optional)"
    echo "   Install: bun add -g @railway/cli"
    echo ""
fi

echo "Log fetch complete!"
