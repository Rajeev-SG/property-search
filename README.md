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
pnpm install
docker compose up -d
pnpm doctor
pnpm validate:fixture
pnpm test
```

## Recommended next implementation move

Start Ticket `001` in `docs/backlog/001-harness-hardening-and-source-registry-contract.md`.

That ticket reconciles the real seed CSV shape with the normalized internal source-registry contract and hardens the harness checks for future work.

## Commands

- `pnpm doctor` — validate required repo files and harness readiness
- `pnpm plans:list` — list broad execution plans
- `pnpm validate:fixture` — validate the synthetic canonical fixture
- `pnpm test` — run tests
- `pnpm typecheck` — run TypeScript no-emit checks
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
- `docs/DEVELOPMENT_LOG.md` is append-only and should be updated whenever significant work is done.
