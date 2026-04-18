# Worked Example: Brief PoC / Evaluation Flow

This example shows the light PoC path at a glance.

## 1) Start with a PoC brief

Create `<SPEC_ROOT>/poc-brief.md` to pin:

- the decision question
- the success criteria
- the first gate

Example:

- Decision question: is the first retrieval-first baseline good enough for Gate 1?
- Success criteria: meets the agreed quality threshold without breaking the latency budget

## 2) Track unresolved questions separately

If the PoC has open questions that survive across tasks, use `questions-triage.md`.

Example:

- If latency and quality trade off, which one wins for the first gate?

## 3) Run one bounded task

Create a normal task card that keeps the experiment narrow:

- control path
- one bounded variation
- explicit verification
- clear closeout question

## 4) Write a small report

Use `REPORT.md` to capture:

- the pinned inputs
- the result summary
- the important failure slice
- the recommendation

Example outcome:

- keep the control path as the current anchor
- create one follow-up task for the hard failure slice

## 5) Close the PoC loop

If the gate decision is clear, capture the result in `POC-CLOSURE.md`:

- outcome
- final evidence anchor
- recommended next step

The point of the PoC path is not more process. It is to stop decision-heavy work from drifting into pseudo-production without a clear conclusion.
