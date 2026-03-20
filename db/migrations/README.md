# Migrations

Deterministic SQL migrations for the local Postgres source-of-truth live here.

## Naming

- Use zero-padded numeric prefixes: `001_description.sql`
- Keep migrations append-only once committed
- Do not edit a previously applied migration without also documenting the reset path

## Current baseline

`001_pipeline_baseline.sql` creates the first core pipeline tables:

- `source_registry`
- `site_profiles`
- `raw_page_artifacts`
- `extracted_listings`
- `canonical_properties`
- `listing_property_links`

The migration runner records applied files in `schema_migrations`.

## Commands

Run the baseline against the configured local database:

```bash
pnpm db:migrate
pnpm db:status
pnpm db:verify
```

Run the fresh-database smoke check used by this ticket:

```bash
pnpm db:smoke
```
