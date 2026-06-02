#!/bin/bash
# Debug Skill - GPUS Astro landing validation runner
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
echo "✅ GPUS landing validation gate passed!"
