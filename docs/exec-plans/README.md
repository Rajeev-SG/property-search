# Execution Plans Index

## Purpose

The files in `docs/exec-plans/active/` are broad phase plans for the repository seed.

They are still useful, but they are **not** the operational source of truth for day-to-day implementation anymore.

## Operational source of truth

Future agent sessions should use this order:

1. `docs/PROJECT_STATUS.md`
2. `docs/TICKET_INDEX.md`
3. the active ticket in `docs/backlog/`
4. `AGENTS.md`
5. `README.md`
6. relevant execution-plan and product/design docs

## How to use execution plans now

- Use `docs/exec-plans/active/*.md` as coarse architectural phase references.
- Use `docs/TICKET_INDEX.md` and `docs/backlog/*.md` for the actual implementation queue.
- Move completed broad phase plans to `docs/exec-plans/completed/` only when every mapped delivery ticket for that phase is complete.

## Current broad plans

Active:
- `001-monorepo-bootstrap.md`
- `002-canonical-schema-and-storage.md`
- `003-site-profiler.md`
- `004-extraction-ladder.md`
- `005-adapter-system.md`
- `006-normalization-dedupe-and-indexing.md`
- `007-evals-and-drift-detection.md`

Completed:
- see `docs/exec-plans/completed/`

## Maintenance rule

Whenever a ticket materially changes project sequencing or a broad implementation phase, update both:
- the relevant execution-plan file or index note here
- the operational status files under `docs/`
