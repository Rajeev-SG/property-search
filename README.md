# Property Search Ingestion — Harness-Ready Repo Seed

This bundle seeds a local-first repository for building a multi-site property search engine from estate-agent websites.

## Summary

This project aims to ingest estate-agent websites from a repository-managed CSV, crawl and extract listing data with evidence, normalize those records into canonical property entities, and index them into a searchable local property database.

It does this by treating `data/seeds/estate-agents.csv` as the long-term raw source-discovery input, normalizing that feed into an internal source registry, profiling each site, and then following a layered extraction pipeline: structured data first, script/blob parsing second, deterministic DOM extraction third, schema-constrained LLM extraction fourth, and site-specific adapters only when needed.

The planned stack is local-first TypeScript with Postgres as the source of truth, filesystem artifact storage for raw HTML/JSON/markdown/screenshots, and Typesense for search. Provider strategy is Firecrawl for discovery and first-pass crawl, Cloudflare Browser Rendering for rendered fetches, browser-use with OpenRouter `glm-5` for interactive browser recovery, and Bright Data for hard-site escalation. Core features include evidence-backed extraction, crawl-policy awareness, normalization, deduplication into canonical property records, recrawl support, and fixture/eval-driven quality checks.

## What this repository is for

The goal is to let a coding agent implement the project reliably by giving it:

- a short `AGENTS.md` map
- checked-in execution plans and delivery tickets
- canonical schemas
- local dev infrastructure
- fixture data and expected outputs
- adapter templates
- Codex skills for recurring workflows
- MCP setup notes for Firecrawl / Codex / Playwright
- external vendor capability notes for browser-use, OpenRouter, Cloudflare, Bright Data, and Firecrawl
- durable status files for clean future agent chats

This seed is intentionally **not** a finished application. It is a scaffold, contract pack, and working thin slice.

## Start here in every future session

The repository is the system of record.

Read in this order:

1. `docs/PROJECT_STATUS.md`
2. `docs/TICKET_INDEX.md`
3. the active ticket in `docs/backlog/`
4. `AGENTS.md`
5. `README.md`
6. relevant docs under `docs/`

## Current repository status

This repo has now been audited for agent-first delivery.

The planning and status layer is in place, but the full product is still to be implemented ticket-by-ticket.

## What you already have

You said you have already added `data/seeds/estate-agents.csv`.

This seed includes:

- `data/seeds/estate-agents.example.csv` as a simplified example shape
- the real checked-in `data/seeds/estate-agents.csv`
- a source-registry spec at `docs/product-specs/source-registry.md`
- a doctor script that checks whether the required harness files exist

Important:

- the checked-in `data/seeds/estate-agents.csv` is the long-term raw repo input contract for this project
- future raw inputs should keep the same header shape while varying only by row content
- implementation should normalize that raw seed into an internal source-registry contract rather than assuming the example file is the only supported shape

## Database baseline

Tickets `004` and `005` establish the first checked-in Postgres persistence baseline.

- SQL migrations live in `db/migrations/`
- the migration runner records applied files in `schema_migrations`
- `ingestion_runs` records run-level metadata plus deterministic artifact directories and manifest paths
- raw page evidence stays on disk under `artifacts/`; Postgres stores metadata, hashes, crawl policy, run IDs, and artifact paths
- use `pnpm db:smoke` when you need a clean migration validation without reusing the default local database

## Local artifact storage baseline

Ticket `005` standardizes local evidence under deterministic per-run directories:

```text
artifacts/
  runs/
    YYYY/
      MM/
        DD/
          <run-id>/
            raw/
            rendered/
            extracted/
            screenshots/
            diagnostics/
            run.json
```

`run.json` is the run manifest for that execution. It records the run ID, provider, URL scope, status, timestamps, bucket directories, individual artifact paths, and failure metadata needed for replay or diagnosis.

## Local-only design constraints in this seed

Included:
- local Postgres
- local Redis
- local Typesense
- filesystem artifact storage
- local `.env`
- external vendor integrations documented for Firecrawl, Cloudflare Browser Rendering, browser-use, Bright Data, and OpenRouter

Explicitly excluded for now:
- S3 / MinIO
- OpenTelemetry / Grafana / Loki / Tempo
- cloud deployment manifests

## Suggested first-run sequence

