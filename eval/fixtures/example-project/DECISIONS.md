# Decisions

## D-001: Use Python 3.12 stdlib for the conformance check (2026-06-08)

Question: Which Python version for `eval/check.py`?

Options:
1. Python 3.12 stdlib only (chosen)
2. Python 3.12 + pip dependencies
3. Node.js

Decision: Option 1 — Python 3.12 stdlib only.

Reason: No pip install in CI keeps the Playbook dependency-free for the
end user. The eval is small enough (~600 lines) that stdlib is enough.

Follow-up: None. Re-evaluate if the eval grows past 1000 lines.
