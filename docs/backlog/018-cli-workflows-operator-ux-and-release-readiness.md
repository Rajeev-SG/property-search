# 018 — CLI workflows, operator UX, and release readiness

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Turn the implemented pieces into a coherent local operator experience with stable CLI workflows, end-to-end smoke paths, refreshed docs, and release-readiness checks.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Extend the CLI so the main workflows are discoverable and runnable locally.
- Add end-to-end thin-slice commands that exercise source ingestion through search indexing on at least one controlled path.
- Refresh README, onboarding docs, and operational docs to match the implemented system.
- Harden CI and maintenance workflows so the repo stays agent-legible after implementation.
- Ensure status/backlog docs reflect the transition from planned to implemented work.

## Files to touch

- `apps/cli/**`
- `scripts/**`
- `tests/**`
- `.github/workflows/ci.yml`
- `README.md`
- `AGENTS.md`
- `ARCHITECTURE.md`
- `docs/**`
- `docs/backlog/**`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Keep the system local-only for this phase.
- Do not add cloud deployment scope.
- Keep CLI workflows explicit and diagnosable.
- Update docs and status files as part of completion.
- Add smoke tests or end-to-end checks where practical.

## Acceptance criteria

- A local operator can discover and run the primary workflows from repo docs and CLI help alone.
- The repo has an end-to-end thin-slice path that exercises the implemented pipeline in local mode.
- CI and maintenance docs reflect the actual delivered system.
- Status files clearly show whether the backlog is complete or what remains.

## Test plan

- Run `pnpm run doctor`.
- Run `pnpm validate:fixture`.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run the documented end-to-end CLI smoke workflow.
- Manually verify CLI help output and README onboarding steps.

## Rollback notes

- Revert CLI/doc/CI changes together if operator workflows become confusing or broken.
- If backlog/status files are rolled back, ensure a coherent active-ticket state remains in the repo.

## Dependencies

- `015`
- `016`
- `017`

## Deliverables

- Coherent local CLI/operator workflows.
- End-to-end smoke path.
- Final doc/CI/release-readiness refresh.

## Status update instructions

- Mark Ticket `018` active and `in_progress` when starting.
- If acceptance criteria are already met, mark it `done`, record the evidence, and close or advance the backlog accordingly.
- If partial work exists, continue from it and document what remained unfinished.
- If blocked by any upstream incomplete ticket, mark this ticket `blocked`, point to the blocking ticket IDs, and record the recommended next move in `docs/PROJECT_STATUS.md`.
- On completion, update `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `docs/DEVELOPMENT_LOG.md`, archive any completed tickets as appropriate, and refresh stale docs.

## Human instructions (if any)

- Run the documented end-to-end local workflow and confirm the operator experience if manual acceptance is desired.
