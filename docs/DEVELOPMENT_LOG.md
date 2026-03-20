# Development Log

## 2026-03-20T00:56:00Z — Ticket 002 completed and queue advanced

### What changed

- Marked Ticket `002` complete in the repo status files after validation passed.
- Advanced the active queue to Ticket `003`.
- Restored the tracked `artifacts/.gitkeep` placeholder so the ticket handoff does not include an unrelated artifact deletion.

### Why it changed

The implementation and validation bar for Ticket `002` is satisfied, so the repo’s operational state should now point at the next dependency-ready ticket instead of leaving the workspace in an in-progress handoff state.

### Files touched

- `artifacts/.gitkeep`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`
- `docs/DEVELOPMENT_LOG.md`

### Validation performed

- Re-ran `pnpm run doctor`.
- Re-ran `pnpm validate:fixture`.
- Re-ran `pnpm typecheck`.
- Re-ran `pnpm run typecheck:workspace`.
- Re-ran `pnpm test`.
- Re-ran `pnpm run smoke:cli`.

### Validation results

- All Ticket `002` validation commands passed after the workspace/package hardening changes.

### Follow-ups

- Start Ticket `003`.

## 2026-03-20T00:00:00Z — Ticket 002 monorepo bootstrap hardening

### What changed

- Added explicit workspace manifests for the existing app and package directories, plus a shared `@property-search/harness` package for repo-root-aware doctor, plan-listing, and fixture-validation helpers.
- Switched root script entrypoints from `tsx ...` to `node --import tsx ...` so `doctor` and `validate:fixture` run reliably in the current sandbox.
- Updated the CLI to import shared harness helpers through a real workspace package instead of reaching into root scripts with relative imports.
- Added package-level TypeScript configs and a root `typecheck:workspace` command to verify workspace boundaries explicitly.
- Updated CI to use `pnpm install --frozen-lockfile`, `pnpm run doctor`, workspace typechecks, and a CLI smoke check.
- Refreshed README, testing guidance, AGENTS/workflow docs, and status files to match the real command surface.
- Updated the unattended workspace bootstrap hook so future local-source workspaces clone `.git` when available instead of rsyncing without commit history.

### Why it changed

Ticket `002` requires the repo to have explicit package boundaries, reliable validation commands, and CI/onboarding instructions that match the actual monorepo behavior. The prior scaffold still depended on root-only manifests, stale `pnpm doctor` guidance, and brittle cross-package relative imports.

### Files touched

- `package.json`
- `pnpm-lock.yaml`
- `tsconfig.base.json`
- `tsconfig.json`
- `turbo.json`
- `vitest.config.ts`
- `apps/cli/package.json`
- `apps/cli/tsconfig.json`
- `apps/cli/src/index.ts`
- `packages/adapters/package.json`
- `packages/adapters/tsconfig.json`
- `packages/crawl/package.json`
- `packages/crawl/tsconfig.json`
- `packages/dedupe/package.json`
- `packages/domain/package.json`
- `packages/domain/tsconfig.json`
- `packages/extract/package.json`
- `packages/extract/tsconfig.json`
- `packages/harness/package.json`
- `packages/harness/tsconfig.json`
- `packages/harness/src/*.ts`
- `packages/index/package.json`
- `packages/normalize/package.json`
- `scripts/doctor.ts`
- `scripts/list-plans.ts`
- `scripts/validate-synthetic-fixture.ts`
- `tests/synthetic-fixture.test.ts`
- `tests/workspace-layout.test.ts`
- `.github/workflows/ci.yml`
- `README.md`
- `docs/HARNESS_AUDIT.md`
- `docs/TESTING.md`
- `docs/backlog/001-harness-hardening-and-source-registry-contract.md`
- `docs/backlog/002-monorepo-bootstrap-and-dev-ergonomics.md`
- `docs/backlog/018-cli-workflows-operator-ux-and-release-readiness.md`
- `docs/exec-plans/active/001-monorepo-bootstrap.md`
- `AGENTS.md`
- `WORKFLOW.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

### Validation performed

- Ran `pnpm run doctor`.
- Ran `pnpm validate:fixture`.
- Ran `pnpm typecheck`.
- Ran `pnpm run typecheck:workspace`.
- Ran `pnpm test`.
- Ran `pnpm run smoke:cli`.

### Validation results

- Root doctor entrypoint: passed after switching away from the `tsx` CLI wrapper.
- Synthetic fixture validation: passed after switching away from the `tsx` CLI wrapper.
- Root TypeScript check: passed.
- Workspace package typechecks: passed.
- Vitest suite: passed.
- CLI doctor smoke check: passed from the package entrypoint.

### Follow-ups

- Re-run `pnpm install --frozen-lockfile` from a git-backed workspace with dependency access.
- Create the required handoff commit and move Ticket `002` to review.

### Blockers

- This isolated workspace copy was created without `.git`, so the required commit/handoff step cannot be completed from the current session.
- A fresh `pnpm install --frozen-lockfile` rerun could not be completed in this sandbox after a workspace-link refresh attempt because registry access is blocked and the local pnpm store is missing `@types/node@24.12.0`.

## 2026-03-19T22:17:00Z — Source-registry contract confirmed and Ticket 001 closed

### What changed

- Recorded that the enriched checked-in `data/seeds/estate-agents.csv` is the long-term raw repo input contract.
- Recorded that future repository-managed inputs should preserve the same header shape while varying only by row content.
- Recorded that external service API keys are already present in `.env`.
- Updated the current status files to close Ticket `001` and advance the active queue to Ticket `002`.

### Why it changed

The remaining uncertainty around the seed CSV contract and provider setup has now been resolved by human confirmation, so the harness should stop treating those items as open decisions.

### Files touched

- `README.md`
- `data/seeds/README.md`
- `docs/HARNESS_AUDIT.md`
- `docs/product-specs/source-registry.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`
- `docs/backlog/001-harness-hardening-and-source-registry-contract.md`

### Validation performed

- Manually verified that `README.md`, `data/seeds/README.md`, and `docs/product-specs/source-registry.md` now tell the same source-contract story.

### Follow-ups

- Start Ticket `002`.
- Run `docker compose up -d` before infra-dependent implementation tickets.

## 2026-03-19T21:43:00Z — Cloudflare retest passed and Oxylabs removed

### What changed

- Retested `pnpm smoke:vendors` after updating the Cloudflare token.
- Confirmed Cloudflare Browser Rendering now passes the live smoke test.
- Removed Oxylabs from the active provider type surface, env example, smoke test script, and active harness docs.
- Removed the local Oxylabs credentials from `.env` because the harness no longer uses them.

### Why it changed

Cloudflare credentials were refreshed successfully, while Oxylabs is no longer part of the active vendor plan and should not remain in the repo’s current harness or validation surface.

### Files touched

- `.env`
- `.env.example`
- `AGENTS.md`
- `README.md`
- `ARCHITECTURE.md`
- `packages/crawl/src/provider.ts`
- `scripts/smoke-external-vendors.ts`
- `docs/HARNESS_AUDIT.md`
- `docs/references/providers.md`
- `docs/design-docs/provider-escalation.md`
- `docs/PROJECT_STATUS.md`

### Validation performed

- Ran `pnpm smoke:vendors` after the Cloudflare credential update.

### Validation results

- OpenRouter: passed.
- Firecrawl: passed.
- Cloudflare Browser Rendering: passed.
- Bright Data: passed.

### Follow-ups

- Continue Ticket `001`.
- Rerun `pnpm smoke:vendors` only when provider-facing harness logic changes again.

## 2026-03-19T21:35:00Z — Vendor harness updates and live smoke validation

### What changed

- Updated the repo harness to treat `browser-use` as an external vendor capability backed by OpenRouter.
- Replaced stale `OPENAI_API_KEY` references with `OPENROUTER_API_KEY`-based guidance.
- Removed stale `SOAX` references from the active harness/docs/provider surfaces.
- Merged the shared `/Users/rajeev/Code/tools/AGENTS.md` guidance into this repo’s `AGENTS.md`.
- Added `pnpm smoke:vendors` and `pnpm smoke:browser-use` scripts.
- Added `scripts/smoke-external-vendors.ts` and `scripts/browser-use-smoke.py`.
- Fixed a pre-existing Zod default typing issue in `packages/adapters/src/siteAdapter.ts` so typecheck could run.

### Why it changed

The harness needed an explicit browser automation vendor path, consistent OpenRouter naming, and an executable validation path for external providers already configured in `.env`.

### Files touched

- `README.md`
- `AGENTS.md`
- `ARCHITECTURE.md`
- `.env.example`
- `package.json`
- `packages/crawl/src/provider.ts`
- `packages/adapters/src/siteAdapter.ts`
- `scripts/doctor.ts`
- `scripts/smoke-external-vendors.ts`
- `scripts/browser-use-smoke.py`
- `docs/TESTING.md`
- `docs/HARNESS_AUDIT.md`
- `docs/references/providers.md`
- `docs/references/mcp-setup.md`
- `docs/design-docs/provider-escalation.md`
- `docs/PROJECT_STATUS.md`

### Validation performed

- Ran `pnpm install` successfully.
- Ran `pnpm typecheck` successfully after fixing the adapter schema default.
- Ran `pnpm smoke:vendors`.
- Ran `pnpm smoke:browser-use`.

### Validation results

- OpenRouter: passed.
- Firecrawl: passed.
- Bright Data: passed.
- browser-use with OpenRouter GLM-5: passed.
- Cloudflare Browser Rendering: failed with `401 Authentication error`.
- Oxylabs: failed with `401` for the tested API path.

### Follow-ups

- Fix Cloudflare Browser Rendering credentials or permissions, then rerun `pnpm smoke:vendors`.
- Confirm the correct Oxylabs credential/product pairing and rerun `pnpm smoke:vendors`.
- Continue Ticket `001` after vendor auth blockers are resolved or explicitly accepted.

### Human actions required

- Update or replace the Cloudflare Browser Rendering token if needed.
- Confirm the correct Oxylabs credentials or product endpoint.

## 2026-03-18T16:50:00Z — Harness audit, status repair, and delivery backlog generation

### What changed

- Audited the full repository seed for agent-first delivery readiness.
- Added `docs/HARNESS_AUDIT.md`.
- Added durable status files:
  - `docs/PROJECT_STATUS.md`
  - `docs/TICKET_INDEX.md`
  - `docs/DEVELOPMENT_LOG.md`
- Added `docs/exec-plans/README.md` to explain how broad execution plans relate to the new ticket system.
- Added `docs/backlog/` ticket files and `docs/backlog/archive/` for future completed or retired tickets.
- Added a dedicated source-registry spec and refreshed root/harness docs to reflect the real repo state.
- Updated provider and MCP reference docs with current official documentation pointers where helpful.

### Why it changed

The original seed had strong architectural intent but lacked the durable operational state needed for clean future agent sessions. It also contained a material mismatch between the documented example source CSV and the real checked-in seed CSV, which would have caused ambiguity for downstream implementation.

### Files touched

- `README.md`
- `AGENTS.md`
- `ARCHITECTURE.md`
- `data/seeds/README.md`
- `docs/HARNESS_AUDIT.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`
- `docs/exec-plans/README.md`
- `docs/product-specs/canonical-schema.md`
- `docs/product-specs/adapter-contract.md`
- `docs/product-specs/source-registry.md`
- `docs/product-specs/index.md`
- `docs/references/providers.md`
- `docs/references/mcp-setup.md`
- `docs/backlog/*.md`
- `docs/backlog/archive/README.md`
- `scripts/doctor.ts`

### Validation performed

- Inspected all major repository docs, scripts, fixtures, package seeds, and local infra files.
- Verified that `docs/PROJECT_STATUS.md`, `docs/DEVELOPMENT_LOG.md`, `docs/TICKET_INDEX.md`, and `docs/backlog/` were missing before this session.
- Verified that the real `data/seeds/estate-agents.csv` contract differs from `data/seeds/estate-agents.example.csv`.
- Queried official documentation for current external tool capabilities:
  - Typesense install and Docker guidance
  - Firecrawl quickstart and crawl/scrape capability
  - Cloudflare Browser Rendering rendered content and crawl endpoints

Blocked validation:
- `pnpm validate:fixture`
- `pnpm test`

Block reason:
- repo dependencies are not installed locally yet, so `tsx` and `vitest` are unavailable.

### Follow-ups

- Start Ticket `001`.
- After `pnpm install`, rerun `pnpm doctor`, `pnpm validate:fixture`, `pnpm typecheck`, and `pnpm test`.
- Keep `docs/PROJECT_STATUS.md` and `docs/TICKET_INDEX.md` updated during every future ticket.

### Human actions required

- Run `pnpm install`.
- Run `docker compose up -d` before infra-dependent tickets.
- Confirm the intended long-term contract for the enriched source CSV.
