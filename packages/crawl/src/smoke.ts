import { createProviderRegistry } from "./registry.js";
import { runFetchPipeline, type FetchPipelineResult } from "./fetchPipeline.js";

export interface FetchPipelineSmokeOptions {
  artifactsRoot?: string;
  log?: (message: string) => void;
  persistToDatabase?: boolean;
  repoRoot?: string;
}

export async function runFetchPipelineSmoke(
  options: FetchPipelineSmokeOptions = {}
): Promise<FetchPipelineResult> {
  const log = options.log ?? console.log;
  const registry = createProviderRegistry({
    env: {
      DEFAULT_BROWSER_AUTOMATION_PROVIDER: "none",
      DEFAULT_DISCOVERY_PROVIDER: "none",
      DEFAULT_ESCALATION_PROVIDER: "none",
      DEFAULT_RENDER_PROVIDER: "cloudflare",
      DEFAULT_SCHEMA_EXTRACTION_PROVIDER: "none",
      DEFAULT_STATIC_FETCH_PROVIDER: "direct",
      PROVIDER_EXECUTION_MODE: "fake"
    },
    includeProcessEnv: false,
    repoRoot: options.repoRoot
  });

  const result = await runFetchPipeline({
    artifactsRoot: options.artifactsRoot,
    metadata: {
      purpose: "crawl-fetch-pipeline-smoke"
    },
    pageUrl: "https://example.com/listings/demo-home",
    persistToDatabase: options.persistToDatabase,
    registry,
    repoRoot: options.repoRoot,
    scope: "crawl-fetch-render-pipeline-smoke",
    sourceId: "fixture-demo-home",
    trigger: "cli"
  });

  log(`crawl fetch smoke run created: ${result.run.runId}`);
  log(`status: ${result.run.status}`);
  log(`manifest: ${result.run.summaryPath}`);
  log(`diagnostics: ${result.diagnosticsPath}`);

  return result;
}
