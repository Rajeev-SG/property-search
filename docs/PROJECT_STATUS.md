# Project Status

## Project objective

Build a local-first TypeScript monorepo that ingests estate-agent websites from repository-managed seed inputs, extracts and normalizes listing data with evidence, deduplicates records into canonical property entities, indexes searchable documents into Typesense, and supports repeatable recrawl and quality evaluation workflows.

## Current phase

Ticket `006` is next up to define provider abstraction and env-driven crawl/render/extraction wiring on top of the storage baseline.

## Current active ticket ID

`006`

## Current active ticket status

`not_started`

## Summary of last completed work

Completed Ticket `005` by adding the `ingestion_runs` ledger table, deterministic per-run artifact path helpers, a checked-in artifact smoke flow, and documentation for the new `artifacts/runs/...` layout.

## Summary of current blockers

- No current blockers are recorded.

## Exact next recommended action

1. Start Ticket `006` by defining stable internal crawl/render/extraction provider interfaces that can reference the new run IDs and artifact paths.
2. Thread env-driven provider defaults through the CLI and harness without hard-coding vendor behavior into the pipeline stages.
3. Preserve the local evidence split: run/artifact files on disk, replay metadata in Postgres, and deterministic helpers as the only path generator.

## Next-session routing

The next agent should continue `006-provider-abstraction-and-config-wiring.md`.

## Required human actions

- No human action is currently required.

## Last updated timestamp

2026-03-20T04:40:00Z

## Source-of-truth note

Operational sequencing lives in:
- `docs/TICKET_INDEX.md`
- `docs/backlog/*.md`

Session-level summary and blockers live in:
- `docs/DEVELOPMENT_LOG.md`

Broad phase references live in:
- `docs/exec-plans/README.md`
- `docs/exec-plans/active/*.md`
