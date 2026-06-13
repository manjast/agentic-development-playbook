# Roadmap

This repo is maintained and intentionally selective. The discipline is
"a template earns its slot by being used in real work." Each version
below corresponds to a concrete change set.

## v1.2.2

- Tighten the README opener (drop the adjective stack) and the
  `pyproject.toml` description to match.
- Drop the "16 surgical fixes" process-narration from the v1.2.0
  entry below; describe the v1.2.0 release as a single change set.
- Drop the first-person plural from `templates/POC-CLOSURE.md:22`
  (the only such instance in a user-facing template).
- Correct stale section-count comments in `eval/check.py`.

## v1.2.1

- Voice pass on `docs/principles.md`, `docs/rationale.md`, the README
  opener, and `eval/check.py` design notes. No template, check, or
  schema changes. 17/17 PASS, 6/6 self-test, both stale-guards green.

## v1.2.0

- Add the conformance check + 2 promoted templates
  (`GATES.ml-eval.md`, `run-manifest.json`) + CI workflow with two
  stale-guards. See the v1.2.0 release notes for the full list.

## v1.2.3

- Add 3 wrong-type breaks to the bad-project `run-manifest.json`
  fixture (`seed_values`, `artifact_pointers`, `environment.python`),
  alongside the existing `seed_policy` break, so the type check is
  exercised on every field it covers.

## v1.2.4

- Generalize the "as of" date in `docs/rationale.md` (drop the date, keep the
  substance); drop the redundant 2nd "Note on the folder name" disclaimer in
  `eval/README.md`; add an illustrative-not-runnable disclaimer on the `curl`
  commands in `examples/worked-example.md`; drop a first-person plural from a
  Python comment in `eval/check.py`; rename "Out (non-goals):" to "Out of
  scope (non-goals):" in `templates/POC-BRIEF.md` and the corresponding
  `required_strings` entry in `eval/check.py`. Bump `pyproject.toml` version
  to 1.2.4.

## v1.2.5

- Add a concrete workflow rule for new dependencies: a decision entry
  in `DECISIONS.md` and a stop-condition pass in
  `templates/AGENTS.md:143`. Bump `pyproject.toml` version 1.2.4 to
  1.2.5.

## v1.3.0 (later)

- Extend the conformance check to cover the DS/AI pack's
  `GATES.ds-ai.md` (structurally parallel to `check_gates_ml_eval_any`;
  ~30 lines of code). The public repo does not ship the DS/AI pack
  today; this is a candidate that depends on whether the pack pattern
  is adopted as a public feature. See the private repo's
  `ROADMAP.md` "v1.3.0 candidates (deferred)" section for the
  design notes.

## v1.3.0 candidates (deferred) — retired

- A one-paragraph note to `AGENTS.md` on how the template discipline
  coexists with MCP / agent-tool protocols. Drafted 2026-06-12; retired
  the same day. The plan-doc was 115 lines, the section draft was 5
  sentences, and at that point the framing collapsed: the note would
  restate that the existing rules in `templates/AGENTS.md` apply when
  the agent is invoked through MCP or any other agent-tool protocol,
  without adding a new rule. A 1-paragraph release is a thin release,
  and a thin release sets a bad precedent for what "v1.3.0" means.
  The Playbook stays tool-agnostic by design, and the existing rules
  already cover this. The public ROADMAP v1.3.0 (later) section now
  contains the DS/AI pack conformance check extension as its single
  remaining bullet; a v1.3.0 release is gated on that decision (see
  the private repo's `ROADMAP.md` "v1.3.0 candidates (deferred)"
  section).

## v2.0 (far)

- Outcome-based check: spawn headless agent on a fixed test set, score
  against a baseline, report variance. This is gated on a reproducible
  agent harness existing (none does as of 2026-06).
- Investigate whether a headless agent harness is viable for an
  outcome-check stub. Depends on whether any of Claude Code, Cursor,
  Codex, or Gemini CLI ships a server-side API with a stable test
  interface (see `docs/rationale.md` for the current assessment).

## Not the goal

- Expanding into a broader public framework
- Publishing the full upstream/downstream methodology stack
- Adding surface area faster than the repo's examples and real use can support
