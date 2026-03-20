import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@property-search/crawl": path.resolve(__dirname, "packages/crawl/src/index.ts"),
      "@property-search/domain": path.resolve(__dirname, "packages/domain/src/index.ts"),
      "@property-search/harness": path.resolve(__dirname, "packages/harness/src/index.ts")
    }
  }
});
