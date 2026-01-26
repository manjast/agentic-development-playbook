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

Goal:
Add `/healthz` and `/readyz` to the API with correlation ID propagation.

Risk: low
Optional policies: not required for this task.

Depends:
- T-008 (DB base + Alembic setup)

Blocks:
- T-020 (reverse proxy config)

Scope:
- Allowed paths: `src/api/**`, `src/core/**`, `tests/**`
- Forbidden paths: `src/db/**`, `<SPEC_ROOT>/**`, `infra/**`
- Create: `src/api/routes/health.py`, `tests/unit/test_health.py`
- Modify: `src/api/middleware/correlation.py`, `src/main.py`

Non-goals:
- No LLM provider checks in `/readyz`.
- No metrics or tracing endpoints.

Acceptance:
- [ ] `GET /healthz` returns 200 with `{"status": "ok"}`.
- [ ] `GET /readyz` returns 200 when DB is reachable.
- [ ] `GET /readyz` returns 503 when DB is unreachable.
- [ ] `X-Correlation-Id` returned in responses.

Verify:
- `pytest tests/unit/test_health.py -v` -> 0 failed
- `curl -f http://localhost:8000/healthz` -> 200 + body contains `status`
- `curl -f http://localhost:8000/readyz` -> 200 when DB is up

Context pack (handoff):
- Task card snapshot
- Last command outputs (last 20-50 lines)
- Relevant spec links
- Current branch + commit hash

Commit:
- feat(api): add health endpoints
  Task: T-012

References:
- <SPEC_ROOT>/architecture.md#health-endpoints

Notes:
- If DB check fails, log error and return 503.

## 3) Verification results (example)

```
pytest tests/unit/test_health.py -v
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
