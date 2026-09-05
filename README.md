# Agentic Development Playbook

> A lightweight, harness-independent assurance protocol for turning sufficiently ready software intent into an acceptable change.

[![Release](https://img.shields.io/github/v/release/manjast/agentic-development-playbook?display_name=tag&sort=semver)](https://github.com/manjast/agentic-development-playbook/releases)
[![License](https://img.shields.io/github/license/manjast/agentic-development-playbook)](LICENSE)

> **Redesign branch:** this branch is the September 2026 architecture reset. Stage 1 removes the legacy commit-bookkeeping enforcement, structural template-conformance machinery, and stale artifact lifecycle before the remaining acceptance semantics are finalized.

## What this is becoming

The Playbook focuses on the control boundary between **authorized intent** and an **accepted software change**.

The durable model is intentionally small:

1. **Work contract** — enough authorized intent, scope, constraints, success criteria, and decision context to execute the next bounded change without inventing consequential requirements.
2. **Candidate** — the exact proposed change and relevant target/integration context being evaluated.
3. **Obligations** — baseline and condition-triggered requirements for evidence, judgment, or authority.
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
- the relevant decision authority.

The representation is deliberately not prescribed. A small issue may be enough; consequential work may point to specifications, ADRs, policies, tests, or other maintained sources.

### Accept candidates, not commit bookkeeping

`one task = one commit` is no longer a correctness rule.

Tasks can split or span multiple candidates; candidates can contain multiple commits. What matters is that evidence, review, and acceptance refer to an identifiable proposed change and the context in which it will be incorporated.

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

### Do not overclaim state

These are different claims:

```text
tests passed
!= accepted

accepted for incorporation
!= incorporated

incorporated
!= deployed

deployed
!= confirmed working
```

A project should define the boundary relevant to the promised outcome. The exact general wording for incorporation versus downstream confirmation is still being validated during this redesign.

## Current redesign baseline

Stage 1 has deliberately removed:

- the legacy `enforcement/` stack and scheduled executor;
- the old template-conformance/eval harness and CI badge;
- the mandatory one-task/one-commit rule;
- tracked task→commit completion bookkeeping;
- the mandatory task-card/archive lifecycle;
- the old PoC/eval template suite from the active public surface.

All retired material remains available in Git history.

The active template surface is intentionally small while the protocol is being validated:

- [`templates/AGENTS.md`](templates/AGENTS.md) — concise repository authority, execution, verification, stop, candidate, and acceptance guidance;
- [`templates/CLAUDE.md`](templates/CLAUDE.md) — optional pointer to the canonical `AGENTS.md` policy;
- [`templates/DECISIONS.md`](templates/DECISIONS.md) — durable rationale/ADR example;
- [`templates/TASKS.md`](templates/TASKS.md) — optional in-repo tracker example for projects that do not already have an authoritative work system.

None of these filenames except the repository instruction mechanism should be interpreted as a mandatory storage architecture.

See:

- [`docs/principles.md`](docs/principles.md) — durable redesign principles;
- [`docs/migration.md`](docs/migration.md) — current migration guidance;
- [`ROADMAP.md`](ROADMAP.md) — bounded redesign sequence.

## What remains deliberately unresolved

Before the protocol surface is frozen, the redesign is still testing:

- the real yield and proper scope of independent review;
- which observable change triggers create useful additional obligations without excessive noise;
- the clean general wording for incorporation-only versus runtime-confirmed outcomes;
- how much of the resulting acceptance boundary can be expressed with native GitHub/CI controls before any custom checker is justified.

These questions affect what may be **added** later. They do not justify restoring the retired bookkeeping architecture.

## Repository topology

The public repository is the maintained product.

Private research, confidential examples, and design evidence may live in a separate private incubator, but the public and private repositories should not be maintained as mirrored implementations or synchronized release trains.

## License

Apache-2.0
