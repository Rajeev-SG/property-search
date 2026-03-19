# 005 — Run ledger and local artifact storage foundation

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Implement the local filesystem artifact layout and run-level metadata needed to make crawl, extraction, and replay failures diagnosable.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Define the artifact directory structure and naming conventions for runs, raw pages, rendered content, extracted outputs, screenshots, and diagnostic metadata.
- Implement a run ledger or equivalent metadata model that records provider, URL, timestamps, artifact paths, and failure classes.
- Add helper utilities for creating and locating artifact paths deterministically.
- Add tests around artifact path generation and run metadata recording.
- Reuse the existing `artifacts/` root rather than introducing remote storage.

## Files to touch

- `artifacts/`
- `packages/**`
- `scripts/**`
- `apps/cli/**`
- `db/migrations/**`
- `ARCHITECTURE.md`
- `docs/RELIABILITY.md`
- `README.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Filesystem storage only in this phase.
- Do not add S3, MinIO, or any remote artifact backend.
- Persist enough metadata to replay or inspect failures.
- Keep artifact naming deterministic and safe for repeated runs.
- Add tests or fixtures for storage conventions.

## Acceptance criteria

- The repo defines a stable on-disk artifact layout for local mode.
- Every run can record enough metadata to locate related raw, rendered, extracted, and diagnostic artifacts.
- Storage helpers are covered by tests.
- Docs explain where evidence lives and how later tickets should use it.

## Test plan

- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any new CLI or script smoke check added for artifact/run creation.
- Manually inspect generated files under `artifacts/` for naming and metadata correctness.

## Rollback notes

- Revert storage helper changes, run-ledger persistence changes, and docs together.
- Do not delete captured evidence without replacing it or documenting the reason.

## Dependencies

- `003`
- `004`

## Deliverables

- Local artifact storage helpers.
- Run metadata/ledger foundation.
- Updated reliability and storage docs.

## Status update instructions

- Mark Ticket `005` active and `in_progress` when you begin.
- If the run ledger and artifact conventions already satisfy acceptance criteria, mark it `done` and record the evidence.
- If partial work exists, continue from that implementation and document any changed conventions.
- If blocked, capture the precise artifact-model issue in `docs/PROJECT_STATUS.md` and mark the ticket `blocked`.
- On completion, update status files and any stale documentation describing evidence persistence.

## Human instructions (if any)

- No human action is required unless local filesystem permissions prevent artifact creation.
