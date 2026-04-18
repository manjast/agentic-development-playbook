# Agentic Development Playbook

[![Release](https://img.shields.io/github/v/release/manjast/agentic-development-playbook?display_name=tag&sort=semver)](https://github.com/manjast/agentic-development-playbook/releases)
[![License](https://img.shields.io/github/license/manjast/agentic-development-playbook)](LICENSE)

Lean, repo-native execution discipline for AI implementation work that needs scoped tasks, verification, and a clean PoC/evaluation path.

**Maintained and intentionally selective.**

Tool docs explain how to use an agent. They do not tell you how to keep implementation work scoped, reviewable, and verifiable once the repo becomes the source of truth.

This playbook is a lean execution-discipline layer for that stage of work. It keeps tasks small, verification explicit, and handoffs cleaner across sessions and tools. It also includes a light PoC/evaluation path for work that needs decision-grade evidence before production hardening.

---

## What this is

- A repo-native execution discipline for implementation work that needs clear scope, explicit verification, and reviewable task boundaries
- A set of templates for teams or solo builders who want a consistent operating shape once work becomes repo-level
- A light PoC/evaluation path for work that needs evidence, reports, and closure before hardening further
- A provider-agnostic setup built around `AGENTS.md` as the canonical instruction file

## What this is not

- A requirements or spec-generation system
- A CLI or automation framework
- A multi-agent orchestration product
- A full public methodology stack covering every upstream and downstream phase

---

## Core path

Use the core path when specs or architecture decisions already exist and the main need is disciplined implementation.

Core artifacts:

- `AGENTS.md`
- `TASKS.md`
- `DECISIONS.md`
- `task-card.md`
- `GATES.md` (optional)
- `STATUS.md` (optional)

Core rules:

- repo files are the source of truth
- one task = one commit
- verification before commit
- no drive-by refactors
- keep tasks small and reviewable

---

## PoC / evaluation path

Use the PoC path when the first phase needs decision-grade evidence rather than a production-ready finish.

The public first pass includes templates for:

- `POC-BRIEF.md`
- `POC-CLOSURE.md`
- `REPORT.md`
- `SOURCE-DIGEST.md`
- `questions-triage.md`

This path is useful when you need to:

- make the decision question explicit before implementation expands
- keep source digests smaller than raw inputs
- write reports that can support a gate decision
- close a PoC cleanly instead of letting it drift into pseudo-production

---

## Quick start

1. Copy the core templates from `templates/` into your repo.
2. Fill in `AGENTS.md` and set your spec root.
3. Create `TASKS.md` and your first task card.
4. If the work is still decision-heavy, add the PoC/evaluation templates as needed.

Recommended minimum layout:

```text
<repo>/
  <SPEC_ROOT>/
  AGENTS.md
  TASKS.md
  DECISIONS.md
  tasks/
```

If your tool expects a different instruction filename, keep it as a short pointer to `AGENTS.md`:

- `CLAUDE.md`
- `GEMINI.md`

---

## Principles

- Source of truth lives in repo files, not chat history.
- One task = one commit.
- Verification before commit.
- No drive-by refactors.
- Tasks are small and reviewable.
- Fresh context per task.
- Curate context: prefer digests over long raw sources.

---

## Task contract

Every task should define:

- a user-visible goal
- a tight scope
- explicit non-goals
- acceptance criteria
- verification commands
- a predefined commit message
- references to the relevant spec or architecture context

If the task grows beyond a small, reviewable unit, split it.

---

## Verification policy

Every task should include at least one verification path.

- Prefer automated checks when they exist.
- If automation is not applicable, record why and use a manual verification path explicitly.
- If verification is still unknown at task creation time, add a provisional path and tighten it before completion.

---

## Templates included

### Core

- `AGENTS.md`
- `CLAUDE.md`
- `GEMINI.md`
- `TASKS.md`
- `DECISIONS.md`
- `STATUS.md`
- `GATES.md`
- `task-card.md`
- `task-card-example.md`
- `task-card-example-high-risk.md`

### PoC / evaluation

- `POC-BRIEF.md`
- `POC-CLOSURE.md`
- `REPORT.md`
- `SOURCE-DIGEST.md`
- `questions-triage.md`
- `gitignore-poc.append.txt`

---

## Example

See `examples/worked-example.md` for a simple end-to-end example of the core task flow.

For a short PoC/evaluation-oriented flow, see `examples/worked-example-poc.md`.

---

## Where this fits

This repo assumes specs or architecture decisions already exist and focuses on making implementation legible and verifiable.

If your bigger problem is still upstream discovery, requirements shaping, or broad methodology design, solve that first. This playbook is intentionally narrower than that.

---

## Contributing

Contributions should keep the repo lean, clear, and provider-agnostic.

- Open an issue for non-trivial changes.
- If you change a rule, update the README and relevant templates.
- If you change a template field, update the examples.
- Prefer clarity over expansion.

---

## License

Apache-2.0
