import {
  createRunLayout,
  persistRunLedger,
  updateRunLedger,
  writeJsonArtifact,
  writeRunManifest,
  writeTextArtifact,
  type RunLedgerRecord
} from "@property-search/harness";
import type { ProviderImplementation } from "./provider.js";
import type { ProviderRegistry } from "./registry.js";

export const fetchPipelineModes = ["static", "rendered"] as const;

export type FetchPipelineMode = (typeof fetchPipelineModes)[number];
export type FetchPipelineAttemptStatus = "succeeded" | "failed";

export interface FetchPipelineAttempt {
  artifactPath?: string;
  durationMs: number;
  errorClass?: string;
  errorDetail?: string;
  fetchedAt: string;
  implementation: ProviderImplementation;
  metadata: Record<string, unknown>;
  mode: FetchPipelineMode;
  provider: string;
  responseFormat?: "html" | "markdown" | "json" | "text";
  status: FetchPipelineAttemptStatus;
  statusCode?: number;
}

export interface RunFetchPipelineOptions {
  artifactsRoot?: string;
  includeRenderedFetch?: boolean;
  metadata?: Record<string, unknown>;
  pageUrl: string;
  persistToDatabase?: boolean;
  registry: ProviderRegistry;
  repoRoot?: string;
  scope?: string;
  sourceId?: string;
  trigger?: string;
}

export interface FetchPipelineResult {
  attempts: FetchPipelineAttempt[];
  diagnosticsPath: string;
  run: RunLedgerRecord;
}

type AttemptExecutor = () => Promise<{
  artifactPath?: string;
  content?: string;
  durationMs?: number;
  fetchedAt?: string;
  metadata?: Record<string, unknown>;
  provider: string;
  responseFormat: "html" | "markdown" | "json" | "text";
  statusCode?: number;
}>;

function extensionForResponseFormat(format: "html" | "markdown" | "json" | "text") {
  switch (format) {
    case "json":
      return "json";
    case "markdown":
      return "md";
    case "text":
      return "txt";
    case "html":
    default:
      return "html";
  }
}

function mediaTypeForResponseFormat(format: "html" | "markdown" | "json" | "text") {
  switch (format) {
    case "json":
      return "application/json";
    case "markdown":
      return "text/markdown";
    case "text":
      return "text/plain";
    case "html":
    default:
      return "text/html";
  }
}

function normalizeContent(content: string) {
  return content.endsWith("\n") ? content : `${content}\n`;
}

async function runAttempt(options: {
  bucket: "raw" | "rendered";
  execute: AttemptExecutor;
  implementation: ProviderImplementation;
  label: string;
  mode: FetchPipelineMode;
  pageUrl: string;
  run: RunLedgerRecord;
  selectedProvider: string;
}) {
  const startedAt = new Date();
  const startedAtMs = Date.now();

  try {
    const result = await options.execute();
    if (!result.content) {
      throw new Error(
        `${options.mode} provider "${result.provider}" returned no content payload to persist`
      );
    }

    const artifact = await writeTextArtifact(options.run, {
      bucket: options.bucket,
      content: normalizeContent(result.content),
      extension: extensionForResponseFormat(result.responseFormat),
      label: options.label,
      mediaType: mediaTypeForResponseFormat(result.responseFormat),
      metadata: {
        fetchMode: options.mode,
        implementation: options.implementation,
        providerArtifactPath: result.artifactPath,
        providerMetadata: result.metadata ?? {},
        statusCode: result.statusCode ?? null
      },
      pageUrl: options.pageUrl
    });

    return {
      artifactPath: artifact.relativePath,
      durationMs: result.durationMs ?? Date.now() - startedAtMs,
      fetchedAt: result.fetchedAt ?? startedAt.toISOString(),
      implementation: options.implementation,
      metadata: result.metadata ?? {},
      mode: options.mode,
      provider: result.provider,
      responseFormat: result.responseFormat,
      status: "succeeded" as const,
      statusCode: result.statusCode
    };
  } catch (error) {
    const resolvedError = error instanceof Error ? error : new Error(String(error));

    return {
      durationMs: Date.now() - startedAtMs,
      errorClass: resolvedError.name || "Error",
      errorDetail: resolvedError.message,
      fetchedAt: startedAt.toISOString(),
      implementation: options.implementation,
      metadata: {},
      mode: options.mode,
      provider: options.selectedProvider,
      status: "failed" as const
    };
  }
}

