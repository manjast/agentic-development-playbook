# Enforcement Tools

> Optional tools for enforcing the Agentic Development Playbook at the local-machine level and detecting drift over time. Opencode-specific components are clearly marked; the discipline itself stays tool-agnostic.

The `enforcement/` directory is a v1.3.0 (deferred) candidate. The
4 components (git hooks, opencode plugin, verifier subagent, cron/CI
executor) ship in subsequent releases; this README is the design
preview. The layer is **opt-in**: projects that adopt the Playbook
can install the enforcement tools or not.

## Components

| Component | Scope | Effectiveness |
|---|---|---|
| `enforcement/hooks/` | Universal (any agent) | 5/5 deterministic |
| `enforcement/plugin/` | opencode-specific | 4-5/5 deterministic |
| `enforcement/verifier/` | opencode-specific | 3/5 detection (observability) |
| `enforcement/executor/` | Cron + CI | Triggers the verifier |

The hooks are the only universal component; the plugin, verifier, and executor are opencode-specific. The hooks are the load-bearing minimum: a project gets a working discipline with only the hooks installed. The other 3 components are incremental.

## What the layer does

- **Enforces** the commit format (`Task: T-XXX` trailer, 3-digit zero-padded)
- **Enforces** the atomic-commit rule (TASKS.md or `tasks/done/DONE.md` in the diff)
- **Enforces** the archive-after-commit step (the post-commit hook writes the hash to `tasks/done/DONE.md`)
- **Detects** drift: missing archive, missing hash, multiple trailers, no trailer — reported in `reports/session-drift.md`

## What the layer does not do

- **Does not** prevent bypass (`git commit --no-verify` is allowed). Bypassed commits are reported as drift in `reports/session-drift.md`; they are not retroactively rejected. See `templates/AGENTS.md` "Rules" for the discipline's stance.
- **Does not** enforce the WIP limit (1 task per developer). The WIP limit is a soft constraint for the agent, not a hook-enforced constraint.
- **Does not** ship a real evaluation. The verifier detects structural drift, not outcome quality.

## Required discipline changes

The layer requires 2 small additions to existing `templates/AGENTS.md` sections, plus 1 new section at the bottom of the file. These ship alongside the layer.

- **Commit Format** (line 132-133): specify 3-digit zero-padded task IDs (e.g., `T-001`, `T-012`, `T-123`). The hooks enforce this strictly.
- **Rules** (line 144-148): clarify that bypassed checks are observable via the verifier, not prevented.
- **New "Optional: enforcement layer" section** (line 175-200): documents the 3 hook behaviors the layer adds on top of the existing rules.

## Install

The 4 components are intended to ship as *sources* in their respective
`enforcement/` subdirectories. The git hooks will be installed via
`lefthook install` after copying. The opencode-specific files (plugin,
verifier) are *copied* or *symlinked* to `.opencode/plugins/` and
`.opencode/agents/` in the adopting project, where opencode looks for
them. The cron/CI executor will be installed by adding the GitHub
Action workflow to `.github/workflows/` (or by adding the cron
example to crontab).

The per-component READMEs and install scripts ship alongside the
components in subsequent releases:

- `enforcement/hooks/README.md` — hook scripts + `lefthook install`
- `enforcement/plugin/README.md` — copy to `.opencode/plugins/`
- `enforcement/verifier/README.md` — copy to `.opencode/agents/`
- `enforcement/executor/README.md` — GitHub Action + cron example

## Tool-agnostic framing

The discipline itself is tool-agnostic — it does not reference any specific agent. The opencode plugin and verifier are one *implementation* of the layer; other agents (Claude Code, Codex CLI, Cursor, etc.) can implement the same pattern following a tool-portable abstraction (documented in private research notes; not part of the public discipline).

The 4 components have different effectiveness ratings because they enforce different things:

- The hooks run at commit time on the developer's machine, where the developer has full control. The hooks are 5/5 deterministic: every commit is checked, every check either passes or rejects the commit.
- The plugin runs inside opencode's tool-execution layer. The plugin can only *observe* (the bash tool has already returned by the time the plugin fires), not enforce. The plugin is 4-5/5 on bash-level commits: it auto-records the hash correctly, but it cannot prevent a misformatted commit.
- The verifier reads `tasks/done/DONE.md`, `TASKS.md`, and the git log, and reports drift. The verifier is 3/5: it detects drift after the fact but cannot prevent it. To be truly load-bearing when the developer is absent, the executor (cron/CI) is required.
- The executor is automation infrastructure; it does not enforce or detect anything by itself. It triggers the verifier on a schedule (cron) and after the conformance check completes on push to main (via the `workflow_run` chain).

## Bootstrap script

A combined bootstrap script installs all 4 components in dependency order. The script ships in a subsequent release alongside the components.

## Conformance test

Each component has a conformance test. The tests ship in a subsequent release alongside the components:

- `enforcement/eval/test-hooks.sh` — 8 test cases for the hook scripts
- `enforcement/eval/test-plugin.test.ts` — 6 test cases for the opencode plugin
- `enforcement/eval/test-verifier.test.ts` — 10 test cases for the verifier subagent
- `enforcement/eval/test-executor.sh` — 8 test cases for the cron/CI executor

The tests are independent; a project can run all 4 or just the ones for the components it has installed.

## Cross-references

- `templates/AGENTS.md` — the discipline's source of truth; 2 small additions + 1 new section ship alongside this layer
- `docs/migration.md` "Optional: Adopting the Enforcement Tools" — the adoption section for the layer
- `ROADMAP.md` "v1.3.0 candidates (deferred) — open" — the release plan for the layer
- `https://github.com/evilmartians/lefthook` — the git-hook runner used by `enforcement/hooks/`
- `https://opencode.ai/docs/plugins/` — the opencode plugin docs (used by `enforcement/plugin/` and `enforcement/verifier/`)
