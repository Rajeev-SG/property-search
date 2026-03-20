import { runArtifactStorageSmoke } from "@property-search/harness";

const persistToDatabase = process.argv.includes("--persist-db");

await runArtifactStorageSmoke({
  persistToDatabase
});
