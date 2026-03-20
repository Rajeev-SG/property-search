---
tracker:
  kind: linear
  api_key: $LINEAR_API_KEY
  project_slug: "property-search-15b283a12982"
  review_state: "In Review"
  active_states:
    - Todo
    - In Progress
  terminal_states:
    - Done
    - Canceled
    - Duplicate
polling:
  interval_ms: 5000
workspace:
  root: ~/code/symphony-workspaces/property-search
hooks:
  after_create: |
    set -euo pipefail
    REPO_URL="${PROPERTY_SEARCH_REPO_URL:-}"
    SOURCE_PATH="${PROPERTY_SEARCH_SOURCE_PATH:-/Users/rajeev/Code/property-search}"
    if [ -n "$REPO_URL" ]; then
      git clone --depth 1 "$REPO_URL" .
    elif [ -d "$SOURCE_PATH/.git" ]; then
      SOURCE_REMOTE_URL="$(git -C "$SOURCE_PATH" remote get-url origin 2>/dev/null || true)"
      SOURCE_BRANCH="$(git -C "$SOURCE_PATH" symbolic-ref --quiet --short HEAD 2>/dev/null || true)"
      git clone --no-local "$SOURCE_PATH" .
      CURRENT_ORIGIN_URL="$(git remote get-url origin 2>/dev/null || true)"
      if [ -n "$SOURCE_REMOTE_URL" ] && [ "$CURRENT_ORIGIN_URL" != "$SOURCE_REMOTE_URL" ]; then
        git remote set-url origin "$SOURCE_REMOTE_URL"
        CURRENT_ORIGIN_URL="$SOURCE_REMOTE_URL"
      fi
      if [ "$CURRENT_ORIGIN_URL" = "$SOURCE_PATH" ]; then
        echo "after_create: workspace origin still points at local source path; GitHub PR automation will be unavailable." >&2
        exit 1
      fi
      if [ -n "$CURRENT_ORIGIN_URL" ]; then
        git fetch origin --prune
        if [ -n "$SOURCE_BRANCH" ] && git show-ref --verify --quiet "refs/remotes/origin/$SOURCE_BRANCH"; then
          git checkout -B "$SOURCE_BRANCH" "origin/$SOURCE_BRANCH"
        fi
      fi
    else
      rsync -a --delete \
        --exclude='node_modules' \
        --exclude='artifacts' \
        --exclude='.turbo' \
        "$SOURCE_PATH"/ ./
    fi
    if [ -f "$SOURCE_PATH/.env" ]; then
      cp "$SOURCE_PATH/.env" .env
    elif [ -f .env.example ]; then
      cp .env.example .env
    fi
    pnpm install --frozen-lockfile
    docker compose up -d
    pnpm run doctor
  before_remove: |
    docker compose down --remove-orphans || true
agent:
  max_concurrent_agents: 1
  max_turns: 30
codex:
  command: codex --config shell_environment_policy.inherit=all --config model_reasoning_effort=medium --model gpt-5.4 app-server
  approval_policy: never
  thread_sandbox: danger-full-access
  turn_sandbox_policy:
    type: dangerFullAccess
github:
  openreview:
    app_slug: "openreview-property-search"
    trigger_comment: "@openreview-property-search please review this PR end to end and leave your findings as a GitHub review comment."
    required: true

---

You are working on a Linear ticket `{{ issue.identifier }}` for the `property-search` repository.

The Codex sandbox is intentionally set to `danger-full-access` here because the earlier `workspace-write` policy blocked `.git/refs` writes plus networked `gh` PR automation steps that this unattended workflow requires. Keep the scope local to this repository workspace and revisit if a narrower policy can reliably preserve the same git/gh handoff behavior.

{% if attempt %}
Continuation context:

- This is retry attempt #{{ attempt }} because the ticket is still in an active state.
- Resume from the current workspace state instead of restarting from scratch.
- Do not repeat already-completed investigation or validation unless needed for new code changes.
{% endif %}

