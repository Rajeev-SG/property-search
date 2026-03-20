# Development Log

## 2026-03-20T18:28:00Z — Ticket 008 source-registry-backed crawl smoke target

### What changed

- Added a `source_registry` fetch-target lookup helper in `@property-search/harness` so the crawl/fetch smoke path can select a real enabled source row from Postgres.
- Extended `@property-search/crawl` smoke target resolution to prefer `source_registry` rows, preserve deterministic fixture fallback when the database is unavailable or empty, and surface the chosen target in run metadata and log output.
- Added CLI and root-script flags for `--fixture`, `--source-id`, and `--require-source-registry` so the unattended flow can force fixture mode, pin a specific source, or fail fast when the registry is expected.
- Added focused tests for source lookup and smoke target resolution, then updated status and testing docs to reflect that Ticket `008` now closes the planned handoff from source-registry ingestion into fetch/render.

### Why it changed

The previous Ticket `008` slice still hard-coded the smoke URL to `example.com`, while `docs/PROJECT_STATUS.md` explicitly called for swapping the smoke input over to real `source_registry` rows without regressing replayable artifacts or diagnostics. This closes that gap while keeping local deterministic fallback for test coverage and offline runs.

### Files touched

- `README.md`
- `ARCHITECTURE.md`
- `apps/cli/src/index.ts`
- `docs/DEVELOPMENT_LOG.md`
- `docs/PROJECT_STATUS.md`
- `docs/RELIABILITY.md`
- `docs/TESTING.md`
- `docs/TICKET_INDEX.md`
- `packages/crawl/src/smoke.ts`
- `packages/harness/src/sourceRegistry.ts`
- `scripts/crawl-fetch-smoke.ts`
- `tests/crawl-fetch-smoke.test.ts`
- `tests/source-registry-fetch-target.test.ts`

### Validation performed

- Ran `pnpm test -- tests/source-registry-fetch-target.test.ts tests/crawl-fetch-smoke.test.ts tests/crawl-fetch-pipeline.test.ts`.
- Ran `pnpm typecheck`.
- Ran `pnpm db:migrate`.
- Ran `pnpm run doctor`.
- Ran `pnpm validate:fixture`.
- Ran `pnpm source-registry:ingest`.
- Ran `pnpm run typecheck:workspace`.
- Ran `pnpm test`.
- Ran `pnpm run smoke:cli`.
- Ran `pnpm crawl:smoke -- --require-source-registry`.

### Validation results

- Focused source-selection, crawl-smoke, and fetch-pipeline tests: passed.
- Root and workspace TypeScript no-emit checks: passed.
- Doctor, synthetic fixture validation, full Vitest suite, and CLI doctor smoke: passed.
- `pnpm source-registry:ingest` inserted 63 enabled source rows from `data/seeds/estate-agents.csv`.
- `pnpm crawl:smoke -- --require-source-registry` succeeded against `source_registry` target `src_b82d8a13e317a1d5` with replayable manifest and diagnostics artifacts under `artifacts/runs/2026/03/20/20260320T182309Z-crawl-fetch-render-pipeline-smoke-a75579de6cf6/`.

## 2026-03-20T14:35:00Z — Ticket 008 fetch/render smoke pipeline foundation

### What changed

- Added a first `@property-search/crawl` fetch pipeline runner that executes static and rendered fetches, persists raw/rendered response bodies into the existing run-ledger layout, and writes a replayable diagnostics artifact summarizing each attempt.
- Added `pnpm crawl:smoke` plus a matching CLI command so Ticket `008` now has a concrete fetch/render smoke path instead of only lower-level provider and artifact helpers.
- Extended fake fetch providers to return deterministic HTML payloads and added focused tests for both the all-success path and a partial-failure render path.
- Updated the architecture, reliability, testing, provider-reference, and status docs so the repo records that Ticket `008` is now in progress with a concrete first slice.

### Why it changed

Ticket `008` needs an actual fetch/render orchestration path that reuses the existing provider registry and run-ledger foundation before discovery or live-provider work broadens the scope. This slice keeps the change small while proving artifact persistence and replayable failure capture end to end.

