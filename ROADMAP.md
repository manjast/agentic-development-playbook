# Roadmap

This repo is maintained and intentionally selective. The discipline is
"a template earns its slot by being used in real work." Each version
below corresponds to a concrete change set.

## v1.2.1 (this release)

- Doc polish: neutral voice in `docs/rationale.md` and `docs/principles.md`
  (replace first-person plural with the Playbook / the check as referent).
- Doc polish: reframe the `eval/check.py` deviation comment as a
  design-choice note.
- Doc polish: remove `PROMOTION.md` (release-process internal detail;
  superseded by the `ROADMAP.md` and the v1.2.0 release notes).
- Doc polish: drop the README marketing-trope opener, keep the dated
  "vibe-coding" position.
- Doc polish: drop the public/private-repo framing in `CONTRIBUTING.md`.
- No template / check / schema changes. 17/17 PASS, 6/6 self-test, both
  stale-guards green.

## v1.2.0

- Add conformance check + 2 promoted templates (GATES.ml-eval.md, run-manifest.json)
- Pre-merge polish: 16 surgical fixes (credibility claims, template count, 2026 currency)
- See the v1.2.0 release notes for the full list.

## v1.2.2 (next)

- (Done in v1.2.0) Semantic checks on `run-manifest.json`: enum-validate
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