Issue context:
Identifier: {{ issue.identifier }}
Title: {{ issue.title }}
Current status: {{ issue.state }}
Labels: {{ issue.labels }}
URL: {{ issue.url }}

Description:
{% if issue.description %}
{{ issue.description }}
{% else %}
No description provided.
{% endif %}

Instructions:

1. This is an unattended orchestration session. Never ask a human to perform follow-up actions unless a required secret, auth token, or external permission is genuinely missing.
2. Work only inside the isolated workspace copy of this repository.
3. Keep changes narrowly scoped to the Linear issue and the documented backlog/plan.
4. Final response should report completed work, validation run, and blockers only.

## Repository source of truth

Read in this order before implementation:

1. `docs/PROJECT_STATUS.md`
2. `docs/TICKET_INDEX.md`
3. the active or referenced ticket under `docs/backlog/`
4. `AGENTS.md`
5. `README.md`
6. any directly relevant docs under `docs/`

## Property-search working rules

- Treat repository docs as the system of record.
- Preserve evidence for extraction behavior and do not drop provenance.
- Prefer deterministic extraction first, schema-constrained LLM extraction second, and site-specific adapters only when necessary.
- Keep artifact storage local under `artifacts/`.
- Update docs/status files when behavior, workflow, or ticket state meaningfully changes.
- Avoid unrelated refactors.

## AGENTS.md alignment requirements

- Keep changes scoped to the active Linear issue and the corresponding repo ticket or backlog item.
- Every significant task must leave behind tests, fixtures, docs, or metrics.
- Follow the repo's preferred workflow: read status docs first, implement the smallest end-to-end slice, run tests and fixture validation, update stale docs/status, then commit with a precise message.
- Update any and all relevant documentation affected by the change, including repo docs, examples, setup instructions, architecture notes, workflow docs, status files, and harness metadata.
- Treat stale docs, stale workflow guidance, and stale harness metadata as defects to fix as part of the task when relevant.
- Do not claim completion unless the requested work is implemented and the relevant validation has been run.
- If validation could not be run, state exactly what was not run, why, and the likely impact.
- When a task is fully completed and validated, create a git commit with a concise, helpful message.
- Do not create a git commit for partial, broken, or unvalidated work.
- If a commit is not possible, state why in the final report and keep the ticket in `In Progress` unless the human explicitly wants handoff without a commit.

 ## Tracker routing

- `Backlog` -> do not modify the issue; stop and wait for it to move into an active state.
- `Todo` -> move to `In Progress` before implementation.
- `In Progress` -> execute the work and keep the issue there until the implementation and validation bar is met.
- `In Review` -> fallback review state only; use it when branch/PR work exists but merge cannot complete automatically. Do not code unless a human moves the issue back to `In Progress`.
- `Done`, `Canceled`, `Duplicate` -> terminal; do nothing.

`In Review` is intentionally excluded from `active_states` so Symphony stops polling a ticket once it has reached human review or another non-automatable merge blocker.

## Handoff state model

- Start: if a ticket is in `Todo`, immediately move it to `In Progress` before making changes.
- Execute: keep the ticket in `In Progress` while reproducing, implementing, validating, and updating docs.
- Handoff: once scope is complete and validation is green, create or reuse the ticket branch, create a git commit with a precise message, push the ticket branch, and create or update the PR that corresponds to it.
- Review loop: once a PR exists, inspect review comments, unresolved review threads, review state, OpenReview state for the current PR head, and required checks; apply actionable fixes on the same branch; commit, push, and re-check until merge conditions are satisfied or the flow is blocked.
- Re-entry: if a prior run stopped in `In Review`, a human may move the ticket back to `In Progress` after new information, changed permissions, or explicit review direction makes another unattended pass worthwhile.
- Closure: move to `Done` only after merge is actually complete and Symphony runtime reconciliation has confirmed the merged PR, final Linear completion comment, and remote branch deletion state.
- Blockers: if required secrets, auth, or external permissions are missing, leave the ticket in `In Progress`, record the blocker clearly, and stop.

