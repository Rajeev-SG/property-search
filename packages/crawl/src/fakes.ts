import type {
  BrowserAutomationArtifact,
  BrowserAutomationProvider,
  BrowserAutomationRequest,
  BrowserAutomationProviderName,
  CrawlResultArtifact,
  DiscoveryProvider,
  DiscoveryProviderName,
  DiscoveryRequest,
  EscalationArtifact,
  EscalationProvider,
  EscalationProviderName,
  EscalationRequest,
  FetchRequest,
  RenderProvider,
  RenderProviderName,
  SchemaExtractionArtifact,
  SchemaExtractionProvider,
  SchemaExtractionProviderName,
  SchemaExtractionRequest,
  SiteProfile,
  StaticFetchProvider,
  StaticFetchProviderName
} from "./provider.js";

function artifactPathFromRequest(
  request: { artifactPath?: string; url?: string },
  role: string,
  provider: string
) {
  if (request.artifactPath) {
    return request.artifactPath;
  }

  const fallbackSlug = request.url ? new URL(request.url).hostname.replace(/\./g, "-") : "local";
  return `artifacts/providers/${role}/${provider}/${fallbackSlug}.json`;
}

function createFetchArtifact(
  request: FetchRequest,
  role: "static-fetch" | "render",
  provider: string,
  responseFormat: CrawlResultArtifact["responseFormat"]
): CrawlResultArtifact {
  return {
    artifactPath: artifactPathFromRequest(request, role, provider),
    provider,
    responseFormat,
    url: request.url
  };
}

function createSiteProfile(startUrl: string): SiteProfile {
  const url = new URL(startUrl);
  return {
    candidateDetailPages: [`${url.origin}/properties/example-home`],
    candidateListingPages: [`${url.origin}/properties`],
    domain: url.hostname,
    paginationHints: ["query:page"],
    robotsUrl: `${url.origin}/robots.txt`,
    sitemapUrls: [`${url.origin}/sitemap.xml`]
  };
}

export function createFakeDiscoveryProvider(name: DiscoveryProviderName): DiscoveryProvider {
  return {
    implementation: "fake",
    name,
    role: "discovery",
    async discoverSite(request: DiscoveryRequest) {
      return createSiteProfile(request.startUrl);
    }
  };
}

export function createFakeStaticFetchProvider(name: StaticFetchProviderName): StaticFetchProvider {
  return {
    implementation: "fake",
    name,
    role: "staticFetch",
    async fetchPage(request: FetchRequest) {
      return createFetchArtifact(request, "static-fetch", name, "html");
    }
  };
}

export function createFakeRenderProvider(name: RenderProviderName): RenderProvider {
  return {
    implementation: "fake",
    name,
    role: "render",
    async fetchRendered(request: FetchRequest) {
      return createFetchArtifact(request, "render", name, "html");
    }
  };
}

export function createFakeSchemaExtractionProvider(
  name: SchemaExtractionProviderName
): SchemaExtractionProvider {
  return {
    implementation: "fake",
    name,
    role: "schemaExtraction",
    async extractStructuredData(
      request: SchemaExtractionRequest
    ): Promise<SchemaExtractionArtifact> {
      return {
        artifactPath: artifactPathFromRequest(request, "schema-extraction", name),
        payload: {
          fake: true,
          requestedSchema: request.schemaName,
          url: request.url
        },
        provider: name,
        schemaName: request.schemaName,
        url: request.url
      };
    }
  };
}

export function createFakeBrowserAutomationProvider(
  name: BrowserAutomationProviderName
): BrowserAutomationProvider {
  return {
    implementation: "fake",
    name,
    role: "browserAutomation",
    async runTask(request: BrowserAutomationRequest): Promise<BrowserAutomationArtifact> {
      return {
        artifactPath: artifactPathFromRequest(request, "browser-automation", name),
        objective: request.objective,
        provider: name,
        transcript: [`Open ${request.url}`, `Objective: ${request.objective}`, "Fake run complete"],
        url: request.url
      };
    }
  };
}

export function createFakeEscalationProvider(
  name: EscalationProviderName
): EscalationProvider {
  return {
    implementation: "fake",
    name,
    role: "escalation",
    async escalate(request: EscalationRequest): Promise<EscalationArtifact> {
      const normalizedReason = request.reason.toLowerCase();
      const nextAction = normalizedReason.includes("interactive")
        ? "browser_automation"
        : normalizedReason.includes("render")
          ? "retry_render"
          : "manual_review";

      return {
        artifactPath: artifactPathFromRequest(request, "escalation", name),
        escalated: name !== "none",
        nextAction,
        provider: name,
        reason: request.reason,
        url: request.url
      };
    }
  };
}
