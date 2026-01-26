# Agentic Development Playbook

Lean, spec-driven, provider-agnostic workflow for AI coding agents; repo is the
source of truth.

This playbook keeps specs as the source of truth, enforces small tasks, and
requires verification before commit. It is intentionally lean and designed to
reduce drift across projects.

Status: v1.0, seeking feedback.

---

## 1) Why this exists

Tool docs explain how to use an agent, not how to structure work. This
playbook provides a lightweight, repeatable workflow so tasks stay scoped,
verifiable, and traceable across tools and sessions.

---

## 2) What this is / what this is NOT

What this is:
- A lightweight, repo-native execution discipline layer for coding agents.
- A set of templates and rules that keep work scoped, verifiable, and reviewable.
- A provider-agnostic layer that complements tool docs and spec frameworks.

What this is NOT:
- A spec generator or requirements tool.
- A CLI or automation framework.
- A multi-agent orchestration system.
- A replacement for BMAD, Spec Kit, OpenSpec, or GSD.

---

## 3) Compared to other approaches

- BMAD: full methodology with roles and ceremony; use it if you want an end-to-end framework. This playbook is the thin execution layer.
- Spec Kit / OpenSpec: focus on spec generation and tooling; this playbook assumes specs exist and focuses on safe execution.
- GSD: minimal / anti-ceremony; this playbook adds repo-native structure.

---

## 4) Principles (non-negotiable)

- Source of truth lives in repo files, not chat history.
- One task = one commit.
- Verification before commit.
- No drive-by refactors.
- Tasks are small and reviewable.
- Fresh context per task.

---

## 5) Inputs and outputs

Inputs (per project):
- Specs location (example: `specs/`, `docs/specs/`)
- Implementation guide or architecture decisions

Outputs (per project):
- `TASKS.md` (backlog and status)
- `DECISIONS.md` (only when real decisions are made)
- `AGENTS.md` (agent rules for any tool)
- `tasks/` (only active task cards)
- Optional: `CLAUDE.md` / `GEMINI.md` (pointers to `AGENTS.md` if the tool expects them)
- Optional: `STATUS.md` (short handoff snapshot)
- Optional: `GATES.md` (phase gate checklists)
- Optional: Context pack (stored in task cards or STATUS.md)

---

## 6) Minimal file layout

Recommended:

```
<repo>/
  <SPEC_ROOT>/           # source of truth (do not fork)
  TASKS.md
  DECISIONS.md
  AGENTS.md
  tasks/                 # active task cards only
  STATUS.md              # optional
```

Avoid `.workflow/` unless you have many contributors or heavy parallel work.
Extra structure increases overhead and drift risk.

Instruction files:
- `AGENTS.md` is canonical.
- If your tool expects a different filename (e.g., `CLAUDE.md`, `GEMINI.md`), keep it as a short pointer to `AGENTS.md`.

Works with (instruction-file aware tools):

| Tool | Instruction file(s) | What to do |
| --- | --- | --- |
| Codex CLI | `AGENTS.md` | Copy `templates/AGENTS.md` to repo root and fill placeholders. |
| OpenCode | `AGENTS.md` | Commit `AGENTS.md` in repo root. |
| Claude Code | `CLAUDE.md` + `AGENTS.md` | Keep `CLAUDE.md` as a short pointer to `AGENTS.md` (template included). |
| Gemini CLI | `GEMINI.md` + `AGENTS.md` | Keep `GEMINI.md` as a short pointer to `AGENTS.md` (template included). |

Verification (official docs, last verified 2026-01-26):
- Codex (`AGENTS.md`): https://developers.openai.com/codex/guides/agents-md
- OpenCode (`AGENTS.md`): https://opencode.ai/docs/rules/
- Claude Code (`CLAUDE.md`): https://claude.com/blog/using-claude-md-files
- Gemini CLI (`GEMINI.md`): https://google-gemini.github.io/gemini-cli/docs/cli/gemini-md.html

---

## 7) How to consume (quick start)

Default (copy templates into your repo):
1) Copy the needed files from `templates/` into your project root.
2) Fill in `AGENTS.md` placeholders and set `<SPEC_ROOT>`.
3) Create `TASKS.md` and `tasks/`.

Optional (git subtree for updates):
- `git subtree add --prefix=playbook https://github.com/manjast/agentic-development-playbook.git main`

---

## 8) Task contract (every task must include)

- Goal (user-visible outcome)
- Scope (files allowed to change)
- Non-goals (explicit exclusions)
- Acceptance criteria (3-7 checks)
- Verification commands (explicit)
- Commit message (predefined)
- References to spec sections
- Dependencies (Depends/Blocks) when applicable
- Risk level (low/medium/high)

Risk level definitions:
- Low: single-file change, no state change, reversible.
- Medium: multi-file or state change, or external integration change.
- High: auth/RLS/schema change, new dependency, infra change.

Examples:
- Low: update a log message or fix a typo in docs.
- Medium: add a new endpoint or change validation logic.
- High: add a migration or modify authentication flow.

---

## 9) Task sizing rules

A task is small enough if:
- Reviewable in under 5 minutes.
- 3-7 acceptance checks.
- Tight file set (typically <10 files).
- One risk type (DB or auth or parsing, not all).

If it fails any rule, split it.
If scope grows mid-task, split it and update the task card(s) before proceeding.

---

## 10) Execution loop (per task)

1) Load task card and relevant spec excerpts only.
2) Confirm scope and approach.
3) Implement within scope.
4) Run verification commands.
5) Commit with task ID.
6) Update `TASKS.md`.
7) Record decisions in `DECISIONS.md` if needed.

