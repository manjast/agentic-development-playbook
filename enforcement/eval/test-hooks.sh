#!/bin/sh
# enforcement/eval/test-hooks.sh — conformance test for the
# local enforcement hooks (4-hook lefthook config).
# 8 cases; 8/8 PASS expected on a POSIX host with git and lefthook installed.
# Run from the consumer repo root after the hooks are installed:
#   sh enforcement/eval/test-hooks.sh
set -e
command -v lefthook >/dev/null 2>&1 || \
  { printf 'lefthook not found; install per enforcement/hooks/README.md §Installation.\n' >&2; exit 1; }
command -v git >/dev/null 2>&1 || \
  { printf 'git not found.\n' >&2; exit 1; }

HOOKS_DIR="$(cd "$(dirname "$0")/../hooks" && pwd)"
REPO=$(mktemp -d)
cleanup() { rm -rf "$REPO"; }
trap cleanup EXIT
cd "$REPO"
git init -q
git config user.email "t@t"
git config user.name "T"
cp "$HOOKS_DIR/lefthook.yml" .
mkdir -p .lefthook
cp "$HOOKS_DIR/commit-msg" .lefthook/commit-msg
cp "$HOOKS_DIR/pre-commit" .lefthook/pre-commit
cp "$HOOKS_DIR/post-commit" .lefthook/post-commit
cp "$HOOKS_DIR/pre-push" .lefthook/pre-push
chmod +x .lefthook/*
lefthook install -f

printf '# Tasks\n- [ ] T-001: test\n## Done\n' > TASKS.md

PASS=0
FAIL=0

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

# msg <T-XXX> — write a commit message file
msg() { printf 'fix\n\nTask: %s\n' "$1" > /tmp/m.test.$$; }

# Case 1: valid trailer + TASKS.md staged → pass
msg T-001
git add TASKS.md
check "valid trailer + TASKS.md staged" pass \
  "git commit -q -F /tmp/m.test.$$"

# Case 2: valid trailer, no TASKS.md staged → fail (pre-commit rejects)
echo x > x
git add x
msg T-002
check "valid trailer, no TASKS.md staged" fail \
  "git commit -q -F /tmp/m.test.$$"
git reset -q x 2>/dev/null || true

# Case 3: no Task: trailer → fail (commit-msg rejects)
git add TASKS.md
check "no Task: trailer" fail \
  'git commit -q -m "fix"'

# Case 4: malformed trailer (1-digit) → fail
msg T-1
check "malformed trailer (1-digit)" fail \
  "git commit -q -F /tmp/m.test.$$"

# Case 5: malformed trailer (4-digit) → fail
msg T-1234
check "malformed trailer (4-digit)" fail \
  "git commit -q -F /tmp/m.test.$$"

# Case 6: multiple Task: trailers → fail
printf 'fix\n\nTask: T-001\n\nTask: T-002\n' > /tmp/m.test.$$
check "multiple Task: trailers" fail \
  "git commit -q -F /tmp/m.test.$$"

# Case 7: amend with valid trailer → pass (post-commit is idempotent)
msg T-001
git add TASKS.md
check "amend with valid trailer" pass \
  "git commit -q -F /tmp/m.test.$$ && git add TASKS.md && msg T-001 && git commit -q --amend -F /tmp/m.test.$$"

# Case 8: --no-verify bypass → pass (acknowledged limitation)
check "--no-verify bypass" pass \
  'git commit -q --allow-empty --no-verify -m "bypass"'

# Case 9: pre-push on new branch with no upstream (REMOTE_SHA
# is all zeros). The hook must skip — there are no new commits
# to check. Without the F-D01 fix, the hook would attempt
# `git log 00000..HEAD`, which would error, and the awk would
# emit a spurious "missing Task: T-XXX trailer" warning.
check "pre-push new branch (no upstream) no false-positive" pass \
  'printf "refs/heads/main %s refs/heads/main 0000000000000000000000000000000000000000\n" "$(git rev-parse HEAD)" | .lefthook/pre-push origin test'

rm -f /tmp/m.test.$$

printf '\nResult: %d PASS, %d FAIL\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
