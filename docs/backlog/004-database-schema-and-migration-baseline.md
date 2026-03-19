# 004 — Database schema and migration baseline

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Establish the first real Postgres schema and migration flow for source registry, profiles, raw artifacts, extracted listings, canonical entities, and linkage tables.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Define the relational schema needed for the local-first v1 pipeline.
- Create deterministic SQL migrations and any required migration runner workflow.
- Add indexes and constraints that reflect the documented data model.
- Keep raw evidence replayable and canonical linkage inspectable.
- Add schema tests or migration smoke checks.

## Files to touch

- `db/migrations/**`
- `db/init/**`
- `packages/**`
- `scripts/**`
- `apps/cli/**`
- `README.md`
- `ARCHITECTURE.md`
- `docs/RELIABILITY.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Use local Postgres only for this phase.
- Do not introduce external managed database dependencies.
- Preserve raw evidence pointers rather than embedding large artifacts in tables.
- Keep migrations deterministic and checked into the repo.
- Document any data-retention assumptions.

## Acceptance criteria

- The repo contains an executable migration baseline for the minimum pipeline tables.
- Table responsibilities match the architecture and product docs.
- A local developer can initialize the schema from repo files alone.
- Tests or smoke checks verify that migrations apply cleanly on a fresh local database.

## Test plan

- Run `docker compose up -d`.
- Run the new migration/apply command introduced by this ticket.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Manually verify that expected tables exist in local Postgres.

## Rollback notes

- Revert the migration set and runner changes together.
- If a migration has already been applied locally, provide explicit manual downgrade or reset instructions in docs before rolling back.

## Dependencies

- `002`
- `003`

## Deliverables

- Initial SQL migration set.
- Migration execution path documented in the repo.
- Minimal validation coverage for schema creation.

## Status update instructions

- Set Ticket `004` active and `in_progress` when starting.
- If the database baseline already exists and passes the acceptance criteria, mark it `done` and log the proof.
- If partial schema work exists, extend it carefully and note what was reused.
- If blocked by unresolved schema semantics, record the blocker and recommended next step in `docs/PROJECT_STATUS.md`.
- On completion, update all status files and any docs affected by table or migration changes.

## Human instructions (if any)

- Ensure local Docker is available and run `docker compose up -d` before validation.
