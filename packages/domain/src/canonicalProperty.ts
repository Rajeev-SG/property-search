import { z } from "zod";

export const canonicalPropertySchema = z.object({
  source_domain: z.string().min(1),
  source_url: z.string().url(),
  listing_id: z.string().min(1),
  agent_name: z.string().min(1),
  branch_name: z.string().optional(),
  sale_or_rent: z.enum(["sale", "rent"]),
  listing_status: z.enum(["available", "under_offer", "sstc", "let_agreed", "withdrawn", "unknown"]),
  price_amount: z.number().nonnegative(),
  price_currency: z.string().length(3),
  price_frequency: z.enum(["total", "pcm", "pw", "pa"]).default("total"),
  address_full: z.string().min(1),
  postcode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  property_type: z.enum([
    "flat",
    "apartment",
    "house",
    "maisonette",
    "studio",
    "bungalow",
    "other"
  ]),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  reception_rooms: z.number().int().nonnegative().optional(),
  floor_area_sqft: z.number().nonnegative().optional(),
  floor_area_sqm: z.number().nonnegative().optional(),
  tenure: z.enum(["freehold", "leasehold", "share_of_freehold", "commonhold", "unknown"]).default("unknown"),
  epc_rating: z.string().optional(),
  description: z.string().min(1),
  features: z.array(z.string()).default([]),
  images: z.array(z.string().url()).default([]),
  floorplans: z.array(z.string().url()).default([]),
  added_date: z.string().optional(),
  updated_date: z.string().optional(),
  availability_text: z.string().optional(),
  extraction_confidence: z.number().min(0).max(1),
  evidence: z.array(z.object({
    field: z.string(),
    source: z.enum(["jsonld", "dom", "script_blob", "llm", "adapter"]),
    locator: z.string(),
    excerpt: z.string().optional()
  })).default([])
});

export type CanonicalProperty = z.infer<typeof canonicalPropertySchema>;
