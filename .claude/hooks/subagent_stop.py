#!/usr/bin/env python3
"""subagent_stop.py - Consolidated SubagentStop handler.

Merges two former hooks (subagent_log.py + evaluator_escalation.py):
  1. Logs non-trivial subagent completions to .claude/logs/subagent-events.jsonl
     (skips quick lookups and built-in shells).
  2. Detects failure signals in transcripts of monitored agents, increments a
     counter, logs to .claude/logs/evaluator-escalation.jsonl, and emits an
     escalation message to stderr once the threshold is reached.

Reads the transcript at most once per invocation. Fails open on any I/O error.

Trigger: SubagentStop
"""
import json
import os
import re
import sys
import typing

from datetime import datetime, timezone
from pathlib import Path

# Built-in / lightweight agents whose completion is not worth logging.
SKIP_TYPES = {"Explore", "general-purpose", "Bash"}

# Agents monitored for repeated-failure signals (evaluator excluded to avoid
# self-escalation).
MONITORED_AGENTS = {
    "orchestrator",
    "debugger",
    "frontend-specialist",
    "performance-optimizer",
    "mobile-developer",
    "project-planner",
    "explorer-agent",
    "explorer",
    "librarian",
}

FAIL_PATTERN = re.compile(r"\b(fail|failed|error|exception|traceback|panic)\b", re.IGNORECASE)
ESCALATION_THRESHOLD = 2
MIN_TRANSCRIPT_LINES = 20


def read_input() -> dict[str, object]:
    try:
        raw = sys.stdin.read()
        return typing.cast(dict[str, object], json.loads(raw)) if raw.strip() else {}
    except Exception:
        return {}


def utcnow() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def get_log_dir() -> Path:
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR") or str(Path(__file__).parent.parent.parent)
    log_dir = Path(project_dir) / ".claude" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    return log_dir


def main() -> None:
    data: dict[str, object] = read_input()
    agent_type = str(data.get("agent_type", "unknown"))
    agent_id = str(data.get("agent_id", "unknown"))
    session_id = str(data.get("session_id", "unknown"))
    transcript_path = str(data.get("agent_transcript_path", ""))
    was_background = str(data.get("background", "unknown"))

    # Read transcript at most once.
    transcript_text = ""
    transcript_lines = 0
    if transcript_path:
        try:
            p = Path(transcript_path)
            if p.is_file():
                transcript_text = p.read_text(errors="replace")
                transcript_lines = transcript_text.count("\n")
        except Exception:
            transcript_text = ""
            transcript_lines = 0

    # ── 1. Activity log (skip lightweight agents and tiny transcripts) ──
    if agent_type not in SKIP_TYPES and transcript_lines >= MIN_TRANSCRIPT_LINES:
        try:
            entry = json.dumps({
                "timestamp": utcnow(),
                "session_id": session_id,
                "agent_id": agent_id,
                "agent_type": agent_type,
                "transcript_lines": transcript_lines,
                "background": was_background,
            })
            with (get_log_dir() / "subagent-events.jsonl").open("a") as f:
                _ = f.write(entry + "\n")
        except Exception:
            pass

    # ── 2. Failure escalation (only monitored agents with fail signals) ──
    if agent_type in MONITORED_AGENTS and transcript_text and FAIL_PATTERN.search(transcript_text):
        try:
            log_dir = get_log_dir()
            counter_file = log_dir / "evaluator-failure-count.txt"
            log_file = log_dir / "evaluator-escalation.jsonl"

            try:
                count = int(counter_file.read_text().strip())
            except Exception:
                count = 0
            count += 1
            counter_file.write_text(str(count))

            entry = json.dumps({"timestamp": utcnow(), "agent": agent_type, "count": count})
            with log_file.open("a") as f:
                _ = f.write(entry + "\n")

            if count >= ESCALATION_THRESHOLD:
                print(
                    f"EVALUATOR ESCALATION: repeated failure signals detected ({count}).",
                    file=sys.stderr,
                )
                print(
                    "Action: delegate analysis to evaluator (Mode 3: Architecture Analysis), "
                    "then resume implementation with evidence.",
                    file=sys.stderr,
                )
                counter_file.write_text("0")
        except Exception:
            pass

    sys.exit(0)


if __name__ == "__main__":
    main()
