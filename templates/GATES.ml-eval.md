# ML Eval Gate: <Phase or Milestone>

Decision question:
- <what decision is made if this gate passes?>

Required checks:
- [ ] Metric definitions are explicit and tied to dataset pointer IDs + versions.
- [ ] Baseline/challenger comparison is reported (absolute + delta values).
- [ ] Run manifest is present and complete (`task_id`, `commit`, `run_id`, pinned inputs, seed policy, variance notes).
- [ ] Variance/confidence is reported (multi-seed or equivalent rationale).
- [ ] Top failure modes are documented with concrete examples.
- [ ] Runtime and cost results are reported and within stated ceilings.
- [ ] Leakage/contamination checks are documented (or explicit N/A reason is recorded).

Verify:
- <command> -> generates `reports/...` + `reports/...run-manifest.json`
- <command> -> validates required report/manifest keys (optional)

Decision:
- Pass | Hold | Fail
- Reason:
- Follow-up task(s):
