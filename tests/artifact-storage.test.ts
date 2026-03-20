import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildRunLedgerUpsert,
  createRunLedger,
  createRunId,
  reserveArtifactPath,
  sanitizeArtifactSegment,
  updateRunLedger,
  writeJsonArtifact,
  writeRunManifest
} from "@property-search/harness";

const tempDirectories: string[] = [];

async function createTempRepoRoot() {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "property-search-artifacts-"));
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

describe("artifact storage helpers", () => {
  it("builds stable run identifiers and path-safe segments", () => {
    expect(sanitizeArtifactSegment("Prime & Proper / West End")).toBe("prime-proper-west-end");
    const runId = createRunId({
      runKind: "crawl",
      scope: "west-end sweep",
      provider: "firecrawl",
      pageUrl: "https://example.com/properties/1",
      startedAt: "2026-03-20T04:27:14.000Z"
    });

    expect(runId).toBe(
      createRunId({
        runKind: "crawl",
        scope: "west-end sweep",
        provider: "firecrawl",
        pageUrl: "https://example.com/properties/1",
        startedAt: "2026-03-20T04:27:14.000Z"
      })
    );
    expect(runId).toMatch(/^20260320T042714Z-west-end-sweep-[a-f0-9]{12}$/);
  });

  it("creates deterministic per-run directories and artifact paths", async () => {
    const repoRoot = await createTempRepoRoot();
    const run = createRunLedger({
      repoRoot,
      runKind: "crawl",
      scope: "example-co-uk",
      provider: "firecrawl",
      pageUrl: "https://example.com/properties/demo-home",
      startedAt: "2026-03-20T04:27:14.000Z"
    });

    expect(run.runPath).toMatch(
      /^artifacts\/runs\/2026\/03\/20\/20260320T042714Z-example-co-uk-[a-f0-9]{12}$/
    );
    expect(run.artifactPaths.raw).toBe(
      `${run.runPath}/raw`
    );

    const artifact = reserveArtifactPath(run, {
      bucket: "raw",
      extension: "html",
      mediaType: "text/html",
      pageUrl: "https://example.com/properties/demo-home",
      label: "detail-page"
    });

    expect(artifact.relativePath).toBe(`${run.runPath}/raw/${artifact.filename}`);
    expect(artifact.filename).toMatch(/^detail-page__[a-f0-9]{12}\.html$/);
  });

  it("writes manifests and serializes ledger data for database upserts", async () => {
    const repoRoot = await createTempRepoRoot();
    const run = createRunLedger({
      repoRoot,
      runKind: "extract",
      scope: "demo-listing",
      provider: "local-smoke",
      pageUrl: "https://example.com/listings/demo-home",
      startedAt: "2026-03-20T05:00:00.000Z"
    });

    await writeJsonArtifact(run, {
      bucket: "extracted",
      extension: "json",
      mediaType: "application/json",
      pageUrl: run.pageUrl,
      label: "listing-json",
      content: {
        listingId: "demo-home"
      }
    });

    updateRunLedger(run, {
      status: "failed",
      completedAt: "2026-03-20T05:01:00.000Z",
      errorClass: "schema extraction failure",
      metadata: {
        attempts: 1
      }
    });

    await writeRunManifest(run);

    const manifest = JSON.parse(await fs.readFile(run.summaryAbsolutePath, "utf8"));
    expect(manifest.status).toBe("failed");
    expect(manifest.artifacts).toHaveLength(1);
    expect(manifest.errorClass).toBe("schema extraction failure");

    const statement = buildRunLedgerUpsert(run);
    expect(statement.text).toContain("INSERT INTO ingestion_runs");
    expect(statement.values[0]).toBe(run.runId);
    expect(statement.values[6]).toBe("failed");
  });
});
