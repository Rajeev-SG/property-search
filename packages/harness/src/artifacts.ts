import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import { findRepoRoot } from "./repoRoot.js";

const DEFAULT_DATABASE_URL = "postgres://postgres:postgres@localhost:5432/property_search";

export const artifactBuckets = [
  "raw",
  "rendered",
  "extracted",
  "screenshots",
  "diagnostics"
] as const;

export const runStatuses = ["running", "succeeded", "failed", "partial"] as const;

export type ArtifactBucket = (typeof artifactBuckets)[number];
export type RunStatus = (typeof runStatuses)[number];

export type ArtifactRecord = {
  artifactId: string;
  bucket: ArtifactBucket;
  filename: string;
  absolutePath: string;
  relativePath: string;
  mediaType: string;
  pageUrl?: string;
  label?: string;
  metadata: Record<string, unknown>;
};

export type RunLedgerRecord = {
  runId: string;
  runKind: string;
  scope: string;
  trigger: string;
  status: RunStatus;
  provider?: string;
  sourceId?: string;
  profileId?: string;
  pageUrl?: string;
  startedAt: string;
  completedAt?: string;
  artifactRoot: string;
  artifactRootAbsolutePath: string;
  runPath: string;
  runAbsolutePath: string;
  summaryPath: string;
  summaryAbsolutePath: string;
  artifactPaths: Record<ArtifactBucket, string>;
  artifactAbsolutePaths: Record<ArtifactBucket, string>;
  artifacts: ArtifactRecord[];
  errorClass?: string;
  errorDetail?: string;
  metadata: Record<string, unknown>;
};

export type CreateRunLedgerOptions = {
  repoRoot?: string;
  artifactsRoot?: string;
  runId?: string;
  runKind: string;
  scope: string;
  trigger?: string;
  status?: RunStatus;
  provider?: string;
  sourceId?: string;
  profileId?: string;
  pageUrl?: string;
  startedAt?: Date | string;
  completedAt?: Date | string;
  errorClass?: string;
  errorDetail?: string;
  metadata?: Record<string, unknown>;
};

export type ReserveArtifactPathOptions = {
  bucket: ArtifactBucket;
  extension: string;
  mediaType: string;
  pageUrl?: string;
  label?: string;
  sequence?: number;
  metadata?: Record<string, unknown>;
};

export type UpdateRunLedgerOptions = {
  status?: RunStatus;
  completedAt?: Date | string;
  errorClass?: string;
  errorDetail?: string;
  metadata?: Record<string, unknown>;
};

export type PersistRunLedgerOptions = {
  databaseUrl?: string;
};

export type ArtifactSmokeOptions = {
  repoRoot?: string;
  artifactsRoot?: string;
  persistToDatabase?: boolean;
  log?: (message: string) => void;
};

type UpsertRunLedgerStatement = {
  text: string;
  values: unknown[];
};

function toPosixPath(value: string) {
  return value.replaceAll(path.sep, "/");
}

function ensureObject(value: Record<string, unknown> | undefined) {
  return value ?? {};
}

