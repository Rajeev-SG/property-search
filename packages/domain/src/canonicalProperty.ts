import { z } from "zod";

export const saleOrRentSchema = z.enum(["sale", "rent"]);
export const listingStatusSchema = z.enum([
  "available",
  "under_offer",
  "sstc",
  "let_agreed",
  "withdrawn",
  "unknown"
]);
export const priceFrequencySchema = z.enum(["total", "pcm", "pw", "pa"]);
export const propertyTypeSchema = z.enum([
  "flat",
  "apartment",
  "house",
  "maisonette",
  "studio",
  "bungalow",
  "other"
]);
export const tenureSchema = z.enum([
  "freehold",
  "leasehold",
  "share_of_freehold",
  "commonhold",
  "unknown"
]);
export const evidenceSourceSchema = z.enum(["jsonld", "dom", "script_blob", "llm", "adapter"]);
export const extractedListingFieldSchema = z.enum([
  "source_domain",
  "source_url",
  "listing_id",
  "agent_name",
  "branch_name",
  "sale_or_rent",
  "listing_status",
  "price_amount",
  "price_currency",
  "price_frequency",
  "address_full",
  "postcode",
  "latitude",
  "longitude",
  "property_type",
  "bedrooms",
  "bathrooms",
  "reception_rooms",
  "floor_area_sqft",
  "floor_area_sqm",
  "tenure",
  "epc_rating",
  "description",
  "features",
  "images",
  "floorplans",
  "added_date",
  "updated_date",
  "availability_text"
]);

const isoTimestampSchema = z.string().regex(
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/,
  "Expected an ISO-8601 UTC timestamp"
);

const baseListingShape = {
  source_domain: z.string().min(1),
  source_url: z.string().url(),
  listing_id: z.string().min(1),
  agent_name: z.string().min(1),
  branch_name: z.string().optional(),
  sale_or_rent: saleOrRentSchema,
  listing_status: listingStatusSchema,
  price_amount: z.number().nonnegative(),
  price_currency: z.string().length(3),
  price_frequency: priceFrequencySchema.default("total"),
  address_full: z.string().min(1),
  postcode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  property_type: propertyTypeSchema,
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  reception_rooms: z.number().int().nonnegative().optional(),
  floor_area_sqft: z.number().nonnegative().optional(),
  floor_area_sqm: z.number().nonnegative().optional(),
  tenure: tenureSchema.default("unknown"),
  epc_rating: z.string().optional(),
  description: z.string().min(1),
  features: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  floorplans: z.array(z.string().url()).default([]),
  added_date: z.string().optional(),
  updated_date: z.string().optional(),
  availability_text: z.string().optional(),
};

export const extractionEvidenceSchema = z.object({
  field: extractedListingFieldSchema,
  source: evidenceSourceSchema,
  locator: z.string().min(1),
  value: z.string().min(1).optional(),
  excerpt: z.string().min(1).optional()
}).strict().refine(
  (evidence) => evidence.value !== undefined || evidence.excerpt !== undefined,
  {
    message: "Evidence must retain a raw value or excerpt.",
    path: ["value"]
  }
);

export const extractedListingSchema = z.object({
  record_type: z.literal("extracted_listing").default("extracted_listing"),
  ...baseListingShape,
  extraction_confidence: z.number().min(0).max(1),
  evidence: z.array(extractionEvidenceSchema).min(1)
}).strict().refine(
  (listing) => (listing.latitude === undefined) === (listing.longitude === undefined),
  {
    message: "Latitude and longitude must be supplied together.",
    path: ["latitude"]
  }
);

export const sourceListingReferenceSchema = z.object({
  source_domain: baseListingShape.source_domain,
  source_url: baseListingShape.source_url,
  listing_id: baseListingShape.listing_id
}).strict();

export const canonicalPropertySchema = z.object({
  record_type: z.literal("canonical_property").default("canonical_property"),
  property_id: z.string().min(1),
  source_listing_refs: z.array(sourceListingReferenceSchema).min(1),
  source_domains: z.array(z.string().min(1)).min(1),
  agent_names: z.array(z.string().min(1)).min(1),
  sale_or_rent: saleOrRentSchema,
  listing_status: listingStatusSchema,
  price_amount: baseListingShape.price_amount,
  price_currency: baseListingShape.price_currency,
  price_frequency: baseListingShape.price_frequency,
  address_full: baseListingShape.address_full,
  postcode: baseListingShape.postcode,
  latitude: baseListingShape.latitude,
  longitude: baseListingShape.longitude,
  property_type: propertyTypeSchema,
  bedrooms: baseListingShape.bedrooms,
  bathrooms: baseListingShape.bathrooms,
  reception_rooms: baseListingShape.reception_rooms,
  floor_area_sqft: baseListingShape.floor_area_sqft,
  floor_area_sqm: baseListingShape.floor_area_sqm,
  tenure: baseListingShape.tenure,
  epc_rating: baseListingShape.epc_rating,
  summary: z.string().min(1),
  feature_tags: z.array(z.string()).default([]),
  image_urls: z.array(z.string().url()).default([]),
  floorplan_urls: z.array(z.string().url()).default([]),
  dedupe_key: z.string().min(1),
  listing_count: z.number().int().positive(),
  evidence_count: z.number().int().positive(),
  extraction_confidence: z.number().min(0).max(1),
  first_seen_at: isoTimestampSchema,
  last_seen_at: isoTimestampSchema
}).strict().refine(
  (property) => (property.latitude === undefined) === (property.longitude === undefined),
  {
    message: "Latitude and longitude must be supplied together.",
    path: ["latitude"]
  }
);

export const searchDocumentSchema = z.object({
  record_type: z.literal("search_document").default("search_document"),
  document_id: z.string().min(1),
  property_id: z.string().min(1),
  source_listing_ids: z.array(z.string().min(1)).min(1),
  source_domains: z.array(z.string().min(1)).min(1),
  agent_names: z.array(z.string().min(1)).min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  searchable_text: z.string().min(1),
  sale_or_rent: saleOrRentSchema,
  listing_status: listingStatusSchema,
  price_amount: baseListingShape.price_amount,
  price_currency: baseListingShape.price_currency,
  price_frequency: baseListingShape.price_frequency,
  address_full: baseListingShape.address_full,
  postcode: baseListingShape.postcode,
  latitude: baseListingShape.latitude,
  longitude: baseListingShape.longitude,
  property_type: propertyTypeSchema,
  bedrooms: baseListingShape.bedrooms,
  bathrooms: baseListingShape.bathrooms,
  tenure: baseListingShape.tenure,
  feature_tags: z.array(z.string()).default([]),
  primary_image_url: z.string().url().optional(),
  last_seen_at: isoTimestampSchema
}).strict().refine(
  (document) => (document.latitude === undefined) === (document.longitude === undefined),
  {
    message: "Latitude and longitude must be supplied together.",
    path: ["latitude"]
  }
);

export type ExtractionEvidence = z.infer<typeof extractionEvidenceSchema>;
export type ExtractedListing = z.infer<typeof extractedListingSchema>;
export type SourceListingReference = z.infer<typeof sourceListingReferenceSchema>;
export type CanonicalProperty = z.infer<typeof canonicalPropertySchema>;
export type SearchDocument = z.infer<typeof searchDocumentSchema>;
