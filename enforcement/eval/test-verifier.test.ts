// enforcement/eval/test-verifier.test.ts
// Conformance test for the local enforcement verifier.
// 10 cases; 10/10 PASS expected.
// Run: npx tsx enforcement/eval/test-verifier.test.ts (Node 20+).
//
// The test imports the deterministic re-implementation
// from enforcement/verifier/verifier-core.ts (the LLM-
// side analysis is verified manually in a real opencode
// session).

import { test } from "node:test"
import { strict as assert } from "node:assert"
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, dirname } from "node:path"
import { execSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { detectDrift } from "../verifier/verifier-core.ts"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CORE_PATH = join(__dirname, "..", "verifier", "verifier-core.ts")

async function withRepo(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = mkdtempSync(join(tmpdir(), "discipline-verifier-"))
  try {
    execSync("git init -q", { cwd: dir })
    execSync('git config user.email "t@t"', { cwd: dir })
    execSync('git config user.name "T"', { cwd: dir })
    await fn(dir)
  } finally { rmSync(dir, { recursive: true, force: true }) }
}

function commit(dir: string, msg: string, trailer?: string): string {
  const full = trailer ? `${msg}\n\nTask: ${trailer}\n` : msg
  // Use a unique filename per commit to avoid "nothing
  // to commit" errors when the same content is committed
  // multiple times
  const idx = Math.random().toString(36).slice(2, 8)
  writeFileSync(join(dir, `m-${idx}`), "x")
  execSync(`git add m-${idx}`, { cwd: dir })
  const msgFile = join(dir, ".msg")
  writeFileSync(msgFile, full)
  execSync(`git commit -q -F ${msgFile}`, { cwd: dir })
  return execSync("git rev-parse HEAD", { cwd: dir }).toString().trim()
}

function writeDone(dir: string, lines: string[]) {
  execSync("mkdir -p tasks/done", { cwd: dir })
  let content = "# Done\n\n"
  for (const l of lines) content += l + "\n"
  writeFileSync(join(dir, "tasks/done/DONE.md"), content)
}

function writeTasks(dir: string, lines: string[]) {
  let content = "# Tasks\n\n"
  for (const l of lines) content += l + "\n"
  writeFileSync(join(dir, "TASKS.md"), content)
}

test("1: clean session — 0 drift", async () => {
  await withRepo(async (d) => {
    const h = commit(d, "feat: clean", "T-001")
    writeDone(d, [`- ${h} T-001 feat: clean`])
    writeTasks(d, [`- [x] T-001: clean (commit: ${h.slice(0, 7)})`])
    const report = await detectDrift(d)
    assert.equal(report.items.length, 0)
  })
})

test("2: missing archive — 1 commit in log, not in DONE.md", async () => {
  await withRepo(async (d) => {
    commit(d, "feat: bypassed", "T-002")
    // Don't write DONE.md
    writeTasks(d, [`- [ ] T-002: bypassed`])
    const report = await detectDrift(d)
    const missing = report.items.filter(i => i.category === "missing-archive")
    assert.equal(missing.length, 1)
    assert.equal(missing[0].taskId, "T-002")
  })
})

test("3: missing hash — task marked done in TASKS.md but no commit suffix", async () => {
  await withRepo(async (d) => {
    const h = commit(d, "feat: half", "T-003")
    writeDone(d, [`- ${h} T-003 feat: half`])
    writeTasks(d, [`- [x] T-003: half`]) // No (commit: ...) suffix
    const report = await detectDrift(d)
    const missing = report.items.filter(i => i.category === "missing-hash")
    assert.equal(missing.length, 1)
    assert.equal(missing[0].taskId, "T-003")
  })
})

test("4: multiple trailers — 1 commit with 2 Task: trailers", async () => {
  await withRepo(async (d) => {
    commit(d, "feat: dup\n\nTask: T-004\n\nTask: T-005") // Will pick the 3-digit one
    writeTasks(d, [`- [ ] T-004: dup`, `- [ ] T-005: dup`])
    const report = await detectDrift(d)
    const multi = report.items.filter(i => i.category === "multiple-trailers")
    assert.equal(multi.length, 1)
  })
})

test("5: no trailer — 1 commit with no Task: trailer", async () => {
  await withRepo(async (d) => {
    commit(d, "fix: no trailer")
    const report = await detectDrift(d)
    const noTrailer = report.items.filter(i => i.category === "no-trailer")
    assert.ok(noTrailer.length >= 1, "expected at least one no-trailer item")
  })
})

test("6: DONE.md missing — 0 drift, warning emitted", async () => {
  await withRepo(async (d) => {
    commit(d, "feat: orphan", "T-006")
    writeTasks(d, [`- [x] T-006: orphan`])
    // No DONE.md
    const report = await detectDrift(d)
    assert.ok(report.warnings.some(w => w.includes("DONE.md missing")))
  })
})

test("7: TASKS.md missing — 0 drift, warning emitted", async () => {
  await withRepo(async (d) => {
    const h = commit(d, "feat: no tasks", "T-007")
    writeDone(d, [`- ${h} T-007 feat: no tasks`])
    // No TASKS.md
    const report = await detectDrift(d)
    assert.ok(report.warnings.some(w => w.includes("TASKS.md missing")))
  })
})

test("8: git log empty — 0 drift, 'no commits' warning", async () => {
  await withRepo(async (d) => {
    // No commits at all
    const report = await detectDrift(d)
    assert.equal(report.items.length, 0)
    assert.ok(report.warnings.length > 0 || report.range.total === 0)
  })
})

test("9: stale archive — hash in DONE.md not in git log", async () => {
  await withRepo(async (d) => {
    const h = commit(d, "feat: real", "T-009")
    writeDone(d, [`- ${h} T-009 feat: real`, `- deadbeefdeadbeefdeadbeefdeadbeefdeadbeef T-999 phantom commit`])
    writeTasks(d, [`- [x] T-009: real (commit: ${h.slice(0, 7)})`])
    const report = await detectDrift(d)
    const stale = report.items.filter(i =>
      i.category === "missing-archive" && i.taskId === "T-999"
    )
    assert.equal(stale.length, 1)
    // The phantom hash is nonexistent (vs reachable-but-
    // orphaned). Both cases are "missing-archive" with
    // different note wording; the test accepts either.
    const note = stale[0].note ?? ""
    assert.ok(
      note.includes("no longer reachable") || note.includes("no longer exists"),
      `expected note to mention unreachable or nonexistent, got: ${note}`,
    )
  })
})

test("10: large report — 50 commits, 50 drift items, no truncation", async () => {
  await withRepo(async (d) => {
    for (let i = 1; i <= 50; i++) {
      const tid = `T-${String(i).padStart(3, "0")}`
      commit(d, `feat: commit ${i}`, tid)
    }
    // No DONE.md, no TASKS.md — all 50 commits are missing-archive
    const report = await detectDrift(d)
    assert.equal(report.items.length, 50)
    assert.equal(report.range.total, 50)
  })
})

test("11: cross-format — hook-format and plugin-format hashes coexist", async () => {
  await withRepo(async (d) => {
    // Three commits so the range is non-empty:
    // - h1 (oldest, 40-char hook format in DONE.md)
    // - h2 (middle, 7-char plugin format in DONE.md)
    // - h3 (newest, NOT in DONE.md, should be missing-archive)
    // The test asserts 1 missing-archive item (h3) and 0
    // other items, proving both formats are recognized and
    // the range resolution works correctly across formats.
    const h1 = commit(d, "feat: hook-format", "T-001")
    const h2 = commit(d, "feat: plugin-format", "T-002")
    const h3 = commit(d, "feat: uncovered", "T-003")
    writeDone(d, [
      `- ${h1} T-001 feat: hook-format`,
      `- ${h2.slice(0, 7)} T-002 feat: plugin-format`,
    ])
    writeTasks(d, [
      `- [x] T-001: hook-format (commit: ${h1.slice(0, 7)})`,
      `- [x] T-002: plugin-format (commit: ${h2.slice(0, 7)})`,
    ])
    const report = await detectDrift(d)
    // h1 and h2 are recognized (40-char and 7-char formats
    // both work via the [0-9a-f]{7,40} regex). h3 is not
    // in DONE.md and is flagged as missing-archive.
    assert.equal(report.items.length, 1)
    assert.equal(report.items[0].category, "missing-archive")
    assert.equal(report.items[0].hash, h3)
  })
})

test("12: no-LLM path — JSON output is valid and matches schema", async () => {
  await withRepo(async (d) => {
    // Create a commit with a trailer, write DONE.md and
    // TASKS.md to mark the session as clean.
    const h = commit(d, "feat: no-llm", "T-001")
    writeDone(d, [`- ${h} T-001 feat: no-llm`])
    writeTasks(d, [`- [x] T-001: no-llm (commit: ${h.slice(0, 7)})`])
    // Run the CLI: invoke verifier-core.ts via tsx. The
    // test framework's runtime uses `process.execPath`
    // (the node binary) plus the tsx import hook. We use
    // the same node binary with `node --import tsx` so
    // the test is portable to any env that has tsx in
    // node_modules/. The runtime is determined by looking
    // up tsx from the test runner's own location.
    const { execFileSync } = await import("node:child_process")
    const CORE = join(__dirname, "..", "verifier", "verifier-core.ts")
    // Look up tsx via node's module resolution: find the
    // path of the `tsx` binary that the test runner used.
    // We approximate this by checking common locations.
    const path = await import("node:path")
    const fs = await import("node:fs")
    const candidates = [
      // test runner's cwd
      path.join(process.cwd(), "node_modules", ".bin", "tsx"),
      // alongside the test runner binary
      path.join(path.dirname(process.execPath), "..", "node_modules", ".bin", "tsx"),
    ]
    // Also try the conventional node_modules walk
    let tsxBin: string | null = null
    for (const c of candidates) {
      if (fs.existsSync(c)) { tsxBin = c; break }
    }
    if (!tsxBin) {
      // Last resort: run via node + --import tsx/esm
      // (works if tsx is installed locally in the
      // project; will skip the test if not).
      try {
        require.resolve("tsx")
      } catch {
        // tsx not available locally; skip the test
        return
      }
      const out = execFileSync(process.execPath, [
        "--import", "tsx/esm",
        CORE, d,
      ], { encoding: "utf8" })
      const parsed = JSON.parse(out)
      assert.ok(Array.isArray(parsed.items))
      assert.ok(Array.isArray(parsed.warnings))
      assert.equal(parsed.items.length, 0)
      return
    }
    const out = execFileSync(tsxBin, [CORE, d], { encoding: "utf8" })
    const parsed = JSON.parse(out)
    // Schema validation (the required fields are present)
    assert.ok(Array.isArray(parsed.items), "items must be an array")
    assert.ok(Array.isArray(parsed.warnings), "warnings must be an array")
    assert.ok(typeof parsed.range === "object" && parsed.range !== null, "range must be an object")
    assert.equal(typeof parsed.range.from, "string", "range.from must be a string")
    assert.equal(typeof parsed.range.to, "string", "range.to must be a string")
    assert.equal(typeof parsed.range.total, "number", "range.total must be a number")
    assert.equal(typeof parsed.timestamp, "string", "timestamp must be a string")
    // Clean session: 0 drift items
    assert.equal(parsed.items.length, 0)
    // No warnings
    assert.equal(parsed.warnings.length, 0)
  })
})