function normalizeTimestamp(value: Date | string | undefined, fallback: Date = new Date()) {
  const resolvedValue = value ?? fallback;
  const date = resolvedValue instanceof Date ? resolvedValue : new Date(resolvedValue);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${String(resolvedValue)}`);
  }

  return date.toISOString();
}

function compactTimestamp(isoTimestamp: string) {
  return isoTimestamp.replaceAll("-", "").replaceAll(":", "").replace(".000", "").slice(0, 15) + "Z";
}

export function sanitizeArtifactSegment(value: string, maxLength: number = 48) {
  const lowercaseValue = value.toLowerCase();
  let sanitized = "";
  let previousWasDash = false;

  for (const character of lowercaseValue) {
    const isLowercaseLetter = character >= "a" && character <= "z";
    const isDigit = character >= "0" && character <= "9";

    if (isLowercaseLetter || isDigit) {
      sanitized += character;
      previousWasDash = false;
      continue;
    }

    if (!previousWasDash && sanitized.length > 0) {
      sanitized += "-";
      previousWasDash = true;
    }
  }

  while (sanitized.endsWith("-")) {
    sanitized = sanitized.slice(0, -1);
  }

  if (sanitized.length === 0) {
    return "item";
  }

  const truncated = sanitized.slice(0, maxLength);
  return truncated.endsWith("-") ? truncated.slice(0, -1) || "item" : truncated;
}

function createArtifactHash(parts: Array<string | undefined>) {
  return createHash("sha256")
    .update(parts.filter((part): part is string => Boolean(part)).join("::"))
    .digest("hex")
    .slice(0, 12);
}

function createArtifactSlug(pageUrl?: string, label?: string) {
  if (label) {
    return sanitizeArtifactSegment(label);
  }

  if (!pageUrl) {
    return "artifact";
  }

  try {
    const url = new URL(pageUrl);
    const host = sanitizeArtifactSegment(url.hostname.replaceAll(".", "-"), 32);
    const pathname = sanitizeArtifactSegment(url.pathname.replaceAll("/", "-"), 48);
    return [host, pathname].filter(Boolean).join("-") || host || "artifact";
  } catch {
    return sanitizeArtifactSegment(pageUrl, 48);
  }
}

function resolveRepoRoot(options: CreateRunLedgerOptions) {
  if (options.repoRoot) {
    return path.resolve(options.repoRoot);
  }

  if (options.artifactsRoot) {
    return path.resolve(options.artifactsRoot, "..");
  }

  return findRepoRoot(process.cwd());
}

function resolveArtifactsRoot(options: CreateRunLedgerOptions, repoRoot: string) {
  return options.artifactsRoot
    ? path.resolve(options.artifactsRoot)
    : path.join(repoRoot, "artifacts");
}

function toArtifactRelativePath(repoRoot: string, absolutePath: string) {
  const relativePath = path.relative(repoRoot, absolutePath);
  return relativePath.startsWith("..") ? toPosixPath(absolutePath) : toPosixPath(relativePath);
}

export function createRunId(options: Pick<CreateRunLedgerOptions, "runKind" | "scope" | "provider" | "sourceId" | "pageUrl" | "startedAt">) {
  const startedAt = normalizeTimestamp(options.startedAt);
  const stamp = compactTimestamp(startedAt);
  const slug = sanitizeArtifactSegment(
    options.scope || options.sourceId || options.provider || options.pageUrl || options.runKind
  );
  const digest = createArtifactHash([
    options.runKind,
    options.scope,
    options.provider,
    options.sourceId,
    options.pageUrl,
    startedAt
  ]);

  return `${stamp}-${slug}-${digest}`;
}

export function createRunLedger(options: CreateRunLedgerOptions): RunLedgerRecord {
  const repoRoot = resolveRepoRoot(options);
  const artifactsRootAbsolutePath = resolveArtifactsRoot(options, repoRoot);
  const startedAt = normalizeTimestamp(options.startedAt);
  const runId = options.runId ?? createRunId(options);
  const runDate = startedAt.slice(0, 10).split("-");
  const runAbsolutePath = path.join(
    artifactsRootAbsolutePath,
    "runs",
    runDate[0] ?? "unknown",
    runDate[1] ?? "unknown",
    runDate[2] ?? "unknown",
    runId
  );
  const summaryAbsolutePath = path.join(runAbsolutePath, "run.json");
  const artifactAbsolutePaths = {
    raw: path.join(runAbsolutePath, "raw"),
    rendered: path.join(runAbsolutePath, "rendered"),
    extracted: path.join(runAbsolutePath, "extracted"),
    screenshots: path.join(runAbsolutePath, "screenshots"),
    diagnostics: path.join(runAbsolutePath, "diagnostics")
  } satisfies Record<ArtifactBucket, string>;

  return {
    runId,
    runKind: options.runKind,
    scope: options.scope,
    trigger: options.trigger ?? "manual",
    status: options.status ?? "running",
    provider: options.provider,
    sourceId: options.sourceId,
    profileId: options.profileId,
    pageUrl: options.pageUrl,
    startedAt,
    completedAt: options.completedAt ? normalizeTimestamp(options.completedAt) : undefined,
    artifactRoot: toArtifactRelativePath(repoRoot, artifactsRootAbsolutePath),
    artifactRootAbsolutePath: toPosixPath(artifactsRootAbsolutePath),
    runPath: toArtifactRelativePath(repoRoot, runAbsolutePath),
    runAbsolutePath: toPosixPath(runAbsolutePath),
    summaryPath: toArtifactRelativePath(repoRoot, summaryAbsolutePath),
    summaryAbsolutePath: toPosixPath(summaryAbsolutePath),
    artifactPaths: {
      raw: toArtifactRelativePath(repoRoot, artifactAbsolutePaths.raw),
      rendered: toArtifactRelativePath(repoRoot, artifactAbsolutePaths.rendered),
      extracted: toArtifactRelativePath(repoRoot, artifactAbsolutePaths.extracted),
      screenshots: toArtifactRelativePath(repoRoot, artifactAbsolutePaths.screenshots),
      diagnostics: toArtifactRelativePath(repoRoot, artifactAbsolutePaths.diagnostics)
    },
    artifactAbsolutePaths: {
      raw: toPosixPath(artifactAbsolutePaths.raw),
      rendered: toPosixPath(artifactAbsolutePaths.rendered),
      extracted: toPosixPath(artifactAbsolutePaths.extracted),
      screenshots: toPosixPath(artifactAbsolutePaths.screenshots),
      diagnostics: toPosixPath(artifactAbsolutePaths.diagnostics)
    },
    artifacts: [],
    errorClass: options.errorClass,
    errorDetail: options.errorDetail,
    metadata: ensureObject(options.metadata)
  };
}

function serializeRunLedger(run: RunLedgerRecord) {
  return {
    runId: run.runId,
    runKind: run.runKind,
    scope: run.scope,
    trigger: run.trigger,
    status: run.status,
    provider: run.provider,
    sourceId: run.sourceId,
    profileId: run.profileId,
    pageUrl: run.pageUrl,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    artifactRoot: run.artifactRoot,
    runPath: run.runPath,
    summaryPath: run.summaryPath,
    artifactPaths: run.artifactPaths,
    artifacts: run.artifacts.map((artifact) => ({
      artifactId: artifact.artifactId,
      bucket: artifact.bucket,
      filename: artifact.filename,
      relativePath: artifact.relativePath,
      mediaType: artifact.mediaType,
      pageUrl: artifact.pageUrl,
      label: artifact.label,
      metadata: artifact.metadata
    })),
    errorClass: run.errorClass,
    errorDetail: run.errorDetail,
    metadata: run.metadata
  };
}

export async function ensureRunDirectories(run: RunLedgerRecord) {
  await fs.mkdir(run.runAbsolutePath, { recursive: true });

  await Promise.all(
    artifactBuckets.map((bucket) =>
      fs.mkdir(run.artifactAbsolutePaths[bucket], { recursive: true })
    )
  );
}

export async function writeRunManifest(run: RunLedgerRecord) {
  await ensureRunDirectories(run);
  await fs.writeFile(run.summaryAbsolutePath, `${JSON.stringify(serializeRunLedger(run), null, 2)}\n`);
}

export function reserveArtifactPath(
  run: RunLedgerRecord,
  options: ReserveArtifactPathOptions
): ArtifactRecord {
  const extension = options.extension.replace(/^\./, "");
  const slug = createArtifactSlug(options.pageUrl, options.label);
  const sequenceSuffix =
    options.sequence && options.sequence > 0 ? `-${String(options.sequence).padStart(3, "0")}` : "";
  const artifactId = createArtifactHash([
    run.runId,
    options.bucket,
    options.pageUrl,
    options.label,
    options.mediaType,
    String(options.sequence ?? 0)
  ]);
  const filename = `${slug}${sequenceSuffix}__${artifactId}.${extension}`;
  const absolutePath = path.join(run.artifactAbsolutePaths[options.bucket], filename);
  const relativePath = `${run.artifactPaths[options.bucket]}/${filename}`;
  const artifact: ArtifactRecord = {
    artifactId,
    bucket: options.bucket,
    filename,
    absolutePath: toPosixPath(absolutePath),
    relativePath,
    mediaType: options.mediaType,
    pageUrl: options.pageUrl,
    label: options.label,
    metadata: ensureObject(options.metadata)
  };

  run.artifacts.push(artifact);
  return artifact;
}

export async function writeTextArtifact(
  run: RunLedgerRecord,
  options: ReserveArtifactPathOptions & { content: string }
) {
  const artifact = reserveArtifactPath(run, options);
  await fs.mkdir(path.dirname(artifact.absolutePath), { recursive: true });
  await fs.writeFile(artifact.absolutePath, options.content);
  return artifact;
}

export async function writeJsonArtifact(
  run: RunLedgerRecord,
  options: ReserveArtifactPathOptions & { content: unknown }
) {
  const artifact = reserveArtifactPath(run, options);
  await fs.mkdir(path.dirname(artifact.absolutePath), { recursive: true });
  await fs.writeFile(artifact.absolutePath, `${JSON.stringify(options.content, null, 2)}\n`);
  return artifact;
}

export function updateRunLedger(run: RunLedgerRecord, options: UpdateRunLedgerOptions) {
  if (options.status) {
    run.status = options.status;
  }

  if (options.completedAt) {
    run.completedAt = normalizeTimestamp(options.completedAt);
  }

  if (options.errorClass !== undefined) {
    run.errorClass = options.errorClass;
  }

  if (options.errorDetail !== undefined) {
    run.errorDetail = options.errorDetail;
  }

  if (options.metadata) {
    run.metadata = {
      ...run.metadata,
      ...options.metadata
    };
  }

  return run;
}

export function buildRunLedgerUpsert(run: RunLedgerRecord): UpsertRunLedgerStatement {
  return {
    text: `
      INSERT INTO ingestion_runs (
        run_id,
        source_id,
        profile_id,
        run_kind,
        scope,
        trigger,
        status,
        provider,
        page_url,
        started_at,
        completed_at,
        artifact_root,
        run_path,
        summary_path,
        artifact_paths,
        artifacts,
        error_class,
        error_detail,
        metadata,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15::jsonb, $16::jsonb, $17, $18, $19::jsonb,
        timezone('utc', now())
      )
      ON CONFLICT (run_id) DO UPDATE
      SET source_id = EXCLUDED.source_id,
          profile_id = EXCLUDED.profile_id,
          run_kind = EXCLUDED.run_kind,
          scope = EXCLUDED.scope,
          trigger = EXCLUDED.trigger,
          status = EXCLUDED.status,
          provider = EXCLUDED.provider,
          page_url = EXCLUDED.page_url,
          started_at = EXCLUDED.started_at,
          completed_at = EXCLUDED.completed_at,
          artifact_root = EXCLUDED.artifact_root,
          run_path = EXCLUDED.run_path,
          summary_path = EXCLUDED.summary_path,
          artifact_paths = EXCLUDED.artifact_paths,
          artifacts = EXCLUDED.artifacts,
          error_class = EXCLUDED.error_class,
          error_detail = EXCLUDED.error_detail,
          metadata = EXCLUDED.metadata,
          updated_at = timezone('utc', now())
    `,
    values: [
      run.runId,
      run.sourceId ?? null,
      run.profileId ?? null,
      run.runKind,
      run.scope,
      run.trigger,
      run.status,
      run.provider ?? null,
      run.pageUrl ?? null,
      run.startedAt,
      run.completedAt ?? null,
      run.artifactRoot,
      run.runPath,
      run.summaryPath,
      JSON.stringify(run.artifactPaths),
      JSON.stringify(
        run.artifacts.map((artifact) => ({
          artifactId: artifact.artifactId,
          bucket: artifact.bucket,
          filename: artifact.filename,
          relativePath: artifact.relativePath,
          mediaType: artifact.mediaType,
          pageUrl: artifact.pageUrl,
          label: artifact.label,
          metadata: artifact.metadata
        }))
      ),
      run.errorClass ?? null,
      run.errorDetail ?? null,
      JSON.stringify(run.metadata)
    ]
  };
}

export async function persistRunLedger(
  run: RunLedgerRecord,
  options: PersistRunLedgerOptions = {}
) {
  const client = new Client({
    connectionString: options.databaseUrl ?? process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL
  });
  const statement = buildRunLedgerUpsert(run);

  await client.connect();

  try {
    await client.query(statement.text, statement.values);
  } finally {
    await client.end();
  }
}

export async function createRunLayout(options: CreateRunLedgerOptions) {
  const run = createRunLedger(options);
  await writeRunManifest(run);
  return run;
}

export async function runArtifactStorageSmoke(options: ArtifactSmokeOptions = {}) {
  const log = options.log ?? console.log;
  const run = await createRunLayout({
    repoRoot: options.repoRoot,
    artifactsRoot: options.artifactsRoot,
    runKind: "smoke",
    scope: "artifact-storage-foundation",
    provider: "local-smoke",
    pageUrl: "https://example.com/listings/demo-home",
    metadata: {
      purpose: "artifact-storage-smoke"
    }
  });

  await writeTextArtifact(run, {
    bucket: "raw",
    extension: "html",
    mediaType: "text/html",
    pageUrl: run.pageUrl,
    label: "raw-source",
    content: "<html><body><h1>Demo home</h1></body></html>\n"
  });

  await writeTextArtifact(run, {
    bucket: "rendered",
    extension: "html",
    mediaType: "text/html",
    pageUrl: run.pageUrl,
    label: "rendered-source",
    content: "<html><body><main data-rendered=\"true\">Rendered demo home</main></body></html>\n"
  });

  await writeJsonArtifact(run, {
    bucket: "extracted",
    extension: "json",
    mediaType: "application/json",
    pageUrl: run.pageUrl,
    label: "extracted-listing",
    content: {
      listingId: "demo-home",
      address: "1 Demo Street, Example Town",
      bedrooms: 3
    }
  });

  await writeJsonArtifact(run, {
    bucket: "diagnostics",
    extension: "json",
    mediaType: "application/json",
    pageUrl: run.pageUrl,
    label: "diagnostic-metadata",
    content: {
      note: "Synthetic smoke artifact for ticket 005",
      provider: run.provider
    }
  });

  updateRunLedger(run, {
    status: "succeeded",
    completedAt: new Date(),
    metadata: {
      smokeArtifactsWritten: run.artifacts.length
    }
  });
  await writeRunManifest(run);

  if (options.persistToDatabase) {
    await persistRunLedger(run);
    log(`persisted ingestion run ${run.runId} to Postgres`);
  }

  log(`artifact smoke run created: ${run.runId}`);
  log(`manifest: ${run.summaryPath}`);
  return run;
}
