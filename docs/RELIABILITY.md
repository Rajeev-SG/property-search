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
- provider used
- domain
- page URL
- extraction path
- artifact file paths
- error class
- elapsed time

## Database retention notes

- Postgres stores metadata, hashes, crawl-policy signals, and filesystem paths to raw artifacts.
- Raw HTML, rendered HTML, markdown, JSON payloads, and screenshots remain on disk under `artifacts/`.
- This split keeps the database replayable without embedding large opaque blobs in the core pipeline tables.
