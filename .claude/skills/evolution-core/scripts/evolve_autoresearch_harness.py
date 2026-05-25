#!/usr/bin/env python3
"""
Bootstrap a local EVOLVE_AUTORESEARCH run from <evolve_request>.

Creates the frozen harness artifacts that correspond to Karpathy's
prepare.py-style surface: request snapshot, criteria list, test-case pool,
candidate scaffolds, and grading templates.
"""

from __future__ import annotations

import argparse
import json
import math
import re
import sys
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path


def _slugify(value: str) -> str:
    slug = value.strip().lower()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = re.sub(r"-{2,}", "-", slug).strip("-")
    return slug or "skill"


def _local_tag(tag: str) -> str:
    if "}" in tag:
        tag = tag.split("}", 1)[1]
    return tag.replace("-", "_").lower()


def _find_child(parent: ET.Element, name: str) -> ET.Element | None:
    want = name.replace("-", "_").lower()
    for child in parent:
        if _local_tag(child.tag) == want:
            return child
    return None


def _text(el: ET.Element | None) -> str:
    if el is None:
        return ""
    return "".join(el.itertext()).strip()


def _extract_request_blob(raw: str) -> str:
    match = re.search(
        r"<evolve_request\b[^>]*>.*?</evolve_request>",
        raw,
        flags=re.DOTALL | re.IGNORECASE,
    )
    if match:
        return match.group(0)
    return raw.strip()


def _require_text(parent: ET.Element, name: str) -> str:
    value = _text(_find_child(parent, name))
    if not value:
        raise ValueError(f"Missing required field: {name}")
    return value


def _parse_int(parent: ET.Element, name: str) -> int:
    raw = _require_text(parent, name)
    try:
        value = int(raw)
    except ValueError as exc:
        raise ValueError(f"{name} must be an integer, got: {raw!r}") from exc
    if value <= 0:
        raise ValueError(f"{name} must be > 0, got: {value}")
    return value


def _parse_bool(parent: ET.Element | None, name: str, default: bool) -> bool:
    if parent is None:
        return default
    raw = _text(_find_child(parent, name))
    if not raw:
        return default
    return raw.strip().lower() in {"1", "true", "yes", "y", "on"}


def _split_constraints(raw: str) -> list[str]:
    lines = []
    for line in raw.splitlines():
        cleaned = line.strip()
        cleaned = re.sub(r"^\s*(?:[-*]|\d+[.)])\s*", "", cleaned)
        if cleaned:
            lines.append(cleaned)
    if lines:
        return lines
    parts = [part.strip() for part in raw.split(";")]
    return [part for part in parts if part]


def _load_request(path: str) -> tuple[str, dict[str, object]]:
    if path == "-":
        raw = sys.stdin.read()
    else:
        raw = Path(path).read_text(encoding="utf-8")
    blob = _extract_request_blob(raw)
    root = ET.fromstring(blob)
    if _local_tag(root.tag) != "evolve_request":
        raise ValueError("Root element must be <evolve_request>.")

    resources = _find_child(root, "resources")
    logging_preferences = _find_child(root, "logging_preferences")
    if resources is None:
        raise ValueError("Missing required field: resources")

    target_skill_name = _require_text(root, "target_skill_name")
    target_skill_prompt = _require_text(root, "target_skill_prompt")
    task_domain = _require_text(root, "task_domain")
    eval_constraints = _require_text(root, "eval_constraints")
    max_iterations = _parse_int(resources, "max_iterations")
    samples_per_iteration = _parse_int(resources, "samples_per_iteration")
    max_cost_raw = _text(_find_child(resources, "max_cost_per_iteration"))

    constraints = _split_constraints(eval_constraints)
    if len(constraints) < 3:
        raise ValueError("Need at least 3 binary-ish constraints to bootstrap a stable harness.")

    request = {
        "target_skill_name": target_skill_name,
        "target_skill_prompt": target_skill_prompt,
        "task_domain": task_domain,
        "eval_constraints_raw": eval_constraints,
        "constraints": constraints,
        "resources": {
            "max_iterations": max_iterations,
            "samples_per_iteration": samples_per_iteration,
            "max_cost_per_iteration": max_cost_raw or None,
        },
        "logging_preferences": {
            "keep_all_candidates": _parse_bool(logging_preferences, "keep_all_candidates", True),
            "store_rationale": _parse_bool(logging_preferences, "store_rationale", True),
        },
    }
    return blob, request


