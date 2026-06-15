#!/bin/sh
# bootstrap.sh — install the opencode discipline plugin. Idempotent.
# Run from the repo root of the consumer project.
# Source: enforcement/plugin/ (from the agentic-development-playbook
# clone or release tarball).
set -e
SRC="$(cd "$(dirname "$0")" && pwd)"

# Copy the plugin to .opencode/plugins/ (where opencode looks for plugins)
mkdir -p .opencode/plugins
cp "$SRC/discipline.ts" .opencode/plugins/discipline.ts
chmod +r .opencode/plugins/discipline.ts

# Write opencode.json if absent; merge the permission block if present.
PERMISSION='  "permission": {
    "bash": {
      "*": "ask",
      "git log *": "allow",
      "git diff *": "allow",
      "git status *": "allow",
      "git show *": "allow",
      "git commit": "allow",
      "git commit *": "allow",
      "git commit *--no-verify*": "deny"
    },
    "read": {
      "TASKS.md": "allow",
      "tasks/done/DONE.md": "allow"
    },
    "write": {
      "TASKS.md": "allow",
      "tasks/done/DONE.md": "allow"
    }
  }'

if [ ! -f opencode.json ]; then
  printf '{\n  "$schema": "https://opencode.ai/config.json",\n  "plugin": ["./plugins/discipline.ts"],\n%s\n}\n' "$PERMISSION" > opencode.json
  printf 'Created opencode.json with the discipline permission block.\n'
else
  printf 'opencode.json already exists; add the permission block manually if needed.\n'
fi

# Idempotent: tasks/done/ + TASKS.md are created by the hooks bootstrap,
# not by the plugin. The plugin requires them to be present.
[ -f TASKS.md ] || printf '# Tasks\n\n## Done\n' > TASKS.md
[ -d tasks/done ] || mkdir -p tasks/done
[ -f tasks/done/DONE.md ] || printf '# Done\n\n' > tasks/done/DONE.md

git add .opencode/plugins/discipline.ts opencode.json
git commit -m "Add local enforcement plugin" --no-verify
printf 'Plugin installed. Restart opencode to load it.\n'
