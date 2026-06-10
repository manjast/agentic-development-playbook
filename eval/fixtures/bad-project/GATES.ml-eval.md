# ML Eval Gate (bad fixture — only 5 of 7 sub-checks)

Decision question:
- Is the bad run OK?

Required checks:
- [ ] Metric definitions are explicit and tied to dataset pointer IDs + versions.
- [ ] Baseline/challenger comparison is reported (absolute + delta values).
- [ ] Run manifest is present and complete (`task_id`, `commit`, `run_id`, pinned inputs, seed policy, variance notes).
- [ ] Top failure modes are documented with concrete examples.
- [ ] Runtime and cost results are reported and within stated ceilings.

Verify:
- `python eval/check.py` -> exit 0

Decision:
- Hold
- Reason: Missing 2 sub-checks.
- Follow-up task(s): add the missing sub-checks
