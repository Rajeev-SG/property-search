# Ticket Index

Current active ticket: `006`.

| Order | Ticket ID | Title | Status | Dependency IDs | Priority | Objective | Ticket file | Active |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `001` | Harness hardening and source-registry contract | `done` | None | High | Reconcile the real raw seed CSV with the documented internal source-registry contract and harden the harness/status checks around that decision. | `docs/backlog/001-harness-hardening-and-source-registry-contract.md` | `no` |
| 2 | `002` | Monorepo bootstrap and dev ergonomics | `done` | `001` | High | Harden workspace/package configuration, root validation commands, and CI so the repo is implementation-ready. | `docs/backlog/002-monorepo-bootstrap-and-dev-ergonomics.md` | `no` |
| 3 | `003` | Canonical schema and domain contract expansion | `done` | `001`, `002` | High | Make the domain contracts explicit enough for extraction, normalization, dedupe, and indexing to proceed without ambiguity. | `docs/backlog/003-canonical-schema-and-domain-contract-expansion.md` | `no` |
| 4 | `004` | Database schema and migration baseline | `done` | `002`, `003` | High | Establish the initial Postgres schema and migration flow for core pipeline records. | `docs/backlog/004-database-schema-and-migration-baseline.md` | `no` |
| 5 | `005` | Run ledger and local artifact storage foundation | `done` | `003`, `004` | High | Implement deterministic local artifact persistence and run metadata capture. | `docs/backlog/005-run-ledger-and-local-artifact-storage-foundation.md` | `no` |
| 6 | `006` | Provider abstraction and config wiring | `not_started` | `002`, `003`, `005` | High | Define stable crawl/render/extraction provider interfaces and env-driven defaults. | `docs/backlog/006-provider-abstraction-and-config-wiring.md` | `yes` |
| 7 | `007` | Source-registry ingestion and normalization | `not_started` | `001`, `003`, `004`, `006` | High | Ingest the raw seed CSV into normalized source-registry records with provenance preserved. | `docs/backlog/007-source-registry-ingestion-and-normalization.md` | `no` |
| 8 | `008` | Crawl, fetch, and render pipeline foundation | `not_started` | `005`, `006`, `007` | High | Implement the local fetch/render pipeline and persist replayable artifacts and failures. | `docs/backlog/008-crawl-fetch-and-render-pipeline-foundation.md` | `no` |
| 9 | `009` | Site profiling and discovery | `not_started` | `007`, `008` | High | Produce reusable site profiles with robots, sitemap, page classification, and pagination evidence. | `docs/backlog/009-site-profiling-and-discovery.md` | `no` |
| 10 | `010` | Deterministic extraction ladder core | `not_started` | `003`, `005`, `008`, `009` | High | Implement structured-data, script/blob, and DOM extraction with field-level evidence. | `docs/backlog/010-deterministic-extraction-ladder-core.md` | `no` |
| 11 | `011` | Schema-constrained LLM extraction fallback | `not_started` | `006`, `010` | Medium | Add a replayable schema-constrained LLM fallback path when deterministic extraction is insufficient. | `docs/backlog/011-schema-constrained-llm-extraction-fallback.md` | `no` |
| 12 | `012` | Declarative adapter system | `not_started` | `009`, `010`, `011` | High | Implement declarative site adapters with validation, selection, and targeted overrides. | `docs/backlog/012-declarative-adapter-system.md` | `no` |
| 13 | `013` | Normalization pipeline and synonym management | `not_started` | `003`, `010`, `011`, `012` | High | Normalize extracted values into stable canonical forms using deterministic helpers and synonym tables. | `docs/backlog/013-normalization-pipeline-and-synonym-management.md` | `no` |
| 14 | `014` | Dedupe, entity resolution, and canonical assembly | `not_started` | `004`, `013` | High | Link normalized listings into canonical property entities with explainable match behavior. | `docs/backlog/014-dedupe-entity-resolution-and-canonical-assembly.md` | `no` |
| 15 | `015` | Typesense indexing and search/query layer | `not_started` | `004`, `014` | High | Project canonical entities into search documents and support local indexing/querying. | `docs/backlog/015-typesense-indexing-and-search-query-layer.md` | `no` |
| 16 | `016` | Recrawl scheduling and policy enforcement | `not_started` | `009`, `014`, `015` | Medium | Implement local recrawl scheduling, freshness tracking, and crawl-policy enforcement. | `docs/backlog/016-recrawl-scheduling-and-policy-enforcement.md` | `no` |
| 17 | `017` | Eval harness, fixture expansion, and drift detection | `not_started` | `010`, `011`, `012`, `013`, `014`, `016` | High | Build fixture-based evals, expand the corpus, and surface drift and quality regressions. | `docs/backlog/017-eval-harness-fixture-expansion-and-drift-detection.md` | `no` |
| 18 | `018` | CLI workflows, operator UX, and release readiness | `not_started` | `015`, `016`, `017` | High | Deliver coherent local operator workflows, end-to-end smoke paths, and final doc/CI readiness. | `docs/backlog/018-cli-workflows-operator-ux-and-release-readiness.md` | `no` |

## Usage notes

- The operational queue is ordered by the `Order` column.
- A future clean agent should start with `docs/PROJECT_STATUS.md`, then this file, then the active ticket.
- If a ticket is already complete, mark it `done` here and in `docs/PROJECT_STATUS.md`, log the reason in `docs/DEVELOPMENT_LOG.md`, and move to the next dependency-satisfied queued ticket.
- If blocked, record the blocker in both `docs/PROJECT_STATUS.md` and `docs/DEVELOPMENT_LOG.md`.
- Archive completed or retired ticket files only after status files have been updated.
