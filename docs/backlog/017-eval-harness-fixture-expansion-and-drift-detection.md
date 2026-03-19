# 017 — Eval harness, fixture expansion, and drift detection

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Build the evaluation harness that measures extraction quality, expands fixture coverage, and surfaces drift or regressions by domain and extractor path.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Implement fixture-based eval runners and scorecards.
- Expand the fixture corpus beyond the single synthetic example to cover representative real or sanitized domain cases.
- Report failing fields, extractor paths, domains, and likely causes.
- Add drift-detection output conventions that later sessions can compare over time.
- Update the existing eval skill and testing docs to match the actual harness.

## Files to touch

- `data/fixtures/**`
- `tests/**`
- `packages/**`
- `apps/cli/**`
- `scripts/**`
- `docs/QUALITY_SCORE.md`
- `docs/TESTING.md`
- `skills/extraction-evals/SKILL.md`
- `docs/RELIABILITY.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Keep gold fixtures in the repo.
- Do not weaken schema requirements to make evals pass.
- Explain failures in diagnosable terms.
- Preserve evidence for fixture-derived assertions.
- Add or update docs together with harness changes.

## Acceptance criteria

- The repo can run fixture-based evals that report pass/fail and actionable failure detail.
- Fixture coverage extends beyond the initial synthetic-only example.
- Drift reporting conventions exist and are documented.
- Testing and quality docs reflect the actual eval workflow.

## Test plan

- Run `pnpm validate:fixture`.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any new eval CLI or script command introduced by the ticket.
- Manually inspect generated scorecards or drift outputs.

## Rollback notes

- Revert eval harness code, fixtures, and docs together if reporting becomes misleading or unstable.
- Never delete fixture evidence without replacing it or documenting why.

## Dependencies

- `010`
- `011`
- `012`
- `013`
- `014`
- `016`

## Deliverables

- Eval runner and scorecard outputs.
- Expanded fixture corpus.
- Drift-detection conventions and updated eval/testing docs.

## Status update instructions

- Mark Ticket `017` active and `in_progress` on start.
- If the eval harness already satisfies acceptance criteria, mark it `done`, record the evidence, and continue.
- If partial work exists, continue from it and document the delta.
- If blocked by missing fixtures or unclear quality thresholds, record the blocker and recommended next move in `docs/PROJECT_STATUS.md`.
- On completion, update all status files and any stale quality/testing docs.

## Human instructions (if any)

- Approve or provide any additional real-page fixtures only if repository policy requires explicit human confirmation.
