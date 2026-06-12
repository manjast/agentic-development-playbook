# Adopting the Playbook into an existing project

> A short orientation page for the reader who has a 2-year-old codebase and wants a consistent operating shape for repo-level work.
>
> See [`docs/rationale.md`](rationale.md) for the philosophy, [`docs/principles.md`](principles.md) for the 3 design principles, and [`README.md`](../README.md) "Quick start" for the templates overview.

## What this is

A 4-step adoption path for an existing project. Two common cases (Python project with a `pyproject.toml` and a `README.md`; research / notebook / DS-style project), and an honest fallback for projects that fit neither.

## What this is not

- A tutorial or a methodology framework.
- A CLI or an automation tool.
- A per-tool guide (Claude Code / Cursor / Codex / Gemini CLI). The Playbook is tool-agnostic; the `AGENTS.md` template is the canonical instruction file. For tools expecting a different filename, keep a 1-line pointer to `AGENTS.md` (the public repo's `CLAUDE.md` is one such example).
- A real evaluation. The Playbook is a conformance check (structural lint), not an outcome eval. See `docs/rationale.md` for why outcome-based is out of scope.
- A wrapper for an existing test suite. The conformance check is a standalone script (`python eval/check.py`); integrating it into a test suite is the user's job.

---

## Common case: Python project with a `pyproject.toml` and a `README.md`

Four steps. The conformance check at the end of each step is the feedback signal.

### Step 1: Pick the 7 core templates

From `templates/`, copy into the project root:

- `AGENTS.md` (canonical instruction file)
- `CLAUDE.md` only if the project uses Claude Code; otherwise skip
- `TASKS.md` (in progress / ready / blocked / done)
- `DECISIONS.md` (append-only `D-NNN` entries: question, options, decision, follow-up)
- `STATUS.md` (Date + Tracker + one-line current state)
- `GATES.md` only if the project uses gates; otherwise skip
- `task-card.md` (small reviewable unit of work; "In scope" / "Out of scope" sub-bullets)

Minimum layout:

```text
<repo>/
  AGENTS.md
  TASKS.md
  DECISIONS.md
  tasks/
```

### Step 2: Fill the 3 required templates

- `AGENTS.md`: set the spec root, the tool filename (if not `AGENTS.md`), and the project's "rules" (the template ships with default rules; edit them).
- `TASKS.md`: start with a single task card. The template's 4 sections (In Progress, Ready, Blocked, Done) are the operating shape.
- `DECISIONS.md`: one entry per decision the project has made (the 3 design decisions, the tooling choices, etc.). Append-only.

### Step 3: Run the conformance check

```bash
python eval/check.py
```

The check verifies every template's structural integrity (required fields, required sections, required patterns). At this point, expect failures on `task-card.md` (not yet used) and possibly on `AGENTS.md` (the spec-root placeholder). Each failure is a checklist item, not a "wrong answer."

Re-run after each edit. The check is fast (<5 sec on stdlib Python 3.12 or 3.13) and has no dependencies.

### Step 4: Add templates one at a time

For each new template:

1. Copy from `templates/`.
2. Fill the required fields.
3. Re-run `python eval/check.py`.
4. Address any failures.

End state: `python eval/check.py` reports 17/17 PASS. The number 17 reflects the public's template discipline (15 templates + 2 promoted eval-meta files) and is not a target for the adopting project; the project's own template count drives its own check result.

---

## Secondary case: research / notebook / DS-style project

Four steps. The PoC/eval templates and the eval-meta files are the focus.

### Step 1: Pick the PoC / evaluation templates

From `templates/`, copy into the project root:

- `POC-BRIEF.md` (decision question, metrics, evaluation plan, artifact policy)
- `POC-CLOSURE.md` (close-out; the equivalent of a "definition of done" for a PoC)
- `REPORT.md` (the report format that supports a gate decision)
- `SOURCE-DIGEST.md` (smaller-than-raw source digests)
- `questions-triage.md` (when the project has enough open questions to warrant a separate tracker)
- `gitignore-poc.append.txt` (recommended gitignore additions for the PoC local artifacts)

Plus the 2 eval-meta files (structurally enforced by the conformance check):

- `GATES.ml-eval.md` (ML-eval decision gate with 7 sub-checks)
- `run-manifest.json` (run reproducibility schema)

### Step 2: Set up `artifacts/`

The PoC/eval templates reference tracked pointer files under `artifacts/`. The pattern is human-readable pointers, not the raw artifacts (datasets, exports, PDFs, zips, logs). The public's `POC-BRIEF.md` template's "Artifact policy" section and the `AGENTS.md` rule on not committing large artifacts are the source of truth.

### Step 3: Set up `GATES.ml-eval.md`

The ML-eval gate is a `GATES.ml-eval.md` file with 7 required sub-checks (each a markdown checkbox). The check verifies the 7 sub-checks are present; it does not verify the content. The 7 sub-checks are listed in the public `GATES.ml-eval.md` template.

### Step 4: Run the conformance check

```bash
python eval/check.py --self-test
```

The `--self-test` flag runs the check against `eval/fixtures/bad-project/`, a fixture with 9 deliberately broken files (4 presence breaks + 4 type breaks + 1 enum break). The self-test asserts that all 9 breaks are caught. If any break slips through, the self-test exits non-zero, meaning the check has a gap. This is a sanity check on the check itself, not on the project.

Then run the check without `--self-test` to verify the project's own state.

---

## If neither case fits

File a GitHub issue at `manjast/agentic-development-playbook/issues` with:

- The project shape (language, framework, size, what "repo-level work" looks like in the project).
- The templates already tried.
- The conformance-check output if `python eval/check.py` has been run.

The Playbook is intentionally narrower than a full public methodology stack. Projects that don't fit either of the two cases above are most often upstream of where the Playbook starts (requirements shaping, discovery, broad methodology design); solve that first.