def _test_case_distribution(sample_count: int) -> dict[str, int]:
    representative = max(1, math.ceil(sample_count * 0.6))
    boundary = max(1, math.ceil(sample_count * 0.2))
    adversarial = sample_count - representative - boundary
    if adversarial < 1:
        adversarial = 1
        if representative >= boundary and representative > 1:
            representative -= 1
        elif boundary > 1:
            boundary -= 1
    return {
        "representative": representative,
        "boundary": boundary,
        "adversarial": adversarial,
    }


def _candidate_count(sample_count: int) -> int:
    if sample_count <= 4:
        return 2
    if sample_count <= 8:
        return 3
    return 4


def _criteria(constraints: list[str]) -> list[dict[str, str]]:
    return [{"id": f"C{i}", "text": text} for i, text in enumerate(constraints, start=1)]


def _write_json(path: Path, data: object) -> None:
    path.write_text(json.dumps(data, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")


def _write_jsonl(path: Path, rows: list[dict[str, object]]) -> None:
    payload = "".join(json.dumps(row, ensure_ascii=True) + "\n" for row in rows)
    path.write_text(payload, encoding="utf-8")


def _build_test_cases(criteria_ids: list[str], sample_count: int) -> list[dict[str, object]]:
    distribution = _test_case_distribution(sample_count)
    buckets: list[str] = (
        ["representative"] * distribution["representative"]
        + ["boundary"] * distribution["boundary"]
        + ["adversarial"] * distribution["adversarial"]
    )
    rows: list[dict[str, object]] = []
    for index, bucket in enumerate(buckets[:sample_count], start=1):
        rows.append(
            {
                "sample_id": f"s{index:02d}",
                "bucket": bucket,
                "input": "",
                "expected_focus": "",
                "why_this_case_exists": "",
                "criteria_ids": criteria_ids,
            }
        )
    return rows


def _build_grade_template(criteria_ids: list[str], sample_count: int) -> dict[str, object]:
    samples = []
    for index in range(1, sample_count + 1):
        samples.append(
            {
                "sample_id": f"s{index:02d}",
                "criteria": {criterion_id: 0 for criterion_id in criteria_ids},
                "notes": "",
            }
        )
    return {
        "iteration": 0,
        "candidate_id": "baseline",
        "status": "scored",
        "hypothesis": "",
        "changes_summary": "",
        "prompt_path": "candidates/baseline.prompt.txt",
        "samples": samples,
    }


def _guidance(run_dir: Path, harness: dict[str, object]) -> str:
    criteria = harness["criteria"]
    criteria_lines = "\n".join(f"- `{item['id']}`: {item['text']}" for item in criteria)  # type: ignore[index]
    return f"""# EVOLVE_AUTORESEARCH run

Run dir: `{run_dir}`

## Frozen harness

- `harness.json`: source of truth for criteria, scoring, sample budget, and plateau threshold
- `test_cases.jsonl`: fixed golden set for this run
- `candidates/`: baseline prompt + deterministic candidate scaffolds
- `grades/grade-template.json`: template for scoring one candidate

## Criteria

{criteria_lines}

## Suggested flow

1. Fill `test_cases.jsonl` with the fixed sample pool before grading any candidate.
2. Keep `candidates/baseline.prompt.txt` unchanged for iteration `0`.
3. Generate candidate prompt files.
4. Copy `grades/grade-template.json` per candidate and fill binary results.
5. Score each candidate with `evolve_autoresearch_score.py`.
6. Build `evolve-response.xml` with `evolve_autoresearch_report.py`.
"""


def cmd_init_run(args: argparse.Namespace) -> int:
    xml_blob, request = _load_request(args.file)

    target_skill_name = str(request["target_skill_name"])
    skill_slug = args.skill_slug or _slugify(target_skill_name)
    run_id = args.run_id or datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    run_dir = Path(args.evals_root).resolve() / skill_slug / "runs" / run_id

    if run_dir.exists() and any(run_dir.iterdir()) and not args.force:
        print(f"Refusing to overwrite non-empty run dir: {run_dir}", file=sys.stderr)
        return 1

    run_dir.mkdir(parents=True, exist_ok=True)
    (run_dir / "candidates").mkdir(exist_ok=True)
    (run_dir / "grades").mkdir(exist_ok=True)

    resources = request["resources"]  # type: ignore[assignment]
    max_iterations = int(resources["max_iterations"])  # type: ignore[index]
    samples_per_iteration = int(resources["samples_per_iteration"])  # type: ignore[index]
    criteria = _criteria(request["constraints"])  # type: ignore[arg-type]
    criteria_ids = [item["id"] for item in criteria]
    candidates_per_iteration = _candidate_count(samples_per_iteration)

    harness = {
        "created_utc": datetime.now(timezone.utc).isoformat(),
        "run_id": run_id,
        "skill_slug": skill_slug,
        "target_skill_name": target_skill_name,
        "task_domain": request["task_domain"],
        "criteria": criteria,
        "scoring_formula": f"total_score = sum over {samples_per_iteration} samples of {len(criteria)} binary criteria passes",
        "resources": resources,
        "plateau_threshold": min(3, max_iterations),
        "candidates_per_iteration": candidates_per_iteration,
        "minimum_distinct_test_cases": max(3, math.ceil(samples_per_iteration / candidates_per_iteration)),
        "test_case_distribution": _test_case_distribution(samples_per_iteration),
        "logging_preferences": request["logging_preferences"],
        "run_path_hint": str(run_dir),
    }

    (run_dir / "request.xml").write_text(xml_blob + "\n", encoding="utf-8")
    _write_json(run_dir / "request.json", request)
    _write_json(run_dir / "harness.json", harness)
    _write_jsonl(run_dir / "test_cases.jsonl", _build_test_cases(criteria_ids, samples_per_iteration))
    _write_json(run_dir / "grades" / "grade-template.json", _build_grade_template(criteria_ids, samples_per_iteration))

    (run_dir / "candidates" / "baseline.prompt.txt").write_text(
        str(request["target_skill_prompt"]).rstrip() + "\n",
        encoding="utf-8",
    )
    (run_dir / "knowledge_gaps.md").write_text("- \n", encoding="utf-8")
    (run_dir / "next_actions.md").write_text(f"- Run path: {run_dir}\n", encoding="utf-8")
    (run_dir / "RUNBOOK.md").write_text(_guidance(run_dir, harness), encoding="utf-8")

    print(run_dir)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Bootstrap an EVOLVE_AUTORESEARCH run from <evolve_request>."
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    init_run = sub.add_parser(
        "init-run",
        help="Create run artifacts: request snapshot, harness.json, test_cases.jsonl, and grading templates.",
    )
    init_run.add_argument(
        "--file",
        required=True,
        help="Path to a file containing <evolve_request>, or - for stdin.",
    )
    init_run.add_argument(
        "--evals-root",
        default="evals",
        help="Root evals directory in the repo (default: evals).",
    )
    init_run.add_argument(
        "--skill-slug",
        default="",
        help="Override target skill slug; defaults to a slugified target_skill_name.",
    )
    init_run.add_argument(
        "--run-id",
        default="",
        help="Override run folder name; defaults to the current UTC timestamp.",
    )
    init_run.add_argument(
        "--force",
        action="store_true",
        help="Allow writing into an existing run directory.",
    )
    init_run.set_defaults(func=cmd_init_run)

    args = parser.parse_args()
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
