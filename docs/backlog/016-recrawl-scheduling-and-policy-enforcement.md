# 016 — Recrawl scheduling and policy enforcement

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Implement recrawl scheduling, crawl-policy enforcement, and freshness tracking for local-first operation.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Implement scheduling logic for profiling, listing-page refresh, detail-page refresh, and changed-page prioritization.
- Enforce robots-derived or configured crawl-policy constraints in the local scheduler.
- Record recrawl decisions, freshness timestamps, and defer/block reasons.
- Add a local execution path for scheduled recrawl runs.
- Add tests for scheduling and policy behavior, continuing from any prior partial work if present.

## Files to touch

- `packages/crawl/**`
- `packages/**`
- `apps/cli/**`
- `scripts/**`
- `db/migrations/**`
- `tests/**`
- `docs/product-specs/recrawl-policy.md`
- `docs/RELIABILITY.md`
- `ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Respect robots and recorded crawl-policy signals.
- Keep scheduling local-first and repo-legible.
- Do not introduce external queue infrastructure unless explicitly documented and still local.
- Persist enough scheduling metadata to explain why a source or page was or was not recrawled.
- Add tests for policy and prioritization behavior.

## Acceptance criteria

- The repo can decide what to recrawl and when using persisted freshness/policy information.
- Crawl-policy constraints are enforced and recorded.
- Local execution paths exist for scheduled recrawl workflows.
- Tests cover key scheduling and policy cases.

## Test plan

- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any new recrawl or scheduler CLI smoke checks.
- Manually inspect scheduling decisions and freshness metadata for representative records.

## Rollback notes

- Revert scheduling logic, persistence changes, and docs together.
- If rollback affects local scheduled-state data, document reset or rebuild steps.

## Dependencies

- `009`
- `014`
- `015`

## Deliverables

- Local recrawl scheduler/policy implementation.
- Persisted freshness and scheduling metadata.
- Tests and updated recrawl/reliability docs.

## Status update instructions

- Mark Ticket `016` active and `in_progress` when starting.
- If acceptance criteria are already met, mark it `done`, log the evidence, and continue.
- If partial work exists, continue from it and document the remaining gaps.
- If blocked by unresolved policy semantics or missing supporting data, record the blocker and recommended next move in `docs/PROJECT_STATUS.md`.
- On completion, update all status files and any stale scheduling docs.

## Human instructions (if any)

- No human action is required unless a crawl-policy exception needs explicit approval.
