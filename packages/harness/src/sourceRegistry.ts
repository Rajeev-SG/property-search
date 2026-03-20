import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";
import { findRepoRoot } from "./repoRoot.js";

const DEFAULT_DATABASE_URL = "postgres://postgres:postgres@localhost:5432/property_search";

const DEFAULT_SEED_PATH = "data/seeds/estate-agents.csv";

export type RawSourceSeedRow = Record<string, string>;

export type SourceSeedCsvRow = {
  rowNumber: number;
  row: RawSourceSeedRow;
};

export type SourceRegistryRecord = {
  sourceId: string;
  rawRowHash: string;
  brandName: string;
  branchName: string | null;
  agentType: string | null;
  websiteDomain: string;
  homepageUrl: string;
  startUrl: string;
  normalizedArea: string | null;
  countryCode: string | null;
  enabled: boolean;
  validationStatus: string;
  provenanceSummary: Record<string, unknown>;
  rawInputPath: string;
  rawRowNumber: number;
  rawPayload: Record<string, string>;
  ingestNotes: string | null;
};

export type SourceRegistrySkipReason =
  | "missing_brand_name"
  | "missing_site_url"
  | "invalid_site_url"
  | "missing_website_domain";

export type SkippedSourceSeedRow = {
  rowNumber: number;
  reason: SourceRegistrySkipReason;
  message: string;
  row: RawSourceSeedRow;
};

export type SourceRegistryImportPlan = {
  seedPath: string;
  importedAt: string;
  totalRows: number;
  records: SourceRegistryRecord[];
  skippedRows: SkippedSourceSeedRow[];
};

export type SourceRegistryImportResult = SourceRegistryImportPlan & {
  insertedCount: number;
  updatedCount: number;
  reportPath: string;
};

type PersistedSourceRow = {
  source_id: string;
  inserted: boolean;
};

