#!/bin/sh
# enforcement/eval/test-executor.sh — conformance test for
# the local enforcement executor. 10 cases; 10/10 PASS
# expected.
#
# Tests the run-executor.sh script in isolation (the
# GitHub Actions workflow itself is tested by the workflow
# YAML schema check, not by this script).
#
# Usage: sh enforcement/eval/test-executor.sh
#   (run from the playbook repo root, not the consumer repo)

set -e

# Resolve paths relative to the script location.
TEST_DIR="$(cd "$(dirname "$0")" && pwd)"
PLAYBOOK_ROOT="$(cd "$TEST_DIR/../.." && pwd)"
EXECUTOR="$PLAYBOOK_ROOT/enforcement/executor/run-executor.sh"
WORKFLOW="$PLAYBOOK_ROOT/.github/workflows/enforcement-executor.yml"

command -v git >/dev/null 2>&1 || \
  { printf 'test-executor.sh: git not in PATH.\n' >&2; exit 1; }
[ -x "$EXECUTOR" ] || \
  { printf 'test-executor.sh: executor not found at %s\n' "$EXECUTOR" >&2; exit 1; }

PASS=0
FAIL=0
REPO=""

# Helper: create a clean temp repo with a fake verifier
# script. Each test case gets a fresh repo to avoid
# state leakage between cases.
setup_repo() {
  REPO=$(mktemp -d -t enforcement-executor-test-XXXXXX)
  cd "$REPO"
  git init -q
  git config user.email "t@t"
  git config user.name "T"
  mkdir -p scripts
  cat > scripts/run-verifier.sh <<'EOF'
#!/bin/sh
# Fake verifier that records a report and exits 0.
mkdir -p reports
printf "# Session drift report\n\n## Header\n\n- **Timestamp:** %s\n- **Range:** root..HEAD\n- **Total commits analyzed:** 0\n\n## Summary\n\n- **Drift count:** 0\n" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > reports/session-drift.md
exit 0
EOF
  chmod +x scripts/run-verifier.sh
}

# Helper: cleanup the temp repo.
cleanup_repo() {
  if [ -n "$REPO" ] && [ -d "$REPO" ]; then
    rm -rf "$REPO"
  fi
  REPO=""
}

# Track all cleanup needs
ALL_CLEANUPS=""
add_cleanup() { ALL_CLEANUPS="$ALL_CLEANUPS $1"; }
run_cleanups() {
  for d in $ALL_CLEANUPS; do
    [ -n "$d" ] && [ -d "$d" ] && rm -rf "$d"
  done
  ALL_CLEANUPS=""
}
trap run_cleanups EXIT

# check <name> <expected: pass|fail> <command>
check() {
  if eval "$3" 2>/dev/null; then o=pass; else o=fail; fi
  if [ "$o" = "$2" ]; then
    PASS=$((PASS+1))
    printf '  PASS: %s\n' "$1"
  else
    FAIL=$((FAIL+1))
    printf '  FAIL: %s\n' "$1"
  fi
}

# Case 1: basic run — verifier runs, report produced
setup_repo
check "basic run" pass \
  "ENFORCEMENT_SKIP_IF_RECENT=0 '$EXECUTOR' && [ -f reports/session-drift.md ]"
cleanup_repo

# Case 2: env-var override — ENFORCEMENT_VERIFIER_SCRIPT
# points to a non-existent script. The executor should
# exit non-zero with a "verifier script not found" error.
setup_repo
check "env-var override" pass \
  "! ENFORCEMENT_VERIFIER_SCRIPT=scripts/does-not-exist.sh ENFORCEMENT_SKIP_IF_RECENT=0 '$EXECUTOR' 2>/dev/null"
cleanup_repo

# Case 3: idempotency window — second run within 1h is skipped
setup_repo
ENFORCEMENT_SKIP_IF_RECENT=0 "$EXECUTOR" >/dev/null 2>&1
if ENFORCEMENT_SKIP_IF_RECENT=1 "$EXECUTOR" 2>&1 | grep -q 'skipping'; then
  PASS=$((PASS+1))
  printf '  PASS: %s\n' "idempotency window"
else
  FAIL=$((FAIL+1))
  printf '  FAIL: %s\n' "idempotency window"
fi
cleanup_repo

