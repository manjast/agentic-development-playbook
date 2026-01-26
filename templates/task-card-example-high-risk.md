# Example Task Card (High Risk)

# Task: T-045 Add provider integration with timeouts/retries

Goal:
Implement a provider integration with spec-defined timeouts and retry policy.

Risk: high
Optional policies: plan approval, multi-agent split, test-first, human review.

Depends:
- T-026 (LLM provider interface)

Blocks:
- T-041 (LLM error mapping)

Scope:
- Allowed paths: `src/services/llm/**`, `tests/**`, `docs/**`
- Forbidden paths: `src/db/**`, `<SPEC_ROOT>/**`, `infra/**`
- Create: `src/services/llm/provider_x.py`, `tests/unit/test_llm_provider_x.py`
- Modify: `src/services/llm/__init__.py`, `src/core/config.py`

Non-goals:
- No prompt changes.
- No endpoint changes.

Acceptance:
- [ ] Provider uses deployment + endpoint config from env.
- [ ] Timeouts: connect=30s, read=300s.
- [ ] Retries: max 2, transient only, 270s guard.
- [ ] LLM response includes tokens in/out + deployment.

Verify:
- `pytest tests/unit/test_llm_provider_x.py -v` -> 0 failed
- `python -c "from src.services.llm.provider_x import ProviderXClient; print('OK')"` -> OK

Context pack (handoff):
- Task card snapshot
- Last command outputs (last 20-50 lines)
- Relevant spec links
- Current branch + commit hash

Commit:
- feat(llm): add provider integration with timeouts
  Task: T-045

References:
- <SPEC_ROOT>/architecture.md#llm-timeouts-retries

Notes:
- Include reasoned plan approval before coding.

---

## After completion (full flow reminder)

Because this task is high risk, confirm the trigger policies in `AGENTS.md` were applied (plan approval, review step, extra verification).

Then:
1) Run all Verify commands and capture outputs in the Context pack.
2) Commit once (Task trailer required).
3) Update `TASKS.md` (Done + commit hash).
4) Remove this task card from `tasks/` once Done.
