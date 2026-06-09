# Why this is a conformance check, not an eval

The `eval/check.py` script in this repo is a **structural lint** — it
verifies that templates, run manifests, and ML-eval gates adhere to the
Playbook's spec. It does not evaluate the quality of agent output. This
document explains why, and what an outcome-based check would require.

## What the conformance check does

Three checks, all in `eval/check.py`:

1. **Template-field consistency** — for every file in `templates/`, verify
   it has the required fields/sections/strings (per `TEMPLATE_REQUIRED_FIELDS`).
2. **Run-manifest schema** — for every `**/run-manifest.json` in the repo,
   verify it conforms to the run-reproducibility schema (per `RUN_MANIFEST_SCHEMA`).
3. **ML-eval gate structure** — for every `**/GATES.ml-eval.md` in the repo,
   verify the 7 required sub-checks are present (each as a markdown checkbox;
   per-check content is not verified — see `eval/check.py:476-481` for the
   design rationale).

## What the conformance check does NOT do

It does not:

- Run an agent on a task
- Score the agent's output
- Compare against a baseline
- Report variance/confidence intervals
- Detect hallucinations or drift in the agent's reasoning

## Why outcome-based is out of scope

An outcome-based check would require:

- **A reproducible agent harness** — a deterministic way to spawn an agent
  with a given config + inputs and capture the output. None exists for
  Claude Code, Cursor, Codex, or Gemini CLI as of 2026-06. (They are
  client-side IDE tools, not server-side APIs with stable test interfaces.)
- **A golden test set** — a curated set of tasks with known-good outputs.
  This exists for some benchmarks (SWE-bench, MMLU) but not for the
  Playbook's "real projects" use case.
- **A scoring function** — a way to map agent output to a number that
  correlates with quality. This is itself an open research problem.
- **A baseline** — something to compare against. The Playbook's value
  is process discipline, not model performance.

Even if all four existed, an outcome check would require **LLM API calls**
(against the very providers the Playbook is built for) and would be flaky by
construction (temperature > 0, model updates, prompt sensitivity).

The Playbook does not currently prescribe a protocol for agent-tool
interaction (e.g., MCP, A2A, or function-calling interfaces). That is
a per-project choice recorded in the task card or `AGENTS.md`. The
template discipline applies to the agent's reasoning artifacts
(decisions, status, run records) regardless of which tool protocol the
agent uses.

## What the structural check gives up

A structural check has two specific limits.

**It does not score agent output.** A reader trained on outcome-based evaluation will see `eval/check.py` and notice that it does not run the agent and does not measure quality. The Playbook is explicit about this rather than over-claiming. See "Why outcome-based is out of scope" above for the four missing prerequisites (reproducible harness, golden test set, scoring function, baseline).

**It catches deviations from the spec, not deviations from the intent of the spec.** A template can have every required heading and still be semantically wrong. The check enforces structure; the GATES decision enforces meaning.

The check itself is a single Python script with no dependencies. How
that choice interacts with the two limits above is described in the
README's "What this prevents" section.

## What an outcome-based check would add (when feasible)

A future `eval/outcome.py` (separate from the structural check) could:

- Spawn a headless agent harness (when one exists)
- Run a fixed test set
- Score against a baseline
- Report variance

That would be a v2.x or v3.x addition, not a v1.2.x deliverable.
