export const discoveryProviderNames = ["firecrawl", "cloudflare", "none"] as const;
export const staticFetchProviderNames = ["direct"] as const;
export const renderProviderNames = ["cloudflare", "firecrawl", "none"] as const;
export const schemaExtractionProviderNames = ["cloudflare", "firecrawl", "none"] as const;
export const browserAutomationProviderNames = ["browseruse", "none"] as const;
export const escalationProviderNames = ["brightdata", "none"] as const;
export const providerExecutionModes = ["fake", "auto"] as const;
export const providerImplementations = ["fake", "live"] as const;
export const crawlResponseFormats = ["html", "markdown", "json", "text"] as const;
export const providerCredentialKeys = [
  "brightDataApiKey",
  "brightDataBrowserWs",
  "brightDataZone",
  "cloudflareAccountId",
  "cloudflareApiToken",
  "firecrawlApiKey",
  "openRouterApiKey"
] as const;

export type DiscoveryProviderName = typeof discoveryProviderNames[number];
export type StaticFetchProviderName = typeof staticFetchProviderNames[number];
export type RenderProviderName = typeof renderProviderNames[number];
export type SchemaExtractionProviderName = typeof schemaExtractionProviderNames[number];
export type BrowserAutomationProviderName = typeof browserAutomationProviderNames[number];
export type EscalationProviderName = typeof escalationProviderNames[number];
export type ProviderExecutionMode = typeof providerExecutionModes[number];
export type ProviderImplementation = typeof providerImplementations[number];
export type CrawlResponseFormat = typeof crawlResponseFormats[number];
export type ProviderCredentialKey = typeof providerCredentialKeys[number];

export type ProviderRole =
  | "discovery"
  | "staticFetch"
  | "render"
  | "schemaExtraction"
  | "browserAutomation"
  | "escalation";

export interface ProviderCallContext {
  runId?: string;
  sourceId?: string;
  pageUrl?: string;
  scope?: string;
  artifactPath?: string;
}

export interface ProviderDescriptor<TName extends string, TRole extends ProviderRole> {
  readonly implementation: ProviderImplementation;
  readonly name: TName;
  readonly role: TRole;
}

export interface CrawlResultArtifact {
  artifactPath: string;
  content?: string;
  durationMs?: number;
  fetchedAt?: string;
  metadata?: Record<string, unknown>;
  provider: string;
  responseFormat: CrawlResponseFormat;
  statusCode?: number;
  url: string;
}

export interface SchemaExtractionArtifact {
  artifactPath: string;
  payload: Record<string, unknown>;
  provider: string;
  schemaName: string;
  url: string;
}

export interface BrowserAutomationArtifact {
  artifactPath: string;
  objective: string;
  provider: string;
  transcript: string[];
  url: string;
}

export interface EscalationArtifact {
  artifactPath: string;
  escalated: boolean;
  nextAction: "retry_render" | "browser_automation" | "manual_review";
  provider: string;
  reason: string;
  url: string;
}

export interface SiteProfile {
  candidateDetailPages: string[];
  candidateListingPages: string[];
  domain: string;
  paginationHints: string[];
  robotsUrl?: string;
  sitemapUrls: string[];
}

export interface DiscoveryRequest extends ProviderCallContext {
  startUrl: string;
}

export interface FetchRequest extends ProviderCallContext {
  url: string;
}

export interface SchemaExtractionRequest extends ProviderCallContext {
  schemaName: string;
  url: string;
}

export interface BrowserAutomationRequest extends ProviderCallContext {
  objective: string;
  url: string;
}

export interface EscalationRequest extends ProviderCallContext {
  reason: string;
  url: string;
}

export interface DiscoveryProvider
  extends ProviderDescriptor<DiscoveryProviderName, "discovery"> {
  discoverSite(request: DiscoveryRequest): Promise<SiteProfile>;
}

export interface StaticFetchProvider
  extends ProviderDescriptor<StaticFetchProviderName, "staticFetch"> {
  fetchPage(request: FetchRequest): Promise<CrawlResultArtifact>;
}

export interface RenderProvider extends ProviderDescriptor<RenderProviderName, "render"> {
  fetchRendered(request: FetchRequest): Promise<CrawlResultArtifact>;
}

export interface SchemaExtractionProvider
  extends ProviderDescriptor<SchemaExtractionProviderName, "schemaExtraction"> {
  extractStructuredData(request: SchemaExtractionRequest): Promise<SchemaExtractionArtifact>;
}

export interface BrowserAutomationProvider
  extends ProviderDescriptor<BrowserAutomationProviderName, "browserAutomation"> {
  runTask(request: BrowserAutomationRequest): Promise<BrowserAutomationArtifact>;
}

export interface EscalationProvider
  extends ProviderDescriptor<EscalationProviderName, "escalation"> {
  escalate(request: EscalationRequest): Promise<EscalationArtifact>;
}

export interface ProviderCatalogEntry<TName extends string, TRole extends ProviderRole> {
  displayName: string;
  name: TName;
  requiredCredentials: readonly ProviderCredentialKey[];
  role: TRole;
}
