// enforcement/verifier/verifier-core.ts
// Deterministic re-implementation of the drift detection
// algorithm described in the verifier subagent's system
// prompt. Used by the conformance test (test-verifier.test.ts)
// to verify the algorithm without invoking an LLM.
//
// When invoked as a script (i.e., `tsx verifier-core.ts`),
// writes the DriftReport to stdout as JSON (per
// drift.schema.json). When imported (i.e., by the test),
// returns the DriftReport object normally.
//
// The LLM-side report writing (the markdown schema with
// Header, Summary, Missing archive, Missing hash, Multiple
// trailers, No trailer sections) is not re-implemented
// here; the test asserts on the structured drift data,
// not on the rendered report. The template renderer
// (drift-report.md.sh) consumes the JSON output and
// produces the markdown report in the no-LLM path.

import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { readFileSync, existsSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const pExecFile = promisify(execFile)

const git = (cwd: string, args: string[]) =>
  pExecFile("git", args, { cwd, maxBuffer: 1024 * 1024 }).then(r => r.stdout)

const TRAILER_RE = /^Task:\s+(T-\d{3})\s*$/m

export interface DriftItem {
  category: "missing-archive" | "missing-hash" | "multiple-trailers" | "no-trailer"
  hash?: string
  shortHash?: string
  taskId?: string
  subject?: string
  action: string
  note?: string
}

export interface DriftReport {
  range: { from: string; to: string; total: number }
  items: DriftItem[]
  warnings: string[]
}

export async function detectDrift(worktree: string): Promise<DriftReport> {
  const warnings: string[] = []
  const items: DriftItem[] = []

  // Read DONE.md and TASKS.md (both optional)
  const donePath = join(worktree, "tasks/done/DONE.md")
  const tasksPath = join(worktree, "TASKS.md")
  const doneExists = existsSync(donePath)
  const tasksExists = existsSync(tasksPath)
  if (!doneExists) warnings.push("DONE.md missing; discipline archive not in use.")
  if (!tasksExists) warnings.push("TASKS.md missing; discipline archive not in use.")
  const doneContent = doneExists ? readFileSync(donePath, "utf8") : ""
  const tasksContent = tasksExists ? readFileSync(tasksPath, "utf8") : ""

  // Build DONE.md hash index: full-hash -> { taskId, subject }
  // The hash can be 7-40 chars (the hook writes 40, the plugin
  // writes 7 from the bash output). The de-dup check is a
  // substring match, so either length is correct as a key.
  const doneIndex = new Map<string, { taskId: string; subject: string }>()
  for (const line of doneContent.split("\n")) {
    const m = /^- ([0-9a-f]{7,40}) (T-\d{3}) (.*)$/.exec(line)
    if (m) doneIndex.set(m[1], { taskId: m[2], subject: m[3] })
  }

  // Build TASKS.md done-index: taskId -> { line, hasCommitSuffix }
  const tasksIndex = new Map<string, { hasSuffix: boolean; shortHash: string | null }>()
  for (const line of tasksContent.split("\n")) {
    // First check if the line has a (commit: ...) suffix at all
    const suffixMatch = /\(commit:\s+([0-9a-f]+)\)\s*$/.exec(line)
    if (!suffixMatch) {
      // No suffix — match just the task ID
      const idMatch = /^- \[x\] (T-\d{3}):/.exec(line)
      if (idMatch) {
        tasksIndex.set(idMatch[1], { hasSuffix: false, shortHash: null })
      }
    } else {
      // Has suffix — match the task ID
      const idMatch = /^- \[x\] (T-\d{3}):/.exec(line)
      if (idMatch) {
        tasksIndex.set(idMatch[1], { hasSuffix: true, shortHash: suffixMatch[1] })
      }
    }
  }

  // Determine range: from the parent of the most-recent
  // commit whose hash appears in DONE.md (so the range
  // includes that commit and any new ones after it), OR
  // the last 50 commits if DONE.md is empty.
  //
  // The "include the most recent DONE.md commit in the
  // range" behavior is intentional: the verifier should
  // re-verify the most recent DONE.md entry to catch
  // stale hashes (e.g., a hash that was force-pushed
  // out but is still in DONE.md). Use HEAD~N if the
  // most recent DONE.md commit is reachable and not HEAD
  // itself; use HEAD~1 if the most recent DONE.md commit
  // IS HEAD (so the range is just HEAD itself).
  let fromHash: string
  let logArgs: string[]
  // Format: HASH\x00SUBJECT\x00BODY\x00commit-end\x00
  // The NUL bytes cannot appear in commit messages.
  // The "commit-end" marker separates commits.
  const fmt = "%H%x00%s%x00%b%x00commit-end%x00"
  if (doneIndex.size > 0) {
    const log = await git(worktree, ["log", "--all", "--max-count=500", "--pretty=format:%H"])
    const hashes = log.split("\n")
    const foundIdx = hashes.findIndex(h => doneIndex.has(h))
    if (foundIdx === -1) {
      // No DONE.md commit is reachable. Scan last 50.
      fromHash = ""
      logArgs = ["log", "--max-count=50", `--pretty=format:${fmt}`, "HEAD"]
    } else if (foundIdx === 0) {
      // Most recent commit is in DONE.md. The range is
      // HEAD (just that one commit) so we re-verify it.
      fromHash = ""
      logArgs = ["log", "--max-count=1", `--pretty=format:${fmt}`, "HEAD"]
    } else {
      // Use the parent of the most recent DONE.md commit.
      // range = parent..HEAD includes that commit + any new.
      const parentHash = hashes[foundIdx - 1] ?? ""
      fromHash = parentHash
      logArgs = ["log", "--max-count=500", `--pretty=format:${fmt}`, `${parentHash}..HEAD`]
    }
  } else {
    fromHash = ""
    logArgs = ["log", "--max-count=50", `--pretty=format:${fmt}`, "HEAD"]
  }
  let logOut: string
  try {
    logOut = await git(worktree, logArgs)
  } catch {
    return {
      range: { from: fromHash, to: "HEAD", total: 0 },
      items: [],
      warnings: [...warnings, "git log failed; no commits analyzed."],
    }
  }
  if (!logOut.trim()) {
    return {
      range: { from: fromHash, to: "HEAD", total: 0 },
      items,
      warnings: [...warnings, "no commits analyzed."],
    }
  }

  // Parse commits. The separator between hash, subject,
  // and body is a NUL byte (which cannot appear in commit
  // messages), so subject and body are safe to split on.
  // The format is "HASH\x00SUBJECT\x00BODY" where BODY
  // can contain newlines literally (git's %b preserves
  // them).
  const commits: { hash: string; shortHash: string; subject: string; body: string }[] = []
  for (const commit of logOut.split("\x00commit-end\x00")) {
    if (!commit.trim()) continue
    const parts = commit.split("\x00")
    if (parts.length < 2) continue
    // Git's format printer inserts a literal "\n" between
    // commits (after the trailing %x00commit-end%x00 of one
    // commit and before the %H of the next). Strip leading
    // whitespace from the hash to avoid a leading newline
    // contaminating the substring-match in doneIndex.
    const hash = parts[0].replace(/^\s+/, "")
    const subject = parts[1] || ""
    const body = parts.slice(2).join("\x00") || ""
    commits.push({ hash, shortHash: hash.slice(0, 7), subject: subject.trim(), body })
  }

  // Scan each commit
  for (const c of commits) {
    const trailerMatches = [...c.body.matchAll(new RegExp(TRAILER_RE, "gm"))]
    if (trailerMatches.length === 0) {
      // No trailer
      if (c.body.trim() === "") {
        // Empty body — likely a single-line commit. Still no trailer.
        items.push({
          category: "no-trailer",
          hash: c.hash,
          shortHash: c.shortHash,
          subject: c.subject,
          action: `git commit --amend to add a Task: T-XXX trailer in the body.`,
        })
      } else {
        items.push({
          category: "no-trailer",
          hash: c.hash,
          shortHash: c.shortHash,
          subject: c.subject,
          action: `git commit --amend to add a Task: T-XXX trailer, or git rebase to fix in history.`,
        })
      }
      continue
    }
    if (trailerMatches.length > 1) {
      items.push({
        category: "multiple-trailers",
        hash: c.hash,
        shortHash: c.shortHash,
        subject: c.subject,
        action: `git commit --amend to keep only one Task: T-XXX trailer.`,
      })
      continue
    }
    const taskId = trailerMatches[0][1]
    if (!doneIndex.has(c.hash)) {
      items.push({
        category: "missing-archive",
        hash: c.hash,
        shortHash: c.shortHash,
        taskId,
        subject: c.subject,
        action: `git commit --amend --no-edit && lefthook run post-commit to re-fire the post-commit hook.`,
      })
    }
    const tasksEntry = tasksIndex.get(taskId)
    if (tasksEntry && !tasksEntry.hasSuffix) {
      items.push({
        category: "missing-hash",
        hash: c.hash,
        shortHash: c.shortHash,
        taskId,
        subject: c.subject,
        action: `TASKS.md marks ${taskId} as done but is missing the (commit: ${c.shortHash}) suffix. Verify and add.`,
      })
    }
  }

  // Stale archive: hashes in DONE.md not in the git log
  for (const [hash, info] of doneIndex) {
    if (!commits.some(c => c.hash === hash)) {
      // Check if it's actually in the log at all
      try {
        const exists = await git(worktree, ["cat-file", "-t", hash])
        if (exists.trim() !== "commit") {
          items.push({
            category: "missing-archive",
            hash,
            shortHash: hash.slice(0, 7),
            taskId: info.taskId,
            subject: info.subject,
            note: "DONE.md references a hash that is no longer reachable from any ref (reaped, force-pushed, or rebased out).",
            action: `Re-record the task in DONE.md with the new commit hash, or restore the missing commit if intentional.`,
          })
        }
      } catch {
        // Hash doesn't exist at all
        items.push({
          category: "missing-archive",
          hash,
          shortHash: hash.slice(0, 7),
          taskId: info.taskId,
          subject: info.subject,
          note: "DONE.md references a hash that no longer exists in the repository.",
          action: `Re-record the task in DONE.md with the new commit hash.`,
        })
      }
    }
  }

  return {
    range: { from: fromHash, to: "HEAD", total: commits.length },
    items,
    warnings,
  }
}

// CLI entry point: when this file is run directly (e.g.,
// `tsx verifier-core.ts`), write the DriftReport to stdout
// as JSON. When imported (e.g., by the conformance test),
// only the function is exported.
//
// The worktree is read from argv[2] (default: current
// directory). A `timestamp` field is added to the JSON
// output for the report's Header section; the function
// itself does not include it (to keep the return type
// stable for tests).
const isMainModule = (() => {
  try {
    return fileURLToPath(import.meta.url) === process.argv[1]
  } catch {
    return false
  }
})()

if (isMainModule) {
  const worktree = process.argv[2] || "."
  detectDrift(worktree).then((report) => {
    const output = {
      ...report,
      timestamp: new Date().toISOString(),
    }
    process.stdout.write(JSON.stringify(output) + "\n")
  }).catch((err) => {
    process.stderr.write(`verifier-core.ts: error: ${err instanceof Error ? err.message : String(err)}\n`)
    process.exit(1)
  })
}
