# Agent Instructions for <PROJECT_NAME>

## Project
<One sentence describing the project and stack.>

## Source of Truth
- Specs: <SPEC_ROOT> (do not fork)
- Tasks: TASKS.md (or the canonical tracker it points to)
- Decisions: DECISIONS.md
- Questions (optional): `questions-triage.md` (or equivalent unresolved-question backlog)
- Task cards: tasks/
- Archived task cards: tasks/archive/

## Question tracking (optional but recommended for PoCs)
- If present, `questions-triage.md` is the canonical unresolved-question backlog.
- Use it for owner-needed answers, evidence links, and questions that survive across tasks/sessions.
- Do not use it for ordered execution (use `TASKS.md` or the canonical tracker) or for committed decisions (use `DECISIONS.md`).

## Doc precedence (avoid drift) (optional)
- `<SPEC_ROOT>` is the canonical spec source of truth.
- `TASKS.md` (or the canonical tracker it points to) is the canonical backlog/status.
- Any schedule/architecture docs are narrative/intent; avoid restating task scope/acceptance criteria.

Drift rule:
- If a task completion changes scope/timing/assumptions reflected in schedule/architecture docs, update the
  relevant doc(s) in the same commit, or create an explicit follow-up task.

## PoC Mode (Recommended Default)
- Maintain `<SPEC_ROOT>/poc-brief.md` (decision question, metrics, evaluation plan, artifact policy).
- Keep only gate-level unresolved questions in `<SPEC_ROOT>/poc-brief.md`; keep the full working question backlog in `questions-triage.md` when used.
- Treat `reports/` as tracked outputs; keep them small and reviewable.
- Do not commit large/binary/high-churn artifacts (datasets, exports, PDFs, zips, logs).
  Store them in your external system of record and commit human-readable pointers under `artifacts/`.
- Append `templates/gitignore-poc.append.txt` to your project `.gitignore` (or ensure `runs/` and `data/` are ignored).
- Use small task cards with explicit decision questions and reproducible verification for experiment/evaluation work.
- PoC iteration: prefer multiple small experiment task cards; each produces a tracked `reports/` output and references pinned inputs.
- For experiment/review outputs, label whether the result is exploratory or anchor evidence. If an anchor changes, say what it supersedes.

## Context budget (avoid transcript blowups)
- Do not load or paste large raw sources (transcripts, exports, vendor docs) into the agent context.
- If a source is longer than ~200 lines (or not diff-friendly), first create a short digest (1–2 pages) and reference it in task cards.
  - Template: `templates/SOURCE-DIGEST.md`
  - Recommended location: `<SPEC_ROOT>/sources/` (or your spec system)

## Privacy / PII / secrets
- Some raw sources may contain personal data, sensitive details, or secrets.
- Do not copy/paste PII or secrets into digests, reports, or task cards; redact or use pointer-only.
- If a source may contain secrets/PII and is not sanitized, stop and ask before proceeding.

## Before Starting a Task
1) Read `TASKS.md` for current state (or open the canonical tracker it points to).
   - If the canonical tracker is off-repo and not available in this session, ask the human to paste the eligible item into a task card (and/or `STATUS.md`).
2) If the canonical tracker includes `<!-- AGENT_BACKLOG_START -->` / `<!-- AGENT_BACKLOG_END -->`, create task
   cards only from that marker-delimited section.
3) Read the task card.
4) Validate the task card is runnable (Goal/Scope/Acceptance/Verify are filled; Verify commands are executable or have a recorded reason).
5) Load only the relevant spec excerpts and digests.
6) Confirm scope and verification commands.

## While Working
1) Modify only files in scope.
2) No drive-by refactors.
3) Ask if requirements are unclear.
4) Run verification commands frequently (prefer the repo's standard entrypoint, e.g. `./verify` or `make verify`).
   - In Python-first repos: prefer `uv run ...` (avoid bare `python`, `pytest`, `ruff`).
5) Prefer automated verification with expected outputs; manual-only verification
   requires a recorded reason.

## After Completing
1) Run all verification commands.
2) Update the task card context pack with latest verification outputs.
3) Write outputs to the right place:
   - Results summaries / metrics -> `reports/` (tracked)
   - External dataset/doc pointers -> `artifacts/` (tracked)
   - Raw run outputs / logs / caches -> `runs/` (ignored) or `data/` (ignored)
4) Commit with task ID in the message.
5) Update TASKS.md (or canonical tracker) with status and commit hash.
6) If the task answered/created/changed an open question, update `questions-triage.md` (status + evidence link) if your project uses it.
7) Update DECISIONS.md if a real decision was made.
8) Update STATUS.md if your project uses it.
9) Archive the completed task card under `tasks/archive/` (do not delete).

TASKS state rules:
- Ready -> In Progress -> Done
- Ready/In Progress -> Blocked -> Ready
- WIP limit: 1 task per developer (unless explicitly agreed)

Decision threshold:
Only log decisions that change behavior, data model, security boundary, or
operational posture.

Stop conditions (ask the human):
- RLS/policy changes
- Schema changes
- Auth boundary changes
- New dependency additions
- Conflicting specs or unclear requirements
- Need to load large raw sources beyond the context budget (create a digest first)
- Sources may contain secrets/PII and are not sanitized
- Verification harness missing (cannot run Verify commands as written)
- Verification is manual only but no reason is recorded
- Project-specific stop conditions (if applicable): performance-critical paths,
  public API changes.
If a stop condition triggers, add a short note to the task card (reason + 1-2
options) and halt.

Gate usage:
If `GATES.md` exists, run the relevant gate checks before marking a phase complete.

## Optional Policies (Activate by Trigger)
Plan approval:
- Trigger: auth/RLS/schema/infra change, new dependency, or spec conflict.
- Rule: produce a short plan (files, approach, risks) and wait for human LGTM.

Multi-agent split:
- Trigger: >1 risk type, >5 files, or unclear spec interpretation.
- Rule: planner pass first, then implementer, then verifier.

Test-first tasks:
- Trigger: bugfix or behavior change with a clear spec.
- Rule: include a failing test and do not modify tests.

Human review step:
- Trigger: multiple contributors or high-risk task.
- Rule: brief review checklist before merge (use a PR/branch when reviews are expected).

Security scanning:
- Trigger: pre-release or dependency changes.
- Rule: include scan command in Verify if tooling exists.

## Commit Format
Use a conventional subject with a Task trailer:

```
type(scope): short description

Task: T-XXX
```

## Rules
- One task = one commit.
- No commit if verification fails.
- Do not add dependencies without approval.
- If iterative work is needed, use a task branch and squash into one final task
  commit before merging to main.

## Starter prompt (copy/paste)

Use this when asking a coding agent to start executing tasks in a repo using this playbook:

Read `AGENTS.md` first. Use `TASKS.md` as the canonical backlog (or follow it if it is a pointer).
If the canonical tracker includes `<!-- AGENT_BACKLOG_START -->` / `<!-- AGENT_BACKLOG_END -->`, create task
cards only from that marker-delimited section. Create a task card under `tasks/` using `templates/task-card.md`.
Implement one task at a time (WIP=1). Follow the `AGENTS.md`
"After Completing" checklist, including updating the tracker with `commit: <hash>` and archiving the task card
to `tasks/archive/`.
