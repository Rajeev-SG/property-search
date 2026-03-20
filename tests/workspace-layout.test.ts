import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { findRepoRoot } from "@property-search/harness";

describe("workspace layout", () => {
  it("finds the repo root from nested package directories", () => {
    const repoRoot = process.cwd();
    const nestedDir = path.join(repoRoot, "apps/cli/src");

    expect(findRepoRoot(nestedDir)).toBe(repoRoot);
  });

  it("declares the core workspace packages explicitly", () => {
    const repoRoot = process.cwd();
    const packageFiles = [
      "apps/cli/package.json",
      "packages/domain/package.json",
      "packages/harness/package.json",
      "packages/adapters/package.json",
      "packages/crawl/package.json",
      "packages/extract/package.json"
    ];

    for (const packageFile of packageFiles) {
      const fullPath = path.join(repoRoot, packageFile);
      expect(fs.existsSync(fullPath), packageFile).toBe(true);
    }
  });
});
