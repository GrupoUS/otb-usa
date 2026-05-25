#!/usr/bin/env python3
"""
Assemble <evolve_response> XML from a scored EVOLVE_AUTORESEARCH run.

This script turns the run directory artifacts into the final exchange format:
criteria, scoring formula, experiment log, best prompt, and backlog notes.
"""

from __future__ import annotations

import argparse
import csv
import json
import xml.etree.ElementTree as ET
from pathlib import Path


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _read_text(path: Path) -> str:
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8").strip()


def _read_tsv(path: Path) -> list[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        return list(reader)


def _auto_status(rows: list[dict[str, str]]) -> str:
    if not rows:
        return "failed"
    baseline_score = None
    improved = False
    for row in rows:
        if row["candidate_id"] == "baseline":
            baseline_score = float(row["score"])
            break
    if baseline_score is None:
        return "failed"
    for row in rows:
        if row["candidate_id"] != "baseline" and row["decision"] == "keep":
            if float(row["score"]) > baseline_score:
                improved = True
                break
    return "success" if improved else "partial"


def _auto_summary(rows: list[dict[str, str]], harness: dict) -> str:
    if not rows:
        return "Run has no scored iterations."
    baseline = next((row for row in rows if row["candidate_id"] == "baseline"), None)
    best = max(rows, key=lambda row: float(row["score"]))
    max_score = int(harness["resources"]["samples_per_iteration"]) * len(harness["criteria"])
    if baseline is None:
        return f"Run recorded {len(rows)} iteration(s) without a baseline; max score per candidate was {max_score}."
    if best["candidate_id"] == "baseline":
        return (
            f"Harness fixed {len(harness['criteria'])} binary criteria across "
            f"{harness['resources']['samples_per_iteration']} samples (max {max_score}). "
            f"Baseline scored {baseline['score']} and no candidate beat it."
        )
    return (
        f"Harness fixed {len(harness['criteria'])} binary criteria across "
        f"{harness['resources']['samples_per_iteration']} samples (max {max_score}). "
        f"Baseline scored {baseline['score']}; best candidate {best['candidate_id']} scored "
        f"{best['score']} ({float(best['score']) - float(baseline['score']):+g} vs baseline)."
    )


def _append_backlog(run_dir: Path, knowledge_gaps: str, next_actions: str) -> None:
    backlog = run_dir / "backlog.md"
    if not backlog.exists():
        backlog.write_text("# Still to improve\n", encoding="utf-8")
    block = "\n\n## From latest report\n\n"
    if knowledge_gaps:
        block += f"### knowledge_gaps\n\n{knowledge_gaps}\n\n"
    if next_actions:
        block += f"### next_actions\n\n{next_actions}\n\n"
    with backlog.open("a", encoding="utf-8") as handle:
        handle.write(block)


def cmd_build(args: argparse.Namespace) -> int:
    run_dir = Path(args.run_dir).resolve()
    harness = _read_json(run_dir / "harness.json")
    rows = _read_tsv(run_dir / "experiments.tsv")
    best_prompt = _read_text(run_dir / "best_skill_prompt.txt")
    if not best_prompt:
        best_prompt = _read_text(run_dir / "candidates" / "baseline.prompt.txt")

    summary = args.summary.strip() if args.summary else _auto_summary(rows, harness)
    knowledge_gaps = _read_text(run_dir / "knowledge_gaps.md")
    next_actions = _read_text(run_dir / "next_actions.md")
    run_path = f"Run path: {run_dir}"
    if run_path not in next_actions:
        next_actions = f"{next_actions}\n{run_path}".strip()

    status = args.status if args.status != "auto" else _auto_status(rows)

    root = ET.Element("evolve_response")
    ET.SubElement(root, "status").text = status
    ET.SubElement(root, "summary").text = summary
    ET.SubElement(root, "best_skill_prompt").text = best_prompt

    eval_design = ET.SubElement(root, "eval_design")
    criteria_text = " ".join(f"{item['id']}: {item['text']}" for item in harness["criteria"])
    ET.SubElement(eval_design, "criteria").text = criteria_text
    ET.SubElement(eval_design, "scoring_formula").text = harness["scoring_formula"]

    experiment_log = ET.SubElement(root, "experiment_log")
    for row in rows:
        iteration = ET.SubElement(experiment_log, "iteration", {"index": row["iteration"]})
        ET.SubElement(iteration, "candidate_id").text = row["candidate_id"]
        ET.SubElement(iteration, "score").text = row["score"]
        ET.SubElement(iteration, "delta_vs_baseline").text = row["delta_vs_baseline"]
        ET.SubElement(iteration, "decision").text = row["decision"]
        ET.SubElement(iteration, "hypothesis").text = row["hypothesis"]
        ET.SubElement(iteration, "changes_summary").text = row["changes_summary"]

    ET.SubElement(root, "knowledge_gaps").text = knowledge_gaps
    ET.SubElement(root, "next_actions").text = next_actions

    ET.indent(root, space="  ")
    xml_payload = ET.tostring(root, encoding="unicode")
    out_path = run_dir / (args.out or "evolve-response.xml")
    out_path.write_text('<?xml version="1.0" encoding="UTF-8"?>\n' + xml_payload + "\n", encoding="utf-8")

    if args.append_backlog:
        _append_backlog(run_dir, knowledge_gaps, next_actions)

    print(out_path)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build <evolve_response> XML from a scored EVOLVE_AUTORESEARCH run."
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    build = sub.add_parser(
        "build-response",
        help="Render evolve-response.xml from run artifacts and optional note files.",
    )
    build.add_argument("--run-dir", required=True)
    build.add_argument(
        "--status",
        default="auto",
        choices=("auto", "success", "partial", "failed"),
        help="Response status, or auto-infer from the scored results.",
    )
    build.add_argument(
        "--summary",
        default="",
        help="Override the generated summary text.",
    )
    build.add_argument(
        "--out",
        default="",
        help="Output filename inside the run dir (default: evolve-response.xml).",
    )
    build.add_argument(
        "--append-backlog",
        action="store_true",
        help="Append knowledge_gaps and next_actions into backlog.md.",
    )
    build.set_defaults(func=cmd_build)

    args = parser.parse_args()
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
