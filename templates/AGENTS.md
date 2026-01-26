# Agent Instructions for <PROJECT_NAME>

## Project
<One sentence describing the project and stack.>

## Source of Truth
- Specs: <SPEC_ROOT> (do not fork)
- Tasks: TASKS.md
- Decisions: DECISIONS.md
- Task cards: tasks/

## Before Starting a Task
1) Read TASKS.md for current state.
2) Read the task card.
3) Load only the relevant spec excerpts.
4) Confirm scope and verification commands.

## While Working
1) Modify only files in scope.
2) No drive-by refactors.
3) Ask if requirements are unclear.
4) Run verification commands frequently.
5) Prefer automated verification with expected outputs; manual-only verification
   requires a recorded reason.

## After Completing
1) Run all verification commands.
2) Update the task card context pack with latest verification outputs.
3) Commit with task ID in the message.
4) Update TASKS.md with status and commit hash.
5) Update DECISIONS.md if a real decision was made.
6) Update STATUS.md if your project uses it.

TASKS state rules:
- Ready -> In Progress -> Done
- Ready/In Progress -> Blocked -> Ready
- WIP limit: 1 task per developer (unless explicitly agreed)

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
If a stop condition triggers, add a short note to the task card (reason + 1-2
options) and halt.

Gate usage:
If `GATES.md` exists, run the relevant gate checks before marking a phase complete.

## Optional Policies (Activate by Trigger)
Plan approval:
- Trigger: auth/RLS/schema/infra change, new dependency, or spec conflict.
- Rule: produce a short plan (files, approach, risks) and wait for human LGTM.

Multi-agent split:
- Trigger: >1 risk type, >5 files, or unclear spec interpretation.
- Rule: planner pass first, then implementer, then verifier.

Test-first tasks:
- Trigger: bugfix or behavior change with a clear spec.
- Rule: include a failing test and do not modify tests.

Human review step:
- Trigger: multiple contributors or high-risk task.
- Rule: brief review checklist before merge (use a PR/branch when reviews are expected).

Security scanning:
- Trigger: pre-release or dependency changes.
- Rule: include scan command in Verify if tooling exists.

## Commit Format
Use a conventional subject with a Task trailer:

```
type(scope): short description

Task: T-XXX
```

## Rules
- One task = one commit.
- No commit if verification fails.
- Do not add dependencies without approval.
- If iterative work is needed, use a task branch and squash into one final task
  commit before merging to main.
