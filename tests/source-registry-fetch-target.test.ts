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

    expect(query).toHaveBeenCalledWith(expect.any(String), [null]);
    const [sql] = query.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain("FROM source_registry");
    expect(sql).toContain("ORDER BY raw_input_path ASC, raw_row_number ASC");
    expect(sql).toContain("LIMIT 1");
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
