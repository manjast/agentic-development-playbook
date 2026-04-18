# Worked Example: Spec -> Task -> Verify -> Commit -> TASKS Update

This is a minimal, end-to-end example that shows the execution flow.

## 1) Spec excerpt (source of truth)

<SPEC_ROOT>/architecture.md#health-endpoints

- The API must expose `/healthz` and `/readyz`.
- `/healthz` returns 200 with `{"status": "ok"}`.
- `/readyz` returns 200 when the DB is reachable; 503 otherwise.
- Responses must include `X-Correlation-Id`.

## 2) Task card (tasks/T-012.md)

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
- Add the health endpoints and correlation ID propagation.

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

## Commit message

```text
feat(api): add health endpoints

Task: T-012
```

## References (spec/evidence)

- <SPEC_ROOT>/architecture.md#health-endpoints

Notes:
- If DB check fails, log error and return 503.

## 3) Verification results (example)

```
uv run pytest tests/unit/test_health.py -v
... 0 failed
```

```
curl -f http://localhost:8000/healthz
{"status":"ok"}
```

## 4) Commit message

```
feat(api): add health endpoints

Task: T-012
```

## 5) TASKS.md update (example)

```
- [x] T-012: Add health endpoints (commit: abc1234)
```

## 6) Archive the task card

Move the completed task card to the archive (keep it for history):

```
mv tasks/T-012.md tasks/archive/T-012.md
```
