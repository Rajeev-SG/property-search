import { z } from "zod";

export const siteAdapterSchema = z.object({
  domain: z.string().min(1),
  enabled: z.boolean().default(true),
  start_urls: z.array(z.string().url()).min(1),
  allowed_paths: z.array(z.string()).default([]),
  exclude_patterns: z.array(z.string()).default([]),
  listing_page_patterns: z.array(z.string()).default([]),
  detail_page_patterns: z.array(z.string()).default([]),
  pagination: z.enum(["link", "button", "infinite_scroll", "unknown"]).default("unknown"),
  selectors: z.object({
    price: z.array(z.string()).default([]),
    address: z.array(z.string()).default([]),
    bedrooms: z.array(z.string()).default([]),
    bathrooms: z.array(z.string()).default([]),
    description: z.array(z.string()).default([]),
    features: z.array(z.string()).default([])
  }).default({
    price: [],
    address: [],
    bedrooms: [],
    bathrooms: [],
    description: [],
    features: []
  }),
  structured_data_priority: z.boolean().default(true),
  llm_fallback: z.boolean().default(true),
  notes: z.string().optional()
});

export type SiteAdapter = z.infer<typeof siteAdapterSchema>;
