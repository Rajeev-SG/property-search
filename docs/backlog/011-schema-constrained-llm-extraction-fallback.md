# 011 — Schema-constrained LLM extraction fallback

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Implement the schema-constrained LLM fallback path for cases where deterministic extraction is insufficient, while preserving evidence and replayability.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Define the intermediate or canonical schema used for LLM extraction requests.
- Implement a provider-agnostic LLM extraction call path behind the provider abstraction.
- Record prompts, schema version, model, provider, confidence, and fallback reason in replayable metadata.
- Ensure deterministic extraction remains the default path and LLM fallback is invoked only when justified.
- Add fixture-backed tests or mocks for fallback orchestration and continue from any partial extraction-fallback work already present.

## Files to touch

- `packages/extract/**`
- `packages/crawl/**`
- `packages/domain/**`
- `apps/cli/**`
- `tests/**`
- `data/fixtures/**`
- `.env.example`
- `docs/design-docs/extraction-ladder.md`
- `docs/RELIABILITY.md`
- `docs/QUALITY_SCORE.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Deterministic extraction must remain first-choice.
- Do not hardcode API keys.
- LLM extraction must be schema-constrained and replay-diagnosable.
- Record why fallback was used.
- Do not loosen acceptance standards simply because an LLM path exists.
- Add test coverage using mocks/fakes rather than requiring live API calls.

## Acceptance criteria

- The repo can invoke an LLM fallback path through the internal abstraction when deterministic extraction is insufficient.
- Fallback usage records enough metadata to diagnose and replay failures.
- Tests cover fallback selection and metadata capture without requiring live credentials.
- Docs explain when LLM extraction is allowed and how it is evaluated.

## Test plan

- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any new extraction fallback smoke workflow with stubbed provider behavior.
- Manually inspect fallback metadata for reason, model/provider, schema, and evidence.

## Rollback notes

- Revert fallback orchestration, config/doc changes, and related tests together.
- If rollback removes metadata fields, update docs and status files so later tickets do not assume they exist.

## Dependencies

- `006`
- `010`

## Deliverables

- Schema-constrained LLM fallback implementation.
- Replayable fallback metadata capture.
- Tests and docs for fallback policy.

## Status update instructions

- Mark Ticket `011` active and `in_progress` when starting.
- If fallback behavior already satisfies acceptance criteria, mark it `done`, record the evidence, and continue.
- If partial work exists, continue from it and document the remaining gaps.
- If blocked by provider or prompt-contract ambiguity, record the blocker and recommended next move in `docs/PROJECT_STATUS.md`.
- On completion, update status files and any stale extraction/reliability docs.

## Human instructions (if any)

- Add the required LLM provider credential to `.env` only if live-provider validation is necessary.
