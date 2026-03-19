export type DiscoveryProviderName = "firecrawl" | "cloudflare" | "custom";
export type EscalationProviderName = "brightdata" | "none";
export type BrowserAutomationProviderName = "browseruse" | "none";

export interface CrawlResultArtifact {
  url: string;
  responseFormat: "html" | "markdown" | "json";
  artifactPath: string;
}

export interface SiteProfile {
  domain: string;
  sitemapUrls: string[];
  robotsUrl?: string;
  candidateListingPages: string[];
  candidateDetailPages: string[];
  paginationHints: string[];
}

export interface CrawlProvider {
  discoverSite(startUrl: string): Promise<SiteProfile>;
  fetchRendered(url: string): Promise<CrawlResultArtifact>;
  extractStructured(url: string, schemaName: string): Promise<Record<string, unknown>>;
}
