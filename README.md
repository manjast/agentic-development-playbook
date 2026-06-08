# Agentic Development Playbook

> AI coding with the receipts: deterministic, spec-gated, decision-logged, human-in-the-loop. A lean, spec-driven workflow for AI coding agents with the repo as the source of truth.
>
> Built for the Claude Code / Cursor / Codex / Gemini CLI era — when most teams are still vibe-coding and shipping un-reviewable mega-diffs.

[![Release](https://img.shields.io/github/v/release/manjast/agentic-development-playbook?display_name=tag&sort=semver)](https://github.com/manjast/agentic-development-playbook/releases)
[![License](https://img.shields.io/github/license/manjast/agentic-development-playbook)](LICENSE)
[![Conformance](https://github.com/manjast/agentic-development-playbook/actions/workflows/eval.yml/badge.svg)](https://github.com/manjast/agentic-development-playbook/actions/workflows/eval.yml)

> **Note on the folder name:** `eval/` is historical. This is a conformance check
> (structural lint), not a behavioral evaluation. See [`docs/rationale.md`](docs/rationale.md)
> for why outcome-based evals are out of scope.

## Conformance check (latest run)

```
check_template_fields/AGENTS.md                                     PASS  all required fields present
check_template_fields/CLAUDE.md                                     PASS  all required fields present
check_template_fields/DECISIONS.md                                  PASS  all required fields present
check_template_fields/GATES.md                                      PASS  all required fields present
check_template_fields/POC-BRIEF.md                                  PASS  all required fields present
check_template_fields/POC-CLOSURE.md                                PASS  all required fields present
check_template_fields/REPORT.md                                     PASS  all required fields present
check_template_fields/SOURCE-DIGEST.md                              PASS  all required fields present
check_template_fields/STATUS.md                                     PASS  all required fields present
check_template_fields/TASKS.md                                      PASS  all required fields present
check_template_fields/gitignore-poc.append.txt                      PASS  all required fields present
check_template_fields/questions-triage.md                           PASS  all required fields present
check_template_fields/task-card.md                                  PASS  all required fields present
check_run_manifest/eval/fixtures/example-project/run-manifest.json  PASS  all required keys present (8 top-level)
check_run_manifest/templates/run-manifest.json                      PASS  all required keys present (8 top-level)
check_gates_ml_eval/eval/fixtures/example-project/GATES.ml-eval.md  PASS  7/7 sub-checks present
check_gates_ml_eval/templates/GATES.ml-eval.md                      PASS  7/7 sub-checks present

Total: 17  Pass: 17  Fail: 0
```

The conformance check verifies (a) every template has its required fields, (b) any `run-manifest.json` conforms to the run-reproducibility schema, (c) any `GATES.ml-eval.md` has the 7 required sub-checks (each as a markdown checkbox; per-check content is not verified — see `eval/check.py:481-488` deviation comment for the design rationale). Runs in <5 sec on stdlib Python 3.12 or 3.13.

**This is a structural check, not a behavioral evaluation** — see [`docs/rationale.md`](docs/rationale.md) for why outcome-based is out of scope, and `python eval/check.py --self-test` to verify the check itself is not vacuous.

## What this prevents

The Playbook's discipline prevents five specific failure modes that plague AI-assisted coding work. Each prevention is **supported by** templates in this repo. **#4 is structurally verified by the conformance check; #1–#3 and #5 are template-presence-supported but not content-verified by the current check — a known scope limit, see [`docs/rationale.md`](docs/rationale.md).**

1. **Lost decisions across context windows** — `DECISIONS.md` (every `D-NNN` entry is dated: question, options, decision, follow-up; append-only)
2. **Drift between TASKS and reality** — `TASKS.md` (4 sections: In Progress, Ready, Blocked, Done) + `STATUS.md` (Date + Tracker + one-line current state)
3. **Unreviewable mega-diffs** — `task-card.md` (explicit "In scope" / "Out of scope" sub-bullets)
4. **Eval claims without evidence** — `GATES.ml-eval.md` (7 sub-checks) + `run-manifest.json` (structured run record: commit, seed, environment, budget)
5. **Template sprawl that no one maintains** — the 19-template discipline (16 user-facing + 2 eval-meta + 1 onboarding, with structure enforcement)

## What this is

- A repo-native execution discipline for implementation work that needs clear scope, explicit verification, and reviewable task boundaries
- A set of templates for teams or solo builders who want a consistent operating shape once work becomes repo-level
- A light PoC/evaluation path for work that needs evidence, reports, and closure before hardening further
- A provider-agnostic setup built around `AGENTS.md` as the canonical instruction file

## What this is not

- A requirements or spec-generation system
- A CLI or automation framework
- A multi-agent orchestration product
- A full public methodology stack covering every upstream and downstream phase

## Core path

Use the core path when specs or architecture decisions already exist and the main need is disciplined implementation.

Core artifacts:

- `AGENTS.md`
- `TASKS.md`
- `DECISIONS.md`
- `task-card.md`
- `GATES.md` (optional)
- `STATUS.md` (optional)

Core rules:

- repo files are the source of truth
- one task = one commit
- verification before commit
- no drive-by refactors
- keep tasks small and reviewable

## PoC / evaluation path

Use the PoC path when the first phase needs decision-grade evidence rather than a production-ready finish.

The public first pass includes templates for:

- `POC-BRIEF.md`
- `POC-CLOSURE.md`
- `REPORT.md`
- `SOURCE-DIGEST.md`
- `questions-triage.md`
- `GATES.ml-eval.md` (ML-eval gate, with 7 sub-checks)
- `run-manifest.json` (run reproducibility schema)

The `eval/` folder in this repo is itself a working PoC of this path.

This path is useful when you need to:

- make the decision question explicit before implementation expands
- keep source digests smaller than raw inputs
- write reports that can support a gate decision
- close a PoC cleanly instead of letting it drift into pseudo-production

## Templates included (15)

### Core (7)

- `AGENTS.md`
- `CLAUDE.md` (pointer to `AGENTS.md` for Claude Code)
- `TASKS.md`
- `DECISIONS.md`
- `STATUS.md`
- `GATES.md`
- `task-card.md`

### PoC / evaluation (6)

- `POC-BRIEF.md`
- `POC-CLOSURE.md`
- `REPORT.md`
- `SOURCE-DIGEST.md`
- `questions-triage.md`
- `gitignore-poc.append.txt`

### Eval-meta (2 — structurally enforced by the conformance check)

- `GATES.ml-eval.md` (ML-eval decision gate with 7 sub-checks)
- `run-manifest.json` (run reproducibility schema)

## Quick start

1. Copy the core templates from `templates/` into your repo.
2. Fill in `AGENTS.md` and set your spec root.
3. Create `TASKS.md` and your first task card.
4. If the work is still decision-heavy, add the PoC/evaluation templates as needed.

Recommended minimum layout:

```text
<repo>/
  <SPEC_ROOT>/
  AGENTS.md
  TASKS.md
  DECISIONS.md
  tasks/
```

If your tool expects a different instruction filename, keep it as a short pointer to `AGENTS.md`. For example, if you use Gemini CLI, copy `CLAUDE.md` to `GEMINI.md` in your project.

## Example

See `examples/worked-example.md` for a simple end-to-end example of the core task flow.

For a short PoC/evaluation-oriented flow, see `examples/worked-example-poc.md`.

For filled-in task card examples (low-risk and high-risk variants), see `examples/task-card-example.md` and `examples/task-card-example-high-risk.md`.

The `eval/` folder in this repo is also a runnable example: `python eval/check.py` shows the structural check in action, and `python eval/check.py --self-test` shows it catching deliberately broken inputs.

## Where this fits

This repo assumes specs or architecture decisions already exist and focuses on making implementation legible and verifiable.

If your bigger problem is still upstream discovery, requirements shaping, or broad methodology design, solve that first. This playbook is intentionally narrower than that.

## Principles

For the philosophy behind the Playbook, see [`docs/principles.md`](docs/principles.md).

## License

Apache-2.0
