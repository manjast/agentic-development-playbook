# Redesign Roadmap

This roadmap is intentionally short. The September 2026 redesign is a correction of scope and control semantics, not a plan to replace retired machinery with a new framework.

## Stage 1 — Establish a truthful baseline

**Status: complete.**

Completed changes:

- retired the legacy commit-bookkeeping enforcement stack;
- retired the scheduled verifier/executor workflow;
- retired the structural conformance harness that hard-coded the legacy template architecture;
- removed `one task = one commit` and tracked commit-hash completion semantics from standing guidance;
- removed the mandatory task-card/archive lifecycle;
- removed the old PoC/eval template suite from the active public surface;
- removed stale claims that conformance or local hooks establish assurance;
- reduced the active template surface to repository instructions, durable decisions, and an optional tracker example.

Stage 1 intentionally leaves the repository smaller and internally coherent even if no replacement code is ever built.

## Stage 2 — Resolve product-shaping semantic uncertainties

**Status: sufficiently complete to proceed.**

Bounded private research produced decision-useful results for:

- **independent review yield** — independent challenge can expose missing invariants/oracles after ordinary verification is green, but should be conditional rather than universal;
- **trigger routing** — high-signal mechanical triggers are useful, while semantic classes need project-specific mapping and impact/reviewer fallback rather than a universal path catalogue;
- **terminal outcome semantics** — the work contract names the terminal outcome boundary; incorporation is enough for some work, while other work requires deployment/release/confirmation evidence.

These results constrain the public protocol but do not justify separate subsystems for each concept.

Cross-repository practice remains useful for examples and counterexamples, but non-adoption of the unfinished Playbook is not a redesign gate.

## Stage 3 — Publish and dogfood the minimal acceptance contract

**Status: first draft and first dogfood complete; exact-candidate challenge remains.**

The branch now contains a short normative [`ACCEPTANCE.md`](ACCEPTANCE.md) covering:

- minimum readiness / work contract;
- candidate identity, named acceptance boundary, and freshness;
- minimal baseline obligations;
- conditional obligations;
- verification vs review vs acceptance;
- execution authority vs acceptance authority;
- exception / stop semantics;
- truthful terminal-outcome claims.

The first self-dogfood pass applied the protocol to the Stage-3 change itself. It found and corrected two issues:

- the final minimum invariant did not explicitly identify the **named acceptance boundary**;
- the normative control-placement list prematurely mentioned Agent Skill packaging even though that packaging remains deferred.

The six-condition baseline is therefore the leading D-020 candidate, not yet a frozen universal schema. The remaining Stage-3 obligation is an exact-candidate semantic/challenge review because this change modifies the Playbook's own acceptance/control policy.

Do not add a trigger engine, reviewer framework, Skill, vendor adapter, or generic checker during this stage.

## Stage 4 — Test native enforcement before writing custom code

**Status: after the exact-candidate Stage-3 challenge.**

Exercise the actual surviving obligations on a disposable/scratch repository using native GitHub/CI capabilities first:

- required checks and freshness;
- review/ownership rules where applicable;
- rulesets / protected branches;
- deployment/environment protections where relevant;
- negative cases such as missing checks, changed candidates, weakened policy, forgotten triggered review, unauthorized exceptions, and deployment-dependent completion.

If native mechanisms cover the load-bearing boundary, build no Playbook checker.

If one narrow consequential gap remains, build the smallest repository-specific helper and only generalize it after repeated real demand.

## Stage 5 — Add examples only where use earns them

Examples should be written after the protocol is exercised, not before.

Potential additions, only if they materially improve use:

- one GitHub-native PR/CI acceptance recipe;
- concise conditional independent-review guidance;
- a few trigger examples clearly labeled as examples rather than a universal catalogue;
- a linear-main/research example using exact-candidate review and durable decisions;
- a small optional empirical/probabilistic evidence guide.

A standalone reviewer contract, custom checker, broad trigger catalogue, multiple vendor recipes, or evaluation platform requires additional demonstrated need.

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
