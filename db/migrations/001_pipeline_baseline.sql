CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE IF NOT EXISTS source_registry (
  source_id text PRIMARY KEY,
  raw_row_hash text NOT NULL,
  brand_name text NOT NULL,
  branch_name text,
  agent_type text,
  website_domain text NOT NULL,
  homepage_url text NOT NULL,
  start_url text NOT NULL,
  normalized_area text,
  country_code text,
  enabled boolean NOT NULL DEFAULT true,
  validation_status text NOT NULL DEFAULT 'unknown',
  provenance_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  raw_input_path text NOT NULL,
  raw_row_number integer NOT NULL CHECK (raw_row_number > 0),
  raw_payload jsonb NOT NULL,
  ingest_notes text,
  ingested_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT source_registry_homepage_url_http CHECK (homepage_url ~* '^https?://'),
  CONSTRAINT source_registry_start_url_http CHECK (start_url ~* '^https?://'),
  CONSTRAINT source_registry_row_source_unique UNIQUE (raw_input_path, raw_row_number)
);

CREATE INDEX IF NOT EXISTS source_registry_domain_idx
  ON source_registry (website_domain);

CREATE INDEX IF NOT EXISTS source_registry_enabled_idx
  ON source_registry (enabled);

CREATE INDEX IF NOT EXISTS source_registry_validation_status_idx
  ON source_registry (validation_status);

CREATE INDEX IF NOT EXISTS source_registry_raw_payload_gin_idx
  ON source_registry
  USING gin (raw_payload jsonb_path_ops);

CREATE TABLE IF NOT EXISTS site_profiles (
  profile_id text PRIMARY KEY,
  source_id text NOT NULL REFERENCES source_registry (source_id) ON DELETE CASCADE,
  profile_url text NOT NULL,
  provider text,
  robots_txt_url text,
  robots_status text,
  crawl_allowed boolean,
  crawl_delay_ms integer CHECK (crawl_delay_ms IS NULL OR crawl_delay_ms >= 0),
  sitemap_urls text[] NOT NULL DEFAULT ARRAY[]::text[],
  listing_url_patterns jsonb NOT NULL DEFAULT '[]'::jsonb,
  detail_url_patterns jsonb NOT NULL DEFAULT '[]'::jsonb,
  pagination_mode text,
  profile_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  discovered_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  profiled_at timestamptz NOT NULL,
  CONSTRAINT site_profiles_profile_url_http CHECK (profile_url ~* '^https?://'),
  CONSTRAINT site_profiles_robots_txt_url_http CHECK (
    robots_txt_url IS NULL OR robots_txt_url ~* '^https?://'
  ),
  CONSTRAINT site_profiles_source_profile_unique UNIQUE (source_id, profile_url)
);

CREATE INDEX IF NOT EXISTS site_profiles_source_idx
  ON site_profiles (source_id);

CREATE INDEX IF NOT EXISTS site_profiles_profiled_at_idx
  ON site_profiles (profiled_at DESC);

CREATE TABLE IF NOT EXISTS raw_page_artifacts (
  artifact_id text PRIMARY KEY,
  source_id text REFERENCES source_registry (source_id) ON DELETE SET NULL,
  profile_id text REFERENCES site_profiles (profile_id) ON DELETE SET NULL,
  page_url text NOT NULL,
  final_url text,
  provider text NOT NULL,
  fetch_mode text NOT NULL,
  response_format text NOT NULL,
  http_status integer CHECK (
    http_status IS NULL OR (http_status >= 100 AND http_status <= 599)
  ),
  content_sha256 text,
  artifact_root text NOT NULL DEFAULT 'artifacts',
  html_path text,
  rendered_html_path text,
  markdown_path text,
  json_path text,
  screenshot_path text,
  response_headers jsonb NOT NULL DEFAULT '{}'::jsonb,
  crawl_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider_request jsonb NOT NULL DEFAULT '{}'::jsonb,
  provider_response_meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_class text,
  error_detail text,
  captured_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT raw_page_artifacts_page_url_http CHECK (page_url ~* '^https?://'),
  CONSTRAINT raw_page_artifacts_final_url_http CHECK (
    final_url IS NULL OR final_url ~* '^https?://'
  )
);

