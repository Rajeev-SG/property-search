# 002 — Monorepo bootstrap and dev ergonomics

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Harden the TypeScript monorepo scaffold so local development, package boundaries, and validation commands are reliable for the rest of the backlog.
- If this ticket is already complete, mark it `done` and continue to the next queued ticket.

## Scope

- Review workspace/package structure, package manifests, TS config, and CLI entrypoints.
- Add missing package manifests, exports, scripts, or shared config needed for a clean multi-package implementation path.
- Ensure root commands cover doctor, typecheck, tests, and package-aware workflows without relying on chat context.
- Add or refine minimal tests around any monorepo/harness code introduced.
- Continue from existing partial scaffold rather than rebuilding it.

## Files to touch

- `package.json`
- `pnpm-workspace.yaml`
- `tsconfig.json`
- `turbo.json`
- `apps/cli/**`
- `packages/**`
- `scripts/**`
- `.github/workflows/ci.yml`
- `README.md`
- `docs/TESTING.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Keep local-only infra assumptions.
- Do not add cloud deployment manifests.
- Do not add unnecessary framework complexity.
- Keep imports/exports explicit and agent-legible.
- Any new command or package boundary must be documented.
- Tests/evals are required for significant harness changes.

## Acceptance criteria

- The workspace layout supports the planned app/package split without placeholder ambiguity.
- Root validation commands succeed once dependencies are installed.
- CI reflects the same minimum validation gates used locally.
- README and testing docs explain how a new agent or human runs the core checks.
- Future implementation tickets can add code without first repairing package plumbing.

## Test plan

- Run `pnpm install` if dependencies are not present.
- Run `pnpm doctor`.
- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any newly added package or CLI smoke checks.

## Rollback notes

- Revert workspace/config changes as a single unit if package resolution or scripts break.
- Restore previous CI configuration if the new setup blocks unrelated work, but keep any doc fixes that remain accurate.

## Dependencies

- `001`

## Deliverables

- Hardened workspace/package configuration.
- Reliable local and CI validation flow.
- Updated docs for developer/operator startup.

## Status update instructions

- When starting, set Ticket `002` as active and `in_progress` in both `docs/PROJECT_STATUS.md` and `docs/TICKET_INDEX.md`.
- If the acceptance criteria are already satisfied, mark Ticket `002` `done`, note the evidence in `docs/DEVELOPMENT_LOG.md`, and advance the next ticket.
- If you find partial work, extend it instead of replacing it wholesale, and document the delta.
- If blocked, record the exact package/config issue and recommended fix path in `docs/PROJECT_STATUS.md` and mark the ticket `blocked`.
- On completion, update `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `docs/DEVELOPMENT_LOG.md`, and any affected onboarding docs.

## Human instructions (if any)

- Run `pnpm install` if it has not already been run in the repo.
