# Agentic Development Playbook

> A lightweight, harness-independent assurance protocol for turning sufficiently ready software intent into an acceptable change.

[![Release](https://img.shields.io/github/v/release/manjast/agentic-development-playbook?display_name=tag&sort=semver)](https://github.com/manjast/agentic-development-playbook/releases)
[![License](https://img.shields.io/github/license/manjast/agentic-development-playbook)](LICENSE)

> **Redesign branch:** the subtractive/truthfulness baseline is complete and the first normative [`ACCEPTANCE.md`](ACCEPTANCE.md) has been dogfooded once. The next step is an exact-candidate challenge review, followed by native-platform sufficiency testing before any custom enforcement is considered.

## What this is becoming

The Playbook focuses on the control boundary between **authorized intent** and an **accepted software change**.

The normative protocol is [`ACCEPTANCE.md`](ACCEPTANCE.md). Its durable model is intentionally small:

1. **Work contract** — enough authorized intent, scope, constraints, success criteria, and decision context to execute the next bounded change without inventing consequential requirements.
2. **Candidate** — the exact proposed change and relevant target/integration context being evaluated.
3. **Obligations** — baseline and condition-triggered requirements for evidence, judgment, authority, or downstream confirmation.
4. **Acceptance decision** — an authorized disposition that permits the candidate to cross a named boundary.

The Playbook defines these semantics. Existing tools should implement them wherever they already provide the stronger boundary.

## What this is not

- A discovery, requirements, or specification-generation methodology
- An agent harness or cross-vendor hook abstraction
- A task scheduler, agent orchestrator, or memory system
- A CI, code-review, merge, deployment, or observability platform
- A universal telemetry or benchmark service

Upstream tools such as issue trackers and specification systems may provide the work contract. Coding harnesses produce candidates. CI and repository rulesets establish mechanical facts and merge policy. Review systems provide judgment. Runtime sandboxes and IAM constrain execution authority. The Playbook should not duplicate those systems.

## Core principles

### Start with minimum readiness

Before bounded implementation, the next change needs enough clarity to identify:

- the intended observable outcome;
- material scope and exclusions;
- how success can be established;
- the authoritative intent/constraint sources;
- unresolved material questions and stop conditions;
- the relevant execution and acceptance authority;
- the terminal outcome boundary when the promised result extends beyond incorporation.

The representation is deliberately not prescribed. A small issue may be enough; consequential work may point to specifications, ADRs, policies, tests, or other maintained sources.

### Accept candidates, not commit bookkeeping

`one task = one commit` is no longer a correctness rule.

Tasks can split or span multiple candidates; candidates can contain multiple commits. What matters is that evidence, review, and acceptance refer to an identifiable proposed change, the named acceptance boundary, and the context in which it will be accepted.

Do not copy Git-derived commit hashes into tracked completion ledgers as a required source of truth.

### Evidence, judgment, and authority are different

- **Verification** establishes facts or evidence under stated conditions.
- **Review** produces judgment about interpretation, design, consequence, or residual uncertainty.
- **Acceptance** is an authorized decision to cross a named boundary.

Passing tests is useful evidence. It is not, by itself, authority to ship.

### Use deterministic controls at the right boundary

The redesign does **not** reject deterministic enforcement. It rejects enforcing low-value derived bookkeeping.

Use the strongest inexpensive boundary available:

- standing repository guidance → `AGENTS.md`;
- local fast feedback → local checks/hooks;
- candidate correctness → CI;
- merge invariants → repository rulesets / required checks;
- required judgment → review/ownership controls;
- execution permissions → harness sandbox / IAM / protected environments;
- consequential external effects → authorization at the resource boundary.

Local hooks may improve ergonomics but are not an authoritative acceptance boundary.

### Route extra obligations selectively

Bounded historical replay supports deterministic routing for high-signal mechanical classes such as dependency manifests, CI/policy files, deployment configuration, and explicitly configured migration/schema locations.

Do not assume a universal path catalogue can identify all semantic privacy, authorization, API, or other consequential changes. Where paths are insufficient, combine small project-specific maps with impact declaration and reviewer inspection.

A trigger attaches an **obligation**. It does not automatically imply a reviewer, a universal risk tier, or a new Playbook subsystem.

### Use independent challenge where it earns its cost

Independent review can add value when residual risk is dominated by missing invariants, weak test oracles, semantic/privacy/provenance mistakes, or producer self-confirmation.

Its differentiated role is challenge and oracle discovery, not manual duplication of CI. Fresh context, independent derivation, adversarial counterexamples, and exact-candidate binding are useful properties. Repeated mechanically decidable escapes should move into deterministic checks when inexpensive.

This does not make independent review mandatory for every candidate or require a different model universally.

### Do not overclaim state

These are different claims:

```text
tests passed
!= accepted

accepted for incorporation
!= incorporated

incorporated
!= deployed or released

deployed or released
!= confirmed in effect
```

The work contract names the terminal outcome boundary. Work is complete when evidence establishes that promised outcome. For some changes incorporation is enough; for others deployment, release, or confirmation in effect is part of the promise.

Never claim a stronger state than the evidence establishes.

## Current redesign baseline

The completed subtractive stage removed:

- the legacy `enforcement/` stack and scheduled executor;
- the old template-conformance/eval harness and CI badge;
- the mandatory one-task/one-commit rule;
- tracked task→commit completion bookkeeping;
- the mandatory task-card/archive lifecycle;
- the old PoC/eval template suite from the active public surface.

All retired material remains available in Git history.

The active public surface is intentionally small:

- [`ACCEPTANCE.md`](ACCEPTANCE.md) — normative change-acceptance protocol;
- [`templates/AGENTS.md`](templates/AGENTS.md) — concise repository authority, execution, evidence, stop, candidate, and acceptance guidance;
- [`templates/CLAUDE.md`](templates/CLAUDE.md) — optional pointer to the canonical `AGENTS.md` policy;
- [`templates/DECISIONS.md`](templates/DECISIONS.md) — durable rationale/ADR example;
- [`templates/TASKS.md`](templates/TASKS.md) — optional in-repo tracker example for projects that do not already have an authoritative work system.

None of these filenames except the repository instruction mechanism should be interpreted as a mandatory storage architecture.

See:

- [`docs/principles.md`](docs/principles.md) — durable redesign principles;
- [`docs/migration.md`](docs/migration.md) — current migration guidance;
- [`ROADMAP.md`](ROADMAP.md) — current redesign sequence.

## Where the redesign currently stands

Private falsification work has produced decision-useful results for independent-review yield, trigger routing architecture, and terminal outcome semantics. Those results are reflected in the public protocol.

The first dogfood pass on `ACCEPTANCE.md` found a real omission in the minimum invariant—the named acceptance boundary—and removed a premature packaging reference. The six-condition baseline is now the leading D-020 candidate, but it is not yet treated as a frozen universal schema.

Because this candidate changes the Playbook's own acceptance/control policy, the next obligation is an exact-candidate challenge/consistency review. After that, the principal remaining enforcement question is whether native GitHub/CI/ruleset/environment mechanisms can express the surviving obligations without a generic Playbook checker.

Native controls are tested first; custom code remains presumptively unnecessary unless a material recurring gap is demonstrated.

## Repository topology

The public repository is the maintained product.

Private research, confidential examples, and design evidence may live in a separate private incubator, but the public and private repositories should not be maintained as mirrored implementations or synchronized release trains.

## License

Apache-2.0
