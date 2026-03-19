# 013 — Normalization pipeline and synonym management

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Implement normalization of extracted listing data into stable canonical values using repository-managed synonym tables and deterministic helpers.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Implement normalization helpers for price, property type, listing status, tenure, address/postcode, and related high-value fields.
- Use and refine the checked-in synonym seed files where appropriate.
- Record when normalization makes inferred or lossy decisions.
- Add tests covering representative edge cases from fixtures and synonym tables.
- Continue from the existing normalize package scaffold rather than replacing it wholesale.

## Files to touch

- `packages/normalize/**`
- `packages/domain/**`
- `data/seeds/**`
- `tests/**`
- `data/fixtures/**`
- `docs/product-specs/canonical-schema.md`
- `docs/QUALITY_SCORE.md`
- `packages/normalize/README.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Prefer deterministic normalization logic.
- Keep synonym tables repo-managed and auditable.
- Do not silently coerce ambiguous values without recording the decision path where needed.
- Update docs when normalization semantics change.
- Add tests and fixture coverage for normalization logic.

## Acceptance criteria

- Extracted data can be normalized into the documented canonical value space for key search fields.
- Synonym-table usage is test-covered and documented.
- Ambiguous normalization behavior is explicit rather than hidden.
- Downstream dedupe and indexing tickets can consume normalized records without redefining field semantics.

## Test plan

- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any new normalization CLI or script smoke checks against fixtures.
- Manually inspect a sample of normalized outputs for expected canonical values.

## Rollback notes

- Revert normalization helpers, seed-table edits, and contract/docs together.
- If synonym tables were changed, preserve replacement evidence or restore the old tables fully.

## Dependencies

- `003`
- `010`
- `011`
- `012`

## Deliverables

- Normalization helpers.
- Managed synonym-table usage.
- Tests/fixtures covering normalization behavior.

## Status update instructions

- Mark Ticket `013` active and `in_progress` when starting.
- If normalization work already satisfies acceptance criteria, mark it `done`, record the evidence, and continue.
- If partial work exists, continue from it and document what was already implemented.
- If blocked by unresolved canonical semantics, record the blocker and the smallest decision needed in `docs/PROJECT_STATUS.md`.
- On completion, update all status files and stale normalization/schema docs.

## Human instructions (if any)

- No human action is required unless a domain-specific normalization policy needs product confirmation.
