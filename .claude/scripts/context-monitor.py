#!/usr/bin/env python3
"""
Claude Code Status Line - Visual & Optimized Version
Uses pre-calculated context data from Claude Code stdin (no transcript parsing)

Performance notes:
- ANSI colors: zero overhead (just text codes: \033[31m)
- Unicode icons: minimal overhead (single characters: U+25CF = 3 bytes)
- Heavy operations: subprocess, file I/O, JSON parsing (avoided here)
"""

import json
import sys
import os

# Configure UTF-8 output for Windows
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# ANSI color codes (16-color standard - works everywhere)
C = {
    'r': '\033[0m',   # reset
    '1': '\033[31m',  # red
    '2': '\033[32m',  # green
    '3': '\033[33m',  # yellow
    '4': '\033[34m',  # blue
    '5': '\033[35m',  # magenta
    '6': '\033[36m',  # cyan
    '7': '\033[37m',  # white
    '8': '\033[90m',  # gray
    '9': '\033[91m',  # bright red
    'B': '\033[1m',   # bold
}

# Unicode icons (lightweight geometric shapes - no emoji rendering overhead)
I = {
    'model':   '◆',   # diamond - model
    'dir':     '▸',   # triangle - directory
    'branch':  '⎇',   # branch symbol
    'ctx':     '●',   # circle - context
    'warn':    '!',   # warning
    'vim':     '⌘',   # vim mode
}

def get_context_display(context_window):
    """Generate context display with colored icon based on usage level."""
    if not context_window:
        return f"{C['8']}?{C['r']}"

    used_pct = context_window.get('used_percentage')
    if used_pct is None:
        return f"{C['8']}?{C['r']}"

    # Color and warning based on usage level
    if used_pct >= 90:
        color, warn = C['1'], I['warn']  # red + warning
    elif used_pct >= 75:
        color, warn = C['3'], ''         # yellow
    elif used_pct >= 50:
        color, warn = C['3'], ''         # yellow
    else:
        color, warn = C['2'], ''         # green

    return f"{color}{I['ctx']} {warn}{used_pct:.0f}%{C['r']}"

def get_directory_display(workspace):
    """Get directory display with icon."""
    current_dir = workspace.get('current_dir', '') if workspace else ''
    project_dir = workspace.get('project_dir', '') if workspace else ''

    if current_dir and project_dir and current_dir.startswith(project_dir):
        rel = current_dir[len(project_dir):].lstrip('/')
        name = rel or os.path.basename(project_dir)
    else:
        name = os.path.basename(project_dir or current_dir or 'unknown')

    return f"{C['6']}{I['dir']} {name}{C['r']}"

def get_provider_from_env():
    """Detect provider from ANTHROPIC_BASE_URL environment variable."""
    base_url = os.environ.get('ANTHROPIC_BASE_URL', '')

    if 'api.z.ai' in base_url:
        return "GLM"
    if 'api.minimax.io' in base_url:
        return "MINIMAX"

    return None  # Not a custom provider

def get_model_short_name(display_name):
    """Shorten model name for compact display - provider only."""
    # First try to detect from environment variables
    provider = get_provider_from_env()
    if provider:
        return provider

    # Fallback: detect from display name
    if display_name:
        if 'glm' in display_name.lower():
            return "GLM"
        if 'minimax' in display_name.lower():
            return "MINIMAX"

    return "Claude"

def get_git_branch(workspace):
    """Get git branch by reading .git/HEAD directly (fast, no subprocess)."""
    project_dir = workspace.get('project_dir', '') if workspace else ''
    if not project_dir:
        return ''

    head_path = os.path.join(project_dir, '.git', 'HEAD')
    try:
        with open(head_path, 'r', encoding='utf-8') as f:
            content = f.read().strip()
        # Format: "ref: refs/heads/branch-name" or just commit hash (detached)
        if content.startswith('ref: refs/heads/'):
            return content[16:]  # Extract branch name
        elif len(content) == 40:  # Detached HEAD (commit hash)
            return content[:7]
    except (FileNotFoundError, PermissionError, OSError):
        pass
    return ''

def get_branch_display(branch):
    """Get colored branch display with icon."""
    if not branch:
        return ''
    # Color based on branch type
    if branch in ('main', 'master'):
        color = C['4']  # blue - stable
    elif branch in ('dev', 'develop'):
        color = C['2']  # green - development
    elif branch.startswith('feature/'):
        color = C['3']  # yellow - feature
        branch = branch[8:]  # Remove prefix
    else:
        color = C['8']  # gray - other
    return f" {C['8']}{I['branch']}{C['r']} {color}{branch}{C['r']}"

def get_model_display(display_name, used_pct):
    """Get model display with color based on context usage."""
    short = get_model_short_name(display_name)
    # Color based on context pressure
    if used_pct >= 90:
        color = C['1']  # red - critical
    elif used_pct >= 75:
        color = C['3']  # yellow - warning
    else:
        color = C['6']  # cyan - ok
    return f"{color}{I['model']} {short}{C['r']}"

def get_vim_display(mode):
    """Get vim mode display."""
    if not mode:
        return ''
    return f" {C['5']}{I['vim']} {mode}{C['r']}"

def main():
    try:
        data = json.load(sys.stdin)

        # Extract all needed data in one pass
        model = data.get('model', {})
        workspace = data.get('workspace', {})
        context_window = data.get('context_window', {})

        # Get context percentage for color decisions
        used_pct = context_window.get('used_percentage', 0) if context_window else 0

        # Build components
        model_display = get_model_display(model.get('display_name', ''), used_pct)
        dir_display = get_directory_display(workspace)
        branch_display = get_branch_display(get_git_branch(workspace))
        ctx_display = get_context_display(context_window)
        vim_display = get_vim_display(data.get('vim', {}).get('mode', ''))

        # Separator
        sep = f" {C['8']}|{C['r']} "

        # Final status line: ◆ model | ▸ dir ⎇ branch | ● ctx% ⌘ vim
        parts = [model_display, dir_display + branch_display, ctx_display]
        if vim_display:
            parts.append(vim_display)

        print(sep.join(parts))

    except Exception:
        # Minimal fallback
        print(f"{C['6']}{I['model']} Claude{C['r']}")

if __name__ == "__main__":
    main()