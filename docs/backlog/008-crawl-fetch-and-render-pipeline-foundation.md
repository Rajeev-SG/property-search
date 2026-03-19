# 008 — Crawl, fetch, and render pipeline foundation

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Implement the local-first crawl/fetch/render foundation that can retrieve raw and rendered page artifacts through the provider abstraction.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Implement fetch modes for static HTML and rendered content.
- Persist artifacts and run metadata using the storage foundation.
- Handle provider attribution, timing, and failure capture.
- Support local testing through stubbed or fixture-backed providers as well as live providers where configured.
- Continue from the current placeholder crawl package rather than replacing it blindly.

## Files to touch

- `packages/crawl/**`
- `packages/**`
- `apps/cli/**`
- `scripts/**`
- `tests/**`
- `data/fixtures/**`
- `ARCHITECTURE.md`
- `docs/RELIABILITY.md`
- `docs/references/providers.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Respect local-only artifact storage.
- Do not assume every site needs rendering.
- Record provider used, fetch mode, URL, timestamps, and artifact paths.
- Do not rely exclusively on live network access for tests.
- Preserve diagnosable failures.

## Acceptance criteria

- The repo can fetch and persist a page artifact through the internal pipeline.
- Both static and rendered fetch paths are represented in code and contracts.
- Failure metadata is recorded in a replayable form.
- Tests or fixture-backed checks cover the fetch pipeline behavior.

## Test plan

- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any new crawl/fetch CLI smoke command against fixture-backed or allowed live inputs.
- Manually inspect recorded artifact and run metadata for correctness.

## Rollback notes

- Revert fetch/render code, artifact persistence changes, and related docs together.
- Keep captured artifacts needed as evidence unless replaced by equivalent fixtures.

## Dependencies

- `005`
- `006`
- `007`

## Deliverables

- Fetch/render pipeline foundation.
- Artifact persistence and failure capture integration.
- Test or fixture coverage for crawl behavior.

## Status update instructions

- Mark Ticket `008` active and `in_progress` when starting.
- If the pipeline already meets acceptance criteria, mark it `done`, record the evidence, and proceed.
- If partial work exists, continue from it and document the remaining gaps.
- If blocked by provider or environment issues, capture the exact issue and next step in `docs/PROJECT_STATUS.md`.
- On completion, update status files and any stale reliability/provider docs.

## Human instructions (if any)

- Provide provider credentials in `.env` only if live-provider validation is required for this ticket.
