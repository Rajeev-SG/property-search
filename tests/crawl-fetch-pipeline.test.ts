import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createProviderRegistry, runFetchPipeline } from "@property-search/crawl";

const tempDirectories: string[] = [];

async function createTempRepoRoot() {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "property-search-fetch-pipeline-"));
  tempDirectories.push(tempRoot);
  await fs.mkdir(path.join(tempRoot, "artifacts"), { recursive: true });
  return tempRoot;
}

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true })
    )
  );
});

describe("fetch pipeline", () => {
  it("persists raw and rendered artifacts plus diagnostics for a successful run", async () => {
    const repoRoot = await createTempRepoRoot();
    const registry = createProviderRegistry({
      env: {
        CLOUDFLARE_ACCOUNT_ID: "fixture-account",
        CLOUDFLARE_API_TOKEN: "fixture-token",
        DEFAULT_BROWSER_AUTOMATION_PROVIDER: "none",
        DEFAULT_DISCOVERY_PROVIDER: "none",
        DEFAULT_ESCALATION_PROVIDER: "none",
        DEFAULT_RENDER_PROVIDER: "cloudflare",
        DEFAULT_SCHEMA_EXTRACTION_PROVIDER: "none",
        DEFAULT_STATIC_FETCH_PROVIDER: "direct",
        PROVIDER_EXECUTION_MODE: "auto"
      },
      includeProcessEnv: false,
      liveFactories: {
        render: {
          cloudflare: () => ({
            implementation: "live",
            name: "cloudflare",
            role: "render",
            async fetchRendered(request) {
              return {
                artifactPath: "ignored/rendered.html",
                content: "<html><body><main data-rendered=\"true\">Rendered fixture</main></body></html>",
                metadata: {
                  fixture: "rendered"
                },
                provider: "cloudflare",
                responseFormat: "html",
                statusCode: 200,
                url: request.url
              };
            }
          })
        },
        staticFetch: {
          direct: () => ({
            implementation: "live",
            name: "direct",
            role: "staticFetch",
            async fetchPage(request) {
              return {
                artifactPath: "ignored/raw.html",
                content: "<html><body><main>Raw fixture</main></body></html>",
                metadata: {
                  fixture: "raw"
                },
                provider: "direct",
                responseFormat: "html",
                statusCode: 200,
                url: request.url
              };
            }
          })
        }
      },
      repoRoot
    });

    const result = await runFetchPipeline({
      pageUrl: "https://example.com/listings/demo-home",
      registry,
      repoRoot,
      sourceId: "fixture-source"
    });

    expect(result.run.status).toBe("succeeded");
    expect(result.attempts).toHaveLength(2);
    expect(result.attempts.map((attempt) => attempt.status)).toEqual([
      "succeeded",
      "succeeded"
    ]);
    expect(result.run.artifacts.map((artifact) => artifact.bucket)).toEqual([
      "raw",
      "rendered",
      "diagnostics"
    ]);

    const manifest = JSON.parse(
      await fs.readFile(path.join(repoRoot, result.run.summaryPath), "utf8")
    ) as {
      metadata: {
        attempts: Array<{ mode: string; status: string }>;
        diagnosticsPath: string;
      };
    };
    expect(manifest.metadata.diagnosticsPath).toBe(result.diagnosticsPath);
    expect(manifest.metadata.attempts).toEqual([
      expect.objectContaining({ mode: "static", status: "succeeded" }),
      expect.objectContaining({ mode: "rendered", status: "succeeded" })
    ]);

    const rawArtifact = result.run.artifacts.find((artifact) => artifact.bucket === "raw");
    const renderedArtifact = result.run.artifacts.find((artifact) => artifact.bucket === "rendered");
    expect(rawArtifact?.relativePath).toMatch(/^artifacts\/runs\//);
    expect(renderedArtifact?.relativePath).toMatch(/^artifacts\/runs\//);
    expect(await fs.readFile(path.join(repoRoot, rawArtifact!.relativePath), "utf8")).toContain(
      "Raw fixture"
    );
    expect(
      await fs.readFile(path.join(repoRoot, renderedArtifact!.relativePath), "utf8")
    ).toContain("Rendered fixture");
  });

  it("records replayable failure metadata when the rendered fetch fails", async () => {
    const repoRoot = await createTempRepoRoot();
    const registry = createProviderRegistry({
      env: {
        CLOUDFLARE_ACCOUNT_ID: "fixture-account",
        CLOUDFLARE_API_TOKEN: "fixture-token",
        DEFAULT_BROWSER_AUTOMATION_PROVIDER: "none",
        DEFAULT_DISCOVERY_PROVIDER: "none",
        DEFAULT_ESCALATION_PROVIDER: "none",
        DEFAULT_RENDER_PROVIDER: "cloudflare",
        DEFAULT_SCHEMA_EXTRACTION_PROVIDER: "none",
        DEFAULT_STATIC_FETCH_PROVIDER: "direct",
        PROVIDER_EXECUTION_MODE: "auto"
      },
      includeProcessEnv: false,
      liveFactories: {
        render: {
          cloudflare: () => ({
            implementation: "live",
            name: "cloudflare",
            role: "render",
            async fetchRendered() {
              throw new Error("Simulated render timeout");
            }
          })
        },
        staticFetch: {
          direct: () => ({
            implementation: "live",
            name: "direct",
            role: "staticFetch",
            async fetchPage(request) {
              return {
                artifactPath: "ignored/raw.html",
                content: "<html><body><main>Raw fixture</main></body></html>",
                provider: "direct",
                responseFormat: "html",
                statusCode: 200,
                url: request.url
              };
            }
          })
        }
      },
      repoRoot
    });

    const result = await runFetchPipeline({
      pageUrl: "https://example.com/listings/demo-home",
      registry,
      repoRoot,
      sourceId: "fixture-source"
    });

    expect(result.run.status).toBe("partial");
    expect(result.run.errorClass).toBe("rendered-fetch-failure");
    expect(result.run.errorDetail).toContain("Simulated render timeout");

    const diagnostics = JSON.parse(
      await fs.readFile(path.join(repoRoot, result.diagnosticsPath), "utf8")
    ) as {
      attempts: Array<{ errorDetail?: string; mode: string; status: string }>;
    };
    expect(diagnostics.attempts).toEqual([
      expect.objectContaining({ mode: "static", status: "succeeded" }),
      expect.objectContaining({
        errorDetail: "Simulated render timeout",
        mode: "rendered",
        status: "failed"
      })
    ]);
  });
});
