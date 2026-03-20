# GitHub PR automation runbook

Use this runbook for unattended Symphony ticket runs after implementation is complete and validation is green.

## Goal

Keep branch, PR, review-loop, and merge behavior inside the repository workflow instead of pushing repo-specific handoff policy into Symphony core.

## Preconditions

- Work is complete for the active ticket.
- Relevant validation has already passed for the touched scope.
- The workspace is git-backed.
- `gh` is installed and authenticated.

## Branch ownership rules

- Use one branch per active ticket / PR.
- Reuse the same branch while the PR remains open.
- Do not create multiple PRs for the same branch.
- If the branch already has an open PR, update that PR instead of creating a new one.

## PR create or update flow

1. Confirm GitHub auth before any PR operations.

   ```bash
   gh auth status
   ```

2. Detect the current ticket branch and repository default branch.

   ```bash
   CURRENT_BRANCH="$(git branch --show-current)"
   DEFAULT_BRANCH="$(gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name')"
   ```

3. Look for an existing open PR for the branch.

   ```bash
   gh pr list --head "$CURRENT_BRANCH" --state open --json number,title,body,url,headRefName,baseRefName
   ```

4. Build the PR body from `.github/pull_request_template.md` and fill every section with concrete ticket-specific detail before calling `gh pr create` or `gh pr edit`.

   ```bash
   cp .github/pull_request_template.md "$PR_BODY_FILE"
   ```

5. If no open PR exists for the branch, create one.

   ```bash
   gh pr create \
     --head "$CURRENT_BRANCH" \
     --base "$DEFAULT_BRANCH" \
     --title "$PR_TITLE" \
     --body-file "$PR_BODY_FILE"
   ```

6. If an open PR already exists, update it in place when the title or body is stale.

   ```bash
   gh pr edit "$PR_NUMBER" --title "$PR_TITLE" --body-file "$PR_BODY_FILE"
   ```

## Review and check gathering

Collect all of the following before deciding whether the PR is ready to merge.

1. Review state, comments, mergeability, and status rollup.

   ```bash
   gh pr view "$PR_NUMBER" \
     --json reviewDecision,reviews,comments,statusCheckRollup,mergeStateStatus,mergeable,title,body,url
   ```

2. Required checks only.

   ```bash
   gh pr checks "$PR_NUMBER" --required --json name,bucket,state,workflow,link
   ```

3. Unresolved review threads so thread-level blockers are not missed.

   ```bash
   gh api graphql \
     -F owner='{owner}' \
     -F name='{repo}' \
     -F prNumber="$PR_NUMBER" \
     -f query='query($owner: String!, $name: String!, $prNumber: Int!) {
       repository(owner: $owner, name: $name) {
         pullRequest(number: $prNumber) {
           reviewThreads(first: 100) {
             nodes {
               isResolved
               isOutdated
               path
               comments(first: 20) {
                 nodes {
                   body
                   url
                   author {
                     login
                   }
                 }
               }
             }
           }
         }
       }
     }'
   ```

## Blocking vs non-blocking feedback

Treat the following as blocking unless GitHub clearly indicates otherwise:

- failing required checks
- pending required checks
- `reviewDecision` that still requires changes or approval
- unresolved review threads with actionable requests
- mergeability or permission failures

Treat the following as non-blocking unless they are tied to required approval or merge policy:

- informational comments
- outdated comments that no longer apply
- stylistic nits that do not affect approval or checks

## Fix loop

When there is actionable review or failing required checks that the unattended run can address:

1. Apply the smallest fix on the same branch.
2. Rerun the narrowest relevant validation for the changed surface area.
3. Commit with a precise follow-up message.
4. Push to the same branch.
5. Re-run the PR inspection steps above.
6. Repeat until merge conditions are satisfied or the flow is blocked.

## Merge rules

Only merge when all of the following are true:

- required checks are green
- no blocking review state remains
- no unresolved blocking review thread remains
- GitHub reports the PR as mergeable

Inspect repository merge settings when you need to choose the merge strategy.

```bash
gh repo view --json viewerDefaultMergeMethod,mergeCommitAllowed,rebaseMergeAllowed,squashMergeAllowed,deleteBranchOnMerge
```

Merge with remote branch deletion as part of completion.

```bash
gh pr merge "$PR_NUMBER" --delete-branch
```

After merge succeeds, post a final Linear comment that links the merged PR and records the validation/check snapshot used for the unattended handoff.

Do not move the Linear issue to `Done` merely because auto-merge or a merge queue was requested. Move it to `Done` only after GitHub reports the PR as merged.

If current-head OpenReview is still pending but remains within the configured timeout window, keep the issue in `In Progress` and add a Linear milestone comment that makes the active PR wait state visible instead of falling back to `In Review`.

## OpenReview lifecycle visibility

Use explicit lifecycle labels in Linear milestone comments so the unattended run leaves a durable audit trail for the current PR head:

- `triggered`: the PR exists and the `@openreview-property-search` trigger comment was posted; record the PR URL and trigger timestamp immediately.
- `pending`: OpenReview has not produced a current-head result yet, but the configured timeout window has not expired; keep the issue in `In Progress` and make the wait state visible instead of escalating to `In Review`.
- `responded_actionable`: OpenReview returned change requests or other blocking feedback for the current head; record the response timestamp, keep working on the same branch, and treat the feedback as blocking until resolved or explicitly satisfied.
- `responded_non_blocking`: OpenReview returned approval-style or informational feedback for the current head; record the response timestamp and proceed with the normal merge gating rules.
- `timed_out_or_escalated`: no current-head result arrived before the configured timeout, or another explicit external blocker made further unattended progress unsafe; move the issue to `In Review` with the PR URL, trigger timestamp, latest observed OpenReview state, and timeout or blocker details.

Each milestone comment should capture, in concise form:

- PR URL
- OpenReview trigger timestamp
- OpenReview response timestamp when available
- final lifecycle classification for the current PR head

## Fallback to `In Review`

If the unattended run cannot complete merge automatically, move the ticket to `In Review` and stop only when there is an explicit blocker such as:

- missing GitHub auth
- insufficient repository or branch permissions
- unresolved required review
- failing or indefinitely pending required checks
- merge conflict or mergeability state the run cannot resolve safely

Record a precise blocker summary that includes:

- the PR URL
- whether the blocker is review, checks, auth, permissions, or mergeability
- the exact failing or pending checks
- the unresolved review thread or review decision, when applicable
- why the unattended run did not apply a further fix automatically
