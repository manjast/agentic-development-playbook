# Discipline Plugin (opencode)

A TypeScript plugin for [opencode](https://opencode.ai) that
auto-records commit hashes from the agent's bash tool to
`tasks/done/DONE.md` and updates `TASKS.md` to mark tasks done.
Matches the format the local enforcement hooks write, so the
same verifier reads both sources uniformly.

## What the plugin enforces

The plugin is **observability + state-write, not enforcement.**
The `tool.execute.after` hook fires *after* the bash tool has
returned; the plugin cannot prevent a misformatted commit, only
record it. The local enforcement hooks catch the commit axis at
5/5; this plugin adds the LLM-side memory writeback so the
verifier can detect drift.

Concretely, the plugin:

1. Filters for `bash` tool invocations of `git commit` (rejects
   `git commit-msg`, `git commit-tree`, etc.).
2. Extracts the commit hash from the bash output (the short
   7-char form that bash prints after a `git commit` invocation).
3. Reads the commit body via `git log -1 --format=%b` and extracts
   the `Task: T-XXX` trailer.
4. Reads the commit subject via `git log -1 --format=%s`.
5. Appends `- {short-hash} {T-XXX} {subject}` to
   `tasks/done/DONE.md` (creates the file with the `# Done` header
   if absent; de-dup by hash substring).
6. Updates the matching `- [ ] T-XXX:` line in `TASKS.md` to
   `- [x] T-XXX {title} (commit: {short-hash})` (strips any existing
   `(commit: ...)` suffix first, so amends produce a fresh suffix).
7. Logs to stderr on write failure (`[discipline-plugin] warning:`);
   never blocks the commit.

### Format differences from the hook layer

The local enforcement hooks write the **full 40-char hash** to
`DONE.md` and preserve the `: {title}` colon in `TASKS.md`. The
plugin writes the **7-char short hash** (because that's what git
prints in the bash output) and drops the colon (because the
TASKS.md update regex consumes it as a literal separator). The
verifier accepts both formats — the de-dup check is a substring
match, so a 7-char hash substring-matches the 40-char form. The
`: {title}` colon difference is purely cosmetic and the verifier
does not depend on it.

## Installation

The plugin is installed via [`bootstrap.sh`](bootstrap.sh). It
copies the plugin to `.opencode/plugins/discipline.ts` and writes
the `opencode.json` permission block.

The plugin requires opencode v1.17+ (or whatever the current
release is at the time of use). The `Plugin` type and the
`tool.execute.after` signature are part of the opencode plugin
API; if a future version renames the bash arg, the plugin would
silently fail to match commands.

### Manual installation

If the bootstrap doesn't fit your setup, copy the files manually:

```sh
mkdir -p .opencode/plugins
cp enforcement/plugin/discipline.ts .opencode/plugins/discipline.ts
```

Then add the permission block from [`opencode.json`](opencode.json)
to your project's `opencode.json` (or `opencode.jsonc`). Restart
opencode.

## Permission block

The `opencode.json` shipped in this directory declares the
discipline's permission rules:

- `git commit` (bare) and `git commit *` (with args) → `allow`
  (both required for exact-match per opencode's `Wildcard.match`
  semantics).
- `git commit *--no-verify*` → `deny` (the discipline's bypass path
  is observed, not prevented; the verifier catches the drift).
- `git --no-pager commit *` → `deny` (covers the bash-flag form
  where the global `--no-pager` flag precedes the `commit`
  subcommand; the substring match catches the common case).
- `git log *`, `git diff *`, `git status *`, `git show *` → `allow`
  (read-only git, no prompt fatigue).
- `read` / `write` for `TASKS.md` and `tasks/done/DONE.md` →
  `allow` (the plugin and the agent both write to these files).

## Conformance test

The 6-case conformance test lives in the sibling `eval/` directory.
It uses `node:test` (Node 20+) and runs without opencode installed
by mocking the plugin context.

```sh
npx tsx enforcement/eval/test-plugin.test.ts
```

6/6 PASS expected. The cases cover the happy path, no-trailer
silently skipped, failed-commit silently skipped, missing
`TASKS.md` silently skipped, de-dup on repeated invocations, and
filter precision (rejects `git commit-msg`, `git commit-tree`).

## Cross-platform

The plugin uses only `node:fs`, `node:fs/promises`, and
`node:child_process` (all cross-platform). The only shell-out is
`git` via `execFile` (a single binary, no shell-quoting hazards).
The plugin does not use the `$` Bun shell from `PluginInput`; it
remains compatible with both Bun and Node.js runtimes. opencode
loads the `.ts` file via Bun's `tsc`-compatible transpiler; no
compilation step required.

## Bypass paths

The plugin observes; it does not enforce. Bypasses:

- The plugin is not loaded (opencode fails to register it, file
  has a syntax error, user disables it). The post-commit hook
  catches the commit at the local-machine layer.
- The LLM invokes `git commit` via a non-`bash` tool (e.g.
  `apply_patch`, a custom MCP tool). The plugin's filter is
  `input.tool === "bash"`; custom tools are separate. The
  post-commit hook catches these too.
- The LLM uses `--no-verify`. The plugin still records the hash
  and task ID (if the trailer is in the body); the
  `opencode.json` `deny` rule on `git commit *--no-verify*`
  asks the user for confirmation in opencode (the bypass is
  observable, not prevented).

## File map

- `discipline.ts` — the plugin (TypeScript, ~90 lines)
- `opencode.json` — the permission block
- `bootstrap.sh` — installation script
- `eval/test-plugin.test.ts` — 6-case conformance test

The full enforcement stack (hooks + plugin + verifier + executor)
is documented in `enforcement/README.md` at the parent directory.
