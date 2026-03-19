---
tracker:
  kind: linear
  api_key: $LINEAR_API_KEY
  project_slug: "property-search-15b283a12982"
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
    else
      rsync -a --delete \
        --exclude='.git' \
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
    pnpm doctor
  before_remove: |
    docker compose down --remove-orphans || true
agent:
  max_concurrent_agents: 1
  max_turns: 30
codex:
  command: codex --config shell_environment_policy.inherit=all --config model_reasoning_effort=high --model gpt-5.3-codex app-server
  approval_policy: never
  thread_sandbox: workspace-write
  turn_sandbox_policy:
    type: workspaceWrite
---

You are working on a Linear ticket `{{ issue.identifier }}` for the `property-search` repository.

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
- `In Review` -> handoff state only; do not code unless a human moves the issue back to `In Progress`.
- `Done`, `Canceled`, `Duplicate` -> terminal; do nothing.

`In Review` is intentionally excluded from `active_states` so Symphony stops polling a ticket once it has been handed off successfully.

## Handoff state model

- Start: if a ticket is in `Todo`, immediately move it to `In Progress` before making changes.
- Execute: keep the ticket in `In Progress` while reproducing, implementing, validating, and updating docs.
- Handoff: once scope is complete, the required validation passes, and a git commit has been created, move the ticket to `In Review` and stop.
- Re-entry: if human review requests changes, the human should move the ticket back to `In Progress`, which makes it eligible for another unattended run.
- Closure: move to `Done` only after review/merge is actually complete.
- Blockers: if required secrets, auth, or external permissions are missing, leave the ticket in `In Progress`, record the blocker clearly, and stop.

## Execution flow

1. Read the issue and map it to the current repo backlog/status docs.
2. If the issue corresponds to a repo ticket, follow that ticket's scope, constraints, and validation plan.
3. Reproduce the current behavior or establish the current baseline before editing code.
4. Implement the smallest end-to-end slice that satisfies the issue.
5. Add or update the tests, fixtures, docs, or metrics required to satisfy the repo definition of done for the scope you touched.
6. Run the most relevant validation commands for the touched area.
7. Update any stale docs, examples, setup instructions, workflow docs, status files, or harness metadata that became inaccurate because of the change.
8. If the task is complete and validation is green, create a git commit with a precise message before handing off.
9. If the task is complete, validation is green, and the commit succeeded, move the Linear issue to `In Review` before stopping.
10. If blocked by missing required access, or if a completed task cannot be committed, keep the issue in `In Progress`, record the blocker clearly, and stop.
11. Summarize completed work, evidence-backed progress, validation, final ticket state, blockers, and any unresolved risks.

## Default validation commands

Use the narrowest relevant set first, then broaden if needed:

- `pnpm doctor`
- `pnpm typecheck`
- `pnpm test`
- `pnpm validate:fixture`
- `pnpm smoke:vendors`
- `pnpm smoke:browser-use`

For significant implementation work, prefer to include both `pnpm test` and `pnpm validate:fixture` unless the touched area clearly does not require one of them.

## Bootstrap assumptions for this repo

- Dependencies are installed with `pnpm install --frozen-lockfile`.
- Local services start with `docker compose up -d`.
- Repo readiness is checked with `pnpm doctor`.
- Repo bootstrap defaults to the local source path `/Users/rajeev/Code/property-search`.
- `PROPERTY_SEARCH_REPO_URL` is an optional override for cloning from a remote instead.
- The long-term raw source input contract is `data/seeds/estate-agents.csv`.
- External provider credentials are expected in `.env`.
