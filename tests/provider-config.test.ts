import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  createProviderRegistry,
  providerCatalog,
  resolveProviderConfig
} from "@property-search/crawl";

const tempDirectories: string[] = [];

async function createTempRepoRoot(files: Record<string, string>) {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "property-search-providers-"));
  tempDirectories.push(tempRoot);

  await Promise.all(
    Object.entries(files).map(async ([relativePath, contents]) => {
      const absolutePath = path.join(tempRoot, relativePath);
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, contents, "utf8");
    })
  );

  return tempRoot;
}

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true })
    )
  );
});

describe("provider config", () => {
  it("loads repo-managed env defaults and local overrides", async () => {
    const repoRoot = await createTempRepoRoot({
      ".env": [
        "DEFAULT_DISCOVERY_PROVIDER=cloudflare",
        "OPENROUTER_API_KEY=test-key",
        "DEFAULT_BROWSER_AUTOMATION_PROVIDER=browseruse"
      ].join("\n"),
      ".env.example": [
        "ARTIFACT_ROOT=./artifacts",
        "DEFAULT_DISCOVERY_PROVIDER=firecrawl",
        "DEFAULT_STATIC_FETCH_PROVIDER=direct",
        "DEFAULT_RENDER_PROVIDER=cloudflare",
        "DEFAULT_SCHEMA_EXTRACTION_PROVIDER=cloudflare",
        "DEFAULT_BROWSER_AUTOMATION_PROVIDER=none",
        "DEFAULT_ESCALATION_PROVIDER=brightdata",
        "PROVIDER_EXECUTION_MODE=fake",
        "DEFAULT_MAX_PAGES_PER_SITE=500",
        "DEFAULT_RECRAWL_HOURS=24",
        "RESPECT_ROBOTS=true",
        "OPENROUTER_MODEL=z-ai/glm-5"
      ].join("\n")
    });

    const config = resolveProviderConfig({
      includeProcessEnv: false,
      repoRoot
    });

    expect(config.envFilesRead).toEqual([".env.example", ".env"]);
    expect(config.defaults.discovery).toBe("cloudflare");
    expect(config.defaults.browserAutomation).toBe("browseruse");
    expect(config.defaults.staticFetch).toBe("direct");
    expect(config.credentials.openRouterApiKey).toBe(true);
    expect(config.executionMode).toBe("fake");
    expect(config.models.openRouterModel).toBe("z-ai/glm-5");
    expect(config.respectRobots).toBe(true);
  });

  it("returns deterministic fake providers without live credentials", async () => {
    const repoRoot = await createTempRepoRoot({
      ".env.example": [
        "DEFAULT_DISCOVERY_PROVIDER=firecrawl",
        "DEFAULT_STATIC_FETCH_PROVIDER=direct",
        "DEFAULT_RENDER_PROVIDER=none",
        "DEFAULT_SCHEMA_EXTRACTION_PROVIDER=none",
        "DEFAULT_BROWSER_AUTOMATION_PROVIDER=none",
        "DEFAULT_ESCALATION_PROVIDER=none"
      ].join("\n")
    });

    const registry = createProviderRegistry({
      includeProcessEnv: false,
      repoRoot
    });

    const siteProfile = await registry.discovery.discoverSite({
      startUrl: "https://example.com/search"
    });
    const page = await registry.staticFetch.fetchPage({
      url: "https://example.com/listings/home-1"
    });
    const extraction = await registry.schemaExtraction.extractStructuredData({
      schemaName: "canonical-property",
      url: "https://example.com/listings/home-1"
    });

    expect(siteProfile.domain).toBe("example.com");
    expect(siteProfile.sitemapUrls).toEqual(["https://example.com/sitemap.xml"]);
    expect(page.provider).toBe("direct");
    expect(page.artifactPath).toContain("artifacts/providers/static-fetch/direct");
    expect(extraction.payload).toMatchObject({
      fake: true,
      requestedSchema: "canonical-property"
    });
    expect(registry.resolution.discovery.runtimeMessage).toContain("PROVIDER_EXECUTION_MODE=fake");
  });

  it("fails fast on invalid provider names", async () => {
    const repoRoot = await createTempRepoRoot({
      ".env.example": "DEFAULT_DISCOVERY_PROVIDER=invalid-provider"
    });

    expect(() =>
      resolveProviderConfig({
        includeProcessEnv: false,
        repoRoot
      })
    ).toThrowError(/DEFAULT_DISCOVERY_PROVIDER/);
  });

  it("falls back to fake providers in auto mode when live factories are unavailable", async () => {
    const repoRoot = await createTempRepoRoot({
      ".env.example": [
        "DEFAULT_DISCOVERY_PROVIDER=firecrawl",
        "DEFAULT_STATIC_FETCH_PROVIDER=direct",
        "DEFAULT_RENDER_PROVIDER=cloudflare",
        "DEFAULT_SCHEMA_EXTRACTION_PROVIDER=cloudflare",
        "DEFAULT_BROWSER_AUTOMATION_PROVIDER=browseruse",
        "DEFAULT_ESCALATION_PROVIDER=brightdata",
        "PROVIDER_EXECUTION_MODE=auto"
      ].join("\n")
    });

    const registry = createProviderRegistry({
      includeProcessEnv: false,
      repoRoot
    });

    expect(registry.discovery.implementation).toBe("fake");
    expect(registry.resolution.discovery.missingCredentials).toEqual(["firecrawlApiKey"]);
    expect(registry.resolution.discovery.runtimeMessage).toContain("credentials are missing");
    expect(registry.resolution.render.runtimeMessage).toContain("credentials are missing");
  });

  it("uses injected live factories in auto mode when credentials are present", async () => {
    const repoRoot = await createTempRepoRoot({
      ".env.example": [
        "DEFAULT_DISCOVERY_PROVIDER=firecrawl",
        "DEFAULT_STATIC_FETCH_PROVIDER=direct",
        "DEFAULT_RENDER_PROVIDER=cloudflare",
        "DEFAULT_SCHEMA_EXTRACTION_PROVIDER=cloudflare",
        "DEFAULT_BROWSER_AUTOMATION_PROVIDER=browseruse",
        "DEFAULT_ESCALATION_PROVIDER=brightdata",
        "PROVIDER_EXECUTION_MODE=auto",
        "FIRECRAWL_API_KEY=test-firecrawl-key"
      ].join("\n")
    });

    const registry = createProviderRegistry({
      includeProcessEnv: false,
      liveFactories: {
        discovery: {
          firecrawl: () => ({
            implementation: "live",
            name: "firecrawl",
            role: "discovery",
            async discoverSite(request) {
              return {
                candidateDetailPages: [`${request.startUrl}/detail-live`],
                candidateListingPages: [request.startUrl],
                domain: new URL(request.startUrl).hostname,
                paginationHints: ["live"],
                sitemapUrls: []
              };
            }
          })
        }
      },
      repoRoot
    });

    const siteProfile = await registry.discovery.discoverSite({
      startUrl: "https://example.com/search"
    });

    expect(registry.discovery.implementation).toBe("live");
    expect(registry.resolution.discovery.implementation).toBe("live");
    expect(registry.resolution.discovery.runtimeMessage).toBeUndefined();
    expect(siteProfile.paginationHints).toEqual(["live"]);
  });

  it("keeps the provider catalog aligned with the fake default registry", () => {
    expect(providerCatalog.discovery.firecrawl.requiredCredentials).toEqual(["firecrawlApiKey"]);
    expect(providerCatalog.render.cloudflare.requiredCredentials).toEqual([
      "cloudflareAccountId",
      "cloudflareApiToken"
    ]);
    expect(providerCatalog.browserAutomation.browseruse.requiredCredentials).toEqual([
      "openRouterApiKey"
    ]);
  });
});
