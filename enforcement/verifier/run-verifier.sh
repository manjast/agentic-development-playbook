#!/bin/sh
# run-verifier.sh — run the local enforcement drift verifier.
# Two modes:
#   default: spawn the opencode verifier subagent (LLM-formatted
#            report at reports/session-drift.md).
#   --no-llm: skip the LLM; run the deterministic algorithm
#             (verifier-core.ts) and render the report with the
#             POSIX sh template (drift-report.md.sh). Faster,
#             cheaper, deterministic. Use from cron/CI.
#
# Usage: run-verifier.sh [--no-llm] [worktree-path]
# Default worktree: current directory (.)
#
# Requires: opencode CLI on PATH (default mode only); git on PATH
# (both modes); Node.js 20+ and tsx on PATH (--no-llm mode only).
# Or, when run from the enforcement/verifier/ source dir, the
# verifier-core.ts and drift-report.md.sh scripts are used directly.

set -e

# Parse flags
NO_LLM=0
while [ $# -gt 0 ]; do
  case "$1" in
    --no-llm)
      NO_LLM=1
      shift
      ;;
    --no-llm=*)
      NO_LLM=1
      shift
      ;;
    -h|--help)
      printf 'Usage: %s [--no-llm] [worktree-path]\n' "${0##*/}"
      printf '  --no-llm  skip the LLM; use the deterministic\n'
      printf '            algorithm + POSIX sh template instead\n'
      exit 0
      ;;
    --)
      shift
      break
      ;;
    -*)
      printf 'run-verifier.sh: unknown flag: %s\n' "$1" >&2
      exit 2
      ;;
    *)
      break
      ;;
  esac
done

WORKTREE="${1:-.}"
cd "$WORKTREE"

command -v git >/dev/null 2>&1 || {
  printf 'run-verifier.sh: git not in PATH.\n' >&2
  exit 1
}
[ -d .git ] || {
  printf 'run-verifier.sh: %s is not a git worktree.\n' "$WORKTREE" >&2
  exit 1
}

mkdir -p reports

# Resolve the path to the verifier's source files. The script
# is installed at scripts/run-verifier.sh (per the verifier
# bootstrap) with the supporting files (verifier-core.ts,
# drift-report.md.sh, drift.schema.json) in the same scripts/
# directory. During development, the script is run from
# enforcement/verifier/run-verifier.sh and the supporting
# files are siblings. Look in both locations.
SRC=""
for candidate in \
  "$(dirname "$0")" \
  "$(dirname "$0")/.." \
  "$(dirname "$0")/../enforcement/verifier" \
  "./enforcement/verifier"
do
  if [ -f "$candidate/verifier-core.ts" ] && [ -f "$candidate/drift-report.md.sh" ]; then
    SRC="$candidate"
    break
  fi
done

if [ "$NO_LLM" = "1" ]; then
  # No-LLM path: run the deterministic algorithm + render
  # the report with the POSIX sh template.
  if [ -z "$SRC" ]; then
    printf 'run-verifier.sh --no-llm: cannot locate verifier-core.ts and drift-report.md.sh.\n' >&2
    printf '  Expected at enforcement/verifier/ relative to the repo root.\n' >&2
    exit 1
  fi
  command -v tsx >/dev/null 2>&1 || {
    printf 'run-verifier.sh --no-llm: tsx not in PATH. Install with: npm install -g tsx\n' >&2
    exit 1
  }
  # Pipeline: verifier-core.ts emits JSON to stdout; the
  # template renderer reads JSON from stdin and writes
  # markdown to stdout. Redirect stdout to the report file.
  tsx "$SRC/verifier-core.ts" | sh "$SRC/drift-report.md.sh" > reports/session-drift.md
  printf 'run-verifier.sh --no-llm: drift report written to reports/session-drift.md.\n'
  exit 0
fi

# Default path: spawn the opencode verifier subagent (LLM-
# formatted report).
command -v opencode >/dev/null 2>&1 || {
  printf 'run-verifier.sh: opencode CLI not in PATH.\n' >&2
  printf '  (use --no-llm to skip the LLM)\n' >&2
  exit 1
}

opencode agent run verifier
EXIT=$?

if [ "$EXIT" -ne 0 ]; then
  printf 'run-verifier.sh: verifier failed (exit %d).\n' "$EXIT" >&2
  printf '  Check reports/session-drift.md if it was partially written.\n' >&2
  exit "$EXIT"
fi

if [ -f reports/session-drift.md ]; then
  printf 'run-verifier.sh: drift report written to reports/session-drift.md.\n'
else
  printf 'run-verifier.sh: verifier exited 0 but report file is missing.\n' >&2
  exit 1
fi
