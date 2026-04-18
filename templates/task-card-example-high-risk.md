# Example Task Card (High Risk)

# Task: T-045 Add provider integration with timeouts/retries

Status: ready
Owner: You
Created: 2026-01-26
Last updated: 2026-01-26

Risk: high
Optional policies: plan approval, multi-agent split, test-first, human review.

Depends:
- T-026 (LLM provider interface)

Blocks:
- T-041 (LLM error mapping)

## Task validity gate (must be true before starting)
- [x] Goal is specific and user-visible.
- [x] Scope is explicit (allowed/forbidden paths + create/modify/delete/move/rename).
- [x] Acceptance criteria are measurable (3-7 checks).
- [x] Verify commands are executable.

## Goal

Implement a provider integration with spec-defined timeouts and retry policy.

## Scope

In scope:
- Add the provider client, configuration wiring, and unit coverage.

Out of scope (non-goals):
- No prompt changes.
- No endpoint changes.

Allowed paths (edit/create within these only):
- `src/services/llm/**`
- `tests/**`
- `docs/**`

Forbidden paths (must not touch):
- `src/db/**`
- `<SPEC_ROOT>/**`
- `infra/**`

Create:
- `src/services/llm/provider_x.py`
- `tests/unit/test_llm_provider_x.py`

Modify:
- `src/services/llm/__init__.py`
- `src/core/config.py`

Delete:
- none

Move/Rename:
- none

## Acceptance criteria

- [ ] Provider uses deployment + endpoint config from env.
- [ ] Timeouts: connect=30s, read=300s.
- [ ] Retries: max 2, transient only, 270s guard.
- [ ] LLM response includes tokens in/out + deployment.

## Verification

- `uv run pytest tests/unit/test_llm_provider_x.py -v` -> 0 failed
- `uv run python -c "from src.services.llm.provider_x import ProviderXClient; print('OK')"` -> OK

Expected outputs / artifacts:
- `reports/20260126-T-045-provider-integration.md` (optional summary)
- Raw outputs/logs/caches -> `runs/<run_id>/` (ignored)

## Context pack (handoff)

- Task card snapshot
- Last command outputs (last 20-50 lines)
- Relevant spec links
- Current branch + commit hash

## References (spec/evidence)

- `<SPEC_ROOT>/architecture.md#llm-timeouts-retries`

## Commit message

```text
feat(llm): add provider integration with timeouts

Task: T-045
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

- Include reasoned plan approval before coding.

---

## After completion (full flow reminder)

Because this task is high risk, confirm the trigger policies in `AGENTS.md` were applied (plan approval, review step, extra verification).

Then:
1) Run all Verify commands and capture outputs in the Context pack.
2) Commit once (Task trailer required).
3) Update `TASKS.md` (Done + commit hash).
4) Archive this task card under `tasks/archive/` once Done.
