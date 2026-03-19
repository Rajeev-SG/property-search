# Canonical schema
 
 This file describes the normalized listing/search contract currently represented by the repo seed.

 Near-term implementation should keep this contract aligned with:

 - `packages/domain/src/canonicalProperty.ts`
 - `packages/domain/src/canonical-property.schema.json`

 The seed currently uses the name `CanonicalProperty`, but future implementation should remain explicit about the distinction between:

 - extracted listing record
 - canonical property entity
 - search document projection

 Until those layers are fully split in code, this contract remains the authoritative machine-readable output target for fixture validation and early extraction work.

 ## Fields

 Canonical listing output fields:

- `source_domain`
- `source_url`
- `listing_id`
- `agent_name`
- `branch_name`
- `sale_or_rent`
- `listing_status`
- `price_amount`
- `price_currency`
- `price_frequency`
- `address_full`
- `postcode`
- `latitude`
- `longitude`
- `property_type`
- `bedrooms`
- `bathrooms`
- `reception_rooms`
- `floor_area_sqft`
- `floor_area_sqm`
- `tenure`
- `epc_rating`
- `description`
- `features[]`
- `images[]`
- `floorplans[]`
- `added_date`
- `updated_date`
- `availability_text`
- `extraction_confidence`
- `evidence[]`

 ## Invariants

 - `source_url` must be a fully qualified URL.
 - `price_currency` should be ISO-style three-letter currency text.
 - `extraction_confidence` is a bounded `0..1` score.
 - `evidence[]` must record where important extracted values came from.
 - A record is not considered safely indexable unless it passes machine-readable validation.

 See `packages/domain/src/canonical-property.schema.json` for the machine-readable version.
