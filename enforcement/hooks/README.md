# Local Enforcement Hooks

Git hooks that enforce the Agentic Development Playbook discipline at
the local-machine level. The load-bearing minimum of the enforcement
stack: 5/5 deterministic, universal across agents (human, LLM, coding
agent — runs regardless of who invokes `git commit`).

## What the hooks enforce

1. **`commit-msg`** — every commit message must carry a `Task: T-XXX`
   trailer in the body (3-digit zero-padded task ID). The trailer
   must be at the start of the line (no leading whitespace).
2. **`pre-commit`** — atomic-commit rule: every commit must touch
   `TASKS.md`, `tasks/done/DONE.md`, or both.
3. **`post-commit`** — archive-after-commit: the commit hash is
   written to `tasks/done/DONE.md` and `TASKS.md` is updated to mark
   the task as done. Warnings only (the commit has already landed).
4. **`pre-push`** — replay the trailer check on pushed commits.
   Warnings only; the commit has already been made.

The 4 hook scripts are agent-agnostic. They run at git's hook layer,
which is the lowest possible enforcement point in the discipline's
lifecycle.

## Installation

The hooks are installed via [`bootstrap.sh`](bootstrap.sh). Requires
`lefthook` (a Go binary) and `git`.

`lefthook` is not packaged in Debian or Ubuntu's official apt
repos. Install it from the [upstream GitHub releases
page](https://github.com/evilmartians/lefthook/releases/latest) for
the latest stable version, or use one of the platform-specific
options below.

```sh
brew install lefthook    # macOS or Linux (Homebrew)
scoop install lefthook   # Windows
go install github.com/evilmartians/lefthook@latest  # any platform with Go 1.21+
```

For Linux without Go or Homebrew, download the `.deb` or `.rpm`
directly from the releases page and install with `dpkg -i` or
`rpm -i`.

Run the bootstrap from the consumer project's repo root:

```sh
sh /path/to/enforcement/hooks/bootstrap.sh
```

The script copies `lefthook.yml` and the 4 hook scripts to the repo
root, runs `lefthook install -f`, creates `TASKS.md` and
`tasks/done/DONE.md` if absent, and commits everything as the
bootstrap commit. The bootstrap commit uses `--no-verify` because its
message has no `Task: T-XXX` trailer; this is a one-time exception,
not a general bypass.

## Conformance test

The 8-case conformance test lives in the sibling `eval/` directory.
It creates a temporary git repo, installs the hooks, and runs 8
cases that exercise the trailer, atomic-commit, and bypass rules.
8/8 PASS expected.

To run it, from the consumer repo's root after the hooks are
installed:

```sh
sh enforcement/eval/test-hooks.sh
```

## Cross-platform

POSIX sh, `awk`, `grep`. No `bash`-isms, no `sed` (except a literal
4-space indent in `pre-commit`). Runs on macOS, Linux, and Windows
Git Bash. `flock` is optional — the de-dup check (`grep -qF`) prevents
duplicate `DONE.md` entries without it.

## Bypass paths

The hooks enforce at the local-machine level. Bypasses are observed,
not prevented:

- `git commit --no-verify` — bypasses `commit-msg` and `pre-commit`.
  `post-commit` still fires. Without a `Task: T-XXX` trailer, the
  hash is not written to `DONE.md`.
- `LEFTHOOK=0` — disables lefthook entirely for a session.

The verifier (shipped as a separate component) catches bypassed
commits after the fact by reading the git log and `TASKS.md`.

## File map

- `lefthook.yml` — lefthook config declaring the 4 hooks
- `commit-msg` — trailer enforcement
- `pre-commit` — atomic-commit rule
- `post-commit` — hash ledger + TASKS.md update
- `pre-push` — trailer check on pushed commits
- `bootstrap.sh` — installation script
- `eval/test-hooks.sh` — 8-case conformance test

The full enforcement stack (hooks + plugin + verifier + executor)
is documented in `enforcement/README.md` at the parent directory.