### Files touched

- `package.json`
- `apps/cli/package.json`
- `apps/cli/src/index.ts`
- `scripts/crawl-fetch-smoke.ts`
- `packages/crawl/package.json`
- `packages/crawl/src/fetchPipeline.ts`
- `packages/crawl/src/fakes.ts`
- `packages/crawl/src/index.ts`
- `packages/crawl/src/provider.ts`
- `packages/crawl/src/smoke.ts`
- `tests/crawl-fetch-pipeline.test.ts`
- `README.md`
- `ARCHITECTURE.md`
- `docs/RELIABILITY.md`
- `docs/TESTING.md`
- `docs/references/providers.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`
- `docs/DEVELOPMENT_LOG.md`

### Validation performed

- Ran `pnpm install` after the workspace dependency update so `pg` and the internal workspace links were present for the harness package.
- Ran `pnpm typecheck`.
- Ran `pnpm run typecheck:workspace`.
- Ran `pnpm test -- tests/crawl-fetch-pipeline.test.ts`.
- Ran `pnpm test`.
- Ran `pnpm crawl:smoke`.
- Ran `pnpm run smoke:cli`.
- Inspected `artifacts/runs/2026/03/20/20260320T142611Z-crawl-fetch-render-pipeline-smoke-6bd83c6bbf1d/run.json`.

### Validation results

- Root and workspace TypeScript checks: passed.
- Focused crawl-pipeline coverage and the full Vitest suite: passed.
- `pnpm crawl:smoke` created a successful Ticket `008` run manifest with raw, rendered, and diagnostics artifacts plus per-attempt fetch metadata.
- CLI doctor smoke still passed after the new crawl command wiring.

## 2026-03-20T11:55:00Z — Symphony runtime handoff reconciliation and OpenReview deployment findings

### What changed

- Implemented runtime-owned Symphony handoff reconciliation in the Elixir orchestrator so `Done` tickets are rechecked for merged PR state, final Linear completion comment presence, and remote branch cleanup before they remain closed.
- Extended the Symphony tracker boundary to support issue comment listing and added focused tests for merged recovery, automatable reopen, and human-blocked review routing.
- Updated the Symphony and `property-search` workflow/readme contract so `tracker.review_state` is explicit and runtime-owned `Done` verification is documented.
- Added `docs/references/openreview-vercel.md` with the current upstream OpenReview findings: the public app is still Anthropic-specific, so OpenRouter on Vercel requires a fork or upstream change rather than a pure env-only deployment.

### Why it changed

- The unattended ticket flow needed a runtime safety net so a premature state transition to `Done` could be corrected automatically or routed to a human review state instead of silently losing merge/comment/branch cleanup guarantees.
- The OpenReview follow-up needed a durable decision record showing that upstream OpenReview is not yet provider-configurable and documenting the smallest viable OpenRouter fork path.

### Files touched

- `WORKFLOW.md`
- `README.md`
- `docs/DEVELOPMENT_LOG.md`
- `docs/references/openreview-vercel.md`

### Validation performed

- Ran `mise exec -- mix test test/symphony_elixir/extensions_test.exs test/symphony_elixir/handoff_reconciler_test.exs test/symphony_elixir/core_test.exs` in `/Users/rajeev/Code/tools/symphony/elixir`.
- Inspected upstream `vercel-labs/openreview` source and docs for the deployment/model-provider path.

### Validation results

- Focused Symphony Elixir handoff tests: passed.
- Upstream OpenReview source inspection confirmed the app currently documents `ANTHROPIC_API_KEY` and hard-codes `anthropic/claude-sonnet-4.6` in the agent construction path.

### Follow-ups

- If an actual OpenReview implementation change is still wanted, clone or fork the upstream repo locally and patch `lib/agent.ts` plus env handling for OpenRouter before attempting a Vercel deployment.

## 2026-03-20T05:29:46Z — Ticket 006 provider abstraction and config wiring

### What changed

