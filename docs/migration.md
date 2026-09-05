# Adopting the Playbook into an existing project

The September 2026 redesign removes the old assumption that adoption means copying a fixed set of task, status, gate, and enforcement files.

Adoption now starts by identifying the boundaries the project already has and adding only the missing assurance semantics.

## 1. Name the authoritative work source

Use the system that already owns the intent and work state: a GitHub issue, Spec Kit artifact, Jira/Linear item, `TASKS.md`, or another maintained source.

The next bounded change should expose enough information to determine:

- intended observable outcome;
- material scope and exclusions;
- success / acceptance criteria or other oracle;
- unresolved material questions;
- relevant durable decisions / constraints;
- decision authority that could block the work.

Do not create a second tracker merely to satisfy the Playbook.

## 2. Add concise repository instructions

Use `templates/AGENTS.md` as a starting point, then keep only information that is durable and non-obvious for this repository:

- authority/source precedence;
- important verification entry points;
- execution bounds;
- stop/escalation conditions;
- pointers to authoritative policy and durable decisions.

If a tool expects another instruction filename, use a short pointer where practical rather than duplicating policy.

## 3. Identify the candidate and authoritative verification boundary

Choose how an exact proposed change is identified in this project: usually a pull request and candidate revision, or an exact commit/range for a linear-main workflow.

Use normal local verification for fast feedback. Use the project's authoritative CI/review boundary for evidence that must hold before incorporation.

Do not require one task to equal one commit. Do not copy commit hashes into tracked completion ledgers when Git or the hosting platform already owns that state.

## 4. Separate evidence, judgment, and authority

For the boundary that matters in this project, identify:

- what mechanical evidence must be current for the candidate;
- when additional judgment is required;
- who or what policy has authority to accept the candidate;
- what stronger post-incorporation claim, if any, must be confirmed before the work is considered complete.

The exact reusable trigger catalogue and reviewer-contract guidance are still being validated in this redesign. Do not invent a large local policy matrix just to match a future Playbook shape.

## Existing project artifacts

These may remain useful when they contain unique information:

- `DECISIONS.md` or ADRs for rationale not recoverable from the diff;
- `TASKS.md` for repositories that genuinely need an in-repo work tracker;
- project-specific quality/acceptance policy where it encodes real failure history;
- evaluation provenance when the deliverable is an empirical/probabilistic result rather than ordinary software behavior.

They are not universally mandatory.

## Retired adoption machinery

The redesign no longer recommends installing the legacy `enforcement/` stack, post-commit completion bookkeeping, verifier/executor, or the old template-conformance harness.

Those implementations remain available in Git history for provenance. They should not be copied into new projects.

## Current limitation

This migration page deliberately describes only the high-confidence redesign direction. The final public acceptance baseline, reusable trigger examples, reviewer-contract treatment, and native GitHub/CI example will be added only after their bounded falsification work is complete.
