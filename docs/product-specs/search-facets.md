# Search facets

Initial v1 facets should be sourced from `SearchDocument`, not directly from raw extracted listings or canonical entities.

Primary facets:

- sale / rent
- price
- price frequency
- bedrooms
- bathrooms
- property type
- tenure
- postcode
- agent name
- listing freshness
- listing status

Required search-document fields that back these facets:

- `sale_or_rent`
- `price_amount`
- `price_frequency`
- `bedrooms`
- `bathrooms`
- `property_type`
- `tenure`
- `postcode`
- `agent_names[]`
- `listing_status`
- `last_seen_at`

Display-oriented but still indexable fields:

- `title`
- `summary`
- `address_full`
- `primary_image_url`
- `searchable_text`