- Extended the partial `@property-search/crawl` scaffolding into a stable provider abstraction with explicit role contracts for discovery, static fetch, render, schema extraction, browser automation, and escalation.
- Added a provider registry/runtime resolution layer that separates configured provider names from actual runtime implementation, keeps `fake` execution as the repo default, and allows later tickets to register live factories per role/provider pair.
- Added a provider catalog with credential requirements, richer provider summary output, and a `pnpm providers:print` CLI path for inspecting resolved defaults, credential availability, runtime mode, and fallback reasons.
- Expanded provider-config tests to cover repo-managed env loading, deterministic fake execution, invalid config rejection, `auto`-mode fake fallback, and injected live-factory resolution.
- Updated `.env.example`, architecture notes, provider references, MCP notes, README commands, and status files so the documented provider contract matches the implementation.

### Why it changed

Ticket `006` requires a stable internal abstraction layer before later crawl/render/LLM tickets start binding directly to Firecrawl, Cloudflare, browser-use, or Bright Data. The registry now preserves local deterministic execution while keeping vendor-targeted defaults and credential requirements explicit.

### Files touched

- `.env.example`
- `ARCHITECTURE.md`
- `README.md`
- `apps/cli/package.json`
- `apps/cli/src/index.ts`
- `docs/design-docs/provider-escalation.md`
- `docs/references/mcp-setup.md`
- `docs/references/providers.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`
- `docs/DEVELOPMENT_LOG.md`
- `package.json`
- `packages/crawl/package.json`
- `packages/crawl/src/config.ts`
- `packages/crawl/src/fakes.ts`
- `packages/crawl/src/index.ts`
- `packages/crawl/src/provider.ts`
- `packages/crawl/src/registry.ts`
- `tests/provider-config.test.ts`
- `tsconfig.base.json`
- `vitest.config.ts`

### Validation performed

- Ran `pnpm typecheck`.
- Ran `pnpm run typecheck:workspace`.
- Ran `pnpm validate:fixture`.
- Ran `pnpm test -- tests/provider-config.test.ts`.
- Ran `pnpm test`.
- Ran `pnpm providers:print`.

### Validation results

- Root and workspace typechecks: passed.
- Synthetic fixture validation: passed.
- Provider-config coverage and full Vitest suite: passed.
- `pnpm providers:print` reported the configured vendor defaults, credential availability, `PROVIDER_EXECUTION_MODE=fake`, and deterministic fake-provider resolution for every role.

## 2026-03-20T04:40:00Z — Ticket 005 run ledger and local artifact storage foundation

### What changed

- Added `db/migrations/002_run_ledger_foundation.sql` to create the `ingestion_runs` table and link `raw_page_artifacts` back to a run ledger row.
- Added `packages/harness/src/artifacts.ts` with deterministic run IDs, per-run artifact directory helpers, run manifest writing, artifact registration helpers, and Postgres upsert support for run metadata.
- Added `pnpm artifacts:smoke`, `scripts/artifact-storage-smoke.ts`, and a matching CLI command so the repo can create a synthetic local run under `artifacts/runs/...` for validation.
- Added artifact storage tests and updated migration expectations for the new core table.
- Updated README, architecture, reliability, testing, migration, and status docs so the checked-in storage contract matches the implementation.

### Why it changed

Ticket `005` requires deterministic local artifact persistence and run metadata capture so later crawl, extraction, and replay failures can be inspected without inventing ad hoc storage conventions.

### Files touched

- `package.json`
- `apps/cli/package.json`
- `apps/cli/src/index.ts`
- `db/migrations/README.md`
- `db/migrations/002_run_ledger_foundation.sql`
- `packages/harness/src/artifacts.ts`
- `packages/harness/src/database.ts`
- `packages/harness/src/index.ts`
- `scripts/artifact-storage-smoke.ts`
- `tests/artifact-storage.test.ts`
- `tests/database-migrations.test.ts`
- `README.md`
- `ARCHITECTURE.md`
- `docs/RELIABILITY.md`
- `docs/TESTING.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`
- `docs/DEVELOPMENT_LOG.md`

