#!/usr/bin/env python3
"""
Score one candidate against the frozen EVOLVE_AUTORESEARCH harness.

Consumes a JSON grade sheet, validates the fixed sample/criteria budget,
computes aggregate score, applies keep/discard/crash logic, and appends
the result to experiments.tsv.
"""

from __future__ import annotations

import argparse
import csv
import json
from datetime import datetime, timezone
from pathlib import Path


TSV_NAME = "experiments.tsv"
HEADER = [
    "iteration",
    "candidate_id",
    "score",
    "delta_vs_baseline",
    "decision",
    "hypothesis",
    "changes_summary",
]


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _read_tsv(path: Path) -> list[dict[str, str]]:
    if not path.exists():
        return []
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        return list(reader)


def _ensure_tsv(path: Path) -> None:
    if path.exists():
        return
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle, delimiter="\t", quoting=csv.QUOTE_MINIMAL)
        writer.writerow(HEADER)


def _write_row(path: Path, row: list[str]) -> None:
    with path.open("a", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle, delimiter="\t", quoting=csv.QUOTE_MINIMAL)
        writer.writerow(row)


def _criteria_ids(harness: dict) -> list[str]:
    return [item["id"] for item in harness["criteria"]]


def _baseline_score(rows: list[dict[str, str]]) -> float | None:
    for row in rows:
        if row["candidate_id"] == "baseline":
            return float(row["score"])
    return None


def _current_best_score(rows: list[dict[str, str]]) -> float | None:
    keep_scores = [float(row["score"]) for row in rows if row["decision"] == "keep"]
    return max(keep_scores) if keep_scores else None


def _append_applied(run_dir: Path, result: dict[str, object]) -> None:
    applied = run_dir / "applied.md"
    if not applied.exists():
        applied.write_text(
            "# Applied in this run\n\n| UTC (ISO) | candidate_id | score | delta_vs_baseline | summary |\n|-----------|--------------|-------|-------------------|---------|\n",
            encoding="utf-8",
        )
    line = (
        f"| {datetime.now(timezone.utc).date().isoformat()} | {result['candidate_id']} | "
        f"{result['score']} | {result['delta_vs_baseline']:+g} | {result['changes_summary']} |\n"
    )
    with applied.open("a", encoding="utf-8") as handle:
        handle.write(line)


def _validate_scored_samples(payload: dict, harness: dict) -> tuple[float, list[dict[str, object]]]:
    samples = payload.get("samples")
    if not isinstance(samples, list):
        raise ValueError("Grade file must contain a list under `samples`.")
    expected_sample_count = int(harness["resources"]["samples_per_iteration"])
    if len(samples) != expected_sample_count:
        raise ValueError(
            f"Expected exactly {expected_sample_count} graded samples, got {len(samples)}."
        )

    criterion_ids = _criteria_ids(harness)
    total = 0.0
    sample_breakdown: list[dict[str, object]] = []
    for sample in samples:
        if not isinstance(sample, dict):
            raise ValueError("Each sample entry must be an object.")
        sample_id = str(sample.get("sample_id", ""))
        grades = sample.get("criteria")
        if not isinstance(grades, dict):
            raise ValueError(f"Sample {sample_id or '<unknown>'} is missing `criteria`.")
        sample_score = 0
        for criterion_id in criterion_ids:
            if criterion_id not in grades:
                raise ValueError(f"Sample {sample_id or '<unknown>'} is missing criterion {criterion_id}.")
            raw = grades[criterion_id]
            if raw not in (0, 1, False, True):
                raise ValueError(
                    f"Criterion {criterion_id} in sample {sample_id or '<unknown>'} must be binary (0/1)."
                )
            sample_score += int(raw)
        total += float(sample_score)
        sample_breakdown.append(
            {
                "sample_id": sample_id,
                "sample_score": sample_score,
                "criteria": {key: int(value) for key, value in grades.items()},
                "notes": sample.get("notes", ""),
            }
        )
    return total, sample_breakdown


def cmd_score(args: argparse.Namespace) -> int:
    run_dir = Path(args.run_dir).resolve()
    harness = _read_json(run_dir / "harness.json")
    payload = _read_json(Path(args.grade_file).resolve())

    tsv = run_dir / TSV_NAME
    _ensure_tsv(tsv)
    existing_rows = _read_tsv(tsv)

    candidate_id = str(payload.get("candidate_id", "")).strip()
    if not candidate_id:
        raise ValueError("Grade file must include `candidate_id`.")
    iteration = int(payload.get("iteration", 0))
    status = str(payload.get("status", "scored")).strip().lower() or "scored"
    hypothesis = str(payload.get("hypothesis", "")).strip()
    changes_summary = str(payload.get("changes_summary", "")).strip()
    prompt_path = str(payload.get("prompt_path", "")).strip()

    if status == "crash":
        score = 0.0
        baseline = _baseline_score(existing_rows)
        delta = 0.0 - (baseline if baseline is not None else 0.0)
        decision = "crash"
        sample_breakdown: list[dict[str, object]] = []
    else:
        score, sample_breakdown = _validate_scored_samples(payload, harness)
        baseline = _baseline_score(existing_rows)
        if baseline is None:
            if candidate_id != "baseline":
                raise ValueError("The first scored candidate must be `baseline`.")
            decision = "keep"
            delta = 0.0
        else:
            delta = score - baseline
            best_so_far = _current_best_score(existing_rows)
            if best_so_far is None or score > best_so_far:
                decision = "keep"
            else:
                decision = "discard"

    row = [
        str(iteration),
        candidate_id,
        f"{score:g}",
        f"{delta:g}",
        decision,
        hypothesis,
        changes_summary,
    ]
    _write_row(tsv, row)

    result = {
        "iteration": iteration,
        "candidate_id": candidate_id,
        "score": score,
        "delta_vs_baseline": delta,
        "decision": decision,
        "hypothesis": hypothesis,
        "changes_summary": changes_summary,
        "status": status,
        "sample_breakdown": sample_breakdown,
    }

    results_dir = run_dir / "grades" / "results"
    results_dir.mkdir(parents=True, exist_ok=True)
    result_path = results_dir / f"{candidate_id}.result.json"
    result_path.write_text(json.dumps(result, indent=2, ensure_ascii=True) + "\n", encoding="utf-8")

    if decision == "keep" and candidate_id != "baseline":
        _append_applied(run_dir, result)

    if decision == "keep" and prompt_path:
        prompt_file = (run_dir / prompt_path).resolve()
        if prompt_file.is_file():
            (run_dir / "best_skill_prompt.txt").write_text(
                prompt_file.read_text(encoding="utf-8").rstrip() + "\n",
                encoding="utf-8",
            )

    print(json.dumps(result, ensure_ascii=True))
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Score a candidate against the frozen EVOLVE_AUTORESEARCH harness."
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    score = sub.add_parser(
        "score-candidate",
        help="Validate one candidate grade sheet, append to experiments.tsv, and update best_skill_prompt.txt when promoted.",
    )
    score.add_argument("--run-dir", required=True)
    score.add_argument("--grade-file", required=True)
    score.set_defaults(func=cmd_score)

    args = parser.parse_args()
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
