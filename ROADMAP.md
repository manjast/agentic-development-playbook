# Redesign Roadmap

This roadmap is intentionally short. The September 2026 redesign is a correction of scope and control semantics, not a plan to replace the retired machinery with a new framework.

## Stage 1 — Establish a truthful baseline

- retire the legacy commit-bookkeeping enforcement stack;
- retire the scheduled verifier/executor workflow;
- retire the structural conformance harness that hard-coded the legacy template architecture;
- remove `one task = one commit` and tracked commit-hash completion semantics from standing guidance;
- replace stale claims that conformance or local hooks establish assurance;
- shrink `AGENTS.md` to durable authority, scope, verification, stop, candidate, and acceptance guidance.

This stage should leave the repository smaller and internally coherent even if no replacement code is ever built.

## Stage 2 — Resolve the remaining semantic uncertainties

Use bounded evidence rather than another broad architecture review.

Questions still being tested in the private research checkpoint:

1. **Independent review yield** — which findings in the existing T-006 audit practice were genuine escapes beyond sensible deterministic checks and producer self-review?
2. **Trigger usefulness** — which observable change properties route meaningful additional obligations without creating excessive noise or misses?
3. **Terminal boundary** — what general wording cleanly covers both incorporation-only work and deployed work that requires confirmation in effect?

Cross-repository practice can supply examples and counterexamples, but non-adoption of the unfinished Playbook is not a redesign gate.

## Stage 3 — Publish the minimal acceptance contract

Once Stage 2 is sufficiently settled, add one short normative acceptance document covering only the concepts that survived testing:

- minimum readiness / work contract;
- candidate identity and freshness;
- baseline obligations;
- triggered obligations where evidence supports them;
- verification vs review vs acceptance;
- authority and exception semantics;
- truthful terminal-state claims.

Do not add a separate subsystem for each concept.

## Stage 4 — Test native enforcement before writing custom code

Exercise the actual surviving obligations on a disposable/scratch repository using native GitHub/CI capabilities first:

- required checks and freshness;
- review/ownership rules where applicable;
- rulesets / protected branches;
- deployment/environment protections where relevant;
- negative cases such as missing checks, changed candidates, weakened policy, forgotten triggered review, and unauthorized exceptions.

If native mechanisms cover the load-bearing boundary, build no Playbook checker.

If one narrow consequential gap remains, build the smallest repository-specific helper and only generalize it after repeated real demand.

## Stage 5 — Add examples that reflect real use

Examples should be written after the protocol is exercised, not before.

Likely modes:

- a PR/CI delivery flow with candidate-bound evidence and, where relevant, post-deployment confirmation;
- a linear-main/research flow using exact-candidate review and durable decisions.

Add a generalized reviewer contract only if the independent-review yield analysis supports it. Add optional empirical/evaluation guidance only if it remains useful without turning this repository into an evaluation platform.

## Explicit non-roadmap

Do not plan to build:

- a universal harness lifecycle abstraction;
- agent orchestration / task claiming / leases;
- a telemetry or trace-normalization platform;
- a new spec-generation workflow;
- a generic ruleset manager;
- a mirrored public/private release train;
- a permanent behavioral benchmark platform for the Playbook.

The default response to uncertainty about a new subsystem is **do not build it yet**.