### Validation performed

- Ran `docker compose up -d`.
- Ran `pnpm run doctor`.
- Ran `pnpm validate:fixture`.
- Ran `pnpm typecheck`.
- Ran `pnpm run typecheck:workspace`.
- Ran `pnpm run smoke:cli`.
- Ran `pnpm artifacts:smoke`.
- Ran `pnpm db:smoke`.
- Ran `pnpm test`.
- Inspected `artifacts/runs/2026/03/20/20260320T043339Z-artifact-storage-foundation-83e23be4fbb3/run.json`.

### Validation results

- Doctor, fixture validation, root and workspace typechecks, CLI smoke, fresh-database migration smoke, and full Vitest suite: passed.
- Artifact smoke created the expected nested run layout plus manifest and sample raw/rendered/extracted/diagnostic files under `artifacts/runs/...`.

## 2026-03-20T04:30:00Z — Ticket 004 database baseline in progress

### What changed

- Added the first checked-in SQL migration baseline at `db/migrations/001_pipeline_baseline.sql`.
- Added a deterministic Postgres migration runner, migration status reporter, and schema verifier to `@property-search/harness`.
- Added root and CLI entrypoints for `db:migrate`, `db:status`, and `db:verify`, plus a fresh-database smoke script.
- Updated architecture, reliability, README, and status docs to reflect the new database baseline and the artifact-path retention rule.
- Added migration discovery coverage in the test suite.

### Why it changed

Ticket `004` requires an executable Postgres schema baseline for source registry, profiling, raw artifact metadata, extracted listings, canonical properties, and listing-to-property linkage records. The repo previously only had placeholder migration docs.

### Files touched

- `package.json`
- `pnpm-lock.yaml`
- `apps/cli/package.json`
- `apps/cli/src/index.ts`
- `db/migrations/README.md`
- `db/migrations/001_pipeline_baseline.sql`
- `packages/harness/package.json`
- `packages/harness/src/database.ts`
- `packages/harness/src/index.ts`
- `scripts/db-migrate.ts`
- `scripts/db-status.ts`
- `scripts/db-verify.ts`
- `scripts/db-smoke.ts`
- `tests/database-migrations.test.ts`
- `README.md`
- `ARCHITECTURE.md`
- `docs/RELIABILITY.md`
- `docs/TESTING.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`
- `docs/DEVELOPMENT_LOG.md`

### Validation performed

- Ran `docker compose up -d`.
- Ran `pnpm db:smoke`.
- Ran `pnpm db:migrate`.
- Ran `pnpm db:status`.
- Ran `pnpm db:verify`.
- Ran `pnpm run doctor`.
- Ran `pnpm validate:fixture`.
- Ran `pnpm typecheck`.
- Ran `pnpm run typecheck:workspace`.
- Ran `pnpm run smoke:cli`.
- Ran `pnpm test`.

### Validation results

- Fresh temporary database migration smoke: passed.
- Default local database migration and schema verification: passed.
- Doctor, fixture validation, typechecks, CLI smoke, and full Vitest suite: passed.

## 2026-03-20T03:45:00Z — Unattended handoff guardrails hardened

### What changed

- Added `.github/pull_request_template.md` so unattended PRs have a concrete body structure instead of free-form summaries.
- Updated `WORKFLOW.md`, `AGENTS.md`, and `README.md` so the repo contract explicitly requires the PR template and a final Linear completion comment after merge.
- Updated `docs/references/github-pr-automation.md` and `skills/pr-automation/SKILL.md` so the reusable PR automation guidance matches the new template and final-comment requirements.
- Documented the existing `WORKFLOW.md` sandbox escalation from `workspace-write` to `danger-full-access`, including the rationale that unattended `git` ref writes and networked `gh` operations were blocked under the narrower sandbox.
- Expanded `tests/workflow-contract.test.ts` so the template and final-comment requirements stay locked into the repo contract.

### Why it changed

- A live unattended run merged a PR before checks had settled, left a vague PR body, and closed the Linear issue without a final completion comment. The repo contract now has a concrete template and explicit final-comment requirement so the hardened Symphony runtime can enforce the intended handoff flow.

