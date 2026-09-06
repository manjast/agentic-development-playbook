# Principles

The Agentic Development Playbook is being redesigned around a small number of durable assurance principles.

## 1. Preserve authority, not duplicate state

Use the system that already owns a fact.

Git owns commit history. The repository host owns pull-request and check state. A tracker/specification system may own work intent. Runtime platforms own sandbox and permission enforcement.

Store information in the Playbook only when it is not already authoritative elsewhere or when a durable rationale must survive the original session.

## 2. Bind assurance to the candidate

Evidence and approval must refer to the actual proposed change and the context in which it will be accepted.

Tasks and commits are useful organizational units, but neither is a universal acceptance identity. Candidate content or material integration-context changes invalidate whatever evidence or approval no longer applies.

## 3. Evidence is not authority

Verification establishes facts. Review supplies judgment. Acceptance grants permission to cross a named boundary.

A passing test, successful agent review, or structurally valid artifact can be valuable evidence without being sufficient authority to merge, release, deploy, or claim success.

## 4. Make important boundaries deterministic where practical

Do not attempt to make open-ended reasoning deterministic. Make consequential boundaries deterministic when a machine can establish them cheaply and reliably.

Use local checks for feedback, CI for candidate facts, rulesets for merge invariants, review requirements for judgment routing, and sandbox/IAM/resource controls for execution authority.

The old enforcement stack failed because it mechanized derived task bookkeeping rather than the acceptance properties that mattered.

## 5. Start with just enough readiness

The Playbook does not own a complete specification methodology. It does require enough authorized intent to make the next bounded change executable and judgeable without inventing consequential requirements.

If that condition is not met, the correct behavior is to stop and resolve the missing intent rather than create more downstream process.

## 6. Add controls from failure models, and remove controls that stop earning their cost

A control should have a concrete reason, an owner, an enforcement location, and a condition for reconsideration.

Controls may be justified by local incidents, external incidents, threat models, architecture invariants, regulation, or high-consequence exposure. Rarely firing catastrophic controls should not be removed merely because they are rare.

At the same time, rules should not accumulate permanently just because they once sounded prudent. Prefer the smallest control that addresses the failure model and periodically challenge its attention/maintenance cost.

## 7. Delegate commodity infrastructure

The Playbook should specify assurance semantics, not reproduce the rapidly changing implementation surfaces of coding harnesses, CI systems, review agents, repository hosts, deployment systems, or observability platforms.

Harness independence should come from a narrow semantic contract, not from a universal adapter layer.
