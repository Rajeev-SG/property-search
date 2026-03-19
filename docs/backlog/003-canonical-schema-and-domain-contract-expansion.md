# 003 — Canonical schema and domain contract expansion

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Make the domain contracts explicit enough that future agents can implement extraction, normalization, dedupe, and indexing without guessing field semantics.
- If this ticket is already complete, mark it `done` and move on.

## Scope

- Review the canonical property/listing schema, evidence model, and any implied search-document fields.
- Clarify invariants, optionality, provenance expectations, and separation between extracted listing record, canonical property entity, and search projection.
- Update machine-readable schemas and TypeScript types as needed.
- Add or update fixtures/tests that validate the revised contracts.
- Preserve backward compatibility where practical or document intentional breaking changes.

## Files to touch

- `packages/domain/src/canonicalProperty.ts`
- `packages/domain/src/canonical-property.schema.json`
- `packages/domain/src/index.ts`
- `data/fixtures/expected-json/*.json`
- `tests/**`
- `ARCHITECTURE.md`
- `docs/product-specs/canonical-schema.md`
- `docs/product-specs/search-facets.md`
- `docs/QUALITY_SCORE.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Keep the current local-first system boundaries.
- Do not weaken schema rigor just to make fixtures pass.
- Record evidence expectations explicitly.
- Keep docs and machine-readable contracts aligned.
- Add tests or fixture validation for any schema change.

## Acceptance criteria

- The canonical contract is unambiguous about required vs optional fields and evidence expectations.
- The repo clearly distinguishes extracted listing data from canonical entity and search-document responsibilities.
- Fixtures validate against the updated contract.
- Downstream tickets can reference this contract without redefining it.

## Test plan

- Run `pnpm validate:fixture`.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Manually inspect updated docs against the schema files for consistency.

## Rollback notes

- Revert schema, fixture, and doc changes together if downstream code or tests fail unexpectedly.
- If a breaking contract change is rolled back, update status files so later tickets do not assume the reverted shape.

## Dependencies

- `001`
- `002`

## Deliverables

- Updated TypeScript and JSON schema contracts.
- Expanded fixture coverage or updated gold outputs.
- Refreshed architecture/product docs.

## Status update instructions

- Mark Ticket `003` active and `in_progress` on start.
- If the schema work is already complete, mark the ticket `done`, log the evidence, and move on.
- If partial work exists, continue from it and document what was already present vs newly added.
- If blocked by unresolved product semantics, record the exact ambiguity and the smallest decision needed in `docs/PROJECT_STATUS.md`.
- On completion, update status files and any stale contract docs.

## Human instructions (if any)

- Confirm only if a product-level schema decision cannot be resolved from the existing docs and fixtures; otherwise no human action is required.
