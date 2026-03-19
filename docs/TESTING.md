# Testing

## Required test layers

1. unit tests for schema and normalization helpers
2. fixture tests for extraction outputs
3. adapter contract tests
4. end-to-end thin-slice tests on synthetic fixtures
5. domain evals on real saved pages once collected

## CI gates

At minimum:
- typecheck
- doctor
- synthetic fixture validation
- vitest

## External vendor smoke tests

Use targeted smoke tests when changing provider credentials, provider defaults, or external capability wiring.

Commands:
- `pnpm smoke:vendors`
- `pnpm smoke:browser-use`

These are not required on every local edit, but they should be run whenever provider setup or provider-facing harness logic changes.

## Eval philosophy

- gold examples live in the repo
- failing evals should explain why
- domain drift should be surfaced as fixture updates or adapter changes
