# Acceptance Protocol

This document defines the Playbook's minimum contract for accepting a software change produced in an agent-assisted workflow.

It describes **assurance semantics**, not a required file layout, agent harness, review product, CI system, merge strategy, or deployment process. A project should use the systems that already own intent, candidate identity, verification, review, permissions, and repository state rather than copying those facts into Playbook-specific ledgers.

The protocol applies to a bounded proposed change from sufficiently ready intent through an authorized acceptance decision, and to truthful completion claims when the promised outcome extends beyond incorporation.

## Core model

The protocol has four concepts:

1. **Work contract** — enough authorized intent and context to make the next bounded change executable and judgeable without inventing consequential requirements.
2. **Candidate** — the identifiable proposed change and the relevant target or integration context in which it is being evaluated.
3. **Obligations** — the evidence, judgment, authority, or downstream confirmation required for that candidate.
4. **Acceptance decision** — an authorized disposition that permits the candidate to cross a named boundary.

The normal flow is:

```text
sufficiently ready intent
        ↓
bounded execution
        ↓
identified candidate
        ↓
applicable obligations
        ↓
evidence / judgment / authority
        ↓
acceptance decision
        ↓
incorporation or other named boundary
        ↓
downstream confirmation, when the promised outcome requires it
```

Evidence and review may accumulate throughout implementation; they are not required to occur as rigid lifecycle stages.

## 1. Start only from sufficiently ready work

Before bounded implementation, the authoritative work context must be sufficient to determine:

- the intended observable outcome;
- the material scope and exclusions of the change;
- how success can be established;
- which sources of intent, constraints, and durable decisions are authoritative;
- whether material unresolved questions or stop conditions remain;
- what execution and acceptance authority is relevant to the work;
- when the promised outcome extends beyond incorporation, what downstream boundary must be established before claiming completion.

The representation is deliberately not prescribed. A small issue may be sufficient. Consequential work may refer to specifications, ADRs, policies, tests, approval records, or other maintained sources.

The Playbook does not require a second work tracker or a Playbook-specific specification when an existing source already supplies the needed authority and context.

If a consequential ambiguity remains, implementation must stop at that ambiguity rather than silently inventing the missing requirement.

## 2. Accept an identified candidate, not bookkeeping

Acceptance applies to the **candidate change**, not to a universal task/commit shape.

The candidate must be identifiable, coherent enough to review as the unit being accepted, and associated with the target or integration context relevant to the acceptance decision. A pull request plus its current revision is a common implementation; an exact commit or range may serve the same role in another workflow.

The Playbook does not require:

- one task to equal one commit;
- one candidate to equal one work item;
- a tracked completion ledger containing Git-derived commit hashes;
- a mandatory task-card or archive transition.

Use Git, pull-request metadata, CI state, and the authoritative work system for facts those systems already own.

If candidate content, material integration context, or authoritative intent/constraints change, any evidence, judgment, or approval that no longer applies must be refreshed before acceptance remains valid.

## 3. Determine obligations for this candidate

Every candidate must satisfy the minimum acceptance invariant defined below. Additional obligations should attach **selectively** from observable change properties, declared impact, governing decisions, project policy, or known failure models.

A trigger attaches an **obligation**, not automatically a reviewer, a universal risk tier, or a new Playbook subsystem. Depending on the project and change, an additional obligation may require:

- a deterministic check;
- stronger compatibility or recovery evidence;
- an impact declaration;
- domain or independent challenge review;
- explicit authority approval;
- deployment or runtime confirmation.

Examples of high-signal mechanical routing include project-recognized dependency manifests, CI/policy controls, deployment configuration, or configured schema/migration locations. These are examples, not a universal path standard.

Semantic impact is often not safely inferable from paths alone. Projects may use small local semantic maps and impact declarations, with reviewer inspection where warranted. The Playbook does not define a universal path catalogue, trigger DSL, fixed trigger count, or global risk taxonomy.

A candidate that changes an acceptance control, verification rule, permission boundary, or policy must not be allowed to make itself acceptable merely by silently lowering the bar that judges it. The changed control needs appropriate validation and authority in its own right.

## 4. Keep verification, review, and acceptance distinct

These are different functions:

- **Verification** establishes facts or evidence under stated conditions.
- **Review** supplies judgment about interpretation, design, consequence, or residual uncertainty.
- **Acceptance** is an authorized decision to cross a named boundary.

A green test suite is evidence. It is not, by itself, authority to merge, release, deploy, or claim success.

A reviewer may discover a problem without having authority to accept the candidate. An authorized decision maker should be able to rely on current mechanical evidence without manually reproducing checks that another trusted boundary already established.

Evidence used for acceptance must be relevant to the candidate and context being accepted. Missing, skipped, stale, superseded, or materially inapplicable evidence must not be represented as passing evidence.

Local verification is valuable feedback. When a project has an authoritative CI, review, or other acceptance boundary, claims that must hold for incorporation should rely on evidence valid at that boundary.

### Independent challenge review

Independent challenge can be a useful conditional obligation when the residual risk is dominated by missing invariants, weak test oracles, semantic or provenance mistakes, or producer self-confirmation.

