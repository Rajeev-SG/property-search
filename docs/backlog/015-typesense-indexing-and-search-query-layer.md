# 015 — Typesense indexing and search/query layer

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Implement the Typesense indexing pipeline and a local query/search layer over canonical property/search documents.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Define the search document projection from canonical entities.
- Create Typesense collection schema and indexing/update/delete workflows.
- Implement a local query path for search and faceting.
- Ensure index writes are traceable to canonical source records.
- Add tests and smoke checks for indexing and querying in local mode.

## Files to touch

- `packages/index/**`
- `packages/domain/**`
- `apps/cli/**`
- `scripts/**`
- `tests/**`
- `ARCHITECTURE.md`
- `docs/product-specs/search-facets.md`
- `packages/index/README.md`
- `README.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Use local Typesense only in this phase.
- Keep search-schema design aligned with documented v1 facets.
- Do not hardcode remote hosted search assumptions.
- Keep indexing idempotent and diagnosable.
- Add tests or local smoke checks for indexing/query behavior.

## Acceptance criteria

- Canonical records can be projected into search documents and indexed into local Typesense.
- Search queries and documented facets work in local mode.
- Indexing/update/delete flows are traceable and documented.
- Tests or smoke checks demonstrate local indexing and querying.

## Test plan

- Run `docker compose up -d`.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any new index/search CLI smoke commands introduced by this ticket.
- Manually verify indexed documents and search results in local Typesense.

## Rollback notes

- Revert Typesense schema/indexing/query changes and docs together if indexing behavior becomes unstable.
- If collection schemas changed locally, document how to reset or recreate the local index.

## Dependencies

- `004`
- `014`

## Deliverables

- Typesense collection schema and indexing flow.
- Local search/query interface.
- Tests or smoke checks for indexing and faceting.

## Status update instructions

- Mark Ticket `015` active and `in_progress` when starting.
- If indexing/search already meets acceptance criteria, mark it `done`, record the evidence, and continue.
- If partial work exists, continue from it and document what remained.
- If blocked by local Typesense configuration or search-schema ambiguity, record the blocker and next move in `docs/PROJECT_STATUS.md`.
- On completion, update all status files and stale indexing/search docs.

## Human instructions (if any)

- Ensure local Docker services, including Typesense, are running before validation.