function deriveRunStatus(attempts: FetchPipelineAttempt[]) {
  const failureCount = attempts.filter((attempt) => attempt.status === "failed").length;
  if (failureCount === 0) {
    return "succeeded" as const;
  }

  return failureCount === attempts.length ? "failed" : "partial";
}

function buildProviderSummary(registry: ProviderRegistry, includeRenderedFetch: boolean) {
  const providers: string[] = [registry.staticFetch.name];
  if (includeRenderedFetch) {
    providers.push(registry.render.name);
  }

  return Array.from(new Set(providers)).join("+");
}

export async function runFetchPipeline(
  options: RunFetchPipelineOptions
): Promise<FetchPipelineResult> {
  const includeRenderedFetch = options.includeRenderedFetch ?? true;
  const run = await createRunLayout({
    artifactsRoot: options.artifactsRoot,
    metadata: {
      ...options.metadata,
      includeRenderedFetch
    },
    pageUrl: options.pageUrl,
    provider: buildProviderSummary(options.registry, includeRenderedFetch),
    repoRoot: options.repoRoot,
    runKind: "crawl",
    scope: options.scope ?? "crawl-fetch-render-pipeline",
    sourceId: options.sourceId,
    trigger: options.trigger ?? "manual"
  });

  const attempts: FetchPipelineAttempt[] = [];

  attempts.push(
    await runAttempt({
      bucket: "raw",
      execute: () =>
        options.registry.staticFetch.fetchPage({
          pageUrl: options.pageUrl,
          runId: run.runId,
          sourceId: options.sourceId,
          url: options.pageUrl
        }),
      implementation: options.registry.staticFetch.implementation,
      label: "static-fetch",
      mode: "static",
      pageUrl: options.pageUrl,
      run,
      selectedProvider: options.registry.staticFetch.name
    })
  );

  if (includeRenderedFetch) {
    attempts.push(
      await runAttempt({
        bucket: "rendered",
        execute: () =>
          options.registry.render.fetchRendered({
            pageUrl: options.pageUrl,
            runId: run.runId,
            sourceId: options.sourceId,
            url: options.pageUrl
          }),
        implementation: options.registry.render.implementation,
        label: "rendered-fetch",
        mode: "rendered",
        pageUrl: options.pageUrl,
        run,
        selectedProvider: options.registry.render.name
      })
    );
  }

  const diagnosticsArtifact = await writeJsonArtifact(run, {
    bucket: "diagnostics",
    content: {
      attempts,
      pageUrl: options.pageUrl,
      providerResolution: {
        render: options.registry.resolution.render,
        staticFetch: options.registry.resolution.staticFetch
      },
      sourceId: options.sourceId ?? null
    },
    extension: "json",
    label: "fetch-pipeline-report",
    mediaType: "application/json",
    pageUrl: options.pageUrl
  });

  const failedAttempts = attempts.filter((attempt) => attempt.status === "failed");
  updateRunLedger(run, {
    completedAt: new Date(),
    errorClass:
      failedAttempts.length > 0 ? `${failedAttempts[0]?.mode ?? "fetch"}-fetch-failure` : undefined,
    errorDetail:
      failedAttempts.length > 0
        ? failedAttempts
            .map((attempt) => `${attempt.mode}: ${attempt.errorDetail ?? "unknown error"}`)
            .join("; ")
        : undefined,
    metadata: {
      attempts,
      diagnosticsPath: diagnosticsArtifact.relativePath
    },
    status: deriveRunStatus(attempts)
  });
  await writeRunManifest(run);

  if (options.persistToDatabase) {
    await persistRunLedger(run);
  }

  return {
    attempts,
    diagnosticsPath: diagnosticsArtifact.relativePath,
    run
  };
}
