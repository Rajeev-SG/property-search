import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  canonicalPropertySchema,
  extractedListingSchema,
  searchDocumentSchema
} from "@property-search/domain";

const readFixture = (relativePath: string) =>
  JSON.parse(
    fs.readFileSync(path.join(process.cwd(), relativePath), "utf8")
  );

describe("synthetic canonical fixture", () => {
  it("validates the extracted listing fixture", () => {
    const result = extractedListingSchema.safeParse(
      readFixture("data/fixtures/expected-json/detail.synthetic.json")
    );

    expect(result.success).toBe(true);
  });

  it("validates the canonical property fixture", () => {
    const result = canonicalPropertySchema.safeParse(
      readFixture("data/fixtures/expected-json/canonical-property.synthetic.json")
    );

    expect(result.success).toBe(true);
  });

  it("validates the search document fixture", () => {
    const result = searchDocumentSchema.safeParse(
      readFixture("data/fixtures/expected-json/search-document.synthetic.json")
    );

    expect(result.success).toBe(true);
  });

  it("keeps the listing, canonical, and search contracts distinct", () => {
    const listingFixture = readFixture("data/fixtures/expected-json/detail.synthetic.json");
    const canonicalFixture = readFixture("data/fixtures/expected-json/canonical-property.synthetic.json");

    expect(canonicalPropertySchema.safeParse(listingFixture).success).toBe(false);
    expect(searchDocumentSchema.safeParse(canonicalFixture).success).toBe(false);
  });
});