### Files touched

- `.gitignore`
- `.github/pull_request_template.md`
- `WORKFLOW.md`
- `AGENTS.md`
- `README.md`
- `docs/references/github-pr-automation.md`
- `skills/pr-automation/SKILL.md`
- `tests/workflow-contract.test.ts`
- `docs/DEVELOPMENT_LOG.md`

## 2026-03-20T02:30:00Z — Live PR automation smoke validation

### What changed

- Added a minimal development-log entry on a dedicated validation branch so the unattended GitHub PR automation flow can be exercised against a real PR without changing product behavior.

### Why it changed

- The repository now has an explicit branch, PR, review-loop, and merge contract. This smoke step validates that the documented `gh`-based PR flow can be executed end-to-end against the live repository.

### Files touched

- `docs/DEVELOPMENT_LOG.md`

## 2026-03-20T02:15:00Z — GitHub PR automation workflow contract added

### What changed

- Expanded `WORKFLOW.md` so unattended Symphony ticket runs explicitly create or reuse one ticket branch, create or update exactly one PR for that branch, inspect PR feedback and required checks, apply same-branch fixes, and merge only when merge conditions are satisfied.
- Added `docs/references/github-pr-automation.md` as the repo-local `gh` runbook for PR lookup, review-thread inspection, required checks, merge gating, and `In Review` blocker reporting.
- Added `skills/pr-automation/SKILL.md` so future unattended runs can reuse the same PR automation lifecycle instead of rediscovering it.
- Updated `AGENTS.md` and `README.md` to keep the repo-level guidance aligned with the workflow contract.
- Added `tests/workflow-contract.test.ts` to lock the key PR automation requirements into the repo test suite.

### Why it changed

The unattended Symphony model for this repository is now branch and PR driven by default. The repository workflow needs to own PR creation, review/check gathering, same-branch fix loops, merge completion, and fallback `In Review` handling so Symphony can stay focused on orchestration and observability.

### Files touched

- `WORKFLOW.md`
- `AGENTS.md`
- `README.md`
- `docs/references/github-pr-automation.md`
- `skills/pr-automation/SKILL.md`
- `tests/workflow-contract.test.ts`
- `docs/DEVELOPMENT_LOG.md`

### Validation performed

- Ran `pnpm run doctor`.
- Ran `pnpm typecheck`.
- Ran `pnpm test -- tests/workflow-contract.test.ts`.

### Validation results

- `pnpm run doctor`: passed.
- `pnpm typecheck`: passed.
- `pnpm test -- tests/workflow-contract.test.ts`: passed. Under the current Vitest configuration this executed the full local test suite, including the new workflow-contract test.

### Remaining external dependencies

- The live `gh` PR creation, review-thread gathering, required-check inspection, and merge path was documented but not exercised in this session because it depends on GitHub auth, repository permissions, branch protection, and real PR/check state.

## 2026-03-20T01:52:01Z — Symphony workflow simplified around git-backed ticket branches

### What changed

- Updated `WORKFLOW.md` so local-source Symphony workspaces clone from the local repo when `.git` is available instead of only rsyncing a `.git`-less copy.
- Shifted the property-search automation model to workflow-owned git/PR/merge behavior instead of relying on Symphony-core handoff enforcement.
- Documented the intended ticket lifecycle as one branch per active ticket / PR, merge when possible, and remote branch deletion after merge.
- Clarified that `In Review` is now a fallback state for cases where merge cannot complete automatically.

### Why it changed

The previous local workspace bootstrap could create isolated workspaces without `.git`, which made commit/push handoff unreliable and pushed repo-specific review policy into Symphony core. The simplified model keeps Symphony focused on orchestration and observability while the repository workflow owns commit, push, PR, merge, and fallback review behavior.

### Files touched

- `WORKFLOW.md`
- `AGENTS.md`
- `README.md`

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

## 2026-03-20 — Ticket 003 contract expansion

### What changed

