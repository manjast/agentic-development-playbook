// enforcement/verifier/verifier-trigger.ts
// Local enforcement verifier trigger. Listens for
// session.idle and spawns the verifier subagent to
// produce reports/session-drift.md.
//
// The plugin is opencode-specific. The POSIX sh
// fallback (enforcement/verifier/run-verifier.sh) is
// the universal cron/CI path.

import type { Plugin } from "@opencode-ai/plugin"

export const VerifierTriggerPlugin: Plugin = async ({
  client,
}) => ({
  event: async (input) => {
    const ev = input.event
    // session.idle fires when the session becomes idle
    // (end of turn). session.status with { type: 'idle' }
    // is the replacement signal; both are accepted.
    const isIdle =
      ev?.type === "session.idle" ||
      (ev?.type === "session.status" && ev.properties?.type === "idle")
    if (!isIdle) return

    // Spawn the verifier subagent. The subagent writes
    // reports/session-drift.md; the trigger does not
    // need to await the result (the file lands on disk
    // asynchronously; the user reads it on the next
    // session). `noReply: true` keeps the parent session
    // from blocking on the verifier's response.
    try {
      const sessionID = ev?.sessionID ?? ""
      await client.session.prompt({
        path: { id: sessionID },
        body: {
          noReply: true,
          parts: [{
            type: "text",
            text: "Run the local enforcement drift verifier on the current worktree. Write reports/session-drift.md.",
          }],
        },
      })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      process.stderr.write(
        `[verifier-trigger] warning: prompt failed: ${msg}\n`,
      )
    }
  },
})
