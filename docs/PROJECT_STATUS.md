# Project Status

## Project objective

Build a local-first TypeScript monorepo that ingests estate-agent websites from repository-managed seed inputs, extracts and normalizes listing data with evidence, deduplicates records into canonical property entities, indexes searchable documents into Typesense, and supports repeatable recrawl and quality evaluation workflows.

## Current phase

Ticket `007` is next up to ingest the raw estate-agent CSV into the normalized source registry on top of the provider/config baseline.

## Current active ticket ID

`007`

## Current active ticket status

`not_started`

## Summary of last completed work

Completed Ticket `006` by stabilizing the internal provider role interfaces, adding env-driven provider/runtime resolution, exposing registry summaries in the CLI, and documenting the fake-by-default local execution contract.

## Summary of current blockers

- No current blockers are recorded.

## Exact next recommended action

1. Start Ticket `007` by loading `data/seeds/estate-agents.csv` into the normalized source-registry contract and preserving raw-row provenance.
2. Reuse the new provider/config registry for any crawl or discovery defaults needed during source ingestion, but keep the ticket focused on registry normalization rather than live fetch behavior.
3. Preserve the local evidence split: artifact files on disk, replay metadata in Postgres, and deterministic helpers as the only path generator.

## Next-session routing

The next agent should continue `007-source-registry-ingestion-and-normalization.md`.

## Required human actions

- No human action is currently required.

## Last updated timestamp

2026-03-20T05:29:46Z

## Source-of-truth note

Operational sequencing lives in:
- `docs/TICKET_INDEX.md`
- `docs/backlog/*.md`

Session-level summary and blockers live in:
- `docs/DEVELOPMENT_LOG.md`

Broad phase references live in:
- `docs/exec-plans/README.md`
- `docs/exec-plans/active/*.md`
