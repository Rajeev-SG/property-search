import { describe, expect, it, vi } from "vitest";
import { loadSourceRegistryFetchTarget } from "@property-search/harness";

describe("source registry fetch target lookup", () => {
  it("returns the first enabled source row ordered by raw input position", async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [
        {
          brandName: "Acme Estates",
          branchName: "Central",
          homepageUrl: "https://acme.example/",
          rawInputPath: "data/seeds/estate-agents.csv",
          rawRowNumber: 12,
          sourceId: "src_acme",
          startUrl: "https://acme.example/listings",
          validationStatus: "verified",
          websiteDomain: "acme.example"
        }
      ]
    });

    const target = await loadSourceRegistryFetchTarget({
      client: {
        query
      }
    });

    expect(query).toHaveBeenCalledWith(expect.stringContaining("FROM source_registry"), [null]);
    expect(target).toEqual({
      brandName: "Acme Estates",
      branchName: "Central",
      homepageUrl: "https://acme.example/",
      rawInputPath: "data/seeds/estate-agents.csv",
      rawRowNumber: 12,
      sourceId: "src_acme",
      startUrl: "https://acme.example/listings",
      validationStatus: "verified",
      websiteDomain: "acme.example"
    });
  });

  it("passes through an explicit source id filter", async () => {
    const query = vi.fn().mockResolvedValue({
      rows: []
    });

    const target = await loadSourceRegistryFetchTarget({
      client: {
        query
      },
      sourceId: "src_missing"
    });

    expect(query).toHaveBeenCalledWith(expect.stringContaining("source_id = $1"), ["src_missing"]);
    expect(target).toBeNull();
  });
});
