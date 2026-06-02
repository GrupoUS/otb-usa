#!/usr/bin/env python3
"""Build log helper for GPUS Astro landing."""

from __future__ import annotations

import subprocess
import sys


def main() -> int:
    result = subprocess.run(["bun", "run", "build"], check=False)
    return result.returncode


if __name__ == "__main__":
    sys.exit(main())
