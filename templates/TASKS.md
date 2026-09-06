# Optional In-Repo Work Tracker

Use this file only when the repository does not already have an authoritative work system. GitHub Issues, Spec Kit, Jira/Linear, or another maintained tracker are equally valid.

Do not duplicate external tracker state here merely for the agent.

Each active item should either contain or link to enough information to make the next bounded change executable and judgeable: intended outcome, material scope, success/acceptance criteria, relevant constraints, and unresolved blockers.

Local IDs and state names are project conventions, not Playbook invariants.

## Active

- [ ] <ID>: <short title>
  - Intent: <authoritative link or short statement>
  - Scope: <material in/out boundary>
  - Acceptance: <observable success or link>
  - Owner: <role/name if useful>

## Ready

- [ ] <ID>: <short title>
  - Intent: <authoritative link or short statement>
  - Acceptance: <observable success or link>

## Blocked

- [ ] <ID>: <short title>
  - Blocked by: <material unresolved condition>

## Done

- [x] <ID>: <short title>

Do not require commit hashes or moved/archive files as completion bookkeeping. Use Git/PR/tracker history for state that those systems already own.
