#!/bin/sh
# bootstrap.sh — install the local enforcement executor.
# Idempotent. Run from the repo root of the consumer project.
# Source: enforcement/executor/ (from the
# agentic-development-playbook clone or release tarball).
#
# The executor wraps the verifier's POSIX sh fallback
# (run-verifier.sh). The verifier's bootstrap (run from
# enforcement/verifier/) installs the verifier files. This
# bootstrap is for projects that want ONLY the executor
# (e.g., a CI-only deployment that doesn't use opencode).
set -e
SRC="$(cd "$(dirname "$0")" && pwd)"

# Copy the executor script. The executor lives at the
# repo root (not under .opencode/, because it's universal
# POSIX sh and not opencode-specific).
mkdir -p enforcement/executor
cp "$SRC/run-executor.sh" enforcement/executor/run-executor.sh
chmod +x enforcement/executor/run-executor.sh

# The cron example is documentation, not code. Skip copying
# (the README documents the cron entry inline).

git add enforcement/executor/run-executor.sh
git commit -m "Add local enforcement executor" --no-verify
printf 'Executor installed. Set up the GitHub Actions workflow by copying enforcement/executor/enforcement-executor.yml to .github/workflows/, or run the executor manually via cron (see the README for the crontab entry).\n'
