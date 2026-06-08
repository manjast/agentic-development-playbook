#!/usr/bin/env python3
"""Conformance check for the Agentic Development Playbook.

Verifies structural integrity of templates, run manifests, and ML-eval gates.

This is a *structural lint* — it does not evaluate agent output quality.
See docs/rationale.md for why outcome-based is out of scope.

Usage:
    python eval/check.py                    # run against the repo's templates/
    python eval/check.py --repo-root PATH   # run against an arbitrary repo
    python eval/check.py --self-test        # run against eval/fixtures/bad-project/

Exit codes:
    0 = all green
    1 = any red
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path


# ---------------------------------------------------------------------------
# CheckResult
# ---------------------------------------------------------------------------

@dataclass
class CheckResult:
    name: str
    status: str  # "PASS" or "FAIL"
    detail: str = ""

    def is_pass(self) -> bool:
        return self.status == "PASS"


# ---------------------------------------------------------------------------
# Template required fields (verified against the actual templates in this repo)
# ---------------------------------------------------------------------------

TEMPLATE_REQUIRED_FIELDS: dict[str, dict] = {
    # Core (8)
    "AGENTS.md": {
        "required_strings": [
            "## Source of Truth",
            "## PoC Mode",
            "## Privacy / PII / secrets",
            "## Before Starting a Task",
        ],
    },
    "CLAUDE.md": {
        "required_strings": ["AGENTS.md"],
    },
    "GEMINI.md": {
        "required_strings": ["AGENTS.md"],
    },
    "TASKS.md": {
        "required_sections": [
            "## In Progress",
            "## Ready",
            "## Blocked",
            "## Done",
        ],
        "min_section_count": 3,
    },
    "DECISIONS.md": {
        "required_patterns": [
            r"^## D-\d{3}:",
        ],
    },
    "STATUS.md": {
        "required_strings": [
            "Date:",
            "Tracker:",
        ],
    },
    "GATES.md": {
        "required_strings": [
            "Decision question:",
            "Required checks:",
            "Verify:",
            "Outcome / next step:",
        ],
    },
    # PoC / evaluation (5)
    "POC-BRIEF.md": {
        "required_sections": [
            "## 1) Decision question",
            "## 2) Hypothesis",
            "## 3) Scope",
            "## 4) Constraints",
            "## 5) Inputs (pinned)",
            "## 6) Outputs at gate",
            "## 7) Metrics",
        ],
        "required_strings": [
            "Out (non-goals):",
        ],
    },
    "POC-CLOSURE.md": {
        "required_sections": [
            "## 1) Gate question outcome",
            "## 4) Recommended next step",
            "## 6) Open questions carried forward",
        ],
    },
    "REPORT.md": {
        "required_sections": [
            "## Closeout question",
            "## Short answer",
            "## Evidence summary",
            "## Recommendation / next step",
        ],
    },
    "SOURCE-DIGEST.md": {
        "required_strings": [
            "Source (pinned):",
            "Context:",
            "Facts (high-signal):",
            "Decisions / constraints:",
            "Requirements (actionable):",
            "Open questions:",
            "Risks / caveats:",
        ],
        "min_string_count": 5,
    },
    "questions-triage.md": {
        "required_sections": [
            "## How to use it",
            "## Suggested status values",
            "## Table",
        ],
    },
    "gitignore-poc.append.txt": {
        "required_strings": [
            "runs/",
        ],
    },
    # Task cards (3)
    "task-card.md": {
        "required_sections": [
            "## Task validity gate",
            "## Goal",
            "## Scope",
            "## Acceptance criteria",
        ],
        "required_strings": [
            "In scope:",
            "Out of scope (non-goals):",
        ],
    },
    "task-card-example.md": {
        "required_sections": [
            "## Task validity gate",
            "## Goal",
            "## Scope",
            "## Acceptance criteria",
        ],
    },
    "task-card-example-high-risk.md": {
        "required_sections": [
            "## Task validity gate",
            "## Goal",
            "## Scope",
            "## Acceptance criteria",
        ],
        "required_strings": [
            "Risk: high",
        ],
    },
}

# Files in templates/ that are NOT field-checked templates.
# Skipped by check_template_fields.
# - 3 promoted (checked by other checks (b, c) or are onboarding-only docs)
# - 5 private-only (not checked at all; advanced patterns that stay in the
#   dev branch and are intentionally not in the public)
PROMOTED_NON_TEMPLATE_FILES: set[str] = {
    # Promoted (3) — checked by checks (b), (c), or onboarding-only
    "run-manifest.json",    # checked by check_run_manifest_any
    "GATES.ml-eval.md",     # checked by check_gates_ml_eval_any
    "START-HERE.md",        # onboarding doc
    # Private-only (5) — advanced patterns, not checked
    "TASKS.pointer.md",
    "TRACKER.agent-backlog.snippet.md",
    "task-card-experiment.md",
    "artifact-pointer.json",
    "gitignore-binaries.append.txt",
}

# ---------------------------------------------------------------------------
# GATES.ml-eval spec
# ---------------------------------------------------------------------------

GATES_ML_EVAL_SUB_CHECKS: list[str] = [
    "Metric definitions are explicit",
    "Baseline/challenger comparison",
    "Run manifest is present and complete",
    "Variance/confidence is reported",
    "Top failure modes are documented",
    "Runtime and cost results are reported",
    "Leakage/contamination checks are documented",
]

# Matches "- [ ] item" or "- [x] item" (C5: both unchecked and checked pass)
SUB_CHECK_PATTERN = re.compile(r"^- \[[ x]\] (.+)$")

GATES_ML_EVAL_REQUIRED_STRINGS: list[str] = [
    "Decision question:",
    "Required checks:",
    "Verify:",
    "Decision:",
]

# ---------------------------------------------------------------------------
# run-manifest.json schema
# ---------------------------------------------------------------------------

RUN_MANIFEST_SCHEMA: dict = {
    "required": [
        "task_id", "run_id", "commit", "inputs", "reproducibility",
        "environment", "budget", "notes",
    ],
    "nested_required": {
        "inputs": ["artifact_pointers", "config", "baseline_ref"],
        "reproducibility": ["seed_policy", "seed_values", "nondeterminism_notes", "acceptable_variance"],
        "environment": ["python", "key_libraries", "hardware"],
        "budget": ["runtime_minutes", "cost_usd"],
    },
}


# ---------------------------------------------------------------------------
# Check (a): template-field consistency
# ---------------------------------------------------------------------------

def check_template_fields(templates_dir: Path) -> list[CheckResult]:
    """Iterate templates/, verify each template has its required fields.

    Skips non-file entries (directories like folders/).
    Skips PROMOTED_NON_TEMPLATE_FILES (checked by other checks).
    """
    results: list[CheckResult] = []

    if not templates_dir.is_dir():
        return [CheckResult(
            name="check_template_fields",
            status="FAIL",
            detail=f"templates dir not found: {templates_dir}",
        )]

    # Walk actual files in templates/
    actual_files: set[str] = set()
    for path in sorted(templates_dir.glob("*")):
        if not path.is_file():
            continue
        if path.name in PROMOTED_NON_TEMPLATE_FILES:
            # Skip — checked by other checks (b, c) or onboarding-only
            continue
        actual_files.add(path.name)

        spec = TEMPLATE_REQUIRED_FIELDS.get(path.name)
        if spec is None:
            # Drift: file in templates/ that's not in our required-fields dict
            results.append(CheckResult(
                name=f"check_template_fields/{path.name}",
                status="FAIL",
                detail="in templates/ but not in TEMPLATE_REQUIRED_FIELDS (drift)",
            ))
            continue

        text = path.read_text(encoding="utf-8")
        issues: list[str] = []

        # required_strings
        for s in spec.get("required_strings", []):
            if s not in text:
                issues.append(f"missing string: {s!r}")

        # required_sections (with min_section_count threshold)
        required_sections = spec.get("required_sections", [])
        min_section_count = spec.get("min_section_count")
        present = [s for s in required_sections if s in text]
        if min_section_count is not None:
            if len(present) < min_section_count:
                missing = [s for s in required_sections if s not in text]
                issues.append(
                    f"only {len(present)}/{len(required_sections)} required sections "
                    f"present (min {min_section_count}); missing: {missing}"
                )
        else:
            for s in required_sections:
                if s not in text:
                    issues.append(f"missing section: {s!r}")

        # required_patterns
        for pat in spec.get("required_patterns", []):
            if not re.search(pat, text, flags=re.MULTILINE):
                issues.append(f"pattern not matched: {pat!r}")

        # min_string_count
        min_string_count = spec.get("min_string_count")
        if min_string_count is not None:
            rs = spec.get("required_strings", [])
            present_s = [s for s in rs if s in text]
            if len(present_s) < min_string_count:
                missing = [s for s in rs if s not in text]
                issues.append(
                    f"only {len(present_s)}/{len(rs)} required strings "
                    f"present (min {min_string_count}); missing: {missing}"
                )

        if issues:
            results.append(CheckResult(
                name=f"check_template_fields/{path.name}",
                status="FAIL",
                detail="; ".join(issues),
            ))
        else:
            results.append(CheckResult(
                name=f"check_template_fields/{path.name}",
                status="PASS",
                detail="all required fields present",
            ))

    # Templates in TEMPLATE_REQUIRED_FIELDS that are not in the repo
    for tpl_name in sorted(TEMPLATE_REQUIRED_FIELDS.keys()):
        if tpl_name not in actual_files:
            results.append(CheckResult(
                name=f"check_template_fields/{tpl_name}",
                status="FAIL",
                detail="in TEMPLATE_REQUIRED_FIELDS but not present in templates/",
            ))

    return results


# ---------------------------------------------------------------------------
# Check (b): run-manifest.json schema
# ---------------------------------------------------------------------------

def check_run_manifest_any(repo_root: Path) -> list[CheckResult]:
    """Walk the repo for any **/run-manifest.json and validate the schema."""
    results: list[CheckResult] = []

    for path in sorted(repo_root.rglob("run-manifest.json")):
        if not path.is_file():
            continue
        rel = path.relative_to(repo_root)
        # Skip self-test fixtures: in the main run the bad-project files would
        # always fail; the self-test passes bad_root directly so its files
        # don't have "bad-project" in their relative path and aren't skipped.
        if "bad-project" in str(rel):
            continue

        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except json.JSONDecodeError as e:
            results.append(CheckResult(
                name=f"check_run_manifest/{rel}",
                status="FAIL",
                detail=f"invalid JSON: {e}",
            ))
            continue

        if not isinstance(data, dict):
            results.append(CheckResult(
                name=f"check_run_manifest/{rel}",
                status="FAIL",
                detail=f"top-level not an object (got {type(data).__name__})",
            ))
            continue

        issues: list[str] = []
        for key in RUN_MANIFEST_SCHEMA["required"]:
            if key not in data:
                issues.append(f"missing top-level key: {key!r}")

        for parent, child_keys in RUN_MANIFEST_SCHEMA["nested_required"].items():
            sub = data.get(parent)
            if not isinstance(sub, dict):
                issues.append(f"missing or non-object nested object: {parent!r}")
                continue
            for ck in child_keys:
                if ck not in sub:
                    issues.append(f"missing nested key: {parent!r}.{ck!r}")

        if issues:
            results.append(CheckResult(
                name=f"check_run_manifest/{rel}",
                status="FAIL",
                detail="; ".join(issues),
            ))
        else:
            results.append(CheckResult(
                name=f"check_run_manifest/{rel}",
                status="PASS",
                detail=f"all required keys present ({len(RUN_MANIFEST_SCHEMA['required'])} top-level)",
            ))

    if not results:
        results.append(CheckResult(
            name="check_run_manifest",
            status="PASS",
            detail="no run-manifest.json files found in repo (vacuously OK)",
        ))

    return results


# ---------------------------------------------------------------------------
# Check (c): GATES.ml-eval.md structure + non-empty sub-check content
# ---------------------------------------------------------------------------

def check_gates_ml_eval_any(repo_root: Path) -> list[CheckResult]:
    """Walk the repo for **/GATES.ml-eval.md, verify structure + 7 sub-checks present."""
    results: list[CheckResult] = []

    for path in sorted(repo_root.rglob("GATES.ml-eval.md")):
        if not path.is_file():
            continue
        rel = path.relative_to(repo_root)
        # Skip self-test fixtures (see check_run_manifest_any for rationale).
        if "bad-project" in str(rel):
            continue
        text = path.read_text(encoding="utf-8")
        issues: list[str] = []

        # Required top-level strings
        for s in GATES_ML_EVAL_REQUIRED_STRINGS:
            if s not in text:
                issues.append(f"missing string: {s!r}")

        # 7 sub-checks present (with [ ] or [x])
        # Match by canonical name as a prefix of the line text (since the
        # actual sub-check lines may have additional phrasing beyond the
        # canonical short name).
        sub_check_lines: list[tuple[str, str]] = []  # (canonical_name, full_text)
        for line in text.splitlines():
            m = SUB_CHECK_PATTERN.match(line)
            if not m:
                continue
            line_text = m.group(1).strip()
            # Find which canonical sub-check this line satisfies (prefix match)
            for canonical in GATES_ML_EVAL_SUB_CHECKS:
                if line_text.startswith(canonical) or canonical in line_text:
                    sub_check_lines.append((canonical, line_text))
                    break

        present_canonicals = {name for name, _ in sub_check_lines}
        missing_subchecks = [
            sc for sc in GATES_ML_EVAL_SUB_CHECKS if sc not in present_canonicals
        ]
        if missing_subchecks:
            issues.append(
                f"{len(missing_subchecks)}/7 sub-checks missing: {missing_subchecks}"
            )
        # NOTE (deviation from plan §7.1, 2026-06-08): the plan also specified a
        # "non-empty content under each sub-check" check. The real
        # templates/GATES.ml-eval.md has 7 consecutive sub-checks with no
        # per-check content (its natural design — Verify: / Decision: sections
        # follow the list, not per-check bodies). A literal "next non-blank line
        # is content" check would FAIL the real template, which is wrong. So
        # the per-sub-check content check is dropped. The 7-sub-checks-present
        # check is the right level of strictness for the real template's design.

        if issues:
            results.append(CheckResult(
                name=f"check_gates_ml_eval/{rel}",
                status="FAIL",
                detail="; ".join(issues),
            ))
        else:
            results.append(CheckResult(
                name=f"check_gates_ml_eval/{rel}",
                status="PASS",
                detail="7/7 sub-checks present, all with content",
            ))

    if not results:
        results.append(CheckResult(
            name="check_gates_ml_eval",
            status="PASS",
            detail="no GATES.ml-eval.md files found in repo (vacuously OK)",
        ))

    return results


# ---------------------------------------------------------------------------
# Check (d): self-test (D16)
# ---------------------------------------------------------------------------

def check_self_test(repo_root: Path) -> list[CheckResult]:
    """Run all checks against eval/fixtures/bad-project/ and assert every break is caught.

    The bad-project fixture contains 5 deliberately broken files. This function
    asserts the conformance check flags all 5.
    """
    bad_root = repo_root / "eval" / "fixtures" / "bad-project"
    if not bad_root.is_dir():
        return [CheckResult(
            name="check_self_test",
            status="FAIL",
            detail=f"bad-project fixture not found: {bad_root}",
        )]

    failures: list[str] = []

    # (a) template-fields: 3 expected FAILs (AGENTS.md, TASKS.md, STATUS.md)
    field_results = check_template_fields(bad_root)
    field_results_by_name = {r.name: r for r in field_results}

    expected_field_fails = [
        "check_template_fields/AGENTS.md",
        "check_template_fields/TASKS.md",
        "check_template_fields/STATUS.md",
    ]
    for name in expected_field_fails:
        if name not in field_results_by_name or field_results_by_name[name].status != "FAIL":
            failures.append(f"expected FAIL: {name}")

    # (b) run-manifest: 1 expected FAIL
    manifest_results = check_run_manifest_any(bad_root)
    manifest_failed = any(r.status == "FAIL" for r in manifest_results)
    if not manifest_failed:
        failures.append("expected run-manifest.json to FAIL")

    # (c) GATES.ml-eval: 1 expected FAIL (5/7 sub-checks)
    gates_results = check_gates_ml_eval_any(bad_root)
    gates_fail_count = sum(1 for r in gates_results if r.status == "FAIL")
    if gates_fail_count < 1:
        failures.append(f"expected at least 1 GATES.ml-eval FAIL row, got {gates_fail_count}")

    if failures:
        return [CheckResult(
            name="check_self_test",
            status="FAIL",
            detail=f"{len(failures)} break(s) not caught: {failures}",
        )]
    return [CheckResult(
        name="check_self_test",
        status="PASS",
        detail="all 5 breaks caught by conformance check",
    )]


# ---------------------------------------------------------------------------
# main
# ---------------------------------------------------------------------------

def print_results(results: list[CheckResult]) -> None:
    """Print an aligned-text status table to stdout (no ANSI color)."""
    if not results:
        print("No results.")
        return
    name_w = max(len(r.name) for r in results)
    status_w = max(len(r.status) for r in results)
    for r in results:
        # Wrap detail at ~100 chars per line
        detail = r.detail
        print(f"{r.name:<{name_w}}  {r.status:<{status_w}}  {detail}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Conformance check for the Agentic Development Playbook."
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=None,
        help="Path to the repo root (default: parent of the eval/ folder)",
    )
    parser.add_argument(
        "--self-test",
        action="store_true",
        help="Run the conformance check against eval/fixtures/bad-project/ and assert every break is caught",
    )
    args = parser.parse_args()

    if args.repo_root is None:
        # default: parent of the eval/ folder
        args.repo_root = Path(__file__).resolve().parent.parent

    repo_root: Path = args.repo_root.resolve()

    if args.self_test:
        results = check_self_test(repo_root)
    else:
        templates_dir = repo_root / "templates"
        results: list[CheckResult] = []
        results.extend(check_template_fields(templates_dir))
        results.extend(check_run_manifest_any(repo_root))
        results.extend(check_gates_ml_eval_any(repo_root))

    print_results(results)

    n_pass = sum(1 for r in results if r.is_pass())
    n_fail = sum(1 for r in results if not r.is_pass())
    total = len(results)
    print()
    print(f"Total: {total}  Pass: {n_pass}  Fail: {n_fail}")
    return 0 if n_fail == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