type ResolvedSourceUrls =
  | {
      homepageUrl: string;
      startUrl: string;
      websiteDomain: string;
    }
  | {
      error: {
        reason: SourceRegistrySkipReason;
        message: string;
      };
    };

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function normalizeText(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeUrl(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  if (trimmed.length === 0) return null;

  try {
    const url = new URL(trimmed);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return url;
  } catch {
    return null;
  }
}

function splitPipeSeparated(value: string | undefined) {
  const trimmed = value?.trim() ?? "";
  if (trimmed.length === 0) return [];

  return trimmed
    .split("|")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function parseCsvLine(line: string) {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];

    if (character === "\"") {
      if (inQuotes && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      fields.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  fields.push(current);
  return fields;
}

function parseCsv(content: string) {
  const rows: string[][] = [];
  let currentLine = "";
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];

    if (character === "\"") {
      if (inQuotes && content[index + 1] === "\"") {
        currentLine += "\"\"";
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      currentLine += character;
      continue;
    }

    if (character === "\n" && !inQuotes) {
      rows.push(parseCsvLine(currentLine.replace(/\r$/, "")));
      currentLine = "";
      continue;
    }

    currentLine += character;
  }

  if (currentLine.length > 0) {
    rows.push(parseCsvLine(currentLine.replace(/\r$/, "")));
  }

  return rows;
}

function resolveSeedPath(seedPath: string | undefined, startDir: string | undefined) {
  const repoRoot = findRepoRoot(startDir);
  const relativeSeedPath = seedPath ?? DEFAULT_SEED_PATH;

  return {
    repoRoot,
    relativeSeedPath,
    absoluteSeedPath: path.isAbsolute(relativeSeedPath)
      ? relativeSeedPath
      : path.join(repoRoot, relativeSeedPath)
  };
}

function resolveReportPath(importedAt: string, startDir: string | undefined) {
  const repoRoot = findRepoRoot(startDir);
  const date = new Date(importedAt);
  const year = String(date.getUTCFullYear());
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const filename = `${importedAt.replaceAll(":", "-")}.json`;

  return {
    repoRoot,
    absoluteReportPath: path.join(
      repoRoot,
      "artifacts/source-registry/ingests",
      year,
      month,
      day,
      filename
    )
  };
}

function resolveSourceId(record: Omit<SourceRegistryRecord, "sourceId">) {
  const identity = [
    record.websiteDomain,
    record.startUrl,
    record.brandName,
    record.branchName ?? "",
    record.rawInputPath,
    String(record.rawRowNumber)
  ].join("|");

  return `src_${sha256(identity).slice(0, 16)}`;
}

function resolveSourceUrls(row: RawSourceSeedRow): ResolvedSourceUrls {
  const websiteUrl = normalizeUrl(row.website_url);
  const canonicalUrl = normalizeUrl(row.canonical_url);
  const preferredStartUrl = websiteUrl ?? canonicalUrl;
  const preferredHomepageUrl = canonicalUrl ?? websiteUrl;

  if (!preferredStartUrl || !preferredHomepageUrl) {
    return {
      error: {
        reason: "missing_site_url" as const,
        message: "Row does not contain a resolvable website_url or canonical_url"
      }
    };
  }

  const derivedDomain = normalizeText(row.website_domain) ?? preferredHomepageUrl.hostname;
  if (!derivedDomain) {
    return {
      error: {
        reason: "missing_website_domain" as const,
        message: "Row does not contain a resolvable website domain"
      }
    };
  }

  const homepageUrl = new URL(preferredHomepageUrl.toString());
  homepageUrl.pathname = "/";
  homepageUrl.search = "";
  homepageUrl.hash = "";

  return {
    homepageUrl: homepageUrl.toString(),
    startUrl: preferredStartUrl.toString(),
    websiteDomain: derivedDomain.toLowerCase()
  };
}

export function readSourceSeedCsv(options: {
  seedPath?: string;
  startDir?: string;
} = {}): SourceSeedCsvRow[] {
  const { absoluteSeedPath } = resolveSeedPath(options.seedPath, options.startDir);
  const content = fs.readFileSync(absoluteSeedPath, "utf8").replace(/^\uFEFF/, "");
  const parsedRows = parseCsv(content);
  const [header, ...rows] = parsedRows;

  if (!header || header.length === 0) {
    throw new Error(`Seed CSV is empty: ${absoluteSeedPath}`);
  }

  return rows
    .filter((columns) => columns.some((value) => value.trim().length > 0))
    .map((columns, index) => {
      const row: RawSourceSeedRow = {};

      for (let columnIndex = 0; columnIndex < header.length; columnIndex += 1) {
        row[header[columnIndex] ?? `column_${columnIndex + 1}`] = columns[columnIndex] ?? "";
      }

      return {
        rowNumber: index + 2,
        row
      };
    });
}

export function planSourceRegistryImport(options: {
  seedPath?: string;
  startDir?: string;
} = {}): SourceRegistryImportPlan {
  const { relativeSeedPath } = resolveSeedPath(options.seedPath, options.startDir);
  const rows = readSourceSeedCsv(options);
  const importedAt = new Date().toISOString();
  const records: SourceRegistryRecord[] = [];
  const skippedRows: SkippedSourceSeedRow[] = [];

  for (const csvRow of rows) {
    const brandName = normalizeText(csvRow.row.agent_name);
    if (!brandName) {
      skippedRows.push({
        rowNumber: csvRow.rowNumber,
        reason: "missing_brand_name",
        message: "Row does not contain agent_name",
        row: csvRow.row
      });
      continue;
    }

    const resolvedUrls = resolveSourceUrls(csvRow.row);
    if ("error" in resolvedUrls) {
      skippedRows.push({
        rowNumber: csvRow.rowNumber,
        reason: resolvedUrls.error.reason,
        message: resolvedUrls.error.message,
        row: csvRow.row
      });
      continue;
    }

    const rawRowHash = sha256(JSON.stringify(csvRow.row));
    const recordWithoutId: Omit<SourceRegistryRecord, "sourceId"> = {
      rawRowHash,
      brandName,
      branchName: normalizeText(csvRow.row.branch_name),
      agentType: normalizeText(csvRow.row.agent_type),
      websiteDomain: resolvedUrls.websiteDomain,
      homepageUrl: resolvedUrls.homepageUrl,
      startUrl: resolvedUrls.startUrl,
      normalizedArea: normalizeText(csvRow.row.normalized_area),
      countryCode: normalizeText(csvRow.row.country_code),
      enabled: true,
      validationStatus: normalizeText(csvRow.row.validation_status) ?? "unknown",
      provenanceSummary: {
        seed: {
          inputQuery: normalizeText(csvRow.row.input_query),
          inputType: normalizeText(csvRow.row.input_type),
          firstSeenSource: normalizeText(csvRow.row.first_seen_source),
          sourceNames: splitPipeSeparated(csvRow.row.source_names),
          sourceIds: splitPipeSeparated(csvRow.row.source_ids),
          portalProfileUrls: splitPipeSeparated(csvRow.row.portal_profile_urls),
          evidenceCount: Number.parseInt(csvRow.row.evidence_count ?? "", 10) || 0,
          matchConfidence: normalizeText(csvRow.row.match_confidence),
          googlePlaceId: normalizeText(csvRow.row.google_place_id),
          osmType: normalizeText(csvRow.row.osm_type),
          osmId: normalizeText(csvRow.row.osm_id)
        },
        derivation: {
          homepageUrl: "canonical_url origin when present, else website_url origin",
          startUrl: "website_url when present, else canonical_url",
          websiteDomain: normalizeText(csvRow.row.website_domain)
            ? "website_domain"
            : "derived from resolved URL hostname"
        }
      },
      rawInputPath: relativeSeedPath,
      rawRowNumber: csvRow.rowNumber,
      rawPayload: csvRow.row,
      ingestNotes: normalizeText(csvRow.row.notes)
    };

    records.push({
      sourceId: resolveSourceId(recordWithoutId),
      ...recordWithoutId
    });
  }

  return {
    seedPath: relativeSeedPath,
    importedAt,
    totalRows: rows.length,
    records,
    skippedRows
  };
}

function createClient(databaseUrl?: string) {
  return new Client({
    connectionString: databaseUrl ?? process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL
  });
}

async function upsertSourceRegistryRecord(client: Client, record: SourceRegistryRecord) {
  const result = await client.query<PersistedSourceRow>(
    `
      INSERT INTO source_registry (
        source_id,
        raw_row_hash,
        brand_name,
        branch_name,
        agent_type,
        website_domain,
        homepage_url,
        start_url,
        normalized_area,
        country_code,
        enabled,
        validation_status,
        provenance_summary,
        raw_input_path,
        raw_row_number,
        raw_payload,
        ingest_notes
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14, $15, $16::jsonb, $17
      )
      ON CONFLICT (raw_input_path, raw_row_number) DO UPDATE
      SET
        raw_row_hash = EXCLUDED.raw_row_hash,
        brand_name = EXCLUDED.brand_name,
        branch_name = EXCLUDED.branch_name,
        agent_type = EXCLUDED.agent_type,
        website_domain = EXCLUDED.website_domain,
        homepage_url = EXCLUDED.homepage_url,
        start_url = EXCLUDED.start_url,
        normalized_area = EXCLUDED.normalized_area,
        country_code = EXCLUDED.country_code,
        enabled = EXCLUDED.enabled,
        validation_status = EXCLUDED.validation_status,
        provenance_summary = EXCLUDED.provenance_summary,
        raw_payload = EXCLUDED.raw_payload,
        ingest_notes = EXCLUDED.ingest_notes,
        updated_at = timezone('utc', now())
      RETURNING source_id, (xmax = 0) AS inserted
    `,
    [
      record.sourceId,
      record.rawRowHash,
      record.brandName,
      record.branchName,
      record.agentType,
      record.websiteDomain,
      record.homepageUrl,
      record.startUrl,
      record.normalizedArea,
      record.countryCode,
      record.enabled,
      record.validationStatus,
      JSON.stringify(record.provenanceSummary),
      record.rawInputPath,
      record.rawRowNumber,
      JSON.stringify(record.rawPayload),
      record.ingestNotes
    ]
  );

  return result.rows[0];
}

export async function importSourceRegistry(options: {
  seedPath?: string;
  startDir?: string;
  databaseUrl?: string;
  dryRun?: boolean;
  log?: (message: string) => void;
} = {}): Promise<SourceRegistryImportResult> {
  const plan = planSourceRegistryImport(options);
  const { repoRoot, absoluteReportPath } = resolveReportPath(plan.importedAt, options.startDir);
  const log = options.log ?? console.log;
  const logSummary = (insertedCount: number, updatedCount: number) => {
    log(`seed path: ${plan.seedPath}`);
    log(`rows read: ${plan.totalRows}`);
    log(`records imported: ${plan.records.length}`);
    log(`rows skipped: ${plan.skippedRows.length}`);
    log(`inserted: ${insertedCount}`);
    log(`updated: ${updatedCount}`);
    log(`report: ${path.relative(repoRoot, absoluteReportPath)}`);

    if (plan.skippedRows.length > 0) {
      for (const skippedRow of plan.skippedRows.slice(0, 10)) {
        log(
          `skip row ${skippedRow.rowNumber}: ${skippedRow.reason} (${skippedRow.row.agent_name || "unknown"})`
        );
      }

      if (plan.skippedRows.length > 10) {
        log(`skip rows truncated: ${plan.skippedRows.length - 10} more`);
      }
    }
  };

  const persistReport = (insertedCount: number, updatedCount: number) => {
    fs.mkdirSync(path.dirname(absoluteReportPath), { recursive: true });
    fs.writeFileSync(
      absoluteReportPath,
      JSON.stringify(
        {
          ...plan,
          insertedCount,
          updatedCount,
          reportPath: path.relative(repoRoot, absoluteReportPath)
        },
        null,
        2
      ),
      "utf8"
    );
  };

  if (options.dryRun) {
    persistReport(0, 0);
    logSummary(0, 0);
    return {
      ...plan,
      insertedCount: 0,
      updatedCount: 0,
      reportPath: path.relative(repoRoot, absoluteReportPath)
    };
  }

  const client = createClient(options.databaseUrl);
  await client.connect();

  let insertedCount = 0;
  let updatedCount = 0;

  try {
    await client.query("BEGIN");

    for (const record of plan.records) {
      const persisted = await upsertSourceRegistryRecord(client, record);

      if (persisted?.inserted) insertedCount += 1;
      else updatedCount += 1;
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }

  persistReport(insertedCount, updatedCount);
  logSummary(insertedCount, updatedCount);

  return {
    ...plan,
    insertedCount,
    updatedCount,
    reportPath: path.relative(repoRoot, absoluteReportPath)
  };
}