- Expanded `packages/domain/src/canonicalProperty.ts` from a single overloaded contract into explicit `ExtractedListing`, `CanonicalProperty`, and `SearchDocument` schemas with shared enums and evidence primitives.
- Reworked `packages/domain/src/canonical-property.schema.json` to expose all three contracts under `$defs` while keeping the root schema compatible with extracted-listing validation.
- Tightened evidence expectations so extracted-listing evidence must retain a field name, source, locator, and either a raw value or excerpt.
- Added synthetic canonical-property and search-document fixtures and updated the existing extracted-listing fixture with explicit evidence payloads.
- Updated fixture validation and tests so `pnpm validate:fixture` and `pnpm test` now cover all three contract layers.
- Added an Ajv-backed test to validate the machine-readable JSON schema against the extracted-listing, canonical-property, and search-document fixtures.
- Refreshed contract and architecture docs to define the layer boundaries, facet ownership, and quality-score expectations.

### Validation performed

- Ran `pnpm run doctor`.
- Ran `pnpm validate:fixture`.
- Ran `pnpm typecheck`.
- Ran `pnpm run typecheck:workspace`.
- Ran `pnpm test`.
- Ran `pnpm run smoke:cli`.

### Blockers

- `git checkout -b rajeevsgill/raj-6-003-canonical-schema-and-domain-contract-expansion` failed because the current sandbox cannot write under `.git/refs`.
- `gh auth status` failed because the configured `github.com` token is invalid.

### Next follow-up

- Resume in a git-writable workspace.
- Re-authenticate `gh`.
- Create the ticket branch, commit the validated changes, and continue PR automation from there.

### Tracker state

- Linear issue `RAJ-6` was moved to `In Review` because implementation and validation are complete, but the unattended branch/PR handoff is blocked by sandboxed `.git` writes and invalid GitHub auth.

## 2026-03-20 — Ticket 003 follow-up validation

### What changed

- Fixed the `tests/domain-schema-json.test.ts` Ajv import path so the new machine-readable schema test passes both `vitest` and repo-wide TypeScript validation.

### Validation performed

- Ran `pnpm run doctor`.
- Ran `pnpm validate:fixture`.
- Ran `pnpm typecheck`.
- Ran `pnpm test`.

### Blockers

- `git checkout -b rajeevsgill/raj-6-003-canonical-schema-and-domain-contract-expansion` still fails because the workspace cannot create refs under `.git/refs/heads`.
- `gh auth status` still reports the configured `github.com` token is invalid, so unattended PR creation and merge checks remain unavailable.

## 2026-03-20 — Ticket 003 handoff completed

### What changed

- Re-ran the Ticket `003` validation suite in a git-writable workspace with working GitHub auth.
- Committed the domain-contract expansion work on `rajeevsgill/raj-6-003-canonical-schema-and-domain-contract-expansion`.
- Opened PR `#2` for the ticket branch so the unattended flow could inspect mergeability, checks, and review state.
- Advanced the repo status docs to make Ticket `004` the next active execution target after Ticket `003`.

### Validation performed

- Ran `pnpm run doctor`.
- Ran `pnpm validate:fixture`.
- Ran `pnpm typecheck`.
- Ran `pnpm test`.

### PR and review state

- PR: `https://github.com/Rajeev-SG/property-search/pull/2`
- `gh pr view` reported the PR as mergeable with no blocking reviews.
- `gh pr checks --required` reported no required checks on the branch.
- Review-thread inspection returned no unresolved review threads.

## 2026-03-20T17:45:00Z — RAJ-26 OpenReview lifecycle validation prep

### What changed

- Clarified `docs/references/github-pr-automation.md` with explicit OpenReview lifecycle labels for unattended PR runs: `triggered`, `pending`, `responded_actionable`, `responded_non_blocking`, and `timed_out_or_escalated`.
- Documented the minimum Linear milestone comment payload for this workflow: PR URL, trigger timestamp, response timestamp when available, and the final lifecycle classification for the current PR head.

### Validation performed

