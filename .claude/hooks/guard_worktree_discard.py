#!/usr/bin/env python3
"""guard_worktree_discard.py - deny the git commands that destroy uncommitted work.

Trigger: PreToolUse (Bash)

`git checkout -- <path>`, `git restore <path>`, `git checkout -f` and friends overwrite the working
tree from the index or HEAD. There is no reflog entry for what they erase and no git command that
brings it back: work that was never committed is simply gone. That is the exact criterion the
graph-powers destructive floor states it enforces ("what git cannot undo"), and
`smart_bash_approver.py` misses all of them — its list carries `clean -f`, `reset --hard`,
`stash drop`, `reflog expire`, `gc --prune=now` and `filter-branch`, then returns an explicit
`allow` for these.

That explicit `allow` is why this file exists rather than a `permissions.ask` rule: a PreToolUse
hook that allows bypasses the permission system entirely, so no settings rule can cover the gap.
A second hook returning `deny` still holds, because any deny wins over any allow.

WHY THE PARSE, AND NOT A REGEX
The first version of this hook matched the *shape* of a command — a literal ` -- `, or a bare `.`.
An audit found seven ways past it in one pass, all of them ordinary spellings:
    git checkout src/lib/leads.ts      (pathspec without `--`)
    git -C . checkout -- .             (a two-character global option)
    git -c core.hooksPath=/dev/null checkout -- .
    git checkout -f dev-test           (`-f` throws away local modifications)
    git switch --discard-changes x
    git checkout-index -a -f
    git read-tree -u --reset HEAD
So it now tokenises the command, strips git's global options, and decides on the SUBCOMMAND and
its operands. Matching shapes is guessing; matching the subcommand is reading.

Only denies when the working tree actually has something to lose. On a clean tree these commands
are no-ops and prompting for them would be the kind of empty prompt that teaches people to approve
without reading.

Opt-in, in the turn the user approved it:  OTBUSA_ALLOW_DISCARD=1 git checkout -- <path>

Fails open, like every hook here: any error resolves to allow rather than taking the session down.
"""
import json
import shlex
import subprocess
import sys
from pathlib import Path

try:
    sys.stdin.reconfigure(encoding="utf-8", errors="replace")  # type: ignore[union-attr]
except Exception:
    pass

OPT_IN = "OTBUSA_ALLOW_DISCARD"

# git's own global options, which sit BEFORE the subcommand. The two-argument forms have to be
# known by name: `-C .` is what let `git -C . checkout -- .` through the previous version.
GLOBAL_WITH_VALUE = {"-C", "-c", "--git-dir", "--work-tree", "--namespace", "--exec-path",
                     "--super-prefix", "--config-env"}
GLOBAL_FLAGS = {"-p", "--paginate", "-P", "--no-pager", "--bare", "--no-replace-objects",
                "--literal-pathspecs", "--glob-pathspecs", "--noglob-pathspecs",
                "--icase-pathspecs", "--no-optional-locks", "--html-path", "--man-path",
                "--info-path", "--version", "-v"}

# Throw away local modifications, whatever else is on the line.
FORCE_FLAGS = {"-f", "--force", "--discard-changes"}

# Splitting on these keeps `cd sub && git checkout -- .` and `x; git restore .` in scope.
SEPARATORS = {"&&", "||", ";", "|", "&"}


def deny(reason: str) -> None:
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))


def segments(tokens: list[str]) -> list[list[str]]:
    out: list[list[str]] = [[]]
    for t in tokens:
        if t in SEPARATORS:
            out.append([])
        else:
            out[-1].append(t)
    return [s for s in out if s]


def parse_git(seg: list[str]) -> tuple[str, list[str]] | None:
    """(subcommand, args) for a git invocation, or None when the segment is not one."""
    i = 0
    while i < len(seg) and seg[i] != "git":
        # env assignments and a leading `command`/`sudo` still lead to git
        if "=" in seg[i] or seg[i] in {"command", "sudo", "env", "nice", "time"}:
            i += 1
            continue
        return None
    if i >= len(seg):
        return None
    i += 1
    while i < len(seg):
        tok = seg[i]
        if tok in GLOBAL_WITH_VALUE:
            i += 2
            continue
        if any(tok.startswith(g + "=") for g in GLOBAL_WITH_VALUE) or tok in GLOBAL_FLAGS:
            i += 1
            continue
        break
    if i >= len(seg):
        return None
    return seg[i], seg[i + 1:]


