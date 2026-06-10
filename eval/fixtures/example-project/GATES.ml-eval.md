# ML Eval Gate: T-001 RAG-readiness scoring (sample fixture)

Decision question:
- Is the RAG-readiness scoring approach fit for the v1 pilot?

Required checks:
- [x] Metric definitions are explicit and tied to dataset pointer IDs + versions.
- [x] Baseline/challenger comparison is reported (absolute + delta values).
- [x] Run manifest is present and complete (`task_id`, `commit`, `run_id`, pinned inputs, seed policy, variance notes).
- [x] Variance/confidence is reported (multi-seed or equivalent rationale).
- [x] Top failure modes are documented with concrete examples.
- [x] Runtime and cost results are reported and within stated ceilings.
- [x] Leakage/contamination checks are documented (or explicit N/A reason is recorded).

Verify:
- `python eval/check.py --repo-root eval/fixtures/example-project` -> all PASS

Decision:
- Pass
- Reason: All sub-checks satisfied in the sample fixture.
- Follow-up task(s): none
