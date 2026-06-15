// enforcement/plugin/discipline.ts
// Auto-record commit hashes from opencode's bash tool to
// tasks/done/DONE.md and update TASKS.md. Matches the format
// the local enforcement hooks write, so the verifier reads
// both sources without distinguishing them.

import type { Plugin } from "@opencode-ai/plugin"
import { appendFile, readFile, writeFile, mkdir } from "node:fs/promises"
import { existsSync } from "node:fs"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { join, dirname } from "node:path"

const pExecFile = promisify(execFile)
// Capture the full T-XXX (with prefix) to match the post-commit
// hook's TASK_ID format (the hook's `awk -F': '` extracts
// `T-001`, not `001`).
const TRAILER_RE = /^Task:\s+(T-\d{3})\s*$/m
const COMMIT_RE = /\[[^\]]+\s+([0-9a-f]{7,40})\]\s+/
// Filter: matches "git commit" / "git commit -m '...'";
// rejects "git commit-msg", "git commit-tree",
// "git commit-graph", "git --no-pager commit".
const FILTER_RE = /^git\s+commit(\s|$)/
const DONE_FILE = "tasks/done/DONE.md"
const TASKS_FILE = "TASKS.md"
const DONE_HEADER = "# Done\n\n"

// Per-process mutex. Serializes read-modify-write across
// concurrent plugin invocations; does not protect across
// opencode processes (the discipline assumes one).
let writeChain: Promise<void> = Promise.resolve()

const git = (cwd: string, args: string[]) =>
  pExecFile("git", args, { cwd, maxBuffer: 1024 * 1024 }).then(r => r.stdout)
const enqueue = (fn: () => Promise<void>) => {
  writeChain = writeChain.then(fn); return writeChain
}

export const DisciplinePlugin: Plugin = async ({ worktree }) => ({
  "tool.execute.after": async (input, output) => {
    if (input.tool !== "bash") return
    const cmd = input.args?.command
    if (typeof cmd !== "string" || !FILTER_RE.test(cmd.trim())) return

    const m = COMMIT_RE.exec(output.output ?? "")
    if (!m) return // commit failed, or non-standard output
    const hash = m[1], shortHash = hash.slice(0, 7)

    let taskId: string | null
    try {
      const body = await git(worktree, ["log", "-1", "--format=%b", hash])
      const r = TRAILER_RE.exec(body); taskId = r ? r[1] : null
    } catch { return }
    if (!taskId) return

    let subject: string
    try {
      subject = (await git(worktree, ["log", "-1", "--format=%s", hash])).trim()
    } catch { return }
    const line = `- ${hash} ${taskId} ${subject.replace(/\n/g, " ")}`

    try {
      await enqueue(async () => {
        const p = join(worktree, DONE_FILE)
        if (!existsSync(p)) {
          await mkdir(dirname(p), { recursive: true })
          await writeFile(p, DONE_HEADER, "utf8")
        }
        const existing = await readFile(p, "utf8")
        if (existing.includes(hash)) return // de-dup
        await appendFile(p, line + "\n", "utf8")
      })
      await enqueue(async () => {
        const p = join(worktree, TASKS_FILE)
        if (!existsSync(p)) return // plugin does not create TASKS.md
        const content = await readFile(p, "utf8")
        // Capture the colon as a separate group so the
        // reconstruction template can re-insert it. The
        // colon must be preserved for the verifier's
        // TASKS.md regex (`^- \[x\] (T-\d{3}):`) to match
        // the plugin's output.
        const re = new RegExp(`^(\\s*)-\\s\\[[ ]\\]\\s+(${taskId})(:)([^\\n]*)$`, "m")
        if (!re.test(content)) return
        await writeFile(p, content.replace(re, (_m, ind, id, colon, rest = "") => {
          const cleaned = rest.replace(/\(commit:\s+[0-9a-f]+\)/, "").trimEnd()
          return `${ind}- [x] ${id}${colon}${cleaned} (commit: ${shortHash})`
        }), "utf8")
      })
    } catch (err) {
      // Write failure (disk full, permission denied). The
      // commit still succeeded; failure is observable but
      // not blocking.
      const msg = err instanceof Error ? err.message : String(err)
      process.stderr.write(
        `[discipline-plugin] warning: write failed for ${shortHash} (${taskId}): ${msg}\n`,
      )
    }
  },
  dispose: async () => { await writeChain },
})
