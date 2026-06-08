# Start Here (Agent-Friendly)

This repo uses a task-card workflow. Do not start coding until you read `AGENTS.md`.

## The loop (WIP=1)

1) Read `AGENTS.md` (workflow, artifact policy, stop conditions).
2) Open `TASKS.md` (or follow it if it is a pointer to a canonical tracker).
   - If the canonical tracker includes a marker-delimited "task-card eligible" backlog section
     (`<!-- AGENT_BACKLOG_START -->` / `<!-- AGENT_BACKLOG_END -->`), create task cards only
     from that section.
3) Pick one Ready item (WIP=1) and create its task card under `tasks/` using your task card template.
4) Implement the task and run its verification commands.
5) Write outputs to the right place (PoC mode):
   - Raw run outputs/logs/caches -> `runs/<YYYYMMDD-HHMMSS>-T-XXX-<slug>/` (ignored)
   - Human-readable results -> `reports/` (tracked)
   - External dataset/doc pointers -> `artifacts/` (tracked)
6) Finish the task:
   - Commit (one task = one commit)
   - Update `TASKS.md` (or canonical tracker) with status + `commit: <hash>`
   - Update `DECISIONS.md` only if a real decision was made
   - Archive the task card under `tasks/archive/` (do not delete)