# Case 4: lock file cleanup — the script creates a lock
# file via mktemp and cleans it up via the EXIT trap.
# We verify the trap fires by checking that the lock
# file is gone after the run.
setup_repo
ENFORCEMENT_SKIP_IF_RECENT=0 "$EXECUTOR" >/dev/null 2>&1
# The lock file is in /tmp with prefix enforcement-executor.
LOCK_FILES=$(ls /tmp/enforcement-executor.* 2>/dev/null | wc -l)
if [ "$LOCK_FILES" -eq 0 ]; then
  PASS=$((PASS+1))
  printf '  PASS: %s\n' "lock file cleanup"
else
  FAIL=$((FAIL+1))
  printf '  FAIL: %s\n' "lock file cleanup ($LOCK_FILES leftover)"
fi
cleanup_repo

# Case 5: missing verifier script — executor exits non-zero
setup_repo
rm scripts/run-verifier.sh
check "missing verifier script" pass \
  "! ENFORCEMENT_SKIP_IF_RECENT=0 '$EXECUTOR' 2>/dev/null"
cleanup_repo

# Case 6: empty run (0 drift) — produces a report, exits 0
setup_repo
check "empty run produces report" pass \
  "ENFORCEMENT_SKIP_IF_RECENT=0 '$EXECUTOR' && [ -s reports/session-drift.md ]"
cleanup_repo

# Case 7: workflow file present and valid YAML
if [ -f "$WORKFLOW" ]; then
  if /data/data/com.termux/files/usr/bin/python3 -c "
import yaml
class L(yaml.SafeLoader): pass
def on_constructor(loader, node):
    return loader.construct_scalar(node)
L.add_constructor('tag:yaml.org,2002:bool', on_constructor)
d = yaml.load(open('$WORKFLOW'), Loader=L)
assert 'jobs' in d and 'executor' in d['jobs'], 'jobs.executor missing'
assert 'timeout-minutes' in d, 'top-level timeout-minutes missing'
assert d['timeout-minutes'] <= 5, 'timeout too long'
print('workflow OK')
" 2>/dev/null; then
    PASS=$((PASS+1))
    printf '  PASS: %s\n' "workflow file valid YAML"
  else
    FAIL=$((FAIL+1))
    printf '  FAIL: %s\n' "workflow file valid YAML"
  fi
else
  FAIL=$((FAIL+1))
  printf '  FAIL: %s\n' "workflow file not found at $WORKFLOW"
fi

# Case 8: workflow has the 3 required triggers
if [ -f "$WORKFLOW" ]; then
  if /data/data/com.termux/files/usr/bin/python3 -c "
import yaml
class L(yaml.SafeLoader): pass
def on_constructor(loader, node):
    return loader.construct_scalar(node)
L.add_constructor('tag:yaml.org,2002:bool', on_constructor)
d = yaml.load(open('$WORKFLOW'), Loader=L)
triggers = list(d['on'].keys())
required = ['workflow_run', 'schedule', 'workflow_dispatch']
missing = [t for t in required if t not in triggers]
assert not missing, f'missing triggers: {missing}'
print('all 3 triggers present')
" 2>/dev/null; then
    PASS=$((PASS+1))
    printf '  PASS: %s\n' "workflow has 3 required triggers"
  else
    FAIL=$((FAIL+1))
    printf '  FAIL: %s\n' "workflow has 3 required triggers"
  fi
else
  FAIL=$((FAIL+1))
  printf '  FAIL: %s\n' "workflow file not found at $WORKFLOW"
fi

# Case 9: --no-llm is the default — the executor runs
# successfully without ENFORCEMENT_USE_LLM=1
setup_repo
check "--no-llm is the default" pass \
  "ENFORCEMENT_SKIP_IF_RECENT=0 '$EXECUTOR' 2>&1 | grep -q 'use_llm=0'"
cleanup_repo

# Case 10: idempotency state file is created/updated
setup_repo
rm -f reports/session-drift.log
ENFORCEMENT_SKIP_IF_RECENT=0 "$EXECUTOR" >/dev/null 2>&1
check "idempotency state file created" pass \
  "[ -f reports/session-drift.log ] && grep -q 'executor starting' reports/session-drift.log"
cleanup_repo

printf '\nResult: %d PASS, %d FAIL\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
