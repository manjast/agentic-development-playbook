# Task: T-001 RAG-readiness scoring

## Task validity gate
- [x] Goal is one measurable outcome
- [x] Scope has explicit In/Out boundaries
- [x] Acceptance criteria are checkable

## Goal
Produce a RAG-readiness score (0-100) for a sample corpus.

## Scope
In scope:
- Sample corpus of 50 documents
- 5 RAG-readiness heuristics
- Single-pass scoring with deterministic seed

Out of scope (non-goals):
- Multi-corpus generalization
- Real-time inference
- LLM API calls

## Acceptance criteria
- Score for each document is between 0 and 100
- Run manifest is complete (task_id, commit, run_id, pinned inputs, seed)
- Conformance check passes

## Verification
- `python eval/check.py --repo-root eval/fixtures/example-project` -> exit 0

## Context pack (handoff)
- See `run-manifest.json` for inputs, environment, budget

## References (spec/evidence)
- `../templates/GATES.ml-eval.md` for the gate structure

## Commit message
`feat(eval): add example-project fixture for conformance check (T-001)`
