# Example Task Card

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

---

## After completion (full flow reminder)

1) Run all Verify commands and record the last outputs in the task card's Context pack.
2) Commit once with the predefined message (Task trailer required).
3) Update `TASKS.md` (move to Done + include commit hash).
4) Remove this task card from `tasks/` once Done (keep only active tasks there).
