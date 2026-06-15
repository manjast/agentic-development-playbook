# Drift Verifier

Observability layer of the local enforcement stack. Reads
`tasks/done/DONE.md`, `TASKS.md`, and the git log, and detects
inconsistencies between them. The verification is split into two
distinct sub-tasks:

- **Detection** (deterministic): the algorithm in
  `verifier-core.ts` cross-references the three sources and
  produces a structured `DriftReport`. No LLM involved.
- **Report formatting** (optional LLM): the structured report
  is rendered to markdown. The LLM-formatted path uses an
  opencode subagent; the no-LLM path uses a POSIX sh template
  renderer (`drift-report.md.sh`).

The detection is the canonical source of truth. The LLM is a
*report formatter*, not the analyst.

## Compatibility

The verifier's deterministic algorithm and POSIX sh fallback work
on any platform with Node.js 20+ and POSIX sh. The opencode
subagent and trigger plugin are opencode-specific.

| Agent | Verifier works? | Notes |
|-------|-----------------|-------|
| opencode | Yes (full) | Subagent + trigger + sh fallback all work |
| Claude Code | Algorithm yes; subagent and trigger no | Per-agent port needed (separate workstream) |
| Codex CLI | Algorithm yes; subagent and trigger no | Per-agent port needed (separate workstream) |
| Any agent with git + Node.js + cron | Algorithm + sh fallback yes | Use the executor (a separate component) for cron/CI |

The LLM-formatted report path requires opencode. The no-LLM path
(`run-verifier.sh --no-llm`) is universal.

## Drift categories (4)

For each drift item, the report includes a 1-line action
recommendation.

### 1. Missing archive

A commit exists in the git log but has no record in `DONE.md`.
Suspected cause: `git commit --no-verify` bypassed the
post-commit hook, the opencode plugin failed to load, or the
commit predates the discipline's adoption. Action:
`git commit --amend --no-edit && lefthook run post-commit` to
re-fire the post-commit hook.

### 2. Missing hash

A `T-XXX` task is marked done in `TASKS.md` but the
corresponding line in `DONE.md` is missing or the
`(commit: ...)` suffix in `TASKS.md` is absent. Suspected
cause: `TASKS.md` was updated manually without committing, or
the post-commit hook was bypassed. Action: verify the commit
exists, add the hash to `DONE.md` and `TASKS.md`.

### 3. Multiple trailers

A commit message has multiple `Task: T-XXX` trailers in the
body. The discipline allows one per commit. Suspected cause:
`git commit --amend` with a pre-existing trailer, or a scripted
commit that did not strip the previous trailer. Action:
`git commit --amend` to keep only one trailer.

### 4. No trailer

A commit message has no `Task: T-XXX` trailer in the body. The
commit-msg hook should have rejected this commit; if it was
bypassed via `--no-verify` or the hook was not installed, the
verifier flags it. Action: `git commit --amend` to add a
trailer, or `git rebase` to fix the commit in history (if not
yet pushed).

## Architecture: detection vs formatting

The verifier's design separates the two sub-tasks:

1. **Detection** (in `verifier-core.ts`): a deterministic
   algorithm that cross-references `DONE.md`, `TASKS.md`, and
   the git log. Produces a structured `DriftReport` JSON object
   conforming to `drift.schema.json`. No LLM.
2. **Report formatting**: the structured `DriftReport` is
   rendered to markdown. Two paths:
   - **LLM-formatted** (default, opencode only): an opencode
     subagent (`.opencode/agents/verifier.md`) reads the
     algorithm's output and writes a human-readable report.
   - **No-LLM** (universal): `drift-report.md.sh` (a POSIX sh
     template renderer) reads the JSON from stdin and writes
     markdown to stdout. Deterministic, fast, no LLM cost.

The deterministic algorithm is the source of truth. Even if
the LLM mis-formats the report, the underlying detection is
correct. The LLM is a presentation layer, not a logic layer.

## Model selection

The verifier subagent inherits the opencode default model
unless overridden. The LLM is a report formatter; the
deterministic detection is in `verifier-core.ts` (no LLM).

To use a specific model, add `model: <name>` to the frontmatter
of the verifier subagent. Common model choices for the
verifier's report-formatting task:

- `anthropic/claude-haiku-4-5` — small, fast
- `minimax/MiniMax-M3` — cheap, available on MiniMax API and
  token plans; often stronger than Haiku for the same cost
- `openai/gpt-4o-mini` — small, available on OpenAI
- `github-copilot/gpt-4o-mini` — available on GitHub Copilot
- Whatever your opencode Zen plan provides

