#!/bin/sh
# bootstrap.sh — install the local enforcement verifier.
# Idempotent. Run from the repo root of the consumer project.
# Source: enforcement/verifier/ (from the
# agentic-development-playbook clone or release tarball).
set -e
SRC="$(cd "$(dirname "$0")" && pwd)"

# Copy the subagent to .opencode/agents/ (where opencode
# looks for agent definitions)
mkdir -p .opencode/agents
cp "$SRC/verifier.md" .opencode/agents/verifier.md
chmod +r .opencode/agents/verifier.md

# Copy the trigger plugin to .opencode/plugins/ (sibling
# of the discipline plugin from enforcement/plugin/)
mkdir -p .opencode/plugins
cp "$SRC/verifier-trigger.ts" .opencode/plugins/verifier-trigger.ts
chmod +r .opencode/plugins/verifier-trigger.ts

# Copy the POSIX sh fallback + no-LLM supporting files to
# scripts/. The supporting files (verifier-core.ts and
# drift-report.md.sh) are required for the --no-llm path
# to function post-bootstrap.
mkdir -p scripts
cp "$SRC/run-verifier.sh" scripts/run-verifier.sh
chmod +x scripts/run-verifier.sh
cp "$SRC/verifier-core.ts" scripts/verifier-core.ts
chmod +r scripts/verifier-core.ts
cp "$SRC/drift-report.md.sh" scripts/drift-report.md.sh
chmod +x scripts/drift-report.md.sh
cp "$SRC/drift.schema.json" scripts/drift.schema.json
chmod +r scripts/drift.schema.json

# Ensure TASKS.md and tasks/done/DONE.md exist (the
# verifier reads both)
[ -f TASKS.md ] || printf '# Tasks\n\n## Done\n' > TASKS.md
[ -d tasks/done ] || mkdir -p tasks/done
[ -f tasks/done/DONE.md ] || printf '# Done\n\n' > tasks/done/DONE.md

# Ensure the opencode.json permission block allows
# the verifier's bash commands
if [ -f opencode.json ] && command -v jq >/dev/null 2>&1; then
  TMP=$(mktemp)
  if ! jq -e '.permission.bash."git rev-list *"' opencode.json >/dev/null 2>&1; then
    jq '.permission.bash += {
      "git rev-list *": "allow",
      "git rev-parse *": "allow"
    }' opencode.json > "$TMP" && mv "$TMP" opencode.json
    printf 'Updated opencode.json with verifier git permissions.\n'
  else
    rm -f "$TMP"
  fi
fi

git add .opencode/agents/verifier.md .opencode/plugins/verifier-trigger.ts scripts/
git commit -m "Add local enforcement verifier" --no-verify
printf 'Verifier installed. Restart opencode to load it.\n'
