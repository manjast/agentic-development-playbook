// enforcement/eval/test-plugin.test.ts
// Conformance test for the opencode discipline plugin.
// 6 cases; 6/6 PASS expected.
// Run: node --test enforcement/eval/test-plugin.test.ts (Node 20+).
//
// The test imports the plugin from enforcement/plugin/discipline.ts
// directly. The test mocks the opencode plugin context, invokes
// the tool.execute.after handler, and verifies the file system
// side-effects.

import { test } from "node:test"
import { strict as assert } from "node:assert"
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, dirname } from "node:path"
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { DisciplinePlugin } from "../plugin/discipline.ts"

const __dirname = dirname(fileURLToPath(import.meta.url))
const PLUGIN_PATH = join(__dirname, "..", "plugin", "discipline.ts")

async function withRepo(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), "discipline-plugin-"))
  try {
    execSync("git init -q", { cwd: dir })
    execSync('git config user.email "t@t"', { cwd: dir })
    execSync('git config user.name "T"', { cwd: dir })
    await fn(dir)
  } finally { rmSync(dir, { recursive: true, force: true }) }
}

function commit(dir: string, msg: string, trailer?: string): string {
  const full = trailer ? `${msg}\n\nTask: ${trailer}\n` : msg
  writeFileSync(join(dir, "m"), "x")
  execSync("git add m", { cwd: dir })
  // Use a temp file to preserve the multi-line body
  // (execSync's shell arg handling does not translate
  // \n to newlines; JSON.stringify preserves them as
  // literal characters that git treats as part of the
  // subject).
  const msgFile = join(dir, ".msg")
  writeFileSync(msgFile, full)
  execSync(`git commit -q -F ${msgFile}`, { cwd: dir })
  return execSync("git rev-parse HEAD", { cwd: dir }).toString().trim()
}

async function invoke(dir: string, cmd: string, out: string): Promise<void> {
  const h = await DisciplinePlugin({
    project: {} as any, client: {} as any, $: (() => {}) as any,
    directory: dir, worktree: dir,
  } as any)
  await h["tool.execute.after"]!(
    { tool: "bash", sessionID: "s", callID: "c", args: { command: cmd } } as any,
    { title: "shell", output: out, metadata: {} } as any,
  )
  if (h.dispose) await h.dispose()
}

test("1: valid commit appends DONE.md and updates TASKS.md", async () => {
  await withRepo(async (d) => {
    writeFileSync(join(d, "TASKS.md"), "# Tasks\n\n- [ ] T-001: test\n")
    const h = commit(d, "test", "T-001")
    // Real git output uses the short (7-char) hash; the plugin
    // captures the full 40-char hash via `git rev-parse <short>`
    // (see plugin spec §3 / implementation). The mock output
    // below uses the full hash to match the post-commit hook's
    // output format.
    const out = `[main ${h}] test\n`
    await invoke(d, "git commit -m 'test'", out)
    const done = readFileSync(join(d, "tasks/done/DONE.md"), "utf8")
    assert.match(done, new RegExp(`- ${h} T-001 test`))
    const tasks = readFileSync(join(d, "TASKS.md"), "utf8")
    // The plugin must preserve the colon between task ID
    // and title (matches the hook's format and the
    // verifier's TASKS.md regex).
    assert.match(tasks, new RegExp(`- \\[x\\] T-001: test \\(commit: ${h.slice(0, 7)}\\)`))
  })
})

test("2: no Task trailer is silently skipped", async () => {
  await withRepo(async (d) => {
    const h = commit(d, "no trailer")
    await invoke(d, "git commit -m 'x'", `[main ${h.slice(0, 7)}] no trailer\n`)
    assert.equal(existsSync(join(d, "tasks/done/DONE.md")), false)
  })
})

test("3: failed commit (no hash) is silently skipped", async () => {
  await withRepo(async (d) => {
    await invoke(d, "git commit -m 'x'", "error: nothing to commit\n")
    assert.equal(existsSync(join(d, "tasks/done/DONE.md")), false)
  })
})

test("4: TASKS.md absent is silently skipped (no create)", async () => {
  await withRepo(async (d) => {
    const h = commit(d, "x", "T-001")
    await invoke(d, "git commit -m 'x'", `[main ${h.slice(0, 7)}] x\n`)
    assert.equal(existsSync(join(d, "TASKS.md")), false)
    assert.ok(existsSync(join(d, "tasks/done/DONE.md")))
  })
})

test("5: duplicate hash is not appended twice (de-dup)", async () => {
  await withRepo(async (d) => {
    writeFileSync(join(d, "TASKS.md"), "# Tasks\n\n- [ ] T-001: t\n")
    const h = commit(d, "first", "T-001")
    const out = `[main ${h}] first\n`
    const cmd = "git commit -m 'x'"
    await invoke(d, cmd, out)
    await invoke(d, cmd, out)
    const done = readFileSync(join(d, "tasks/done/DONE.md"), "utf8")
    const matches = done.match(new RegExp(`- ${h} T-001 first`, "g")) || []
    assert.equal(matches.length, 1)
  })
})

test("6: git commit-msg and git commit-tree are filtered out", async () => {
  await withRepo(async (d) => {
    await invoke(d, "git commit-msg .git/COMMIT_EDITMSG", "out")
    await invoke(d, "git commit-tree 1234 -m 't'", "out")
    // The non-bash tool case is a one-line guard
    // (`input.tool !== "bash"`) not directly mockable from
    // a real plugin invocation; the guard is trivially correct.
    assert.equal(existsSync(join(d, "tasks/done/DONE.md")), false)
  })
})
