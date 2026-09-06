# Agent Instructions for <PROJECT_NAME>

## Project
<One sentence describing the project and stack.>

## Authority and sources

- Authoritative work / intent: <ISSUE, SPEC, TRACKER, OR FILE>
- Durable decisions / ADRs: <DECISION SOURCE>
- Project verification entrypoint: <VERIFY COMMAND OR CI JOB>
- Acceptance policy / decision authority: <POLICY OR OWNER>
- Execution constraints / permission policy: <POLICY LOCATION OR NONE>

Use the systems that already own these facts. Do not create tracked mirrors merely for the agent.

## Before making a change

Confirm the next bounded change is sufficiently ready to execute and judge:

- intended observable outcome;
- material scope and exclusions;
- success / acceptance criteria or other oracle;
- relevant constraints and durable decisions;
- unresolved material questions or stop conditions;
- when the promised outcome extends beyond incorporation, the required downstream boundary.

If a consequential ambiguity remains, stop and ask rather than inventing the missing requirement.

## While working

- Stay within authorized scope; do not add drive-by refactors.
- Use the repository's normal verification commands as implementation feedback.
- Do not weaken tests, CI, policy, security controls, or acceptance criteria merely to make the candidate pass.
- Keep concurrent mutable work isolated where needed and make candidate ownership clear.
- Do not take external, production, destructive, credential-bearing, or otherwise hard-to-reverse actions without explicit execution authority.
- Record a durable decision only when its rationale or rejected alternatives should survive the current session.

## Candidate and evidence

- Treat the identifiable candidate change as the acceptance subject; do not require one task to equal one commit.
- Evidence must apply to the candidate and relevant target/integration context being evaluated.
- If candidate content, material integration context, or authoritative intent changes, refresh whatever evidence or approval no longer applies.
- Treat local verification as feedback. Use the project's authoritative boundary for claims that must hold before incorporation.
- Apply any additional obligations required by project policy or declared impact.
- Do not write Git-derived commit hashes into tracked completion state merely because Git already owns that fact.

## Stop / escalate

Stop and ask when any of these is true:

- authoritative intent is materially unclear or conflicting;
- the requested implementation exceeds authorized scope;
- a consequential execution or external-side-effect boundary would be crossed without permission;
- required evidence is unavailable, invalid for the candidate, or would need to be weakened to pass;
- a blocking finding, project invariant, or durable decision remains unresolved;
- the work requires an acceptance or exception decision the current actor is not authorized to make.

Add project-specific stop conditions only when they address a real failure mode or consequential invariant.

## Acceptance and completion

Verification establishes evidence. Review supplies judgment where required. Acceptance is an authorized decision; do not collapse these into one state.

Use the terminal outcome boundary promised by the work. Do not claim `done`, `shipped`, deployed, or confirmed unless the evidence establishes that state.

## Commit convention

Follow the repository's own commit convention. The Playbook does not require a universal task trailer, commit format, or one-task/one-commit cardinality.
