import { loadSourceRegistryFetchTarget, type SourceRegistryFetchTarget } from "@property-search/harness";
import { createProviderRegistry } from "./registry.js";
import { runFetchPipeline, type FetchPipelineResult } from "./fetchPipeline.js";

export interface FetchPipelineSmokeOptions {
  artifactsRoot?: string;
  databaseUrl?: string;
  fixture?: boolean;
  log?: (message: string) => void;
  persistToDatabase?: boolean;
  requireSourceRegistry?: boolean;
  repoRoot?: string;
  sourceId?: string;
}

export interface FetchPipelineSmokeTarget {
  metadata: Record<string, unknown>;
  pageUrl: string;
  sourceId: string;
  targetKind: "fixture" | "source_registry";
}

type SourceRegistryTargetLoader = (options: {
  databaseUrl?: string;
  sourceId?: string;
}) => Promise<SourceRegistryFetchTarget | null>;

const FIXTURE_SMOKE_TARGET: FetchPipelineSmokeTarget = {
  metadata: {
    fallbackReason: "fixture_requested",
    selection: "fixture"
  },
  pageUrl: "https://example.com/listings/demo-home",
  sourceId: "fixture-demo-home",
  targetKind: "fixture"
};

function buildFixtureTarget(reason: string, detail?: string): FetchPipelineSmokeTarget {
  return {
    ...FIXTURE_SMOKE_TARGET,
    metadata: {
      ...FIXTURE_SMOKE_TARGET.metadata,
      fallbackReason: reason,
      ...(detail ? { fallbackDetail: detail } : {})
    }
  };
}

export async function resolveFetchPipelineSmokeTarget(
  options: Pick<
    FetchPipelineSmokeOptions,
    "databaseUrl" | "fixture" | "requireSourceRegistry" | "sourceId"
  > & {
    loadSourceRegistryTarget?: SourceRegistryTargetLoader;
  } = {}
): Promise<FetchPipelineSmokeTarget> {
  if (options.fixture) {
    return FIXTURE_SMOKE_TARGET;
  }

  const loadSourceRegistryTarget =
    options.loadSourceRegistryTarget ?? loadSourceRegistryFetchTarget;

  try {
    const source = await loadSourceRegistryTarget({
      databaseUrl: options.databaseUrl,
      sourceId: options.sourceId
    });

    if (!source) {
      if (options.sourceId) {
        throw new Error(`No enabled source_registry row found for source_id "${options.sourceId}"`);
      }

      if (options.requireSourceRegistry) {
        throw new Error(
          "No enabled source_registry rows found. Run `pnpm db:migrate` and `pnpm source-registry:ingest` first."
        );
      }

      return buildFixtureTarget("source_registry_empty");
    }

    return {
      metadata: {
        brandName: source.brandName,
        branchName: source.branchName,
        rawInputPath: source.rawInputPath,
        rawRowNumber: source.rawRowNumber,
        selection: "source_registry",
        validationStatus: source.validationStatus,
        websiteDomain: source.websiteDomain
      },
      pageUrl: source.startUrl,
      sourceId: source.sourceId,
      targetKind: "source_registry"
    };
  } catch (error) {
    if (options.sourceId || options.requireSourceRegistry) {
      throw error;
    }

    const detail = error instanceof Error ? error.message : String(error);
    return buildFixtureTarget("source_registry_unavailable", detail);
  }
}

export async function runFetchPipelineSmoke(
  options: FetchPipelineSmokeOptions = {}
): Promise<FetchPipelineResult> {
  const log = options.log ?? console.log;
  const target = await resolveFetchPipelineSmokeTarget({
    databaseUrl: options.databaseUrl,
    fixture: options.fixture,
    requireSourceRegistry: options.requireSourceRegistry,
    sourceId: options.sourceId
  });
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
      purpose: "crawl-fetch-pipeline-smoke",
      targetKind: target.targetKind,
      targetSelection: target.metadata
    },
    pageUrl: target.pageUrl,
    persistToDatabase: options.persistToDatabase,
    registry,
    repoRoot: options.repoRoot,
    scope: "crawl-fetch-render-pipeline-smoke",
    sourceId: target.sourceId,
    trigger: "cli"
  });

  log(`crawl fetch smoke run created: ${result.run.runId}`);
  log(`status: ${result.run.status}`);
  log(`target: ${target.targetKind} ${target.sourceId} ${target.pageUrl}`);
  log(`manifest: ${result.run.summaryPath}`);
  log(`diagnostics: ${result.diagnosticsPath}`);

  return result;
}
