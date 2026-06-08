# Promotion: development → public

This public repo is the **curated surface** of the Agentic Development Playbook.
A broader development version is maintained in a private sibling repository
(by collaboration invitation), which contains additional advanced patterns
(off-repo tracker pointers, hybrid tracker snippets, enterprise artifact
pointers, a `reviews/` folder of pre-public synthesis work) and serves as
the staging area for new work.

Promotion flow: develop on a feature branch in the private repo → open a
PR to the public repo → cut a public release. After the public release
ships, the conformance check, CI, and 3 promoted templates are cherry-picked
back into the private's main (the private's README, pyproject, and this
`PROMOTION.md` are not synced back — they are intentionally different).
