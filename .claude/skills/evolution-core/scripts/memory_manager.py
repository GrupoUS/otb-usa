#!/usr/bin/env python3
"""
Memory Manager - Simplified Persistent Storage

Minimal SQLite storage for sessions, observations, learnings, and errors.
No FTS5, no external dependencies.

Usage:
    python3 memory_manager.py init
    python3 memory_manager.py session start -t "task"
    python3 memory_manager.py session end -s "summary"
    python3 memory_manager.py capture "what happened"
    python3 memory_manager.py load_context --project PATH
    python3 memory_manager.py capture-error  # reads JSON from stdin
    python3 memory_manager.py stats
"""

import argparse
import json
import os
import sqlite3
from datetime import datetime
from pathlib import Path
from uuid import uuid4


def get_project_root() -> Path:
    """Detect project root via .git directory."""
    env_root = os.getenv("EVOLUTION_PROJECT_ROOT")
    if env_root:
        return Path(env_root)

    current = Path.cwd()
    for parent in [current, *current.parents]:
        if (parent / ".git").exists():
            return parent
        if parent == parent.parent:
            break
    return Path.cwd()


def get_db_path() -> Path:
    """Get database path for current project."""
    return get_project_root() / ".claude" / "docs" / "evolution" / "memory.db"


def get_conn() -> sqlite3.Connection:
    """Get database connection."""
    path = get_db_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize minimal database schema."""
    conn = get_conn()
    c = conn.cursor()

    # Sessions
    c.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            project_path TEXT NOT NULL,
            start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            end_time TIMESTAMP,
            summary TEXT,
            success_score REAL DEFAULT 0.0,
            task_description TEXT
        )
    """)

    # Observations
    c.execute("""
        CREATE TABLE IF NOT EXISTS observations (
            observation_id TEXT PRIMARY KEY,
            session_id TEXT REFERENCES sessions(session_id),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            tool_name TEXT,
            input_data TEXT,
            output_data TEXT,
            success BOOLEAN DEFAULT TRUE
        )
    """)

    # Learnings
    c.execute("""
        CREATE TABLE IF NOT EXISTS learnings (
            learning_id TEXT PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            pattern_type TEXT,
            description TEXT,
            frequency INTEGER DEFAULT 1,
            confidence_score REAL DEFAULT 0.5
        )
    """)

    # Code errors (for self-learning)
    c.execute("""
        CREATE TABLE IF NOT EXISTS code_errors (
            error_id TEXT PRIMARY KEY,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            error_type TEXT,
            error_message TEXT,
            file_path TEXT,
            tool_that_failed TEXT,
            fix_applied BOOLEAN DEFAULT FALSE,
            fix_description TEXT
        )
    """)

    # Indexes
    c.execute("CREATE INDEX IF NOT EXISTS idx_sessions_project ON sessions(project_path)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_observations_session ON observations(session_id)")
    c.execute("CREATE INDEX IF NOT EXISTS idx_errors_type ON code_errors(error_type)")

    conn.commit()
    conn.close()
    print(f"✓ Database initialized at {get_db_path()}")


def create_session(project_path: str, task: str = "") -> str:
    """Create new session, return ID."""
    session_id = str(uuid4())
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        "INSERT INTO sessions (session_id, project_path, task_description) VALUES (?, ?, ?)",
        (session_id, project_path, task)
    )
    conn.commit()
    conn.close()
    return session_id


def end_session(session_id: str, summary: str, score: float = 0.8):
    """Finalize session."""
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        """UPDATE sessions SET end_time = CURRENT_TIMESTAMP, summary = ?, success_score = ?
           WHERE session_id = ?""",
        (summary, score, session_id)
    )
    conn.commit()
    conn.close()
    print(f"✓ Session ended: {session_id[:8]}...")


def capture_observation(description: str, tool: str = "agent_action"):
    """Quick capture observation to current session."""
    session_file = get_project_root() / ".claude" / "docs" / "evolution" / ".current_session"

    if not get_db_path().exists():
        init_db()

    conn = get_conn()
    c = conn.cursor()

    # Get or create session
    if session_file.exists():
        session_id = session_file.read_text().strip()
    else:
        session_id = create_session(str(get_project_root()), "Auto-session")
        session_file.write_text(session_id)

    # Store observation
    obs_id = str(uuid4())
    c.execute(
        """INSERT INTO observations (observation_id, session_id, tool_name, input_data, output_data)
           VALUES (?, ?, ?, ?, 'captured')""",
        (obs_id, session_id, tool, description[:500])
    )
    conn.commit()
    conn.close()
    print(f"✓ Captured: {description[:50]}...")


