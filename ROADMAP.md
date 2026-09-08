# Roadmap

The core change-acceptance protocol is defined and maintained. The roadmap is intentionally conservative: add public surface only when real use demonstrates a recurring comprehension or control gap that the existing protocol and project-native systems do not already cover.

## Current direction

### Exercise the protocol at real project boundaries

Use the protocol against actual pull requests, releases, deployments, and other acceptance boundaries. The purpose is to discover where the semantics are unclear or where existing platform controls are insufficient—not to manufacture examples or infrastructure in advance.

Questions worth continuing to test include:

- how projects represent missing or never-run required evidence without ambiguity;
- when integration-context movement requires evidence or judgment to be refreshed;
- how control-changing candidates are reviewed when the control itself affects acceptance;
- how exception or bypass authority is represented explicitly;
- how deployment-dependent promises are confirmed without turning the Playbook into deployment tooling.

These are platform/composition questions around the maintained protocol, not evidence that the protocol needs a generic checker.

### Improve guidance only where repeated use earns it

Potential additions are intentionally conditional:

- a compact platform-native example if readers repeatedly struggle to map the protocol onto existing repository controls;
- concise guidance for conditional independent challenge review if recurring use shows a stable pattern worth documenting;
- a small set of trigger examples if they clarify selective obligations without becoming a universal catalogue;
- additional terminal-outcome examples where merge/release/deployment distinctions remain a recurring source of confusion;
- empirical/probabilistic evidence guidance if real adopters need a pattern beyond ordinary software verification.

Any such addition should solve an observed problem, remain subordinate to `ACCEPTANCE.md`, and avoid duplicating authoritative state owned by another system.

### Keep the maintained surface small

There is no current plan to build:

- a universal harness lifecycle abstraction;
- agent orchestration, task claiming, leases, or memory infrastructure;
- a telemetry or trace-normalization platform;
- a new specification-generation workflow;
- a generic ruleset manager;
- a generic Playbook acceptance checker;
- a permanent benchmark/evaluation platform;
- a mirrored public/private release train;
- broad vendor-specific recipe collections.

The default response to uncertainty about a new subsystem remains: **do not build it yet**.

## Historical redesign context

The current protocol emerged from a September 2026 scope correction. This history explains why the maintained product is smaller than the v1 line; it is not the current product roadmap.

### Stage 1 — establish a truthful baseline — complete

The legacy commit-bookkeeping enforcement stack, verifier/executor workflow, structural conformance harness, one-task-one-commit requirement, tracked task→commit completion semantics, mandatory task-card/archive lifecycle, and old PoC/eval template suite were retired from the maintained surface.

### Stage 2 — resolve the semantic model — complete

The redesign established candidate-centered acceptance, selective obligations, conditional independent challenge, explicit execution/acceptance authority, and outcome-dependent completion without creating separate subsystems for each concern.

### Stage 3 — publish the maintained acceptance contract — complete

[`ACCEPTANCE.md`](ACCEPTANCE.md) became the normative source for work readiness, candidate/context identity, selective obligations, evidence and judgment, execution/acceptance authority, stop/exception semantics, and truthful completion claims.

### Stage 4 — test native enforcement/composition — ongoing and non-blocking

Bounded platform work supports a composition of candidate-bound evidence, effective native policy, and protected authority boundaries. Remaining questions are configuration-sensitive cases such as integration freshness, control-changing paths, missing required evidence, and explicit bypass authority.

No result so far justifies a generic Playbook acceptance checker. Prefer existing evidence or deliberately disposable test environments; do not weaken production controls to complete platform research.

### Stage 5 — add examples only where use earns them — ongoing policy

Examples and platform guidance should follow demonstrated need. A standalone reviewer contract, custom checker, broad trigger catalogue, or multi-vendor recipe set requires stronger evidence than the repository currently has.
