#!/bin/sh
# enforcement/executor/run-executor.sh
# Universal cron/CI path for the local enforcement stack's
# drift verifier. Invokes the verifier's POSIX sh fallback
# (scripts/run-verifier.sh) and records the result.
# Idempotent within a 1-hour window (skip if the verifier
# has already run in the last hour, to prevent runaway
# triggers on rapid schedule changes).
#
# The default invocation is --no-llm (deterministic
# detection + POSIX sh template renderer, no LLM cost).
# Set ENFORCEMENT_USE_LLM=1 to opt into the LLM-formatted
# report path (slower, costs LLM tokens per run, useful for
# human-interactive debugging).
#
# Environment variables:
#   ENFORCEMENT_MODE              — "ci" (default) or "cron".
#                                     Affects logging verbosity
#                                     and the artifact upload
#                                     step (CI mode writes to
#                                     reports/, cron mode prints
#                                     to stdout).
#   ENFORCEMENT_REPORT_PATH      — path to the drift report
#                                     (default:
#                                     reports/session-drift.md).
#   ENFORCEMENT_SKIP_IF_RECENT  — "1" (default) skips if the
#                                     verifier has run in the
#                                     last hour. "0" forces
#                                     a run.
#   ENFORCEMENT_VERIFIER_SCRIPT  — path to the verifier
#                                     script (default:
#                                     scripts/run-verifier.sh).
#                                     Override for projects
#                                     that install the verifier
#                                     at a non-standard path.
#   ENFORCEMENT_USE_LLM          — "1" to use the LLM-formatted
#                                     report path. Default is
#                                     "0" (--no-llm).
#
# Exit codes:
#   0 — verifier ran, no drift detected, or skip-if-recent
#       triggered.
#   1 — verifier ran, drift detected.
#   2 — prerequisite missing (git, sh, the verifier
#       script not present).

# Symbolic exit codes (set here once, used by the prereq-check
# and run-verifier phases below). The numeric values are the
# source of truth; the symbolic names make the script's intent
# explicit at the use sites.
EXIT_OK=0
EXIT_DRIFT=1
EXIT_PREREQ_MISSING=2

set -e

# --- 1. Environment setup -----------------------------------

MODE="${ENFORCEMENT_MODE:-ci}"
REPORT_PATH="${ENFORCEMENT_REPORT_PATH:-reports/session-drift.md}"
SKIP_IF_RECENT="${ENFORCEMENT_SKIP_IF_RECENT:-1}"
VERIFIER_SCRIPT="${ENFORCEMENT_VERIFIER_SCRIPT:-scripts/run-verifier.sh}"
USE_LLM="${ENFORCEMENT_USE_LLM:-0}"
LOCK_FILE="$(mktemp -t enforcement-executor.XXXXXX 2>/dev/null || echo /tmp/enforcement-executor.lock.$$)"
LOG_FILE="reports/session-drift.log"
mkdir -p "$(dirname "$REPORT_PATH")"
mkdir -p "$(dirname "$LOG_FILE")"

log() {
  printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u)" "$1" | \
    tee -a "$LOG_FILE"
}

cleanup() {
  rm -f "$LOCK_FILE"
}
trap cleanup EXIT

log "executor starting (mode=$MODE, use_llm=$USE_LLM, report=$REPORT_PATH)"

# --- 2. Prerequisite check -----------------------------------

command -v git >/dev/null 2>&1 || {
  log "git not in PATH (required: git on PATH for branch detection and verifier invocation)"
  exit "$EXIT_PREREQ_MISSING"
}

command -v sh >/dev/null 2>&1 || {
  log "sh not in PATH (required: POSIX sh for the verifier script)"
  exit "$EXIT_PREREQ_MISSING"
}

# --- 3. Idempotency check ------------------------------------

# Parse the most-recent run timestamp from the log file.
# The format is [ISO8601] message; we extract the timestamp
# from the first matching line.
if [ "$SKIP_IF_RECENT" = "1" ] && [ -f "$LOG_FILE" ]; then
  LAST_RUN=$(grep -E '^\[[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}' "$LOG_FILE" | \
    tail -n 1 | \
    sed -E 's/^\[([^]]+)\].*/\1/')
  if [ -n "$LAST_RUN" ]; then
    # Parse ISO8601 → epoch seconds. GNU date supports -d;
    # BSD date supports -j -f. Try GNU first, fall back to BSD.
    LAST_EPOCH=$(date -u -d "$LAST_RUN" +%s 2>/dev/null || \
      date -u -j -f '%Y-%m-%dT%H:%M:%SZ' "$LAST_RUN" +%s 2>/dev/null || \
      echo 0)
    NOW_EPOCH=$(date -u +%s)
    if [ "$LAST_EPOCH" -gt 0 ] && \
       [ $((NOW_EPOCH - LAST_EPOCH)) -lt 3600 ]; then
      MINUTES=$(( (NOW_EPOCH - LAST_EPOCH) / 60 ))
      log "skipping: verifier ran ${MINUTES} minutes ago (1-hour idempotency window)"
      exit 0
    fi
  fi
fi

# --- 4. Branch detection ------------------------------------

# CI: use the GITHUB_REF_NAME env var (set by GitHub Actions).
# Cron: use git rev-parse to get the current branch.
if [ -n "$GITHUB_REF_NAME" ]; then
  BRANCH="$GITHUB_REF_NAME"
elif command -v git >/dev/null 2>&1 && [ -d .git ]; then
  # git rev-parse --abbrev-ref HEAD returns "HEAD" on a
  # repo with no commits. Check that there's a current
  # commit before using the branch name.
  if git rev-parse HEAD >/dev/null 2>&1; then
    BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  else
    BRANCH="no-commits"
  fi
else
  BRANCH="unknown"
fi
log "branch: $BRANCH"

# --- 5. Acquire lock (prevent concurrent runs) --------------

if command -v flock >/dev/null 2>&1; then
  exec 9>"$LOCK_FILE"
  if ! flock -n 9; then
    log "another executor run is in progress; exiting"
    exit 0
  fi
fi

# --- 6. Run the verifier -------------------------------------

if [ ! -x "$VERIFIER_SCRIPT" ]; then
  log "verifier script not found or not executable: $VERIFIER_SCRIPT"
  log "(the verifier ships with the local enforcement stack; install via enforcement/verifier/bootstrap.sh)"
  exit "$EXIT_PREREQ_MISSING"
fi

log "running verifier (--no-llm=$([ "$USE_LLM" = "1" ] && echo false || echo true))"

# Build the verifier invocation. Default: --no-llm.
# Opt-in: --llm via ENFORCEMENT_USE_LLM=1 (passes --no-llm=false
# flag, or omits the flag, depending on the verifier's API;
# for now we just pass --no-llm unconditionally and let
# the verifier default to its own no-LLM behavior).
VERIFIER_ARGS="--no-llm"
if [ "$USE_LLM" = "1" ]; then
  VERIFIER_ARGS=""
fi

if "$VERIFIER_SCRIPT" $VERIFIER_ARGS; then
  log "verifier passed: no drift detected"
  exit "$EXIT_OK"
else
  RC=$?
  log "verifier reported drift (exit code $RC); report at $REPORT_PATH"
  exit "$EXIT_DRIFT"
fi
