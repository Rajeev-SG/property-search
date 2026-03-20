# Reliability

## Reliability principles

- persist raw evidence before normalization
- never treat partial extraction as success without flags
- every provider response should be attributable
- store enough metadata to replay failures

## Failure classes

- discovery failure
- render failure
- provider block / challenge
- schema extraction failure
- canonical validation failure
- dedupe collision ambiguity
- indexing failure

## Minimum logs

Every run should record:
- run id
- run manifest path
- provider used
- domain
- page URL
- fetch mode
- extraction path
- artifact file paths
- run status
- error class
- elapsed time

Ticket `008` smoke runs also emit a diagnostics JSON artifact with one entry per static/render fetch attempt and record whether the target came from `source_registry` or the fixture fallback so partial failures remain replayable even when only part of the pipeline succeeds.

## Database retention notes

- Postgres stores run metadata, hashes, crawl-policy signals, and filesystem paths to raw artifacts.
- `ingestion_runs` is the run ledger for local mode. It stores run status, provider, URL scope, manifest path, bucket directories, artifact listings, and failure metadata.
- Raw HTML, rendered HTML, markdown, JSON payloads, screenshots, and diagnostic payloads remain on disk under `artifacts/runs/<yyyy>/<mm>/<dd>/<run-id>/`.
- This split keeps the database replayable without embedding large opaque blobs in the core pipeline tables.
