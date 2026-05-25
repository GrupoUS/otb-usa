#!/bin/bash
# Debug Skill - OTB USA validation runner
# Runs the canonical Astro static-site gate for this project.

set -e

echo "🔍 Running lint..."
bun run lint

echo ""
echo "🔎 Running Astro check..."
bunx astro check

echo ""
echo "🏗️ Running production build..."
bun run build

echo ""
echo "✅ OTB USA validation gate passed!"
