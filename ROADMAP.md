# Roadmap

This repo is maintained and intentionally selective. The discipline is
"a template earns its slot by being used in real work." Each version
below corresponds to a concrete change set.

## v1.2.2 (this release)

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

## v1.2.3 (next)

- Semantic checks on `run-manifest.json`: enum-validate
  `nondeterminism_notes` against the closed set `[none, low, high, n/a]`.
- Add a second adversarial self-test break (e.g. wrong-type on a
  different field, to make the type check less single-point-of-failure).
- Update the `task-card-example*` worked examples to reflect the new
  `examples/` location.

## v1.3.0 (later)

- Investigate whether a headless agent harness is viable for an
  outcome-check stub. Depends on whether any of Claude Code, Cursor,
  Codex, or Gemini CLI ships a server-side API with a stable test
  interface (see `docs/rationale.md` for the current assessment).
- Add a one-paragraph note to `AGENTS.md` on how the template
  discipline coexists with MCP/agent-tool protocols.

## v2.0 (far)

- Outcome-based check: spawn headless agent on a fixed test set, score
  against a baseline, report variance. This is gated on a reproducible
  agent harness existing (none does as of 2026-06).

## Not the goal

- Expanding into a broader public framework
- Publishing the full upstream/downstream methodology stack
- Adding surface area faster than the repo's examples and real use can support
