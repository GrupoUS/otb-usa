#!/bin/bash
# Debug Skill - Backend Test Runner
# Run biome + vitest for full backend validation

set -e  # Exit on error

echo "🔍 Running lint & type check..."
bun run check

echo ""
echo "🧪 Running tests..."
bun test "$@"

echo ""
echo "✅ All checks passed!"
