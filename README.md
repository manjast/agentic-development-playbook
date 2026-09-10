# Agentic Development Playbook

> A small **software change-acceptance protocol** for agent-assisted development.

[![License](https://img.shields.io/github/license/manjast/agentic-development-playbook)](LICENSE)

A pull request can have passing checks and an approval, then change before merge. Some of that evidence and judgment may still apply; some may need to be refreshed. Before that exact revision crosses a boundary such as merge, release, or deployment, the project still needs to know what this change requires and who or what policy is authorized to accept it.

**Acceptance** here means an authorized decision permitting an identified change to cross a named boundary. The protocol describes what must be established around that decision; it does not execute the decision or replace the controls that enforce it.

The Agentic Development Playbook is a small written protocol for making that decision explicit while using the systems a project already has: its work or specification source, Git, CI, review, permissions, and release or deployment controls. It requires no new tool or mandatory file layout.

Start with [`ACCEPTANCE.md`](ACCEPTANCE.md) beside one real change. If the project's existing workflow already satisfies the protocol, useful adoption may require adding nothing.

## Where the distinction matters

Suppose an amendment changes a test, workflow, policy, or permission boundary used to judge the pull request. The new result can still be useful evidence, but the change to the control also needs appropriate validation and authority. The revised change should not become acceptable merely by silently lowering the bar used to judge it.

The protocol does not say to reset every check or approval after every edit. It asks whether the evidence, judgment, and authority being relied on still apply to the exact revision and target context that will actually cross the boundary.

## See it in practice

**Green deployment, missing endpoint.** In a real change, build, artifact upload, and deployment all succeeded while the promised public result was still missing. [Read the worked example](docs/adoption.md#worked-example-green-deployment-missing-endpoint) to see how that changes merge, publication, and completion decisions.

## Core model

The protocol uses four concepts:

1. **Work contract** — the authoritative description of what this change is supposed to achieve and the constraints that matter.
2. **Candidate** — the proposed revision and the target or integration conditions in which it is being judged.
3. **Obligations** — the checks, judgment, permissions or approvals, and any downstream confirmation required for this particular change.
4. **Acceptance decision** — the authorized decision allowing that candidate to cross a named boundary.

The normative requirements live in [`ACCEPTANCE.md`](ACCEPTANCE.md). This README is orientation, not a second copy of the acceptance invariant.

## Use the systems that already own the facts

The mapping below is illustrative. It shows where the relevant information and controls may already live.

| Playbook concern | Typical existing source or control |
|---|---|
| Work intent / work contract | Issue, specification, or maintained work system |
| Candidate + relevant context | PR revision, exact commit/range, target or integration context |
| Applicable obligations | Project policy, declared impact, maintained constraints |
| Verification evidence | Tests, CI, and other authoritative check results |
| Required judgment | Review and domain-owner assessment |
| Execution authority | Agent permissions, sandbox, IAM, resource controls |
| Acceptance decision / authority | Authorized actor or effective project/platform policy |
| Downstream confirmation, when promised | Release, deployment, or application-specific runtime evidence |

A platform feature can represent or enforce part of this model without establishing the whole protocol by itself. Technical permission may implement an authority decision, for example, but permission alone does not establish what that actor or policy is authorized to accept.

## Try it on one change

The smallest useful adoption is an examination of a real candidate, not installation.

1. Read [`ACCEPTANCE.md`](ACCEPTANCE.md) alongside an existing pull request, commit/range, or other identifiable proposed change.
2. Locate what the change is supposed to achieve, what it requires, the evidence and judgment that support it, who or what policy can accept it, and the outcome that must exist before the work is complete.
3. If a meaningful gap exists, improve the system that owns that fact or control rather than copying the same state into a Playbook ledger.
4. Add durable repository guidance or one of the optional templates only when it solves a recurring, non-obvious need.

A useful first result may be a concrete gap, or confirmation that the existing arrangement already expresses the required semantics. This exercise is adoption guidance, not a condensed pass/fail checklist.

For the worked example, fuller adoption guidance, and the v1 transition, see [`docs/adoption.md`](docs/adoption.md).

## What this is not

The Playbook is not:

- a discovery, requirements, or specification-generation methodology;
- an agent harness, orchestration framework, task scheduler, or memory system;
- a CI, code-review, merge, deployment, or observability platform;
- a universal risk taxonomy, trigger catalogue, or reviewer hierarchy;
- a generic acceptance checker or replacement for native repository and permission controls.

The protocol should compose with those systems, not duplicate their authoritative state or rapidly changing implementation surfaces.

## Maintained surface

The repository is intentionally small:

- [`ACCEPTANCE.md`](ACCEPTANCE.md) — normative protocol;
- [`docs/adoption.md`](docs/adoption.md) — worked example, adoption guidance, and the v1 transition;
- [`docs/principles.md`](docs/principles.md) — rationale for the durable design principles;
- [`templates/AGENTS.md`](templates/AGENTS.md) — optional repository-specific agent guidance;
- [`templates/CLAUDE.md`](templates/CLAUDE.md) — optional pointer to canonical repository guidance;
- [`templates/DECISIONS.md`](templates/DECISIONS.md) — optional durable-decision/ADR example;
- [`templates/TASKS.md`](templates/TASKS.md) — optional in-repo tracker for projects without an authoritative external work system;
- [`ROADMAP.md`](ROADMAP.md) — current direction and historical redesign context.

## Maturity

The core protocol is defined and maintained. Platform-specific guidance remains intentionally limited and will expand only where real use justifies it.

Projects remain responsible for validating how their own work systems, repository controls, review policy, permissions, and deployment boundaries implement the protocol in their context.

## History and contribution

The v2 line replaces the v1 enforcement/bookkeeping adoption model with the maintained change-acceptance protocol. Existing v1 tags and releases remain available as history; see [Releases](https://github.com/manjast/agentic-development-playbook/releases) and [`docs/adoption.md`](docs/adoption.md) for the transition.

Contributions should keep the surface lean and preserve the distinction between evidence, judgment, and acceptance authority. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

Maintained by [Stefan Manja](https://github.com/manjast).

## License

Apache-2.0. See [`LICENSE`](LICENSE).
