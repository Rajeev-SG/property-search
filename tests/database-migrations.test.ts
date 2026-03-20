import { describe, expect, it } from "vitest";
import { expectedCoreTables, listSqlMigrations } from "@property-search/harness";

describe("database migrations", () => {
  it("discovers deterministic SQL migration files in lexical order", () => {
    const migrations = listSqlMigrations();

    expect(migrations.map((migration) => migration.filename)).toEqual([
      "001_pipeline_baseline.sql"
    ]);
    expect(migrations[0]?.sql).toContain("CREATE TABLE IF NOT EXISTS source_registry");
  });

  it("tracks the core pipeline tables required by ticket 004", () => {
    expect(expectedCoreTables).toEqual([
      "source_registry",
      "site_profiles",
      "raw_page_artifacts",
      "extracted_listings",
      "canonical_properties",
      "listing_property_links"
    ]);
  });
});
