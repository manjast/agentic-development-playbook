#!/bin/sh
# bootstrap.sh — install local enforcement hooks. Idempotent.
# Run from the repo root of the consumer project.
# Source: enforcement/hooks/ (from the agentic-development-playbook
# clone or release tarball).
set -e
SRC="$(dirname "$0")"
command -v lefthook >/dev/null 2>&1 || \
  { printf 'lefthook not found; install per enforcement/hooks/README.md §Installation.\n' >&2; exit 1; }
mkdir -p .lefthook
cp "$SRC/lefthook.yml" ./lefthook.yml
cp "$SRC/commit-msg" .lefthook/commit-msg
cp "$SRC/pre-commit" .lefthook/pre-commit
cp "$SRC/post-commit" .lefthook/post-commit
cp "$SRC/pre-push" .lefthook/pre-push
chmod +x .lefthook/* && lefthook install -f
[ -f TASKS.md ] || printf '# Tasks\n\n## Done\n' > TASKS.md
[ -d tasks/done ] || mkdir -p tasks/done
[ -f tasks/done/DONE.md ] || printf '# Done\n\n' > tasks/done/DONE.md
git add lefthook.yml .lefthook/ TASKS.md tasks/done/DONE.md
git commit -m "Add local enforcement hooks" --no-verify
printf 'Hooks installed. Run "git commit" to test.\n'
