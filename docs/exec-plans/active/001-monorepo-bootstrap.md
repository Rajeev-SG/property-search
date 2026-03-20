# 001 — Monorepo bootstrap

## Objective
Create a runnable local repository shell with docs, local infra, schema package, CLI shell, and CI.

## Scope
- package manager setup
- TypeScript config
- Docker Compose
- doctor script
- test harness thin slice
- repo docs

## Acceptance criteria
- `pnpm install --frozen-lockfile` succeeds
- `docker compose up -d` starts local services
- `pnpm run doctor` runs
- `pnpm test` runs
