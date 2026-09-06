# Agentic Development Playbook

> A lightweight, harness-independent assurance protocol for turning sufficiently ready software intent into an acceptable change.

[![Release](https://img.shields.io/github/v/release/manjast/agentic-development-playbook?display_name=tag&sort=semver)](https://github.com/manjast/agentic-development-playbook/releases)
[![License](https://img.shields.io/github/license/manjast/agentic-development-playbook)](LICENSE)

> **Redesign branch:** the subtractive baseline and first acceptance-protocol dogfood/challenge pass are complete. The next stage tests whether native GitHub/CI controls can express the surviving obligations before any custom enforcement is considered.

## What this is becoming

The Playbook focuses on the control boundary between **authorized intent** and an **accepted software change**.

[`ACCEPTANCE.md`](ACCEPTANCE.md) is the normative protocol. Its model is intentionally small:

1. **Work contract** — enough authorized intent and context to execute and judge the next bounded change.
2. **Candidate** — the identifiable proposed change and relevant target/integration context.
3. **Obligations** — required evidence, judgment, authority, or downstream confirmation.
4. **Acceptance decision** — an authorized disposition permitting the candidate to cross a named boundary.

The protocol distinguishes verification, review, acceptance, execution authority, acceptance authority, and truthful terminal-outcome claims. It also defines how candidate/context changes affect evidence freshness and why additional obligations should be routed selectively rather than through a universal risk taxonomy.

For the actual requirements, read [`ACCEPTANCE.md`](ACCEPTANCE.md). This README intentionally does not restate the full protocol.

## What this is not

- A discovery, requirements, or specification-generation methodology
- An agent harness or cross-vendor hook abstraction
- A task scheduler, agent orchestrator, or memory system
- A CI, code-review, merge, deployment, or observability platform
- A universal telemetry or benchmark service

Upstream tools such as issue trackers and specification systems may supply the work contract. Coding harnesses produce candidates. CI and repository rules establish mechanical facts and merge policy. Review systems provide judgment. Sandboxes, IAM, protected environments, and resource controls constrain execution authority.

The Playbook should not duplicate those systems.

## Design principles

The redesign keeps a few durable principles around the normative protocol:

- preserve authority instead of duplicating state;
- accept identifiable candidates rather than enforcing task/commit cardinality;
- treat evidence, judgment, and authority as different things;
- enforce consequential invariants at the strongest inexpensive boundary available;
- use baseline assurance plus selectively triggered obligations;
- keep execution authority distinct from acceptance authority;
- never claim a stronger completion state than the evidence establishes;
- add custom machinery only after a recurring material gap is demonstrated.

See [`docs/principles.md`](docs/principles.md) for the rationale behind these choices.

## Current public surface

The active surface is intentionally small:

- [`ACCEPTANCE.md`](ACCEPTANCE.md) — normative change-acceptance protocol;
- [`templates/AGENTS.md`](templates/AGENTS.md) — concise repository-specific authority, execution, evidence, stop, and completion guidance;
- [`templates/CLAUDE.md`](templates/CLAUDE.md) — optional pointer to canonical `AGENTS.md` policy;
- [`templates/DECISIONS.md`](templates/DECISIONS.md) — simple durable-decision/ADR example;
- [`templates/TASKS.md`](templates/TASKS.md) — optional in-repo tracker for projects without an authoritative external work system.

These filenames are examples of representation, not a mandatory storage architecture.

The completed subtractive stage removed the legacy enforcement/verifier/executor stack, structural conformance harness, mandatory one-task/one-commit rule, tracked task→commit bookkeeping, mandatory task-card/archive lifecycle, and the old PoC/eval template suite from the active public surface. Retired material remains available in Git history.

## Where the redesign stands

Bounded research and dogfooding have already shaped the protocol:

- independent challenge is useful conditionally for missing invariants, weak oracles, semantic/provenance mistakes, and producer self-confirmation;
- high-signal mechanical trigger routing is useful, while semantic consequences need project-specific knowledge and impact/reviewer fallback;
- the work contract names the terminal outcome boundary, so incorporation is sufficient for some work while other work needs deployment/release/confirmation evidence;
- the first protocol dogfood found a missing named acceptance boundary and a premature packaging reference;
- the exact-candidate consistency challenge then removed duplicated baseline wording and bound acceptance explicitly to candidate + context + boundary.

The six-condition minimum invariant in [`ACCEPTANCE.md`](ACCEPTANCE.md) is now the leading baseline for the next test. The next question is implementation, not another architecture rewrite: can native repository/CI/review/environment controls express it without a generic Playbook checker?

See [`ROADMAP.md`](ROADMAP.md) for the current sequence and [`docs/migration.md`](docs/migration.md) for adoption guidance.

## Repository topology

The public repository is the maintained product.

Private research, confidential examples, falsification results, and design evidence may live in a separate private incubator, but the public and private repositories should not be maintained as mirrored implementations or synchronized release trains.

## License

Apache-2.0