Note: `temperature: 0` is not set in the frontmatter by
default because (a) some providers ignore the parameter
(reasoning models, opencode Zen routing), (b) some models
clamp it (OpenAI's `o1` family restricts to 1), and (c) the
verifier's LLM is a report formatter whose output variance is
low regardless of temperature. Override `temperature:` in the
frontmatter if you need to pin it.

The conformance test (`eval/test-verifier.test.ts`) verifies
the detection algorithm in isolation; it does not depend on
any LLM model. The LLM-formatted report path is verified
manually in a real opencode session.

## Installation

The verifier is installed via `bootstrap.sh`. Requires
`opencode` on PATH (for the LLM-formatted path) and `git` on
PATH (for both paths). The no-LLM path additionally requires
`tsx` (Node.js 20+ TypeScript runner).

```sh
sh /path/to/enforcement/verifier/bootstrap.sh
```

The bootstrap copies 3 files to the consumer repo:

- `.opencode/agents/verifier.md` (the subagent)
- `.opencode/plugins/verifier-trigger.ts` (the trigger)
- `scripts/run-verifier.sh` (the POSIX sh fallback)

The bootstrap also updates the consumer's `opencode.json` to
add the verifier's required `git rev-list` and `git rev-parse`
permissions (if `jq` is installed and `opencode.json` exists).

## Conformance test

The 12-case conformance test verifies the detection algorithm.
It uses `node:test` (Node 20+) and runs without opencode
installed. Cases cover the 4 drift categories, the missing-
archive scenarios, the no-trailer cases, the missing-input
cases, the cross-format compatibility (hook + plugin hashes
coexist), and the no-LLM JSON pipeline.

```sh
npx tsx enforcement/eval/test-verifier.test.ts
```

12/12 PASS expected. The cases are:

1. Clean session: 0 drift
2. Missing archive: 1 commit not in DONE.md
3. Missing hash: task marked done in TASKS.md without suffix
4. Multiple trailers: 1 commit with 2 trailers
5. No trailer: 1 commit with no trailer
6. DONE.md missing: 0 drift, warning
7. TASKS.md missing: 0 drift, warning
8. Git log empty: 0 drift, no-commits note
9. Stale archive: phantom hash in DONE.md
10. Large report: 50 commits, 50 drift items, no truncation
11. Cross-format: hook-format (40-char) + plugin-format (7-char)
    hashes coexist
12. No-LLM path: JSON output is valid and matches the schema

## The no-LLM path

The no-LLM path runs the deterministic algorithm and renders
the report without invoking an LLM. It is the default for
cron/CI use because:

- **Cost**: zero LLM cost per run
- **Speed**: no LLM latency; runs in 5-10 seconds
- **Determinism**: the same input always produces the same
  report
- **Auditability**: the rendered report is byte-identical
  across runs (modulo the timestamp)

```sh
# Manual invocation
sh scripts/run-verifier.sh --no-llm

# Cron entry (nightly at 3am)
0 3 * * * cd /path/to/repo && sh scripts/run-verifier.sh --no-llm
```

The pipeline: `verifier-core.ts` emits the `DriftReport` JSON
to stdout; `drift-report.md.sh` reads the JSON from stdin and
emits markdown to stdout. The shell redirects stdout to
`reports/session-drift.md`.

## Cross-platform

The detection algorithm (`verifier-core.ts`) uses only
`node:fs`, `node:fs/promises`, and `node:child_process`. The
POSIX sh fallback (`run-verifier.sh`) and the template
renderer (`drift-report.md.sh`) use only POSIX sh, awk, sed,
printf, grep. No bash-isms. Portable to macOS, Linux, and
Windows Git Bash / WSL.

The opencode subagent and trigger plugin are opencode-native;
they only run inside opencode.

## Bypass paths

The verifier observes; it does not enforce. Bypasses:

- `--no-verify` on `git commit`: the post-commit hook is
  bypassed, the commit lands without a hash in `DONE.md`. The
  verifier's "Missing archive" category flags this.
- Plugin disabled or not loaded: same effect as above. The
  post-commit hook (a separate component) is the floor.
- Non-bash tools (`apply_patch`, custom MCP tools): the plugin
  doesn't see them. The verifier catches them via the git log
  scan.
- `--no-pager commit`: the plugin's filter regex doesn't
  match. The post-commit hook (which uses `git rev-parse HEAD`
  from the repo, not from the bash output) catches the commit.

## File map

- `verifier.md` — the opencode subagent (LLM-formatted report
  path)
- `verifier-trigger.ts` — the opencode plugin that spawns the
  verifier on `session.idle`
- `run-verifier.sh` — POSIX sh wrapper with `--no-llm` flag
- `verifier-core.ts` — the deterministic detection algorithm
- `drift-report.md.sh` — POSIX sh template renderer (no-LLM
  path)
- `drift.schema.json` — JSON Schema contract for the
  `DriftReport` output
- `bootstrap.sh` — installation script
- `eval/test-verifier.test.ts` — 12-case conformance test

The full enforcement stack (hooks + plugin + verifier +
executor) is documented in `enforcement/README.md` at the
parent directory.
