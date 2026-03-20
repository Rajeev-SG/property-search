# Project Status

## Project objective

Build a local-first TypeScript monorepo that ingests estate-agent websites from repository-managed seed inputs, extracts and normalizes listing data with evidence, deduplicates records into canonical property entities, indexes searchable documents into Typesense, and supports repeatable recrawl and quality evaluation workflows.

## Current phase

Ticket `008` is in progress to build the crawl, fetch, and render pipeline on top of the normalized source-registry baseline delivered in Ticket `007`.

## Current active ticket ID

`008`

## Current active ticket status

`in_progress`

## Summary of last completed work

Completed Ticket `007` by adding deterministic source-registry ingestion, preserving raw-row provenance in Postgres, emitting ingest reports for unresolved discovery-only rows, and validating the live import path against local Postgres.

## Summary of current blockers

- No current blockers are recorded.

## Exact next recommended action

1. Build from the new Ticket `008` smoke slice by swapping the fixture URL/input over to real `source_registry` rows while keeping the existing run manifest and diagnostics contract intact.
2. Extend the fetch pipeline from synthetic providers to the first real live-provider path only after the same artifact and failure metadata remain replayable.
3. Keep provider-specific behavior behind the existing provider registry and validate with targeted crawl/artifact checks before broadening to discovery logic.

## Next-session routing

The next agent should continue `008-crawl-fetch-and-render-pipeline-foundation.md`.

## Required human actions

- No human action is currently required.

## Last updated timestamp

2026-03-20T14:35:00Z

## Source-of-truth note

Operational sequencing lives in:
- `docs/TICKET_INDEX.md`
- `docs/backlog/*.md`

Session-level summary and blockers live in:
- `docs/DEVELOPMENT_LOG.md`

Broad phase references live in:
- `docs/exec-plans/README.md`
- `docs/exec-plans/active/*.md`
