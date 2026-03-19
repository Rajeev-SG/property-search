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