## Ticket git lifecycle

- Use one branch per active ticket / PR.
- Reuse that branch while its PR remains open.
- Start new ticket branches from the current remote default branch state.
- Use precise commit messages with subject, what changed, why, and validation.
- After pushing, create or update the PR for the ticket branch instead of creating multiple competing branches.
- Reuse an existing PR for the branch if one already exists; do not create multiple PRs for the same ticket branch.
- Gather PR review comments, review threads, review state, and required check status before deciding whether more fixes are needed.
- The configured OpenReview app for this repository is `openreview-property-search`; the PR flow must keep that review current for the latest pushed head commit.
- Apply actionable feedback on the same branch, then commit, push, and re-check the same PR.
- Merge only when required checks are green, no blocking review state remains, and OpenReview is satisfied for the current PR head.
- If merge succeeds, request remote branch deletion as part of merge and let the terminal-state cleanup remove the isolated workspace.
- If merge cannot complete automatically because checks, review requirements, permissions, or another explicit blocker remain, move the ticket to `In Review` and stop with a precise blocker summary.

## GitHub PR automation defaults

- Prefer `gh` over manual GitHub web flows for PR lookup, creation, editing, review inspection, checks, and merge.
- Verify GitHub auth before PR operations with `gh auth status`.
- Build unattended PR bodies from `.github/pull_request_template.md` and keep every section populated with concrete repo-specific details before calling `gh pr create` or `gh pr edit`.
- Detect the current ticket branch before PR work and keep using that branch for the entire unattended run.
- Detect the repository default branch with `gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'` when you need an explicit PR base.
- Look up an existing open PR for the current branch with `gh pr list --head "$CURRENT_BRANCH" --state open --json number,title,body,url,headRefName,baseRefName`.
- If no open PR exists for the branch, create one with `gh pr create --head "$CURRENT_BRANCH" --base "$DEFAULT_BRANCH" --title "$PR_TITLE" --body-file "$PR_BODY_FILE"`.
- If an open PR already exists, update it in place with `gh pr edit "$PR_NUMBER" --title "$PR_TITLE" --body-file "$PR_BODY_FILE"` when the title or body is stale.
- After PR creation or update, ensure OpenReview is triggered by commenting `@openreview-property-search ...` on the PR whenever the current PR head has not been reviewed yet.
- Inspect PR state with `gh pr view "$PR_NUMBER" --json reviewDecision,reviews,comments,statusCheckRollup,mergeStateStatus,mergeable,title,body,url`.
- Inspect required checks with `gh pr checks "$PR_NUMBER" --required --json name,bucket,state,workflow,link`.
- Inspect unresolved review threads with `gh api graphql` against `repository.pullRequest.reviewThreads` so thread-level blockers are not missed.
- Treat current-head OpenReview as blocking until one of these is true:
  - OpenReview approved the current head, or
  - OpenReview reviewed the current head without actionable feedback, or
  - every actionable OpenReview thread on the current head is resolved or explicitly rebutted with a valid reason.
