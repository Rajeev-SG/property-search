# 012 — Declarative adapter system

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Implement the declarative adapter system that lets site-specific rules close persistent extraction gaps without replacing the generic pipeline by default.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Finalize the adapter schema and loader.
- Implement adapter validation, selection, and merge/override behavior.
- Define how adapters interact with profile hints, deterministic extraction, and LLM fallback.
- Add one or more real adapter examples derived from profiling evidence.
- Add tests covering validation, loading, and override behavior.

## Files to touch

- `packages/adapters/**`
- `packages/extract/**`
- `packages/crawl/**`
- `tests/**`
- `data/fixtures/**`
- `docs/product-specs/adapter-contract.md`
- `docs/design-docs/extraction-ladder.md`
- `skills/adapter-authoring/SKILL.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Adapters should close gaps, not replace the generic pipeline by default.
- Keep adapter semantics declarative and testable.
- Tie adapters to evidence from site profiling or fixture failures.
- Document why each real adapter exists.
- Add tests and at least one fixture/eval alongside significant adapter work.

## Acceptance criteria

- Adapter files validate against the documented schema.
- The loader can resolve and apply adapters deterministically.
- Real adapter examples are backed by fixtures or profiling evidence.
- Docs and the adapter-authoring skill describe how and when adapters should be created.

## Test plan

- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any new adapter-validation or extraction smoke checks.
- Manually verify that adapter selection and override behavior match documented rules.

## Rollback notes

- Revert adapter schema/loader changes and docs together if adapter resolution becomes ambiguous or unstable.
- Preserve any captured fixtures/evidence that justified adapter creation unless replaced.

## Dependencies

- `009`
- `010`
- `011`

## Deliverables

- Declarative adapter schema and loader.
- Real example adapter(s) with evidence.
- Tests and refreshed adapter docs/skill guidance.

## Status update instructions

- Mark Ticket `012` active and `in_progress` on start.
- If the adapter system already satisfies acceptance criteria, mark it `done`, log the proof, and continue.
- If partial work exists, continue from it and record what remained unfinished.
- If blocked by missing profiling evidence or unresolved override rules, document the blocker and recommended next move in `docs/PROJECT_STATUS.md`.
- On completion, update all status files and stale adapter/extraction docs.

## Human instructions (if any)

- No human action is required unless a product decision about adapter policy cannot be resolved from repo docs.
