# 014 — Dedupe, entity resolution, and canonical assembly

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Build dedupe and entity-resolution logic that links normalized listing records into canonical property entities while preserving source evidence and ambiguity handling.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Define listing-level duplicate detection and canonical clustering heuristics.
- Implement linkage records between source listings and canonical properties.
- Handle ambiguous matches with inspectable scores or flags rather than silent merges.
- Add tests and fixtures for obvious duplicate, non-duplicate, and ambiguous cases.
- Continue from any existing dedupe scaffold or docs rather than recreating them.

## Files to touch

- `packages/dedupe/**`
- `packages/domain/**`
- `packages/normalize/**`
- `db/migrations/**`
- `tests/**`
- `data/fixtures/**`
- `docs/RELIABILITY.md`
- `packages/dedupe/README.md`
- `ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Preserve source listing references and evidence.
- Do not silently merge ambiguous candidates.
- Keep heuristics explainable and testable.
- Record enough detail to understand why a linkage or non-linkage occurred.
- Add tests or fixtures for merge behavior.

## Acceptance criteria

- The repo can assemble canonical property entities from normalized listing records.
- Source-to-property linkage is persisted and inspectable.
- Ambiguous matches are surfaced explicitly.
- Tests cover duplicate, non-duplicate, and ambiguous examples.

## Test plan

- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any new dedupe smoke workflow introduced by the ticket.
- Manually inspect canonical assembly and linkage records for a representative sample.

## Rollback notes

- Revert dedupe logic, linkage persistence, fixture updates, and docs together.
- If rollback affects stored linkage data, document how local developers should reset or rebuild it.

## Dependencies

- `004`
- `013`

## Deliverables

- Dedupe/entity-resolution implementation.
- Canonical property assembly flow.
- Tests/fixtures for linkage behavior.

## Status update instructions

- Set Ticket `014` active and `in_progress` on start.
- If acceptance criteria are already satisfied, mark it `done`, log the evidence, and continue.
- If partial work exists, continue from it and document the delta.
- If blocked by insufficient fixture coverage or unresolved match policy, record the blocker and recommended next move in `docs/PROJECT_STATUS.md`.
- On completion, update status files and any stale dedupe/architecture docs.

## Human instructions (if any)

- No human action is required unless a merge-policy decision cannot be resolved from repo docs.
