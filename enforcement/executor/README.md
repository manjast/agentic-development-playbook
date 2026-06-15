# Drift Executor

Universal cron/CI layer for the local enforcement stack's
drift verifier. Wraps the verifier's POSIX sh fallback and
adds:

- **Idempotency window** (1 hour) — prevents runaway triggers
  if the schedule changes to a more frequent cadence.
- **Concurrent-run safety** (`flock` + `mktemp` lock file) —
  prevents two simultaneous runs from clobbering each other.
- **Exit code propagation** — 0 = clean, 1 = drift, 2 = missing
  prerequisite. CI fails the build on drift.
- **Timestamped log** (`reports/session-drift.log`) — append-only
  audit trail of every run.
- **No-LLM default** — the cron/CI use case doesn't need the
  LLM-formatted report path. Set `ENFORCEMENT_USE_LLM=1` to
  opt in.

## How the executor fits in the stack

```
executor (cron/CI)
    ↓
run-executor.sh (POSIX sh, idempotency, flock, env-var setup)
    ↓
run-verifier.sh (verifier's POSIX sh fallback)
    ↓
verifier-core.ts (deterministic detection) + drift-report.md.sh (template)
or
opencode agent run verifier (LLM-formatted report)
```

The executor is **universal** — it works for any agent (opencode,
Claude Code, Codex CLI, etc.) and any agent-not-installed
scenario. The LLM-formatted report path (when `ENFORCEMENT_USE_LLM=1`)
requires opencode; the no-LLM path (default) is fully universal.

## Compatibility

| Agent | Executor works? | Notes |
|-------|-----------------|-------|
| Any agent with git + POSIX sh + a verifier install | Yes (--no-llm path, default) | The executor wraps `run-verifier.sh`, which wraps `verifier-core.ts` + `drift-report.md.sh`. All POSIX + Node.js (for `tsx`). |
| opencode | Yes (full) | LLM-formatted report path requires opencode. Opt-in via `ENFORCEMENT_USE_LLM=1`. |

The executor's interface (`ENFORCEMENT_VERIFIER_SCRIPT` env-var
override) is the future-proofing seam. If a user has a
Claude-Code-specific verifier at `~/.claude/agents/verifier/run-claude.sh`,
they can set `ENFORCEMENT_VERIFIER_SCRIPT=~/.claude/agents/verifier/run-claude.sh`
and the executor will call that instead of `scripts/run-verifier.sh`.

## Installation

The executor is installed via `bootstrap.sh`. Requires
`git` on PATH (the executor needs git for branch detection
in cron mode). The no-LLM path requires `tsx` (installed
automatically by the GitHub Actions workflow). The LLM
path requires `opencode` on PATH (opt-in).

```sh
sh /path/to/enforcement/executor/bootstrap.sh
```

The bootstrap copies 1 file to the consumer repo
(`enforcement/executor/run-executor.sh`). The GitHub Actions
workflow (`enforcement-executor.yml`) is **not** copied
automatically — copy it to `.github/workflows/` manually,
or run the executor via cron (see the "Cron example"
section below).

## Configuration

Environment variables (all `ENFORCEMENT_*` to avoid leaking
the internal plan label into the public repo):

| Variable | Default | Description |
|----------|---------|-------------|
| `ENFORCEMENT_MODE` | `ci` | `ci` or `cron`. Affects logging verbosity and the artifact upload step. |
| `ENFORCEMENT_REPORT_PATH` | `reports/session-drift.md` | Path to the drift report. |
| `ENFORCEMENT_SKIP_IF_RECENT` | `1` | `1` skips if the verifier has run in the last hour. `0` forces a run. |
| `ENFORCEMENT_VERIFIER_SCRIPT` | `scripts/run-verifier.sh` | Path to the verifier script. Override for non-standard install paths or per-agent verifiers. |
| `ENFORCEMENT_USE_LLM` | `0` | `1` to use the LLM-formatted report path. Default is `--no-llm`. |

## GitHub Actions

The shipped `enforcement-executor.yml` defines a workflow
with 3 triggers:

- `workflow_run` — chained after the `eval` (conformance check)
  workflow completes on push to main. This is the primary
  trigger; it ensures drift is caught immediately after a
  push.
