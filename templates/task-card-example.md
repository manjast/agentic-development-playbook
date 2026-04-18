# Example Task Card

# Task: T-012 Add health endpoints

Status: ready
Owner: You
Created: 2026-01-26
Last updated: 2026-01-26

Risk: low
Optional policies: not required for this task.

Depends:
- T-008 (DB base + Alembic setup)

Blocks:
- T-020 (reverse proxy config)

## Task validity gate (must be true before starting)
- [x] Goal is specific and user-visible.
- [x] Scope is explicit (allowed/forbidden paths + create/modify/delete/move/rename).
- [x] Acceptance criteria are measurable (3-7 checks).
- [x] Verify commands are executable.

## Goal

Add `/healthz` and `/readyz` to the API with correlation ID propagation.

## Scope

In scope:
- Add the two health endpoints and wire correlation ID propagation.

Out of scope (non-goals):
- No LLM provider checks in `/readyz`.
- No metrics or tracing endpoints.

Allowed paths (edit/create within these only):
- `src/api/**`
- `src/core/**`
- `tests/**`

Forbidden paths (must not touch):
- `src/db/**`
- `<SPEC_ROOT>/**`
- `infra/**`

Create:
- `src/api/routes/health.py`
- `tests/unit/test_health.py`

Modify:
- `src/api/middleware/correlation.py`
- `src/main.py`

Delete:
- none

Move/Rename:
- none

## Acceptance criteria

- [ ] `GET /healthz` returns 200 with `{"status": "ok"}`.
- [ ] `GET /readyz` returns 200 when DB is reachable.
- [ ] `GET /readyz` returns 503 when DB is unreachable.
- [ ] `X-Correlation-Id` returned in responses.

## Verification

- `uv run pytest tests/unit/test_health.py -v` -> 0 failed
- `curl -f http://localhost:8000/healthz` -> 200 + body contains `status`
- `curl -f http://localhost:8000/readyz` -> 200 when DB is up

Expected outputs / artifacts:
- `reports/20260126-T-012-health-endpoints.md` (optional summary)
- Raw outputs/logs/caches -> `runs/<run_id>/` (ignored)

## Context pack (handoff)

- Task card snapshot
- Last command outputs (last 20-50 lines)
- Relevant spec links
- Current branch + commit hash

## References (spec/evidence)

- `<SPEC_ROOT>/architecture.md#health-endpoints`

## Commit message

```text
feat(api): add health endpoints

Task: T-012
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

- If DB check fails, log error and return 503.

---

## After completion (full flow reminder)

1) Run all Verify commands and record the last outputs in the task card's Context pack.
2) Commit once with the predefined message (Task trailer required).
3) Update `TASKS.md` (move to Done + include commit hash).
4) Archive this task card under `tasks/archive/` once Done.
