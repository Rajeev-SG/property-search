# Testing

## Required test layers

1. unit tests for schema and normalization helpers
2. fixture tests for extraction outputs
3. adapter contract tests
4. end-to-end thin-slice tests on synthetic fixtures
5. domain evals on real saved pages once collected
6. migration smoke checks on a fresh local Postgres database when schema work changes

## CI gates

At minimum:
- `pnpm run doctor`
- `pnpm validate:fixture`
- `pnpm typecheck`
- `pnpm run typecheck:workspace`
- `pnpm test`
- `pnpm run smoke:cli` when CLI/package wiring changes

## External vendor smoke tests

Use targeted smoke tests when changing provider credentials, provider defaults, or external capability wiring.

Commands:
- `pnpm smoke:vendors`
- `pnpm smoke:browser-use`

These are not required on every local edit, but they should be run whenever provider setup or provider-facing harness logic changes.

## Database smoke tests

Use `pnpm db:smoke` when changing SQL migrations or schema verification logic. It creates a fresh temporary database, applies the checked-in migrations, verifies the expected core tables, and drops the temporary database again.

## Artifact storage smoke tests

Use `pnpm artifacts:smoke` when changing the run ledger or filesystem artifact layout. It creates a synthetic run manifest plus sample raw/rendered/extracted/diagnostic files under `artifacts/runs/` so naming and evidence capture can be inspected directly.

## Crawl/fetch smoke tests

Use `pnpm crawl:smoke` when changing Ticket `008` fetch/render orchestration, provider response persistence, source-target resolution, or replay diagnostics. It prefers the first enabled `source_registry` row in the local database and falls back to the deterministic fixture only when the registry is unavailable or empty.

## Eval philosophy

- gold examples live in the repo
- failing evals should explain why
- domain drift should be surfaced as fixture updates or adapter changes
