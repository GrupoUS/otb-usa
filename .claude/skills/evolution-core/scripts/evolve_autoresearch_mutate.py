#!/usr/bin/env python3
"""
Generate deterministic candidate prompt variants for EVOLVE_AUTORESEARCH.

This is intentionally heuristic, not model-driven: it creates a few small,
diff-friendly prompt mutations so the run can start from concrete candidates
without inventing an opaque optimizer.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path


def _read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def _baseline_prompt(run_dir: Path) -> str:
    return (run_dir / "candidates" / "baseline.prompt.txt").read_text(encoding="utf-8").rstrip()


def _constraint_lines(harness: dict) -> list[str]:
    return [item["text"] for item in harness["criteria"]]


def _negative_constraints(constraints: list[str]) -> list[str]:
    negatives = []
    for constraint in constraints:
        lower = constraint.lower()
        if any(token in lower for token in ["no ", "not ", "never", "without", "exactly", "must not", "cannot"]):
            negatives.append(constraint)
    return negatives or constraints[:2]


def _write_candidate(run_dir: Path, candidate_id: str, prompt: str) -> None:
    path = run_dir / "candidates" / f"{candidate_id}.prompt.txt"
    path.write_text(prompt.rstrip() + "\n", encoding="utf-8")


def _build_variants(baseline: str, harness: dict) -> list[dict[str, str]]:
    task_domain = harness["task_domain"]
    constraints = _constraint_lines(harness)
    negative_constraints = _negative_constraints(constraints)
    joined_constraints = "\n".join(f"- {item}" for item in constraints)
    joined_negatives = "\n".join(f"- {item}" for item in negative_constraints)

    checklist_prompt = "\n\n".join(
        [
            baseline,
            "Success checklist:",
            joined_constraints,
            "Before finalizing, ensure every checklist item passes.",
        ]
    )

    output_contract_prompt = "\n\n".join(
        [
            baseline,
            "Working contract:",
            f"- Task domain: {task_domain}",
            "- Prefer the simplest wording that still satisfies every constraint.",
            "- If there is a format requirement, satisfy it exactly before optimizing style.",
            "Output must satisfy:",
            joined_constraints,
        ]
    )

    negative_guard_prompt = "\n\n".join(
        [
            baseline,
            "Must-not-regress guards:",
            joined_negatives,
            "If any guard would fail, revise before returning the final answer.",
        ]
    )

    minimal_contract_prompt = "\n\n".join(
        [
            f"Task domain: {task_domain}",
            "Goal: produce the strongest answer that passes the evaluation harness.",
            "Non-negotiable constraints:",
            joined_constraints,
            "Prefer concise, literal instructions over decorative wording.",
            "Return only the final answer.",
        ]
    )

    return [
        {
            "candidate_id": "c_constraints_mirror",
            "hypothesis": "Mirroring the eval constraints as an explicit checklist increases pass-rate consistency.",
            "changes_summary": "Adds a final success checklist with every constraint restated verbatim.",
            "prompt": checklist_prompt,
        },
        {
            "candidate_id": "c_output_contract",
            "hypothesis": "A task-domain plus output-contract section reduces ambiguity and format drift.",
            "changes_summary": "Adds a working contract with domain and exact output obligations.",
            "prompt": output_contract_prompt,
        },
        {
            "candidate_id": "c_negative_guards",
            "hypothesis": "Explicit must-not-regress guards reduce failures on negative or exact-match constraints.",
            "changes_summary": "Elevates failure-causing constraints into a dedicated guardrail block.",
            "prompt": negative_guard_prompt,
        },
        {
            "candidate_id": "c_minimal_contract",
            "hypothesis": "A shorter, cleaner prompt can tie or beat longer variants through lower ambiguity.",
            "changes_summary": "Rewrites the prompt into a compact contract-first form.",
            "prompt": minimal_contract_prompt,
        },
    ]


def cmd_seed(args: argparse.Namespace) -> int:
    run_dir = Path(args.run_dir).resolve()
    harness = _read_json(run_dir / "harness.json")
    baseline = _baseline_prompt(run_dir)
    variants = _build_variants(baseline, harness)

    manifest = []
    for index, variant in enumerate(variants, start=1):
        variant["iteration"] = index
        _write_candidate(run_dir, variant["candidate_id"], variant["prompt"])
        manifest.append(
            {
                "iteration": index,
                "candidate_id": variant["candidate_id"],
                "hypothesis": variant["hypothesis"],
                "changes_summary": variant["changes_summary"],
                "prompt_file": f"candidates/{variant['candidate_id']}.prompt.txt",
            }
        )

    (run_dir / "candidates" / "manifest.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    print(f"seeded {len(manifest)} candidate prompt(s) in {run_dir / 'candidates'}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Generate deterministic candidate prompt variants for an EVOLVE_AUTORESEARCH run."
    )
    sub = parser.add_subparsers(dest="cmd", required=True)

    seed = sub.add_parser(
        "seed-candidates",
        help="Create a small set of diff-friendly candidate prompt files under candidates/.",
    )
    seed.add_argument("--run-dir", required=True)
    seed.set_defaults(func=cmd_seed)

    args = parser.parse_args()
    return int(args.func(args))


if __name__ == "__main__":
    raise SystemExit(main())