def destroys_worktree(sub: str, args: list[str]) -> str | None:
    """The reason this invocation destroys uncommitted work, or None."""
    flags = [a for a in args if a.startswith("-") and a != "--"]
    operands_after_ddash = args[args.index("--") + 1:] if "--" in args else []
    operands = [a for a in args if not a.startswith("-") and a != "--"]

    if sub in {"checkout", "switch", "restore"} and any(f in FORCE_FLAGS for f in flags):
        return "%s carries a force flag, which throws away local modifications" % sub

    # A `--` pathspec is decisive and is checked BEFORE the branch-flag exemption below:
    # `git checkout -b nova -- src/` still writes src/ from the index.
    if sub == "checkout" and "--" in args:
        return "checkout with a pathspec after `--` overwrites those files from the index"

    if sub in {"checkout", "switch"}:
        # `-b feature/x` names a BRANCH, not a path — and branch names carry slashes, which is
        # what made the first cut of the path heuristic reject `git checkout -b feature/x`.
        # Past this point the operands are refs by definition; `--` and the force flags, the
        # only two ways a branch operation still destroys something, were both handled above.
        if {"-b", "-B", "-c", "-C", "--orphan", "--detach", "--track", "-t"} & set(flags):
            return None

    if sub == "checkout":
        # `git checkout <branch>` only moves HEAD. `git checkout <ref> <path>` and
        # `git checkout <path>` overwrite the file. Treat any operand that names something on
        # disk — or that looks like a path — as a pathspec.
        for op in operands:
            if op == "." or "/" in op or Path(op).exists():
                return "checkout with the pathspec %r overwrites it from the index" % op

    if sub == "restore":
        # `--staged` alone only rewrites the index; add `--worktree`/`-W` and the file goes.
        staged = "--staged" in flags or "-S" in flags
        worktree = "--worktree" in flags or "-W" in flags
        if not staged or worktree:
            return "restore writes the working tree copy from the index or a source commit"

    if sub == "checkout-index" and ({"-f", "-a", "--force", "--all"} & set(flags)):
        return "checkout-index -f/-a rewrites working tree files from the index"

    if sub == "read-tree" and ("-u" in flags or "--reset" in flags):
        return "read-tree -u updates the working tree to match the tree it reads"

    if operands_after_ddash and sub in {"checkout", "restore"}:
        return "%s with a pathspec overwrites those files" % sub

    return None


def dirty() -> bool:
    """True when the working tree carries changes these commands would destroy."""
    try:
        out = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True, encoding="utf-8", errors="replace", timeout=5, check=False,
        )
    except Exception:
        return True  # cannot tell -> assume there is something to lose
    return any(line[:2].strip() for line in (out.stdout or "").splitlines())


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except Exception:
        return
    command = str((data.get("tool_input") or {}).get("command", ""))
    if not command or OPT_IN in command:
        return
    try:
        tokens = shlex.split(command, comments=False, posix=True)
    except ValueError:
        return  # unbalanced quotes: not ours to judge

    reason = None
    for seg in segments(tokens):
        parsed = parse_git(seg)
        if not parsed:
            continue
        reason = destroys_worktree(parsed[0], parsed[1])
        if reason:
            break
    if not reason or not dirty():
        return

    deny(
        "Blocked: %s — and git cannot bring it back, because there is no reflog entry for a "
        "change that was never committed.\n\n"
        "The working tree is dirty right now. If losing those changes is what the user asked for "
        "IN THIS TURN, repeat the command with the opt-in:\n"
        "    %s=1 <command>\n"
        "  The key is matched as TEXT, so `$env:KEY=1; <cmd>` (PowerShell) and "
        "`set KEY=1 && <cmd>` (cmd) release it too.\n\n"
        "To keep the changes instead: `git stash push -m '<why>'` is reversible; this is not."
        % (reason, OPT_IN)
    )


if __name__ == "__main__":
    main()
    sys.exit(0)