def load_context(project_path: str, task: str = "", limit: int = 5) -> dict:
    """Load historical context for project."""
    conn = get_conn()
    c = conn.cursor()

    result = {"sessions": [], "learnings": [], "recent_errors": []}

    # Recent sessions
    c.execute(
        """SELECT session_id, task_description, summary, start_time, success_score
           FROM sessions WHERE project_path = ? ORDER BY start_time DESC LIMIT ?""",
        (project_path, limit)
    )
    result["sessions"] = [dict(r) for r in c.fetchall()]

    # High-confidence learnings
    c.execute(
        """SELECT pattern_type, description, confidence_score
           FROM learnings WHERE confidence_score >= 0.7 ORDER BY frequency DESC LIMIT ?""",
        (limit,)
    )
    result["learnings"] = [dict(r) for r in c.fetchall()]

    # Recent errors (for pattern awareness)
    c.execute(
        """SELECT error_type, error_message, fix_description FROM code_errors
           WHERE created_at > datetime('now', '-7 days') LIMIT 5"""
    )
    result["recent_errors"] = [dict(r) for r in c.fetchall()]

    conn.close()
    return result


def capture_error(input_json: str) -> dict:
    """Parse tool failure JSON and store error."""
    try:
        data = json.loads(input_json)
    except json.JSONDecodeError:
        return {"status": "error", "message": "Invalid JSON"}

    tool = data.get("tool_name", "unknown")
    error_msg = data.get("error", "Unknown error")[:200]

    # Determine error type
    error_lower = error_msg.lower()
    if "typescript" in error_lower:
        error_type = "typescript"
    elif "test" in error_lower:
        error_type = "test"
    elif "lint" in error_lower or "biome" in error_lower:
        error_type = "lint"
    elif "not found" in error_lower:
        error_type = "not_found"
    else:
        error_type = "runtime"

    file_path = ""
    if tool in ["Edit", "Write"] and isinstance(data.get("tool_input"), dict):
        file_path = data["tool_input"].get("file_path", "")[:100]

    conn = get_conn()
    c = conn.cursor()

    # Prune old errors if > 500
    c.execute("SELECT COUNT(*) FROM code_errors")
    if c.fetchone()[0] >= 500:
        c.execute("DELETE FROM code_errors WHERE error_id IN (SELECT error_id FROM code_errors ORDER BY created_at ASC LIMIT 50)")

    error_id = str(uuid4())
    c.execute(
        "INSERT INTO code_errors (error_id, error_type, error_message, file_path, tool_that_failed) VALUES (?, ?, ?, ?, ?)",
        (error_id, error_type, error_msg, file_path, tool)
    )
    conn.commit()
    conn.close()

    return {"status": "captured", "error_id": error_id, "error_type": error_type}


def get_stats() -> dict:
    """Get database statistics."""
    if not get_db_path().exists():
        return {}

    try:
        conn = get_conn()
        c = conn.cursor()

        stats = {}
        for table in ["sessions", "observations", "learnings", "code_errors"]:
            try:
                c.execute(f"SELECT COUNT(*) FROM {table}")
                stats[table] = c.fetchone()[0]
            except sqlite3.OperationalError:
                stats[table] = 0

        try:
            c.execute("SELECT AVG(success_score) FROM sessions WHERE success_score > 0")
            row = c.fetchone()
            stats["avg_success"] = round(row[0], 2) if row[0] else 0
        except sqlite3.OperationalError:
            stats["avg_success"] = 0

        conn.close()
        return stats
    except Exception:
        return {}


def main():
    parser = argparse.ArgumentParser(description="Memory Manager")
    sub = parser.add_subparsers(dest="cmd")

    sub.add_parser("init")

    # Session
    sess = sub.add_parser("session")
    sess_act = sess.add_subparsers(dest="action")
    start = sess_act.add_parser("start")
    start.add_argument("-t", "--task", required=True)
    end = sess_act.add_parser("end")
    end.add_argument("-s", "--summary", required=True)
    end.add_argument("--score", type=float, default=0.8)

    # Capture
    cap = sub.add_parser("capture")
    cap.add_argument("description")
    cap.add_argument("-t", "--tool", default="agent_action")

    # Load context
    load = sub.add_parser("load_context")
    load.add_argument("--project", required=True)
    load.add_argument("--task", default="")
    load.add_argument("--limit", type=int, default=5)

    # Capture error
    sub.add_parser("capture-error")

    # Stats
    sub.add_parser("stats")

    args = parser.parse_args()
    session_file = get_project_root() / ".claude" / "docs" / "evolution" / ".current_session"

    if args.cmd == "init":
        init_db()

    elif args.cmd == "session":
        if args.action == "start":
            if not get_db_path().exists():
                init_db()
            sid = create_session(str(get_project_root()), args.task)
            session_file.write_text(sid)
            print(f"✓ Session started: {sid}")

        elif args.action == "end":
            if session_file.exists():
                sid = session_file.read_text().strip()
                end_session(sid, args.summary, args.score)
                session_file.unlink()
            else:
                print("⚠ No active session")

    elif args.cmd == "capture":
        capture_observation(args.description, args.tool)

    elif args.cmd == "load_context":
        ctx = load_context(args.project, args.task, args.limit)
        print(json.dumps(ctx, indent=2, default=str))

    elif args.cmd == "capture-error":
        import sys
        result = capture_error(sys.stdin.read())
        print(json.dumps(result))

    elif args.cmd == "stats":
        stats = get_stats()
        print(json.dumps(stats, indent=2))

    else:
        parser.print_help()


if __name__ == "__main__":
    main()