```bash
pnpm install --frozen-lockfile
docker compose up -d
pnpm db:migrate
pnpm run doctor
pnpm validate:fixture
pnpm test
```

## Recommended next implementation move

Start from the active ticket recorded in `docs/PROJECT_STATUS.md`.

At the time of writing, the next repo ticket is `008-crawl-fetch-and-render-pipeline-foundation.md`.

## Commands

- `pnpm run doctor` — validate required repo files and harness readiness
- `pnpm providers:print` — print the resolved provider defaults, credential availability, runtime mode, and fake/live registry decisions
- `pnpm db:migrate` — apply deterministic SQL migrations to local Postgres
- `pnpm db:status` — report applied and pending SQL migrations
- `pnpm db:verify` — verify the expected core pipeline tables exist
- `pnpm db:smoke` — create a fresh temporary database, apply migrations, and verify the baseline schema
- `pnpm artifacts:smoke` — create a synthetic local run plus manifest under `artifacts/runs/`
- `pnpm source-registry:ingest -- --dry-run` — normalize the seed CSV, print import/skip counts, and write the full ingest report under `artifacts/source-registry/ingests/`
- `pnpm plans:list` — list broad execution plans
- `pnpm validate:fixture` — validate the synthetic extracted-listing, canonical-property, and search-document fixtures
- `pnpm test` — run tests
- `pnpm typecheck` — run TypeScript no-emit checks
- `pnpm run typecheck:workspace` — run package-level typechecks across the workspace
- `pnpm run smoke:cli` — run the CLI `doctor` command through the workspace package entrypoint
- `pnpm smoke:vendors` — run repo vendor smoke tests for OpenRouter, Firecrawl, Cloudflare, and Bright Data
- `pnpm smoke:browser-use` — run the browser-use smoke test against OpenRouter GLM-5

OpenRouter note:

- the human-facing default model for this harness is GLM-5
- OpenRouter requests use the provider model ID `z-ai/glm-5`

## Recommended first implementation slice after Ticket `001`

1. load `estate-agents.csv`
2. profile one domain
3. discover listing + detail URLs
4. extract one property detail page into canonical JSON
5. validate JSON against the canonical schema
6. store raw page artifacts locally
7. index one normalized document into Typesense

## Repo conventions

- All durable project knowledge belongs in the repository.
- `docs/PROJECT_STATUS.md` and `docs/TICKET_INDEX.md` are the operational source of truth.
- `docs/backlog/*.md` are the execution contracts for implementation tickets.
- `docs/exec-plans/active/` contains broad phase references.
- `AGENTS.md` is intentionally short; deeper detail lives in the docs it links to.
- The `skills/` folder is for Codex skills that should be reusable across tasks.
- `skills/pr-automation/SKILL.md` documents the reusable unattended branch, PR, review-loop, and merge flow for Symphony ticket runs.
- `docs/DEVELOPMENT_LOG.md` is append-only and should be updated whenever significant work is done.
- `docs/references/openreview-vercel.md` records the current upstream OpenReview Anthropic-only wiring plus the minimal fork plan for an OpenRouter-configurable Vercel deployment.
- Symphony ticket runs should create or update exactly one PR for the active ticket branch, build the PR body from `.github/pull_request_template.md`, gather review comments, unresolved threads, and required checks with `gh`, apply actionable fixes on the same branch, and merge only when merge conditions are satisfied.
- After merge succeeds, the unattended handoff should leave a final Linear comment with the merged PR URL plus the validation/check snapshot used for completion, and Symphony runtime reconciliation should verify that comment plus remote branch cleanup before the ticket stays `Done`.
- If auth, permissions, unresolved review, or failing required checks block automatic merge, the repository workflow should leave the ticket in `In Review` with a precise blocker summary instead of treating `In Review` as the happy path.
- The repository workflow owns commit, push, PR, merge, and fallback review behavior; Symphony itself should remain the scheduler and observability surface.

## Source-registry ingestion notes

- Ticket `007` adds a deterministic seed importer that upserts only crawlable source rows into `source_registry`.
- The importer preserves the full CSV row in `raw_payload`, records derivation and upstream evidence in `provenance_summary`, and keeps duplicate-domain branch rows distinct by raw row number.
- Discovery-only rows that still lack a site URL are surfaced in the generated ingest report with a stable skip reason so they can be revisited without losing evidence.
