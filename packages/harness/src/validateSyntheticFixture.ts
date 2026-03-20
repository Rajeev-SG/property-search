import fs from "node:fs";
import path from "node:path";
import {
  canonicalPropertySchema,
  extractedListingSchema,
  searchDocumentSchema
} from "@property-search/domain";
import { findRepoRoot } from "./repoRoot.js";

export async function validateSyntheticFixture(startDir: string = process.cwd()) {
  const repoRoot = findRepoRoot(startDir);
  const validations = [
    {
      label: "extracted listing",
      target: path.join(repoRoot, "data/fixtures/expected-json/detail.synthetic.json"),
      schema: extractedListingSchema
    },
    {
      label: "canonical property",
      target: path.join(repoRoot, "data/fixtures/expected-json/canonical-property.synthetic.json"),
      schema: canonicalPropertySchema
    },
    {
      label: "search document",
      target: path.join(repoRoot, "data/fixtures/expected-json/search-document.synthetic.json"),
      schema: searchDocumentSchema
    }
  ];

  for (const validation of validations) {
    const raw = fs.readFileSync(validation.target, "utf8");
    const parsed = JSON.parse(raw);
    const result = validation.schema.safeParse(parsed);

    if (!result.success) {
      console.error(`Fixture validation failed for ${validation.label}`);
      console.error(result.error.format());
      process.exitCode = 1;
      return;
    }
  }

  console.log("Synthetic fixtures validated successfully.");
}