- If new commits are pushed after OpenReview reviewed the PR, re-trigger OpenReview for the updated head and do not merge until that refreshed review completes.
- Distinguish blocking feedback from non-blocking or informational comments where possible; do not churn on pure nits unless they block approval or merge.
- For actionable feedback or failing checks, apply the smallest fix on the same branch, rerun the narrowest relevant validation, create a precise follow-up commit, push, and re-check the same PR.
- Repeat the review and fix loop until merge conditions are satisfied or the flow is blocked by review, checks, auth, permissions, or another explicit non-automatable condition.
- Merge with `gh pr merge "$PR_NUMBER" --delete-branch` only when required checks are green and no blocking review state remains. Use the repository-allowed merge strategy.
- Keep Linear updated with concise milestone comments when implementation starts, when the PR is created, when OpenReview requires follow-up changes, when follow-up changes are pushed, when the PR is approved or merged, and when the workflow is blocked.
- After merge succeeds, post a final Linear comment that links the merged PR and records the validation/check snapshot used for the handoff.
- Move the Linear issue to `Done` only after merge succeeds. Runtime reconciliation must still verify the final comment plus remote branch cleanup before the ticket remains closed.
- If auth is missing, permissions are insufficient, required review remains unresolved, or checks cannot pass automatically, move the issue to `In Review`, record the exact blocker summary with the PR URL and blocking signals, and stop.

## Execution flow

1. Read the issue and map it to the current repo backlog/status docs.
2. If the issue corresponds to a repo ticket, follow that ticket's scope, constraints, and validation plan.
3. Reproduce the current behavior or establish the current baseline before editing code.
4. Implement the smallest end-to-end slice that satisfies the issue.
5. Add or update the tests, fixtures, docs, or metrics required to satisfy the repo definition of done for the scope you touched.
6. Run the most relevant validation commands for the touched area.
7. Update any stale docs, examples, setup instructions, workflow docs, status files, or harness metadata that became inaccurate because of the change.
8. If the task is complete and validation is green, create or reuse the ticket branch and create a git commit with a precise message.
9. Push the ticket branch, detect whether a PR for that branch already exists, and create or update exactly one PR for it.
10. Collect PR review comments, unresolved review threads, review state, mergeability, OpenReview state for the current PR head, and required check status.
11. If OpenReview has not yet reviewed the current head, trigger or re-trigger `@openreview-property-search` on the same PR and wait for that review before attempting merge.
12. If there is actionable PR or OpenReview feedback, or a failing required check that can be addressed automatically, apply the smallest fix on the same branch, rerun the narrowest relevant validation, create a precise follow-up commit, push, and return to the previous step.
13. Repeat the review and fix loop until merge conditions are satisfied or the flow is blocked by review, OpenReview, checks, auth, permissions, or another explicit non-automatable condition.
14. Merge with `gh pr merge "$PR_NUMBER" --delete-branch` only when required checks are green, no blocking review state remains, and OpenReview is satisfied for the current PR head.
15. If merge cannot complete automatically because review requirements, OpenReview, checks, auth, permissions, or another explicit blocker still need human attention, move the issue to `In Review`, record the exact blocker summary with the PR URL and blocking signals, and stop.
16. Move the Linear issue to `Done` only after merge succeeds and Symphony runtime reconciliation has verified the merged PR, completion comment, and branch cleanup outcome.
17. Summarize completed work, evidence-backed progress, validation, final ticket state, blockers, and any unresolved risks.

## Default validation commands

Use the narrowest relevant set first, then broaden if needed:

- `pnpm run doctor`
- `pnpm typecheck`
- `pnpm test`
- `pnpm validate:fixture`
- `pnpm smoke:vendors`
- `pnpm smoke:browser-use`

For significant implementation work, prefer to include both `pnpm test` and `pnpm validate:fixture` unless the touched area clearly does not require one of them.

## Bootstrap assumptions for this repo

- Dependencies are installed with `pnpm install --frozen-lockfile`.
- Local services start with `docker compose up -d`.
- `docker-compose.yml` must stay workspace-safe so isolated Symphony clones can boot infra without global container-name conflicts.
- Repo readiness is checked with `pnpm run doctor`.
- Repo bootstrap defaults to the local source path `/Users/rajeev/Code/property-search`, cloning from that path when `.git` is available so ticket workspaces remain git-backed.
- `PROPERTY_SEARCH_REPO_URL` is an optional override for cloning from a remote instead.
- The long-term raw source input contract is `data/seeds/estate-agents.csv`.
- External provider credentials are expected in `.env`.