Its differentiated value is not duplicating CI. Useful properties include fresh context, deriving expectations from authoritative intent rather than producer claims, constructing counterexamples, challenging the existing oracle, and binding the verdict to the candidate actually reviewed.

The Playbook does not require independent review for every candidate, a different model for every review, or one universal reviewer contract. Repeated mechanically decidable escapes should move into deterministic checks when that is inexpensive and reliable.

## 5. Keep execution authority separate from acceptance authority

**Execution authority** governs what an agent may do while producing work. **Acceptance authority** governs who or what policy may incorporate, release, deploy, or otherwise accept the resulting candidate.

These boundaries are not interchangeable.

A later rejection cannot undo a credential disclosure, destructive migration, production write, external message, or other already-executed side effect. Consequential execution permissions therefore belong at the real enforcement boundary: harness sandboxing, IAM, protected environments, resource permissions, or equivalent controls.

The Playbook defines the distinction but does not replace those mechanisms.

Likewise, an actor's technical ability to merge or deploy does not by itself establish that the actor is authorized to make the acceptance decision.

## 6. Stop conditions and exceptions are explicit decisions

Acceptance must stop while a material required obligation is unresolved, required evidence is unavailable or invalid for the candidate, a blocking finding remains open, authoritative intent conflicts, or the decision would cross an authority boundary without permission.

An exception or waiver must not be created implicitly by timeout, absent response, skipped evidence, or the inability to run a required control.

Where a project permits exceptions, the exception itself must be an authorized disposition appropriate to the consequence and must make clear what obligation is being waived or replaced. A waived obligation is not the same as a satisfied obligation. The Playbook does not prescribe a universal waiver form or approval hierarchy.

## 7. Bind the acceptance decision to what it actually authorizes

An acceptance decision is valid only for the candidate, relevant target/integration context, and boundary it addresses.

The decision context must be sufficient to establish:

- which candidate is being accepted;
- which target or integration context is relevant to the decision;
- which boundary the candidate is permitted to cross;
- which obligations were applicable;
- which evidence and any required judgment support the decision;
- who or what authorized policy made the disposition.

This information may already be represented by the pull request, repository rules, check results, review state, issue/spec references, protected environments, or another authoritative system. The protocol does not require duplicating it into a new manifest.

Material change invalidates whatever part of the previous acceptance no longer applies. Do not preserve a stale approval merely because the identifier of the work item stayed the same.

## 8. Do not overclaim completion

Acceptance and completion are not always the same event.

These claims are distinct:

```text
verified
!= accepted for incorporation

accepted for incorporation
!= incorporated

incorporated
!= deployed or released

deployed
!= confirmed in effect
```

The work contract names the terminal outcome boundary relevant to the promise being made.

> **Work is complete when the evidence supports the terminal outcome promised by the work contract. Incorporation may be that boundary for some changes; other changes require deployment, release, or confirmation in effect. Never claim a stronger state than the evidence establishes.**

A library refactor may be complete after incorporation with authoritative verification. A public endpoint is not complete merely because its source file was merged if the promise is that the endpoint is actually available. The Playbook owns this semantic distinction without owning deployment machinery.

## 9. Put controls at the strongest inexpensive boundary

Do not make open-ended reasoning deterministic. Make important boundaries deterministic where a machine can establish them cheaply and reliably.

Typical placement is:

- durable repository guidance → `AGENTS.md` or equivalent;
- reusable procedure → a project or tool-native procedure when that packaging is useful;
- local fast feedback → local checks/hooks;
- candidate facts → CI;
- merge invariants → required checks/rulesets;
- required judgment → review/ownership controls;
- execution permission → harness sandbox/IAM/protected environment;
- consequential external effect → authorization at the resource boundary.

Local hooks may improve feedback but should not be treated as authoritative merely because they run automatically.

Prefer native platform controls over Playbook-specific infrastructure when they establish the same boundary more directly. A custom acceptance checker is not implied by this protocol.

## Minimum acceptance invariant

A candidate may cross an acceptance boundary only when all of the following are true:

1. the work is sufficiently authorized and clear for the bounded change;
2. the candidate, named acceptance boundary, and relevant target/integration context are identifiable;
3. any additional obligations applicable to the candidate have been determined;
4. required evidence and any required judgment are current and adequate for that candidate, context, and boundary;
5. no material blocking finding, stop condition, or unresolved authority problem remains;
6. the disposition is made by an authorized actor or policy.

If the promised outcome extends beyond that acceptance boundary, the work is not complete until evidence establishes the named terminal outcome.

## What this protocol does not require

This protocol does not require a specific:

- issue tracker or specification system;
- `TASKS.md`, task card, status file, or completion ledger;
- commit cardinality or commit-message trailer;
- branch/worktree strategy;
- agent vendor or lifecycle-hook implementation;
- CI provider or review product;
- trigger catalogue or risk-tier taxonomy;
- reviewer model or verdict vocabulary;
- deployment platform;
- universal run manifest;
- custom Playbook checker.

Projects may adopt such mechanisms when they solve a real local problem. They are not acceptance invariants merely because they exist in an example or tool.