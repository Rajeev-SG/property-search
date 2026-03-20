# Review Guidelines

## Critical Areas

- Treat evidence capture, provenance retention, canonical schema handling, crawl-policy behavior, and fixture integrity as high-severity review areas.
- Flag any change that stores artifacts outside `artifacts/` or weakens replayability or diagnosability.
- Flag provider-specific logic introduced before deterministic extraction options are exhausted unless the ticket explicitly requires it.

## Required Checks

- Confirm the change stays scoped to the active ticket and does not introduce unrelated refactors.
- Confirm the touched scope includes the docs, fixtures/evals, tests, or metrics required by `AGENTS.md` and the backlog ticket.
- Confirm validation coverage is appropriate for the changed surface area and that any skipped validation is called out explicitly.
- Confirm status files, workflow docs, and harness metadata were updated when behavior or operating assumptions changed.

## Repo-Specific Expectations

- Prefer deterministic extraction first, schema-constrained LLM extraction second, and site-specific adapters only when necessary.
- Preserve repository docs as the system of record; stale docs should be treated as defects.
- Treat changes to source-registry contracts, canonical schema behavior, extraction ladder behavior, and provider wiring as requiring especially careful review.

## Ignore / Low-Signal Areas

- Generated lockfile noise is low priority unless dependency intent changed.
- Formatting-only markdown churn is low priority unless it changes behavior or requirements.
