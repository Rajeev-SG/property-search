import fs from "node:fs";
import path from "node:path";
import { Client } from "pg";
import { findRepoRoot } from "./repoRoot.js";

const MIGRATION_FILE_PATTERN = /^\d{3}_.+\.sql$/;
const DEFAULT_DATABASE_URL = "postgres://postgres:postgres@localhost:5432/property_search";
const MIGRATION_LOCK_KEY = 4004;

export const expectedCoreTables = [
  "source_registry",
  "site_profiles",
  "ingestion_runs",
  "raw_page_artifacts",
  "extracted_listings",
  "canonical_properties",
  "listing_property_links"
] as const;

export type ExpectedCoreTable = (typeof expectedCoreTables)[number];

export type MigrationFile = {
  id: string;
  filename: string;
  fullPath: string;
  sql: string;
};

export type MigrationStatus = {
  databaseUrl: string;
  pendingMigrations: string[];
  appliedMigrations: string[];
  existingTables: string[];
  missingCoreTables: string[];
};

function resolveDatabaseUrl(databaseUrl?: string) {
  return databaseUrl ?? process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
}

function createClient(databaseUrl?: string) {
  return new Client({
    connectionString: resolveDatabaseUrl(databaseUrl)
  });
}

async function ensureSchemaMigrationsTable(client: Client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id text PRIMARY KEY,
      filename text NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT timezone('utc', now())
    )
  `);
}

async function withMigrationLock<T>(client: Client, work: () => Promise<T>) {
  await client.query("SELECT pg_advisory_lock($1)", [MIGRATION_LOCK_KEY]);

  try {
    return await work();
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [MIGRATION_LOCK_KEY]);
  }
}

async function loadAppliedMigrationIds(client: Client) {
  const result = await client.query<{ id: string }>(
    "SELECT id FROM schema_migrations ORDER BY id ASC"
  );

  return new Set(result.rows.map((row) => row.id));
}

async function loadExistingTables(client: Client) {
  const result = await client.query<{ tablename: string }>(`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename ASC
  `);

  return result.rows.map((row) => row.tablename);
}

export function listSqlMigrations(startDir: string = process.cwd()): MigrationFile[] {
  const repoRoot = findRepoRoot(startDir);
  const migrationsDir = path.join(repoRoot, "db/migrations");
  const filenames = fs
    .readdirSync(migrationsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && MIGRATION_FILE_PATTERN.test(entry.name))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  return filenames.map((filename) => {
    const fullPath = path.join(migrationsDir, filename);

    return {
      id: filename.replace(/\.sql$/, ""),
      filename,
      fullPath,
      sql: fs.readFileSync(fullPath, "utf8")
    };
  });
}

export async function applyMigrations(options: {
  startDir?: string;
  databaseUrl?: string;
  log?: (message: string) => void;
} = {}) {
  const databaseUrl = resolveDatabaseUrl(options.databaseUrl);
  const log = options.log ?? console.log;
  const migrations = listSqlMigrations(options.startDir);
  const client = createClient(databaseUrl);

  await client.connect();

  try {
    await withMigrationLock(client, async () => {
      await ensureSchemaMigrationsTable(client);
      const appliedMigrationIds = await loadAppliedMigrationIds(client);

      for (const migration of migrations) {
        if (appliedMigrationIds.has(migration.id)) {
          log(`skip ${migration.filename}`);
          continue;
        }

        log(`apply ${migration.filename}`);

        try {
          await client.query("BEGIN");
          await client.query(migration.sql);
          await client.query(
            "INSERT INTO schema_migrations (id, filename) VALUES ($1, $2)",
            [migration.id, migration.filename]
          );
          await client.query("COMMIT");
        } catch (error) {
          await client.query("ROLLBACK");
          throw new Error(
            `Failed to apply ${migration.filename}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
      }
    });
  } finally {
    await client.end();
  }
}

export async function getMigrationStatus(options: {
  startDir?: string;
  databaseUrl?: string;
} = {}): Promise<MigrationStatus> {
  const databaseUrl = resolveDatabaseUrl(options.databaseUrl);
  const client = createClient(databaseUrl);
  const migrations = listSqlMigrations(options.startDir);

  await client.connect();

  try {
    return await withMigrationLock(client, async () => {
      await ensureSchemaMigrationsTable(client);
      const appliedMigrationIds = await loadAppliedMigrationIds(client);
      const existingTables = await loadExistingTables(client);

      return {
        databaseUrl,
        appliedMigrations: migrations
          .filter((migration) => appliedMigrationIds.has(migration.id))
          .map((migration) => migration.filename),
        pendingMigrations: migrations
          .filter((migration) => !appliedMigrationIds.has(migration.id))
          .map((migration) => migration.filename),
        existingTables,
        missingCoreTables: expectedCoreTables.filter(
          (tableName) => !existingTables.includes(tableName)
        )
      };
    });
  } finally {
    await client.end();
  }
}

export async function printMigrationStatus(options: {
  startDir?: string;
  databaseUrl?: string;
  log?: (message: string) => void;
} = {}) {
  const log = options.log ?? console.log;
  const status = await getMigrationStatus(options);
  const presentCoreTables = status.existingTables.filter((tableName) =>
    expectedCoreTables.includes(tableName as ExpectedCoreTable)
  );

  log(`database: ${status.databaseUrl}`);
  log(`applied migrations: ${status.appliedMigrations.length}`);
  for (const filename of status.appliedMigrations) {
    log(`  - ${filename}`);
  }

  log(`pending migrations: ${status.pendingMigrations.length}`);
  for (const filename of status.pendingMigrations) {
    log(`  - ${filename}`);
  }

  log(`core tables present: ${presentCoreTables.length}/${expectedCoreTables.length}`);
  if (status.missingCoreTables.length === 0) {
    log("missing core tables: none");
  } else {
    log(`missing core tables: ${status.missingCoreTables.join(", ")}`);
  }
}

export async function verifyDatabaseSchema(options: {
  startDir?: string;
  databaseUrl?: string;
  log?: (message: string) => void;
} = {}) {
  const log = options.log ?? console.log;
  const status = await getMigrationStatus(options);

  if (status.pendingMigrations.length > 0) {
    throw new Error(
      `Database has pending migrations: ${status.pendingMigrations.join(", ")}`
    );
  }

  if (status.missingCoreTables.length > 0) {
    throw new Error(
      `Database is missing core tables: ${status.missingCoreTables.join(", ")}`
    );
  }

  log(`verified ${expectedCoreTables.length} core tables`);
}
