# Agent Instructions for <PROJECT_NAME>

## Project
<One sentence describing the project and stack.>

## Authority and sources

- Authoritative work item / intent: <ISSUE, SPEC, TRACKER, OR FILE>
- Durable decisions / ADRs: <DECISION SOURCE>
- Project verification entrypoint: <VERIFY COMMAND OR CI JOB>
- Additional repository-specific policy: <POLICY LOCATION OR NONE>

Do not duplicate authoritative state into another tracked file merely for the agent. Prefer references to the system that already owns the information.

## Before making a change

Confirm that the next bounded change is sufficiently clear to execute and judge:

- intended observable outcome;
- material in-scope and out-of-scope boundaries;
- success / acceptance criteria or other oracle;
- relevant constraints and durable decisions;
- unresolved material questions;
- execution or decision authority that could block the work.

If a consequential ambiguity remains, stop and ask rather than inventing the missing requirement.

## While working

- Stay within the authorized scope; do not add drive-by refactors.
- Use the repository's normal verification commands as feedback during implementation.
- Do not weaken tests, CI, policy, security controls, or acceptance criteria merely to make the candidate pass.
- If concurrent work exists, keep mutable work isolated in an appropriate branch/worktree/session and make candidate ownership explicit.
- Do not take an external, production, destructive, credential-bearing, or otherwise hard-to-reverse action unless the configured execution authority explicitly permits it.
- Record a durable decision only when the rationale or rejected alternatives will matter after the current session.

## Candidate and verification

The acceptance subject is the identifiable candidate change, not a required one-task/one-commit shape.

- Multiple implementation commits are allowed unless the project has a separate convention.
- Verification evidence must apply to the candidate being evaluated and to the relevant target/integration context.
- If the candidate or material integration context changes, rerun whatever evidence is no longer valid.
- Treat local verification as feedback. Use the project's authoritative CI/review boundary for claims that must hold before incorporation.
- Do not write a commit hash back into tracked task/completion state merely because Git already knows it.

## Review and acceptance

Keep these concepts separate:

- **Verification** establishes facts/evidence.
- **Review** supplies judgment.
- **Acceptance** is an authorized decision to cross a named boundary.

Passing checks is not automatically authority to merge, release, deploy, or claim a stronger outcome.

Project-specific policy may attach additional review/evidence/authority obligations to particular kinds of change. Those triggers are intentionally not standardized in this template while the redesign is being validated.

## Stop / escalate

Stop and ask when any of these is true:

- the authoritative intent is materially unclear or conflicting;
- the requested implementation exceeds the authorized scope;
- a change would cross a security, data, production, external-side-effect, or other consequential authority boundary without clear permission;
- required verification is unavailable, invalid for the candidate, or would need to be weakened to pass;
- a material project invariant or durable decision would be violated;
- the work requires a decision that the current actor is not authorized to make.

Add project-specific stop conditions when they address real consequential failure modes.

## Completion claims

Do not collapse stronger states into weaker evidence:

```text
tests passed
!= accepted

accepted for incorporation
!= incorporated

incorporated
!= deployed

deployed
!= confirmed working
```

Use the terminal boundary appropriate to the promised outcome. Do not claim `done`, `shipped`, or equivalent until that boundary has actually been satisfied.

## Commit convention

Follow the repository's own commit convention. A `Task: T-XXX` trailer may be used where it provides useful linkage, but the Playbook does not require one universal commit format or one-task/one-commit cardinality.
