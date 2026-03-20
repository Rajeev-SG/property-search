# Harness Sufficiency Audit

## Audit scope

This audit reviewed the repository seed as of 2026-03-18 for agent-first delivery readiness.

Audited areas:
- `README.md`
- `AGENTS.md`
- `ARCHITECTURE.md`
- `docs/product-specs/*`
- `docs/design-docs/*`
- `docs/exec-plans/*`
- `docs/references/*`
- `data/seeds/*`
- `data/fixtures/*`
- `packages/*`
- `scripts/*`
- `apps/cli/*`
- `db/*`
- `.codex/*`
- `skills/*`
- `.github/workflows/*`
- local validation commands and current repo state

## Verdict

The seed was **useful but not yet fit for purpose as-is** for clean agent-first end-to-end delivery.

After the repairs in this session, the repo is **fit for purpose for future agent chats to continue delivery**, but product implementation has **not** started yet.

## What was already good

- **Core project intent existed**
  - `README.md`, `AGENTS.md`, and `ARCHITECTURE.md` already described the local-first ingestion goal and major system layers.
- **Key local constraints were explicit**
  - Local Postgres, Redis, Typesense, and filesystem artifact storage were already present.
  - S3/object storage and observability stacks were explicitly out of scope.
- **A starter schema and fixture existed**
  - `packages/domain/src/canonicalProperty.ts`
  - `packages/domain/src/canonical-property.schema.json`
  - `data/fixtures/expected-json/detail.synthetic.json`
- **Execution-plan intent existed**
  - The repo already had broad phase plans under `docs/exec-plans/active/`.
- **Basic harness tooling existed**
  - `pnpm run doctor`
  - `pnpm plans:list`
  - `pnpm validate:fixture`
  - `pnpm test`
- **Provider direction was present**
  - Firecrawl, Cloudflare Browser Rendering, Bright Data, browser-use, OpenRouter, and Typesense were named consistently in the docs.

## Explicit sufficiency assessment

### Architecture boundaries

Assessment: **partially sufficient**.

Strengths:
- System layers were named clearly in `ARCHITECTURE.md`.
- The repo already distinguished source registry, profiling, crawl, extraction, normalization, dedupe, persistence, and evaluation.

Problems:
- The boundary between extracted listing, canonical property entity, and search document was still too implicit for clean implementation handoff.
- The source-registry input contract was ambiguous because the real seed CSV in the repo did not match the documented example contract.

Repair made:
- Added a dedicated source-registry product spec and updated root docs to make the normalized ingestion boundary explicit.

### Canonical schema completeness

Assessment: **partially sufficient**.

Strengths:
- A machine-readable JSON schema and Zod schema existed.
- Evidence capture was already represented.

Problems:
- The prose spec was too thin for future agents to know which invariants are authoritative.
- The schema name implied a canonical property entity, while the actual fields behave more like a normalized listing/search projection.

Repair made:
- Expanded the canonical schema doc to describe contract intent, invariants, and near-term layering work.

### Local development setup

Assessment: **partially sufficient**.

Strengths:
- `docker-compose.yml` already defined Postgres, Redis, and Typesense.
- `.env.example` had sensible local placeholders.
- CI and scripts existed.

Problems:
- Validation could not run in this session because dependencies were not installed locally.
- Human setup expectations were scattered and did not point to a single status-driven next step.

Repair made:
- Added status machinery and refreshed README guidance so a future agent or human can resume deterministically.

### Fixtures and evals

Assessment: **insufficient for full delivery, sufficient for a seed**.

Strengths:
- A synthetic fixture and one test existed.

Problems:
- Only one synthetic gold output existed.
- No per-domain fixture inventory, no eval runner backlog, and no drift artifact conventions were defined in operational status files.

Repair made:
- Added explicit backlog coverage for fixture expansion, eval harnesses, and drift detection.

### Status tracking for future sessions

