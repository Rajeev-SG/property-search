import { runFetchPipelineSmoke } from "@property-search/crawl";

const result = await runFetchPipelineSmoke();

if (result.run.status !== "succeeded") {
  console.error(`crawl smoke ended with non-success status: ${result.run.status}`);
  process.exitCode = 1;
}
