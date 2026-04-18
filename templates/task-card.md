# Task: T-XXX <short title>

Status: draft | ready | in_progress | blocked | done
Owner:
Created: YYYY-MM-DD
Last updated: YYYY-MM-DD

Risk: low | medium | high
Optional policies: apply when risk is high or triggers in AGENTS.md apply

Depends:
Blocks:

## Task validity gate (must be true before starting)
- [ ] Goal is specific and user-visible.
- [ ] Scope is explicit (allowed/forbidden paths + create/modify/delete/move/rename).
- [ ] Acceptance criteria are measurable (3-7 checks).
- [ ] Verify commands are executable (or a reason is recorded).

## Goal

What user-visible outcome will exist when this task is done?

## Scope

In scope:
- ...

Out of scope (non-goals):
- ...

Allowed paths (edit/create within these only):
- ...

Forbidden paths (must not touch):
- ...

Create:
- ...

Modify:
- ...

Delete:
- ...

Move/Rename:
- ...

## Acceptance criteria

- [ ] ...
- [ ] ...
- [ ] ...

## Verification

Commands:
- `...` -> ...

Expected outputs / artifacts:
- `reports/...` (tracked, human-readable)
- `artifacts/...` (tracked pointer files)
- Raw outputs/logs/caches -> `runs/<run_id>/` (ignored) or `data/` (ignored)

## Context pack (handoff)

- Task card snapshot
- Last verification command outputs (last 20-50 lines)
- Relevant spec links / source digests
- Current branch + commit hash

## References (spec/evidence)

- `<SPEC_ROOT>/...`
- Open questions impacted (optional): `questions-triage.md` (Q-XXX)

## Commit message

```text
type(scope): short description

Task: T-XXX
```

## Completion checklist (quick)

- [ ] Run verification commands
- [ ] Update this card's context pack (if helpful)
- [ ] Write outputs (`reports/`, `artifacts/` as applicable; keep `runs/`/`data/` untracked)
- [ ] Commit
- [ ] Update `TASKS.md` (or canonical tracker) with status and `commit: <hash>`
- [ ] Update `questions-triage.md` / `DECISIONS.md` / `STATUS.md` only if applicable
- [ ] Archive this card under `tasks/archive/`

## Notes