Assessment: **missing before this session**.

Problems:
- No `docs/PROJECT_STATUS.md`
- No `docs/DEVELOPMENT_LOG.md`
- No `docs/TICKET_INDEX.md`
- No durable ticket directory
- No explicit “what should the next clean agent do?” state

Repair made:
- Created all required status artifacts.
- Created a full backlog with dependencies and handoff instructions.

### Human setup and testing instructions

Assessment: **partial**.

Problems:
- The repo told the user how to start local services, but it did not explicitly separate immediate human actions from future agent work.
- Provider credentials were implied rather than tracked operationally.

Repair made:
- Captured required human actions in `docs/PROJECT_STATUS.md`, `docs/DEVELOPMENT_LOG.md`, and each ticket.

### Provider abstraction design

Assessment: **partially sufficient**.

Strengths:
- Providers and escalation order were already named.

Problems:
- The contract was only a placeholder and did not yet define concrete adapter, crawl, render, and extract boundaries.
- Existing provider notes referenced capabilities but lacked authoritative operational links.

Repair made:
- Refreshed provider reference docs with official documentation links and current capability notes verified against primary sources.

### Adapter and extraction contracts

Assessment: **partially sufficient**.

Strengths:
- There was an adapter schema seed and example YAML.
- The extraction ladder order was already stated.

Problems:
- The adapter contract lacked explicit guardrails for when adapters should exist.
- The extraction contract did not yet explain how evidence, fallback, and replayable failure capture should be treated operationally.

Repair made:
- Strengthened the prose contracts and created explicit tickets that decompose deterministic extraction, LLM fallback, and adapter overrides.

### Dependency and delivery sequencing

Assessment: **insufficient before this session**.

Problems:
- Existing execution plans were too broad to hand to a clean coding agent.
- No granular dependency graph existed.

Repair made:
- Created a complete ordered ticket backlog and a ticket index.
- Clarified that `docs/TICKET_INDEX.md` and `docs/PROJECT_STATUS.md` are the operational source of truth, while broad exec plans remain phase references.

## What changed in this session

- Added this audit document.
- Added durable status machinery:
  - `docs/PROJECT_STATUS.md`
  - `docs/DEVELOPMENT_LOG.md`
  - `docs/TICKET_INDEX.md`
  - `docs/backlog/`
  - `docs/backlog/archive/`
  - `docs/exec-plans/README.md`
- Added a dedicated source-registry spec.
- Refreshed root and harness docs so future agent sessions start from repo state, not chat history.
- Generated the full delivery ticket set needed to build the working project.
- Updated harness references to call out official provider/tool documentation where useful.

## Validation performed

Validation completed during the audit:
- Inspected all major docs, specs, scripts, fixtures, and package seeds.
- Verified that the real `data/seeds/estate-agents.csv` differs from the example contract.
- Verified that the required status machinery was previously absent.
- Verified official documentation availability for:
  - Typesense local install and Docker usage
  - Firecrawl scrape/crawl/MCP workflows
  - Cloudflare Browser Rendering rendered content and crawl endpoints

Validation blocked in the current local environment:
- `pnpm validate:fixture`
- `pnpm test`

Reason:
- local dependencies are not installed yet, so `tsx` and `vitest` are unavailable.

## Intentionally deferred

The following items remain intentionally deferred to backlog tickets instead of being implemented in this planning session:
- source-registry ingestion code
- database schema and migrations
- provider clients
- crawler/discovery implementation
- extraction ladder implementation
- adapter loader and overrides
- normalization and dedupe code
- Typesense indexing and query flow
- recrawl orchestration
- drift detection and quality scorecards
- expanded fixtures and eval harnesses
- full CLI workflows and operator UX

## Required human follow-up after this session

- Run `pnpm install --frozen-lockfile` in the repo root before asking an agent to run TypeScript-based validation commands.
- Run `docker compose up -d` before infra-dependent tickets.
