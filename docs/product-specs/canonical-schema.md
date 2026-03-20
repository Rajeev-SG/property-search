# Canonical schema

This repo now treats property data as three explicit contracts instead of one overloaded object:

- `ExtractedListing`: the normalized output of crawl and extraction.
- `CanonicalProperty`: the deduped entity assembled from one or more extracted listings.
- `SearchDocument`: the Typesense-friendly projection derived from a canonical property.

The source of truth is:

- `packages/domain/src/canonicalProperty.ts`
- `packages/domain/src/canonical-property.schema.json`

Synthetic fixture coverage lives in:

- `data/fixtures/expected-json/detail.synthetic.json`
- `data/fixtures/expected-json/canonical-property.synthetic.json`
- `data/fixtures/expected-json/search-document.synthetic.json`

## Contract boundaries

### `ExtractedListing`

Use this contract immediately after deterministic or LLM-backed extraction.

It answers:

- what listing URL was parsed
- what the raw-but-normalized listing fields are
- how confident the extractor is
- what evidence supports each extracted field

Required fields:

- `source_domain`
- `source_url`
- `listing_id`
- `agent_name`
- `sale_or_rent`
- `listing_status`
- `price_amount`
- `price_currency`
- `price_frequency`
- `address_full`
- `property_type`
- `description`
- `extraction_confidence`
- `evidence[]`

Optional listing enrichment:

- branch metadata such as `branch_name`
- location detail such as `postcode`, `latitude`, `longitude`
- room counts and floor area
- marketing detail such as `features[]`, `images[]`, `floorplans[]`
- availability text and source-specific added or updated dates

Evidence rules:

- `evidence[]` is required and must contain at least one entry.
- Every evidence entry must retain `field`, `source`, and `locator`.
- Every evidence entry must also preserve either a raw `value` or an `excerpt`.
- `field` values are constrained to the extracted-listing field set so later stages know exactly what was observed.

### `CanonicalProperty`

Use this contract after normalization and dedupe. It is the entity layer that downstream storage and matching logic should reason over.

It answers:

- which listings currently map to the same property
- what the stable property-level normalized values are
- what dedupe key or match handle was assigned
- how much source evidence and confidence supports the entity

Required fields:

- `property_id`
- `source_listing_refs[]`
- `source_domains[]`
- `agent_names[]`
- `sale_or_rent`
- `listing_status`
- `price_amount`
- `price_currency`
- `price_frequency`
- `address_full`
- `property_type`
- `summary`
- `dedupe_key`
- `listing_count`
- `evidence_count`
- `extraction_confidence`
- `first_seen_at`
- `last_seen_at`

Notes:

- `summary` is the canonical text summary, not necessarily the raw listing description.
- `source_listing_refs[]` preserves lineage back to listing records.
- `listing_count` and `evidence_count` make downstream quality and dedupe behavior explainable.

### `SearchDocument`

Use this contract only for indexing and local query. It is intentionally denormalized and facet-friendly.

It answers:

- what should be indexed
- which fields should be facetable or sortable
- what display text should be shown in search results

Required fields:

- `document_id`
- `property_id`
- `source_listing_ids[]`
- `source_domains[]`
- `agent_names[]`
- `title`
- `summary`
- `searchable_text`
- `sale_or_rent`
- `listing_status`
- `price_amount`
- `price_currency`
- `price_frequency`
- `address_full`
- `property_type`
- `last_seen_at`

Notes:

- `source_listing_ids[]` is a string-friendly projection for index payloads.
- `searchable_text` is the composed full-text field, not raw extraction output.
- `primary_image_url` is optional so indexing does not depend on media availability.

## Shared invariants

- `source_url` values must be fully qualified URLs.
- `price_currency` should be ISO-style three-letter currency text.
- `extraction_confidence` is bounded to `0..1`.
- `latitude` and `longitude` must appear together or not at all.
- Timestamps on canonical entities and search documents use ISO-8601 UTC timestamps.
- A listing is not safely canonicalized or indexed unless it first passes extracted-listing validation.

## Machine-readable schema layout

`packages/domain/src/canonical-property.schema.json` now exposes all three contracts under `$defs`:

- `#/$defs/ExtractedListing`
- `#/$defs/CanonicalProperty`
- `#/$defs/SearchDocument`

The document root continues to resolve to `ExtractedListing` so existing fixture tooling stays compatible while downstream tickets adopt the explicit split.
