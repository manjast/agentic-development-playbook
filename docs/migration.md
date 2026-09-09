# Adopting the Playbook into an existing project

Adoption starts with one real change and the systems the project already uses. You do not need to install software, copy a template, or create a Playbook-specific tracker before the protocol can be useful.

Read [`../ACCEPTANCE.md`](../ACCEPTANCE.md) alongside an identifiable candidate and ask where the authoritative intent, evidence, judgment, policy, authority, and promised completion boundary already live.

## 1. Start with the authoritative work source

Use the system that already owns the intent and work state: an issue, specification, Jira/Linear item, `TASKS.md`, or another maintained source.

The next bounded change should expose enough information to determine:

- the intended observable outcome;
- material scope and exclusions;
- how success can be established;
- relevant authoritative constraints and durable decisions;
- consequential unresolved questions or stop conditions;
- the authority relevant to execution and acceptance;
- when the promise extends beyond incorporation, the downstream outcome that must be established before calling the work complete.

Do not create a second tracker or specification merely to satisfy the Playbook.

## 2. Identify the candidate and boundary

Choose how the proposed change is identified in this project: commonly a pull request and current revision, or an exact commit/range in another workflow.

Also identify the boundary the decision addresses: merge, release, deployment, or another project-defined transition.

Use normal local verification for fast feedback. For claims that must hold at incorporation or another authoritative boundary, rely on evidence valid for the candidate and context at that boundary.

The Playbook does not require one task to equal one commit or Git-derived hashes to be copied into tracked completion ledgers.

## 3. Inspect evidence, judgment, obligations, and authority

For the candidate and boundary under consideration, determine where the project already establishes:

- mechanical evidence relevant to the candidate;
- any additional obligations triggered by the change or project policy;
- judgment that cannot be reduced safely to mechanical checks;
- execution permissions governing what an agent or other actor may do while producing the work;
- acceptance authority governing who or what policy may permit the change to cross the boundary.

Additional obligations should be selective. Project-recognized dependency manifests, CI or policy controls, deployment configuration, migration/schema locations, declared impact, architecture decisions, and known failure models may all be useful sources. They are examples, not a universal trigger catalogue.

Independent challenge review can be useful when residual uncertainty is dominated by missing invariants, weak test oracles, semantic or provenance mistakes, or producer self-confirmation. It is not required for every candidate.

If the candidate changes a control used to judge it, such as a test workflow, permission boundary, or acceptance policy, validate and authorize that control change appropriately rather than allowing the candidate to lower its own bar silently.

## 4. Refresh only what stopped applying

Candidate content, integration context, or authoritative intent can change during implementation and review.

Do not assume every change invalidates every prior result. Re-evaluate the evidence, judgment, or approval whose applicability was materially affected, and refresh what no longer supports the candidate and context being accepted.

Likewise, missing, skipped, stale, superseded, or materially inapplicable evidence should not be represented as passing evidence.

## 5. Name the completion boundary truthfully

Acceptance and completion are not always the same event.

```text
accepted for incorporation
!= incorporated

incorporated
!= deployed or released

deployed
!= confirmed in effect
```

The work contract should make clear which terminal outcome the promise actually requires. Claim only the strongest state for which current evidence exists.

## Add repository guidance only when it earns its place

An instruction file such as `AGENTS.md` helps when recurring agent work needs durable, non-obvious guidance about authoritative sources, verification entry points, execution limits, stop conditions, or escalation.

If that need exists, adapt [`../templates/AGENTS.md`](../templates/AGENTS.md) or improve the project's existing repository instructions. If another tool expects a different filename, prefer a short pointer where practical rather than duplicating policy.

No Playbook-specific instruction file is necessary when the project's existing work system, repository guidance, checks, review policy, permissions, and deployment evidence already express the needed semantics.

Other optional artifacts may still be useful when they contain unique information:

- `DECISIONS.md` or ADRs for rationale not recoverable from the diff;
- `TASKS.md` for repositories that genuinely need an in-repo work tracker;
- project-specific quality or acceptance policy grounded in real constraints or failure history;
- records of where evaluation inputs and results came from and how results were produced, when the deliverable is an empirical or probabilistic result rather than ordinary software behavior.

## Migrating from v1

v2 retires the Playbook's old enforcement and bookkeeping adoption model. New projects should not install the legacy `enforcement/` stack, post-commit completion bookkeeping, verifier/executor, structural conformance harness, or one-task-one-commit/task→commit ledger as Playbook requirements.

For an existing v1 adoption, retire dependencies on those mechanisms deliberately. Do **not** delete useful tests, review rules, decision history, permissions, or project-specific controls merely because the Playbook no longer supplies or requires the old machinery. First determine which local property each integration protects, then keep, replace, or remove it on its own merits.

Historical implementations remain available through Git history and v1 releases.

## Current scope

The maintained adoption surface is intentionally narrow. The Playbook does not currently supply a universal GitHub configuration, broad trigger catalogue, standalone reviewer framework, multi-vendor recipe set, or generic acceptance checker.

Add platform-specific guidance only when repeated real use demonstrates a concrete need that existing systems and the normative protocol do not already explain clearly.