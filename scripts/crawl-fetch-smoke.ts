import { parseArgs } from "node:util";
import { runFetchPipelineSmoke } from "@property-search/crawl";

const { values } = parseArgs({
  args: process.argv.slice(2).filter((argument) => argument !== "--"),
  allowPositionals: false,
  options: {
    fixture: {
      type: "boolean"
    },
    "persist-db": {
      type: "boolean"
    },
    "require-source-registry": {
      type: "boolean"
    },
    "source-id": {
      type: "string"
    }
  }
});

const result = await runFetchPipelineSmoke({
  fixture: values.fixture,
  persistToDatabase: values["persist-db"],
  requireSourceRegistry: values["require-source-registry"],
  sourceId: values["source-id"]
});

if (result.run.status !== "succeeded") {
  console.error(`crawl smoke ended with non-success status: ${result.run.status}`);
  process.exitCode = 1;
}
