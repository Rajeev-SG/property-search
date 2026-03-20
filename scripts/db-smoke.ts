import { randomUUID } from "node:crypto";
import { Client } from "pg";
import { applyMigrations, verifyDatabaseSchema } from "@property-search/harness";

const DEFAULT_DATABASE_URL = "postgres://postgres:postgres@localhost:5432/property_search";

function resolveDatabaseUrl() {
  return process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
}

function withDatabaseName(connectionString: string, databaseName: string) {
  const url = new URL(connectionString);
  url.pathname = `/${databaseName}`;
  return url.toString();
}

function quoteIdentifier(identifier: string) {
  return `"${identifier.replaceAll("\"", "\"\"")}"`;
}

const baseDatabaseUrl = resolveDatabaseUrl();
const tempDatabaseName = `property_search_smoke_${randomUUID().replaceAll("-", "_")}`;
const adminUrl = withDatabaseName(baseDatabaseUrl, "postgres");
const smokeDatabaseUrl = withDatabaseName(baseDatabaseUrl, tempDatabaseName);
const adminClient = new Client({ connectionString: adminUrl });

await adminClient.connect();

try {
  await adminClient.query(`CREATE DATABASE ${quoteIdentifier(tempDatabaseName)}`);
} finally {
  await adminClient.end();
}

try {
  await applyMigrations({
    databaseUrl: smokeDatabaseUrl
  });
  await verifyDatabaseSchema({
    databaseUrl: smokeDatabaseUrl
  });
  console.log(`smoke database verified: ${tempDatabaseName}`);
} finally {
  const cleanupClient = new Client({ connectionString: adminUrl });
  await cleanupClient.connect();

  try {
    await cleanupClient.query(
      `SELECT pg_terminate_backend(pid)
       FROM pg_stat_activity
       WHERE datname = $1
         AND pid <> pg_backend_pid()`,
      [tempDatabaseName]
    );
    await cleanupClient.query(`DROP DATABASE IF EXISTS ${quoteIdentifier(tempDatabaseName)}`);
  } finally {
    await cleanupClient.end();
  }
}