CREATE INDEX IF NOT EXISTS raw_page_artifacts_source_idx
  ON raw_page_artifacts (source_id);

CREATE INDEX IF NOT EXISTS raw_page_artifacts_profile_idx
  ON raw_page_artifacts (profile_id);

CREATE INDEX IF NOT EXISTS raw_page_artifacts_page_url_idx
  ON raw_page_artifacts (page_url);

CREATE INDEX IF NOT EXISTS raw_page_artifacts_captured_at_idx
  ON raw_page_artifacts (captured_at DESC);

CREATE TABLE IF NOT EXISTS extracted_listings (
  listing_record_id text PRIMARY KEY,
  source_id text REFERENCES source_registry (source_id) ON DELETE SET NULL,
  artifact_id text REFERENCES raw_page_artifacts (artifact_id) ON DELETE SET NULL,
  source_domain text NOT NULL,
  source_url text NOT NULL,
  listing_id text NOT NULL,
  agent_name text NOT NULL,
  branch_name text,
  sale_or_rent text NOT NULL CHECK (sale_or_rent IN ('sale', 'rent')),
  listing_status text NOT NULL CHECK (
    listing_status IN ('available', 'under_offer', 'sstc', 'let_agreed', 'withdrawn', 'unknown')
  ),
  price_amount numeric(14, 2) NOT NULL CHECK (price_amount >= 0),
  price_currency char(3) NOT NULL,
  price_frequency text NOT NULL CHECK (price_frequency IN ('total', 'pcm', 'pw', 'pa')),
  address_full text NOT NULL,
  postcode text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  property_type text NOT NULL CHECK (
    property_type IN ('flat', 'apartment', 'house', 'maisonette', 'studio', 'bungalow', 'other')
  ),
  bedrooms integer CHECK (bedrooms IS NULL OR bedrooms >= 0),
  bathrooms integer CHECK (bathrooms IS NULL OR bathrooms >= 0),
  reception_rooms integer CHECK (reception_rooms IS NULL OR reception_rooms >= 0),
  floor_area_sqft numeric(10, 2) CHECK (floor_area_sqft IS NULL OR floor_area_sqft >= 0),
  floor_area_sqm numeric(10, 2) CHECK (floor_area_sqm IS NULL OR floor_area_sqm >= 0),
  tenure text NOT NULL DEFAULT 'unknown' CHECK (
    tenure IN ('freehold', 'leasehold', 'share_of_freehold', 'commonhold', 'unknown')
  ),
  epc_rating text,
  description text NOT NULL,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  floorplans jsonb NOT NULL DEFAULT '[]'::jsonb,
  added_date text,
  updated_date text,
  availability_text text,
  extraction_path text NOT NULL,
  extraction_confidence numeric(4, 3) NOT NULL CHECK (
    extraction_confidence >= 0 AND extraction_confidence <= 1
  ),
  extracted_payload jsonb NOT NULL,
  evidence jsonb NOT NULL,
  extracted_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT extracted_listings_source_url_http CHECK (source_url ~* '^https?://'),
  CONSTRAINT extracted_listings_lat_lon_pair CHECK (
    (latitude IS NULL AND longitude IS NULL)
    OR (latitude IS NOT NULL AND longitude IS NOT NULL)
  ),
  CONSTRAINT extracted_listings_source_listing_unique UNIQUE (source_domain, source_url, listing_id)
);

CREATE INDEX IF NOT EXISTS extracted_listings_source_idx
  ON extracted_listings (source_id);

CREATE INDEX IF NOT EXISTS extracted_listings_artifact_idx
  ON extracted_listings (artifact_id);

CREATE INDEX IF NOT EXISTS extracted_listings_source_domain_idx
  ON extracted_listings (source_domain);

CREATE INDEX IF NOT EXISTS extracted_listings_listing_id_idx
  ON extracted_listings (listing_id);

CREATE INDEX IF NOT EXISTS extracted_listings_extracted_at_idx
  ON extracted_listings (extracted_at DESC);