- `schedule` — weekly on Monday at 09:00 UTC. Safety net for
  the `workflow_run` trigger; catches drift that the chained
  trigger missed (e.g., if the eval workflow was disabled).
- `workflow_dispatch` — manual trigger for ad-hoc runs.

Permissions are `contents: read` + `actions: read` (least-
privilege). The workflow uses `concurrency:` to cancel
in-progress runs of the same ref, and `timeout-minutes: 5`
to prevent runaway jobs. Actions are pinned to specific
minor versions: `actions/checkout@v6.0.3`,
`actions/setup-node@v6.4.0` (Node.js 24 LTS — v20 reached
end-of-life on 2026-03-24), and `actions/upload-artifact@v7.0.1`.

The artifact upload is `if: always()` (so a failed run
still produces a report) with `if-no-files-found: ignore`
(so an empty report doesn't fail the run) and
`retention-days: 30` (30-day artifact retention).

## Cron example

For projects that don't use GitHub Actions (or that want a
tighter schedule than the workflow's weekly default):

```cron
# m h  dom mon dow   command
0 9 * * * cd /absolute/path/to/your/repo && \
  ENFORCEMENT_MODE=cron \
  ENFORCEMENT_SKIP_IF_RECENT=1 \
  ./enforcement/executor/run-executor.sh \
  >> ~/.local/share/enforcement-executor.log 2>&1
```

This runs the executor daily at 09:00 UTC, with the 1-hour
idempotency window as a safety net. Adjust the schedule,
log path, and project path to your environment. The
script must be on a path the cron daemon can resolve;
absolute paths are recommended.

## Conformance test

The 10-case conformance test verifies the executor's
runtime behavior, the workflow YAML schema, and the no-LLM
default. Uses POSIX sh + Python (for YAML parsing).

```sh
sh enforcement/eval/test-executor.sh
```

10/10 PASS expected. The cases cover:

1. Basic run (verifier runs, report produced)
2. Env-var override (verifier script not found)
3. Idempotency window (second run within 1h is skipped)
4. Lock file cleanup (no leftover `/tmp/enforcement-executor.*` files)
5. Missing verifier script (exits non-zero)
6. Empty run (0 drift, produces a report, exits 0)
7. Workflow file valid YAML
8. Workflow has 3 required triggers
9. `--no-llm` is the default
10. Idempotency state file is created/updated

## Cross-platform

The executor is pure POSIX sh with `set -e`. Portable to
Linux, macOS, and Windows Git Bash / WSL. The `flock` command
is in util-linux (Linux), Homebrew (macOS), and is optional —
without `flock`, the executor falls back to a non-atomic
`mktemp`-based lock file. The `date -d` (GNU) and
`date -j -f` (BSD) variants are both tried for ISO8601
parsing; the executor falls back to `epoch 0` (forcing a
re-run) if both fail.

The GitHub Actions workflow uses `ubuntu-latest` (Ubuntu
24.04 Noble as of 2026). Node.js 24 LTS is pre-installed;
the workflow's `setup-node` step pins to 24 explicitly.

## Bypass paths

- **`ENFORCEMENT_SKIP_IF_RECENT=0`** — forces a run,
  bypassing the 1-hour idempotency window. Use for manual
  recovery after a configuration change.
- **`ENFORCEMENT_USE_LLM=1`** — opt into the LLM-formatted
  report path. Costs LLM tokens per run. Useful for
  human-interactive debugging but not for cron/CI.
- **Concurrent run** — the executor's `flock` (or `mktemp`
  fallback) prevents concurrent runs. If a run is already
  in progress, the second run exits 0 silently (no
  error, no log line) to avoid noisy CI failures on rapid
  trigger fires.

## File map

- `run-executor.sh` — the POSIX sh executor script
- `bootstrap.sh` — installation script
- `eval/test-executor.sh` — 10-case conformance test
- `.github/workflows/enforcement-executor.yml` — the
  GitHub Actions workflow (lives at the repo root, not
  under `enforcement/executor/`, because GitHub Actions
  workflows are conventionally at `.github/workflows/`)

The full enforcement stack (hooks + plugin + verifier +
executor) is documented in `enforcement/README.md` at the
parent directory.
