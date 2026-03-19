# 007 — Source-registry ingestion and normalization

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Implement ingestion of the raw seed CSV into the normalized internal source-registry model with provenance preserved.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Parse the current enriched `data/seeds/estate-agents.csv` shape.
- Normalize rows into the internal source-registry contract documented in the repo.
- Persist normalized source records and raw-row provenance.
- Handle multiple rows per domain or branch without losing attribution.
- Add fixtures/tests for ingestion behavior and continue from any prior partial implementation.

## Files to touch

- `data/seeds/**`
- `packages/**`
- `apps/cli/**`
- `scripts/**`
- `db/migrations/**`
- `tests/**`
- `docs/product-specs/source-registry.md`
- `README.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Treat the checked-in seed CSV as repository evidence.
- Preserve raw-row traceability.
- Do not silently drop enriched columns.
- Keep the normalized internal contract stable and documented.
- Add tests for normalization and duplicate/branch cases.
- Do not require external services beyond local repo infrastructure.

## Acceptance criteria

- The repo can ingest the checked-in seed CSV into normalized source-registry records.
- Provenance from raw rows is preserved and inspectable.
- The importer behavior is covered by tests or fixtures.
- Docs clearly describe the supported raw input and normalized output contracts.

## Test plan

- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any new CLI or script command introduced for source ingestion.
- Manually inspect stored normalized records and provenance fields for a small sample of rows.

## Rollback notes

- Revert ingestion code, storage changes, and doc changes together.
- Do not delete the checked-in raw seed CSV during rollback.
- If migration changes were applied, document reset steps before reverting.

## Dependencies

- `001`
- `003`
- `004`
- `006`

## Deliverables

- Source-registry ingestion code.
- Normalization logic with provenance retention.
- Tests or fixtures covering real-seed edge cases.

## Status update instructions

- Set Ticket `007` active and `in_progress` when work begins.
- If the importer already satisfies acceptance criteria, mark it `done`, log the proof, and continue.
- If partial work exists, continue from that state and record what remained unfinished.
- If blocked by seed-data ambiguity, document the exact decision needed and the proposed default behavior in `docs/PROJECT_STATUS.md`.
- On completion, update all status files and any source-registry docs touched.

## Human instructions (if any)

- Only respond if the repo docs do not resolve a raw-seed policy decision; otherwise no human action is required.
