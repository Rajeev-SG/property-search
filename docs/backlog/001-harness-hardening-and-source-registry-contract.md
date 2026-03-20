# 001 — Harness hardening and source-registry contract

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Reconcile the real checked-in `data/seeds/estate-agents.csv` with the documented source-registry contract so future implementation starts from a deterministic repository-owned input boundary.
- If this ticket is already complete, mark it `done` in the status files and move to the next queued ticket.

## Scope

- Update docs and validation tooling so the repository clearly distinguishes the raw enriched seed CSV from the normalized internal source-registry contract.
- Decide whether `data/seeds/estate-agents.example.csv` should be updated, supplemented, or explicitly labeled as a simplified example.
- Tighten `scripts/doctor.ts` and any related harness checks to verify the new status/backlog files and source-registry docs exist.
- Record any unresolved product decision that still requires human confirmation.
- If prior partial work exists, continue from it instead of recreating files.

## Files to touch

- `README.md`
- `AGENTS.md`
- `data/seeds/README.md`
- `data/seeds/estate-agents.example.csv`
- `docs/HARNESS_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`
- `docs/product-specs/source-registry.md`
- `scripts/doctor.ts`
- `tests/`

## Constraints

- Keep the repo local-only for this phase.
- Do not introduce S3, MinIO, or any cloud object-store dependency.
- Do not introduce observability stacks.
- Preserve repository legibility for clean agent chats.
- Do not leave undocumented behavior.
- Update docs together with code changes.
- Add tests or validation coverage for any changed harness logic.
- Preserve the checked-in real seed CSV as evidence; do not delete it.

## Acceptance criteria

- The repo clearly documents the difference between raw source input and normalized internal source-registry records.
- `pnpm run doctor` verifies the repaired harness/status files relevant to agent-first continuation.
- No root or seed doc still implies that the simplified example CSV is the only supported source shape.
- The next clean agent can determine, from repo docs alone, how source-registry work should begin.
- Any remaining human decision is explicitly documented in `docs/PROJECT_STATUS.md`.

## Test plan

- Run `pnpm run doctor`.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Manually verify that `README.md`, `data/seeds/README.md`, and `docs/product-specs/source-registry.md` tell the same story.

## Rollback notes

- Revert the doc and harness-check changes together.
- If `estate-agents.example.csv` is changed and causes confusion, restore the previous example file and keep the contract clarification in docs until a better example is ready.
- Do not roll back status-file improvements that other tickets already depend on without replacing them.

## Dependencies

- None.

## Deliverables

- Reconciled source-registry documentation.
- Hardened harness checks.
- Any required test coverage updates.
- Updated status files reflecting completion or blockers.

## Status update instructions

- When starting, set `docs/PROJECT_STATUS.md` active ticket to `001` and status to `in_progress`, and mark Ticket `001` as active in `docs/TICKET_INDEX.md`.
- Before coding, inspect the repo; if acceptance criteria are already met, mark Ticket `001` as `done`, log that finding in `docs/DEVELOPMENT_LOG.md`, and advance the next ticket.
- If you discover partial work, continue from the current state rather than redoing it, and note the partial state in `docs/DEVELOPMENT_LOG.md`.
- If blocked, update `docs/PROJECT_STATUS.md` with blocker details and the exact recommended next move, then mark Ticket `001` as `blocked` in `docs/TICKET_INDEX.md`.
- On completion, update `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `docs/DEVELOPMENT_LOG.md`, and any stale docs touched by the contract change.

## Human instructions (if any)

- Confirmed: the enriched checked-in `data/seeds/estate-agents.csv` is the permanent raw repo input contract, and future inputs should preserve the same header while varying by row content.
