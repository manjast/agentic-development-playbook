# Roadmap

This repo is maintained and intentionally selective. The discipline is
"a template earns its slot by being used in real work." Each version
below corresponds to a concrete change set.

## v1.2.0 (this release)

- Add conformance check + 2 promoted templates (GATES.ml-eval.md, run-manifest.json)
- Pre-merge polish: 16 surgical fixes (credibility claims, template count, 2026 currency)
- See the v1.2.0 release notes for the full list.

## v1.2.1 (next)

- Semantic checks on `run-manifest.json`: enum-validate `nondeterminism_notes`
  against the closed set `[none, low, high, n/a]`.
- Expand the self-test to cover at least one "structurally correct,
  semantically wrong" failure class.
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
