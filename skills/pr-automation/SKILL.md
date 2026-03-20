---
name: pr-automation
description: Create or update the ticket PR, inspect review and checks, apply same-branch fixes, and merge or fall back to In Review with a precise blocker summary.
---

# PR automation skill

Use this skill when an unattended Symphony run has completed implementation and validation and needs to drive the branch, PR, review-loop, and merge lifecycle.

## Workflow

1. Read `docs/references/github-pr-automation.md`.
2. Confirm the workspace is git-backed and `gh` auth is available.
3. Build the PR body from `.github/pull_request_template.md` before creating or editing the PR, and keep every section concrete and ticket-specific.
4. Reuse the existing ticket branch and existing PR for that branch when they already exist.
5. Gather review comments, unresolved review threads, review state, mergeability, and required checks before deciding whether more fixes are needed.
6. Apply only actionable feedback that the unattended run can address safely, then commit, push, and re-check on the same branch.
7. Merge only when required checks are green and no blocking review state remains.
8. After merge succeeds, post a final Linear comment linking the merged PR and recording the validation/check snapshot used for completion.
9. Move the Linear issue to `Done` only after merge succeeds.
10. If auth, permissions, unresolved review, failing checks, or another explicit blocker prevent automatic merge, move the issue to `In Review` with a precise blocker summary.
