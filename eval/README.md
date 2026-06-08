# Eval

A **conformance check** for the Agentic Development Playbook. Verifies
structural integrity of templates, run manifests, and ML-eval gates.

> This is a *structural lint*, not a behavioral evaluation. It does not run
> agents, score their output, or compare against a baseline. See
> [`../docs/rationale.md`](../docs/rationale.md) for why outcome-based is
> out of scope (a v2.x or v3.x addition, not v1.2.0).

## How to run

```bash
python eval/check.py                    # run against the repo's templates/
python eval/check.py --self-test        # verify the check itself has teeth
```

Exit code: 0 = all green, 1 = any red.

## What it checks

The check has three independent passes:

1. **Template-field consistency** — for every file in `templates/`, verify
   it has the required fields/sections/strings/patterns (per
   `TEMPLATE_REQUIRED_FIELDS` in `check.py`).
2. **Run-manifest schema** — for every `**/run-manifest.json` in the repo
   (excluding the `bad-project` self-test fixture), verify it conforms to
   the run-reproducibility schema (per `RUN_MANIFEST_SCHEMA`).
3. **ML-eval gate structure** — for every `**/GATES.ml-eval.md` in the repo
   (excluding the `bad-project` self-test fixture), verify the 7 required
   sub-checks are present (each as a markdown checkbox with `[ ]` or `[x]`).

Stdlib only (Python 3.12 or 3.13). No `pip install`. Runs in under 2 seconds.

## Adding a new template

Add an entry to the `TEMPLATE_REQUIRED_FIELDS` dict in `check.py`. Each
entry can specify:

- `required_strings` — exact strings that must appear in the file
- `required_sections` — H2 headers that must appear
- `required_patterns` — regex patterns (multiline) that must match
- `min_section_count` — minimum number of `required_sections` that must be
  present (defaults to "all of them")
- `min_string_count` — minimum number of `required_strings` that must be
  present (defaults to "all of them")

If the template shouldn't be field-checked (e.g., it has a different
validation rule or is onboarding-only), add it to
`PROMOTED_NON_TEMPLATE_FILES` instead.

## Adding a new check

Add a new function returning `list[CheckResult]`, and call it from `main()`.
Each result is a `CheckResult(name, status, detail)` where `status` is
`"PASS"` or `"FAIL"`. The status table is printed to stdout (no ANSI
color, so it copies cleanly into the README).

## Sample run

See [`eval/sample-run-2026-06-08.txt`](sample-run-2026-06-08.txt) for the
latest captured run (20/20 PASS, ~1.2s on Python 3.13).

## Self-test

`--self-test` runs the check against `eval/fixtures/bad-project/`, which
contains 5 deliberately broken files. The self-test asserts that all 5
breaks are caught. If any break slips through, the self-test exits
non-zero — meaning the check has a gap and needs fixing.

The 5 breaks are listed in `eval/fixtures/bad-project/_README.md`.

## Exit codes

- `0` — all green
- `1` — any red (the check found a structural issue, or `--self-test`
  found that a break was not caught)