Decision threshold:
Only log decisions that change behavior, data model, security boundary, or
operational posture.

Stop conditions (ask the human):
- RLS/policy changes
- Schema changes
- Auth boundary changes
- New dependency additions
- Conflicting specs or unclear requirements
- Verification harness missing (cannot run Verify commands as written)
- Verification is manual only but no reason is recorded
- Project-specific stop conditions (if applicable): performance-critical paths,
  public API changes.
If blocked, mark the task Blocked in `TASKS.md` and record the exact question + next step.
If a spec is wrong or incomplete, update the spec (or log a decision) before continuing.

Active task card rule:
Agents only execute tasks that have an instantiated task card in `tasks/`.
Backlog items in `TASKS.md` are planning only until a task card exists.

Gate usage:
If `GATES.md` exists, run the relevant gate checks before marking a phase complete.

---

## 11) Worked example (end-to-end)

See `examples/worked-example.md` for a full walkthrough:
spec excerpt -> task card -> verify output -> commit -> TASKS.md update.

---

## 12) Verification policy

Every task must include at least one automated test (unit or integration) when
applicable. If automation is not applicable (docs-only, scaffolding, or missing
test harness), record the reason and use manual verification commands.
If verification is unknown upfront, add a provisional command and update the task card once verification is clear.

---

## 13) Optional policies (activate by trigger)

These are optional guardrails. Use them when the trigger applies.

Plan approval:
- Trigger: auth/RLS/schema/infra change, new dependency, or spec conflict.
- Rule: produce a short plan (files, approach, risks) and wait for human LGTM.

Multi-agent split:
- Trigger: >1 risk type, >5 files, or unclear spec interpretation.
- Rule: planner pass first, then implementer, then verifier.

Test-first tasks:
- Trigger: bugfix or behavior change with a clear spec.
- Rule: include a failing test and do not modify the test you're trying to make pass.

Human review step:
- Trigger: multiple contributors or high-risk task.
- Rule: brief review checklist before merge (use a PR/branch when reviews are expected).

Security scanning:
- Trigger: pre-release or dependency changes.
- Rule: include scan command in Verify if tooling exists.

---

## 14) Commit discipline

- One task = one commit.
- No commit if verification fails.
- Commit message uses a conventional subject with a Task trailer.
- If iterative work is needed, use a task branch and squash into one final task
  commit before merging to main.
- If a task commit introduces a regression, revert the commit and open a new
  task.

Example:
```
feat(api): add health endpoints

Task: T-012
```

---

## 15) Multi-tool context transfer protocol

Use this when switching between agents/tools:

1) Commit or stash current work (no half-state).
2) Update `TASKS.md` with status and commit hash.
3) Copy task card plus relevant spec excerpts.
4) Include verification commands and last results.
5) New session reads `TASKS.md` and starts from the task card only.

Light handoff (same tool, no state change): record the last command + output
and the next intended step in the task card context pack.

Context pack contents:
- Task card snapshot
- Last command outputs (last 20-50 lines)
- Relevant spec links
- Current branch + commit hash

---

## 16) QA cadence (lightweight)

Daily:
- Run task verification commands.
- Update `TASKS.md` and commit.
- Note blockers (no scope creep).

Weekly:
- Run full unit + integration suite.
- Run isolation tests if multi-tenant.
- Review logs for PII leakage.
- Verify backup script if modified.

---

## 17) Risk checklists (examples)

These are examples; customize them for your domain and risk profile.

Data isolation (RLS or equivalent):
- Default deny without tenant context.
- Cross-tenant queries return zero rows.
- Connection pool resets do not leak context.

Database migrations:
- Upgrade and downgrade both succeed.
- Rollback returns schema to prior state.

Data ingestion/parsing:
- Use fixtures from known-good files.
- Validate output schema before downstream processing.
- Compare key outputs vs reference runs.

Parser changes:
- Fixture validation required.
- Missing-sheet behavior returns explicit error.

Background jobs/queues:
- Each worker uses a new DB session.
- Worker sets tenant context before queries.
- Saturation returns 503 + Retry-After.

External provider switching:
- Provider selection works via config.
- Timeouts/retries match specs.
- Health checks reflect active provider.
- Model/deployment logged for cost tracking.

---

## 18) When to add .workflow

Consider `.workflow/` only if:
- More than 2 contributors working in parallel.
- Over 30 active tasks with heavy dependencies.
- You need a single, enforced entrypoint for automation.

Tradeoff: more structure reduces ambiguity but increases maintenance and drift.

---

## 19) Bootstrap checklist (new project)

1) Pick `<SPEC_ROOT>` and confirm it is the only source of truth.
2) Verify spec completeness (all referenced sections exist).
3) Copy templates from `templates/`.
4) Fill in `AGENTS.md` placeholders.
5) Create initial tasks in `TASKS.md`.
6) Write task cards only for active work.
7) Run the first task using the execution loop.

---

## 20) Templates included

- `templates/AGENTS.md`
- `templates/CLAUDE.md`
- `templates/GEMINI.md`
- `templates/TASKS.md`
- `templates/DECISIONS.md`
- `templates/GATES.md`
- `templates/task-card.md`
- `templates/task-card-example.md`
- `templates/task-card-example-high-risk.md`
- `templates/STATUS.md` (optional, 5-7 lines max, no task list)

---

## 21) Examples included

- `examples/worked-example.md`

Roadmap: see `ROADMAP.md` for deferred v1.1 items.

Getting help: open an issue on GitHub.
