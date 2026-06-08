# bad-project fixture

This directory contains deliberately broken files used by
`python eval/check.py --self-test` to prove the conformance check has teeth.

The 5 broken files (each missing one structural property):

| File | What's wrong |
|---|---|
| `AGENTS.md` | Missing the `## Privacy / PII / secrets` section |
| `TASKS.md` | Only 2 of 4 required sections present (`## Blocked` and `## Done` missing) |
| `STATUS.md` | Missing the `Date:` field (has only `Tracker:`) |
| `run-manifest.json` | Wrong type for `reproducibility.seed_policy` (int instead of str) |
| `GATES.ml-eval.md` | Only 5 of 7 required sub-checks present (missing `Variance/confidence is reported` and `Leakage/contamination checks are documented`) |

The `--self-test` flag runs the conformance check against this directory
and asserts that all 5 breaks are caught. If any break slips through,
the self-test exits non-zero — meaning the check has a gap and needs fixing.

Note: 4 of the 5 breaks are presence breaks (a section/key is missing);
1 is a type break (`run-manifest.json` has the right key with the wrong
type). The type break exists to verify the run-manifest type check
(reproducibility.seed_policy: str) has teeth.

The self-test also asserts that the *expected* files are flagged (positive
direction): if the check flags a file that the spec didn't predict would
fail, that's also a self-test failure (suggests the check is over-eager).
