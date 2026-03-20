import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  importSourceRegistry,
  planSourceRegistryImport,
  readSourceSeedCsv
} from "@property-search/harness";

const tempDirectories: string[] = [];

async function createTempRepoRoot(seedCsvContents: string) {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "property-search-source-registry-"));
  tempDirectories.push(tempRoot);

  await Promise.all([
    fs.mkdir(path.join(tempRoot, "docs"), { recursive: true }),
    fs.mkdir(path.join(tempRoot, "data/seeds"), { recursive: true })
  ]);

  await Promise.all([
    fs.writeFile(path.join(tempRoot, "pnpm-workspace.yaml"), "packages:\n  - apps/*\n", "utf8"),
    fs.writeFile(path.join(tempRoot, "AGENTS.md"), "# temp repo\n", "utf8"),
    fs.writeFile(path.join(tempRoot, "docs/PROJECT_STATUS.md"), "# status\n", "utf8"),
    fs.writeFile(path.join(tempRoot, "data/seeds/estate-agents.csv"), seedCsvContents, "utf8")
  ]);

  return tempRoot;
}

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true })
    )
  );
});

describe("source registry ingestion", () => {
  it("reads the checked-in fixture CSV without losing quoted fields", () => {
    const rows = readSourceSeedCsv({
      seedPath: "data/fixtures/source-registry/estate-agents.sample.csv",
      startDir: process.cwd()
    });

    expect(rows).toHaveLength(4);
    expect(rows[0]?.row.normalized_area).toBe(
      "London Borough of Croydon, Greater London, England, United Kingdom"
    );
  });

  it("plans normalized source-registry rows and skips unresolved discovery-only rows", () => {
    const plan = planSourceRegistryImport({
      seedPath: "data/fixtures/source-registry/estate-agents.sample.csv",
      startDir: process.cwd()
    });

    expect(plan.totalRows).toBe(4);
    expect(plan.records).toHaveLength(3);
    expect(plan.skippedRows).toHaveLength(1);
    expect(plan.skippedRows[0]).toMatchObject({
      rowNumber: 4,
      reason: "missing_site_url"
    });

    expect(plan.records[0]).toMatchObject({
      brandName: "Example Estates",
      branchName: "Example Estates Croydon",
      websiteDomain: "www.example-estates.co.uk",
      homepageUrl: "https://www.example-estates.co.uk/",
      startUrl: "https://www.example-estates.co.uk/branches/croydon"
    });

    expect(plan.records[1]?.websiteDomain).toBe("www.example-estates.co.uk");
    expect(plan.records[1]?.sourceId).not.toBe(plan.records[0]?.sourceId);

    expect(plan.records[2]).toMatchObject({
      brandName: "Derived Domain Realty",
      websiteDomain: "derived-domain.example",
      homepageUrl: "https://derived-domain.example/",
      startUrl: "https://derived-domain.example/listings",
      validationStatus: "partial"
    });

    expect(plan.records[0]?.provenanceSummary).toMatchObject({
      seed: {
        sourceNames: ["rightmove", "manual"],
        sourceIds: ["rm-1", "manual-1"],
        portalProfileUrls: ["https://www.rightmove.co.uk/estate-agents/agent/example.html"],
        evidenceCount: 3
      }
    });
  });

  it("writes a dry-run ingest report with skipped-row traceability under artifacts", async () => {
    const fixturePath = path.join(
      process.cwd(),
      "data/fixtures/source-registry/estate-agents.sample.csv"
    );
    const seedCsvContents = await fs.readFile(fixturePath, "utf8");
    const tempRoot = await createTempRepoRoot(seedCsvContents);

    const result = await importSourceRegistry({
      dryRun: true,
      startDir: tempRoot,
      log: () => {}
    });

    expect(result.insertedCount).toBe(0);
    expect(result.updatedCount).toBe(0);
    expect(result.reportPath).toMatch(/^artifacts\/source-registry\/ingests\//);

    const report = JSON.parse(
      await fs.readFile(path.join(tempRoot, result.reportPath), "utf8")
    ) as {
      skippedRows: Array<{ reason: string; row: Record<string, string> }>;
      records: Array<{ brandName: string }>;
    };

    expect(report.records).toHaveLength(3);
    expect(report.skippedRows).toHaveLength(1);
    expect(report.skippedRows[0]?.reason).toBe("missing_site_url");
    expect(report.skippedRows[0]?.row.agent_name).toBe("Portal Only Estates");
  });
});
