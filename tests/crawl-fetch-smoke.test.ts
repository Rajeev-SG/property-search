import { describe, expect, it } from "vitest";
import { resolveFetchPipelineSmokeTarget } from "@property-search/crawl";

describe("fetch pipeline smoke target resolution", () => {
  it("uses a source_registry row when one is available", async () => {
    const target = await resolveFetchPipelineSmokeTarget({
      loadSourceRegistryTarget: async () => ({
        brandName: "Acme Estates",
        branchName: null,
        homepageUrl: "https://acme.example/",
        rawInputPath: "data/seeds/estate-agents.csv",
        rawRowNumber: 21,
        sourceId: "src_acme",
        startUrl: "https://acme.example/listings",
        validationStatus: "verified",
        websiteDomain: "acme.example"
      })
    });

    expect(target).toEqual({
      metadata: {
        brandName: "Acme Estates",
        branchName: null,
        rawInputPath: "data/seeds/estate-agents.csv",
        rawRowNumber: 21,
        selection: "source_registry",
        validationStatus: "verified",
        websiteDomain: "acme.example"
      },
      pageUrl: "https://acme.example/listings",
      sourceId: "src_acme",
      targetKind: "source_registry"
    });
  });

  it("falls back to the fixture when source_registry is empty", async () => {
    const target = await resolveFetchPipelineSmokeTarget({
      loadSourceRegistryTarget: async () => null
    });

    expect(target).toEqual({
      metadata: {
        fallbackReason: "source_registry_empty",
        selection: "fixture"
      },
      pageUrl: "https://example.com/listings/demo-home",
      sourceId: "fixture-demo-home",
      targetKind: "fixture"
    });
  });

  it("uses the fixture when explicitly requested even if source_registry is available", async () => {
    const target = await resolveFetchPipelineSmokeTarget({
      fixture: true,
      loadSourceRegistryTarget: async () => ({
        brandName: "Acme Estates",
        branchName: null,
        homepageUrl: "https://acme.example/",
        rawInputPath: "data/seeds/estate-agents.csv",
        rawRowNumber: 21,
        sourceId: "src_acme",
        startUrl: "https://acme.example/listings",
        validationStatus: "verified",
        websiteDomain: "acme.example"
      })
    });

    expect(target).toEqual({
      metadata: {
        fallbackReason: "fixture_requested",
        selection: "fixture"
      },
      pageUrl: "https://example.com/listings/demo-home",
      sourceId: "fixture-demo-home",
      targetKind: "fixture"
    });
  });

  it("fails when source_registry is required but empty", async () => {
    await expect(
      resolveFetchPipelineSmokeTarget({
        loadSourceRegistryTarget: async () => null,
        requireSourceRegistry: true
      })
    ).rejects.toThrow(
      "No enabled source_registry rows found. Run `pnpm db:migrate` and `pnpm source-registry:ingest` first."
    );
  });

  it("fails when a specific source id is requested but missing", async () => {
    await expect(
      resolveFetchPipelineSmokeTarget({
        loadSourceRegistryTarget: async () => null,
        sourceId: "src_missing"
      })
    ).rejects.toThrow('No enabled source_registry row found for source_id "src_missing"');
  });

  it("fails when a specific source id is blank", async () => {
    await expect(
      resolveFetchPipelineSmokeTarget({
        loadSourceRegistryTarget: async () => null,
        sourceId: "   "
      })
    ).rejects.toThrow('No enabled source_registry row found for source_id ""');
  });
});
