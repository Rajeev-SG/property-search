# Development Log

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
- `docs/DEVELOPMENT_LOG.md`

### Validation performed

- Verified the updated workflow contract and docs stay aligned on branch-per-ticket and merge/cleanup behavior.

### Follow-ups

- Validate a fresh Symphony-created workspace to confirm `.git`, branch, and remote wiring are correct.
- Re-run unattended ticket flow against a real Linear issue after the Symphony-core cleanup is complete.

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
