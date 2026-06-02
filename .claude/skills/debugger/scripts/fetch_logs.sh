#!/bin/bash
# Debug Skill - Build log helper for GPUS Astro landing

set -e

echo "GPUS Astro landing build status"
echo "───────────────────────────────"

if command -v bun >/dev/null 2>&1; then
  bun run build
else
  echo "Bun is not installed or not on PATH"
  exit 1
fi
