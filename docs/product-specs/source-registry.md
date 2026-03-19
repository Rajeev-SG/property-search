# Source registry contract

## Purpose

The repository needs a deterministic source-registry boundary between raw seed inputs and the internal crawl/profiling pipeline.

This matters because the checked-in `data/seeds/estate-agents.csv` currently contains a richer discovery dataset than the older simplified example file.

## Current repository reality

Two shapes are currently present:

### Simplified example contract

Documented by `data/seeds/estate-agents.example.csv`:
- `agent_id`
- `brand_name`
- `branch_name`
- `domain`
- `homepage_url`
- `start_url`
- `geo_hint`
- `notes`
- `enabled`

### Enriched checked-in raw seed

Observed in `data/seeds/estate-agents.csv`:
- discovery inputs such as `input_query`, `input_type`, `normalized_area`, `country_code`
- organization details such as `agent_name`, `branch_name`, `agent_type`
- site identifiers such as `website_url`, `website_domain`, `canonical_url`
- contact/location metadata
- evidence and provenance fields such as `source_names`, `source_ids`, `portal_profile_urls`, `validation_status`, `first_seen_source`, `evidence_count`

## Contract decision for delivery work

Implementation should treat the checked-in `data/seeds/estate-agents.csv` as a **raw source-discovery feed**, not as the final internal source-registry table shape.

The product should normalize that raw feed into an internal source-registry record with fields sufficient for crawl and profiling.

This enriched checked-in CSV shape is the **long-term raw repo input contract** for this project.

Future repository-managed seed inputs should preserve the same header shape while varying by row content.

## Minimum internal source-registry record

Every normalized source-registry row should be able to answer:
- what organization or branch is this source for
- what domain should be crawled
- what URL should crawl/profile begin from
- is the source enabled for ingestion
- what evidence supports using this source
- what quality or validation status is known
- what geospatial or area hints are available

Minimum normalized fields for implementation:
- `source_id`
- `raw_row_hash`
- `brand_name`
- `branch_name`
- `agent_type`
- `website_domain`
- `homepage_url`
- `start_url`
- `normalized_area`
- `country_code`
- `enabled`
- `validation_status`
- `provenance_summary`
- `raw_input_path`
- `raw_row_number`
- `ingested_at`

## Required behavior

- Preserve the raw input row for traceability.
- Do not silently discard enriched columns.
- Record how normalized fields were derived.
- Allow multiple raw rows to point at the same domain while still preserving branch-level metadata.
- Keep the internal contract stable even if upstream seed exports evolve.

## Relationship to downstream pipeline

The normalized source registry feeds:
1. site profiling
2. crawl policy and recrawl scheduling
3. adapter selection hints
4. attribution in extraction outputs and canonical entities

Repo code should support this enriched raw file without losing evidence.
