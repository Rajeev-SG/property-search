# 010 — Deterministic extraction ladder core

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Implement the deterministic extraction ladder stages that do not require LLM fallback: structured data, script/blob parsing, and DOM extraction with evidence capture.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Implement structured-data extraction from JSON-LD and similar page signals.
- Implement script/blob parsing for obvious embedded property payloads.
- Implement deterministic DOM extraction helpers for high-value fields.
- Produce extraction outputs with field-level evidence and extraction-path metadata.
- Add fixture-backed tests using synthetic and any newly captured gold pages.

## Files to touch

- `packages/extract/**`
- `packages/domain/**`
- `packages/adapters/**`
- `apps/cli/**`
- `tests/**`
- `data/fixtures/**`
- `docs/design-docs/extraction-ladder.md`
- `docs/product-specs/canonical-schema.md`
- `docs/QUALITY_SCORE.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Prefer deterministic extraction before any LLM path.
- Record field-level evidence for extracted values.
- Do not treat partial extraction as full success without flags.
- Keep extractor steps modular and measurable.
- Add or expand fixtures and tests as part of the work.

## Acceptance criteria

- The repo can extract a property fixture through deterministic ladder stages into the documented output contract.
- Extracted fields include evidence and extraction-path metadata.
- Tests cover structured-data, script/blob, and DOM paths.
- The extraction ladder docs match the implemented stage ordering and failure semantics.

## Test plan

- Run `pnpm validate:fixture`.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any new extraction CLI workflow against fixture pages and inspect the output/evidence.

## Rollback notes

- Revert extractor changes, fixture updates, and contract/docs together if outputs regress.
- Preserve failing fixtures or artifacts if they are needed to explain a rollback.

## Dependencies

- `003`
- `005`
- `008`
- `009`

## Deliverables

- Deterministic extraction-stage implementations.
- Evidence-bearing extraction outputs.
- Fixture-backed tests for ladder stages.

## Status update instructions

- Mark Ticket `010` active and `in_progress` when you begin.
- If the deterministic extraction core already satisfies acceptance criteria, mark it `done`, record the evidence, and continue.
- If partial work exists, continue from it and document what was already present.
- If blocked by missing fixture coverage or unresolved contract semantics, record the blocker and next move in `docs/PROJECT_STATUS.md`.
- On completion, update status files and any stale extraction/schema docs.

## Human instructions (if any)

- No human action is required unless additional real-page fixtures need approval for capture and storage.
