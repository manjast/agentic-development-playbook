# Principles

The Agentic Development Playbook is built on three principles that guide
what this document includes, what it excludes, and how the surface evolves.

## 1. The repo is the source of truth

Every decision, status update, and run record lives in a versioned file.
This is non-negotiable. If a decision isn't in `DECISIONS.md`, it didn't
happen. If a run isn't in `run-manifest.json`, it didn't get reviewed.
The repo outlives the agent's context window, the agent's session, and
the agent's provider.

## 2. Conformance over outcome

The Playbook verifies that artifacts **adhere to the spec** (a structural
check), not that they **produce good outcomes** (a behavioral eval). The
reason isn't that outcomes don't matter — they do. The reason is that
outcome evals for AI-assisted work require infrastructure that doesn't
exist yet (reproducible agent harness, golden test set, scoring function,
baseline). See `docs/rationale.md` for the full discussion.

When the infrastructure exists, the Playbook adds outcome checks.
Until then, "this looks like itself" is the best the check can do
automatically. "This is good" is a human judgment, made at the
GATES.md decision point.

## 3. Lean is a discipline, not a posture

15 templates (13 user-facing + 2 eval-meta) is selective on purpose.
Every template that ships in the public repo costs the next maintainer
time to keep consistent. The discipline is: a template earns its slot
by being used in real work, not by being clever. The conformance check
enforces the discipline: adding a template requires updating
`TEMPLATE_REQUIRED_FIELDS` and passing the check.

