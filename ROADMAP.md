# Roadmap

The core change-acceptance protocol is defined and maintained. Add guidance only when real use demonstrates a recurring gap that the protocol and existing project systems do not already explain clearly.

## Current direction

Improve clarity at the boundaries where projects accept changes. Recurring adoption questions include:

- representing missing or never-run required evidence clearly;
- refreshing evidence and judgment when the relevant integration context changes;
- validating and authorizing changes to controls used to judge a candidate;
- making exception or bypass authority explicit;
- confirming deployment-dependent promises.

Projects remain responsible for validating their own controls. These questions do not imply a new Playbook checker or deployment tool.

## Possible additions

Future guidance should address demonstrated needs, such as:

- a compact example mapping the protocol to existing repository controls;
- examples of when independent review adds useful judgment;
- a few examples of changes that call for additional obligations;
- examples distinguishing incorporation, release, deployment, and confirmation in effect;
- guidance on evidence for empirical or probabilistic results where ordinary software verification is insufficient.

These are possible documentation additions, not new adoption requirements or a commitment to build separate systems. Any addition should remain subordinate to [`ACCEPTANCE.md`](ACCEPTANCE.md) and avoid duplicating authoritative state owned by another system.

## Non-goals

There is no current plan to build:

- a universal agent harness or lifecycle abstraction;
- agent orchestration, task claiming, leases, or memory infrastructure;
- a telemetry or trace-normalization platform;
- a specification-generation workflow;
- a generic ruleset manager or Playbook acceptance checker;
- a permanent benchmark or evaluation platform;
- broad vendor-specific recipe collections or a standalone reviewer framework.

Keep the maintained surface small. Add a mechanism only when it solves a demonstrated problem.

## Historical redesign context

v2 replaced the v1 enforcement and bookkeeping adoption model with the maintained change-acceptance protocol. [`ACCEPTANCE.md`](ACCEPTANCE.md) is the normative source. See [`docs/migration.md`](docs/migration.md) for the retired mechanisms and guidance on retaining useful project-specific controls. Historical implementations remain available through Git history and v1 releases.