- Ran `pnpm run doctor`.
- Ran `pnpm test -- --run tests/workflow-contract.test.ts`.

### Why this change exists

- `RAJ-26` is a disposable unattended validation ticket for verifying that the Symphony OpenReview lifecycle keeps active pending runs in `In Progress` and only falls back to `In Review` on an explicit timeout or blocker.

## 2026-03-20 — Ticket 007 source-registry importer

### What changed

- Added a deterministic source-registry importer in `packages/harness/src/sourceRegistry.ts`.
- Added CLI and root-script entrypoints for source-registry ingestion.
- Normalized crawlable rows from `data/seeds/estate-agents.csv` into the existing `source_registry` contract while preserving the full raw row in `raw_payload`.
- Recorded upstream evidence and derivation notes in `provenance_summary`, including source names, source IDs, portal profile URLs, and URL/domain derivation behavior.
- Added an ingest report under `artifacts/source-registry/ingests/...` so discovery-only rows without a crawlable site URL remain traceable with a stable skip reason instead of being silently dropped.
- Added a checked-in source-registry fixture and tests for quoted CSV parsing, duplicate-domain branch handling, derived domains, and unresolved rows.
- Updated the source-registry and seed docs to document the importer behavior and skip-report policy.

### Validation performed

- Ran `pnpm run doctor`.
- Ran `pnpm validate:fixture`.
- Ran `pnpm typecheck`.
- Ran `pnpm run typecheck:workspace`.
- Ran `pnpm test`.
- Ran `pnpm run smoke:cli`.
- Ran `pnpm source-registry:ingest -- --dry-run`.

### Blockers

- Live Postgres validation is still pending because `postgres://postgres:postgres@localhost:5432/property_search` timed out from this workspace.
- `docker compose up -d`, `docker compose ps`, and `docker ps` did not return usable output in this session, so the local database could not be brought up for the final import/inspection step.

### Next follow-up

- Restore local Docker/Postgres availability.
- Run `pnpm db:migrate`.
- Run `pnpm source-registry:ingest`.
- Inspect stored `source_registry` rows and the generated ingest report, then continue the unattended git/PR flow.

## 2026-03-20 — Ticket 007 live import validation

### What changed

- Recovered the local OrbStack Docker runtime after the API socket stalled during the first validation attempt.
- Started the local Postgres service for the current workspace, applied the checked-in migrations, and ran the live `pnpm source-registry:ingest` path against `data/seeds/estate-agents.csv`.
- Verified that `source_registry` now contains 63 imported rows spanning 51 distinct domains, with `raw_payload` and `provenance_summary` populated on stored records.
- Advanced the repo status files so Ticket `008` is the next execution target.

### Validation performed

- Ran `docker version`.
- Ran `docker compose up -d postgres`.
- Ran `pnpm db:migrate`.
- Ran `pnpm source-registry:ingest`.
- Queried Postgres directly to verify row counts and stored provenance fields in `source_registry`.
- Ran `pnpm db:verify`.
- Ran `pnpm test`.
- Ran `pnpm typecheck`.

### Blockers

- No implementation blockers remain at the repo level.

## 2026-03-20 — Ticket 007 status-doc reconciliation

### What changed

- Re-verified the Ticket `007` source-registry importer behavior in the current workspace using both dry-run and live Postgres paths.
- Corrected stale handoff pointers in `README.md` and `docs/TICKET_INDEX.md` so new sessions route to Ticket `008`, matching `docs/PROJECT_STATUS.md` and the backlog table.

### Validation performed

- Ran `pnpm run doctor`.
- Ran `pnpm typecheck`.
- Ran `pnpm test`.
- Ran `pnpm validate:fixture`.
- Ran `pnpm source-registry:ingest -- --dry-run`.
- Ran `docker compose up -d postgres`.
- Ran `pnpm db:migrate`.
- Ran `pnpm source-registry:ingest`.
- Queried Postgres through the running container to confirm `source_registry` still contains 63 rows across 51 domains and that stored records retain `raw_payload` plus `provenance_summary`.

### Blockers

- No implementation blockers remain at the repo level.
