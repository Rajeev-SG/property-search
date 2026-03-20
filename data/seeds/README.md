# Seed data

## Required file

Place your real seed source list here:

`data/seeds/estate-agents.csv`

## Current repository reality

The checked-in `data/seeds/estate-agents.csv` uses the long-term raw repo input shape for this project.

Future inputs should keep the same header and differ only by row content.

Examples of columns present in the real file include:

- `input_query`
- `input_type`
- `normalized_area`
- `country_code`
- `agent_name`
- `branch_name`
- `agent_type`
- `website_url`
- `website_domain`
- `canonical_url`
- `source_names`
- `source_ids`
- `portal_profile_urls`
- `validation_status`
- `first_seen_source`
- `evidence_count`

`estate-agents.example.csv` is a simplified illustrative shape only.

The product should normalize the raw seed into an internal source-registry contract as documented in `docs/product-specs/source-registry.md`.

Rows that still lack a crawlable `website_url` or `canonical_url` remain part of the raw seed contract. The Ticket `007` importer records those unresolved rows in an ingest report under `artifacts/source-registry/ingests/` instead of silently dropping them.

## Supporting seed files

- `status_synonyms.csv`
- `property_type_synonyms.csv`
- `tenure_synonyms.csv`
- `site_hints.csv`
