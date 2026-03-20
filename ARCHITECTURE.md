# Architecture

## System goal

Aggregate listings from many independent estate-agent websites into one normalized property search engine.

## Core design

The system is split into layers:

1. **Source registry**
   - raw estate-agent discovery input from `data/seeds/estate-agents.csv`
   - normalization into an internal source-registry contract
   - per-domain and per-branch metadata, provenance, and hints

2. **Site profiling**
   - detect sitemaps
   - classify listing/search/detail pages
   - infer pagination style
   - record robots signal and crawl constraints

3. **Crawl / fetch**
   - basic HTML fetch
   - rendered fetch
   - managed crawl provider
   - escalation provider for hard sites

4. **Extraction ladder**
   - JSON-LD / microdata / obvious script blobs
   - deterministic DOM selectors
   - schema-constrained LLM extraction
   - site adapter override

5. **Normalization**
   - price normalization
   - address normalization
   - status / tenure / property type harmonization
   - feature extraction

6. **Deduplication / canonicalization**
   - listing-level record
   - canonical property entity
   - listing-to-property match score

7. **Persistence**
   - Postgres: source of truth
   - filesystem: raw artifacts
   - Typesense: search docs

8. **Search projection and query**
   - transform canonical entities into indexable search documents
   - facet/query layer over local Typesense

9. **Evaluation**
   - fixture validation
   - domain evals
   - drift detection
   - extraction quality score

## Provider policy

### Default path
- Discovery and first-pass crawl: Firecrawl
- HTML / JSON extraction and custom browser workflow: Cloudflare Browser Rendering
- Browser automation for complex interactive recovery paths: browser-use with OpenRouter `glm-5`
- Hard site escalation: Bright Data when extra unblock capability is needed

### Why
- keep easy sites cheap
- pay for unblocking only when necessary
- preserve a single internal extraction pipeline regardless of upstream provider

## Data model

The repo should treat these as separate but related layers.

### Raw page record
Stores:
- URL
- provider
- fetch mode
- response format
- crawl policy metadata
- artifact paths
- fetch timestamp

### Extracted listing record
Stores:
- source URL
- source domain and listing identifier
- raw extracted fields
- confidence
- evidence
- extractor path used

### Canonical property record
Stores:
- canonical property identifier
- normalized search fields
- dedupe cluster keys
- source listing references
- aggregate evidence/count signals
- freshness timestamps

### Search document
Stores:
- indexable projection derived from canonical property records
- facet-friendly values
- denormalized display fields needed for local search
- string-friendly listing references for index payloads

### Contract ownership

- Extraction produces `ExtractedListing`.
- Normalization and dedupe produce `CanonicalProperty`.
- Search indexing produces `SearchDocument`.
- Each boundary is schema-validated before the next stage consumes it.

## Local storage layout

```text
artifacts/
  raw/
  rendered/
  extracted/
  screenshots/
  runs/
```

## Failure strategy

- hard failures are recorded, not swallowed
- every provider call records provider name and request shape
- schema validation errors are first-class
- a listing is only indexable after canonical validation

## Long-term extension points

- queue-backed crawl scheduling
- domain template clustering
- semantic retrieval for descriptions
- recrawl prioritization based on change rate
- cloud storage + observability

## Postgres baseline tables

Ticket `004` establishes the first database baseline with these responsibilities:

- `source_registry`: normalized source rows derived from the raw CSV, including raw-row provenance and the retained raw payload
- `site_profiles`: robots, sitemap, pagination, and profiling evidence per source
- `raw_page_artifacts`: fetch metadata, crawl-policy metadata, provider request/response metadata, hashes, and filesystem artifact pointers
- `extracted_listings`: the validated extracted-listing contract plus evidence and extraction-path metadata
- `canonical_properties`: the canonical-property contract plus dedupe/search-friendly scalar fields
- `listing_property_links`: explicit listing-to-property linkage and match metadata for inspectable canonicalization

The database stores pointers to local artifacts rather than large raw HTML or screenshot blobs. Raw evidence remains on disk under `artifacts/`.