CREATE INDEX IF NOT EXISTS extracted_listings_address_trgm_idx
  ON extracted_listings
  USING gin (address_full gin_trgm_ops);

CREATE TABLE IF NOT EXISTS canonical_properties (
  property_id text PRIMARY KEY,
  dedupe_key text NOT NULL UNIQUE,
  sale_or_rent text NOT NULL CHECK (sale_or_rent IN ('sale', 'rent')),
  listing_status text NOT NULL CHECK (
    listing_status IN ('available', 'under_offer', 'sstc', 'let_agreed', 'withdrawn', 'unknown')
  ),
  price_amount numeric(14, 2) NOT NULL CHECK (price_amount >= 0),
  price_currency char(3) NOT NULL,
  price_frequency text NOT NULL CHECK (price_frequency IN ('total', 'pcm', 'pw', 'pa')),
  address_full text NOT NULL,
  postcode text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  property_type text NOT NULL CHECK (
    property_type IN ('flat', 'apartment', 'house', 'maisonette', 'studio', 'bungalow', 'other')
  ),
  bedrooms integer CHECK (bedrooms IS NULL OR bedrooms >= 0),
  bathrooms integer CHECK (bathrooms IS NULL OR bathrooms >= 0),
  reception_rooms integer CHECK (reception_rooms IS NULL OR reception_rooms >= 0),
  floor_area_sqft numeric(10, 2) CHECK (floor_area_sqft IS NULL OR floor_area_sqft >= 0),
  floor_area_sqm numeric(10, 2) CHECK (floor_area_sqm IS NULL OR floor_area_sqm >= 0),
  tenure text NOT NULL DEFAULT 'unknown' CHECK (
    tenure IN ('freehold', 'leasehold', 'share_of_freehold', 'commonhold', 'unknown')
  ),
  epc_rating text,
  summary text NOT NULL,
  feature_tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  floorplan_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_listing_refs jsonb NOT NULL,
  source_domains text[] NOT NULL DEFAULT ARRAY[]::text[],
  agent_names text[] NOT NULL DEFAULT ARRAY[]::text[],
  listing_count integer NOT NULL CHECK (listing_count > 0),
  evidence_count integer NOT NULL CHECK (evidence_count > 0),
  extraction_confidence numeric(4, 3) NOT NULL CHECK (
    extraction_confidence >= 0 AND extraction_confidence <= 1
  ),
  canonical_payload jsonb NOT NULL,
  first_seen_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  CONSTRAINT canonical_properties_first_last_seen CHECK (first_seen_at <= last_seen_at),
  CONSTRAINT canonical_properties_lat_lon_pair CHECK (
    (latitude IS NULL AND longitude IS NULL)
    OR (latitude IS NOT NULL AND longitude IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS canonical_properties_listing_status_idx
  ON canonical_properties (listing_status);

CREATE INDEX IF NOT EXISTS canonical_properties_property_type_idx
  ON canonical_properties (property_type);

CREATE INDEX IF NOT EXISTS canonical_properties_last_seen_at_idx
  ON canonical_properties (last_seen_at DESC);

CREATE INDEX IF NOT EXISTS canonical_properties_address_trgm_idx
  ON canonical_properties
  USING gin (address_full gin_trgm_ops);

CREATE TABLE IF NOT EXISTS listing_property_links (
  extracted_listing_record_id text NOT NULL REFERENCES extracted_listings (listing_record_id) ON DELETE CASCADE,
  property_id text NOT NULL REFERENCES canonical_properties (property_id) ON DELETE CASCADE,
  match_method text NOT NULL,
  match_score numeric(4, 3) NOT NULL CHECK (match_score >= 0 AND match_score <= 1),
  is_primary boolean NOT NULL DEFAULT false,
  linkage_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  linked_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  PRIMARY KEY (extracted_listing_record_id, property_id)
);

CREATE INDEX IF NOT EXISTS listing_property_links_property_idx
  ON listing_property_links (property_id);

CREATE INDEX IF NOT EXISTS listing_property_links_linked_at_idx
  ON listing_property_links (linked_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS listing_property_links_primary_unique_idx
  ON listing_property_links (extracted_listing_record_id)
  WHERE is_primary;
