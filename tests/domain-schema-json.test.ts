import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { describe, expect, it } from "vitest";

const repoRoot = process.cwd();
const require = createRequire(import.meta.url);
const Ajv2020 = require("ajv/dist/2020.js").default;
const addFormats = require("ajv-formats").default;

const readJson = (relativePath: string) =>
  JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));

describe("machine-readable domain schema", () => {
  const schema = readJson("packages/domain/src/canonical-property.schema.json");
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false
  });

  addFormats(ajv);

  it("validates the extracted listing fixture against the root schema", () => {
    const validate = ajv.compile(schema);
    const fixture = readJson("data/fixtures/expected-json/detail.synthetic.json");
    const valid = validate(fixture);

    expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
  });

  it("validates the canonical property fixture against the canonical-property definition", () => {
    const validate = ajv.compile({
      ...schema,
      $ref: "#/$defs/CanonicalProperty"
    });
    const fixture = readJson("data/fixtures/expected-json/canonical-property.synthetic.json");
    const valid = validate(fixture);

    expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
  });

  it("validates the search document fixture against the search-document definition", () => {
    const validate = ajv.compile({
      ...schema,
      $ref: "#/$defs/SearchDocument"
    });
    const fixture = readJson("data/fixtures/expected-json/search-document.synthetic.json");
    const valid = validate(fixture);

    expect(valid, JSON.stringify(validate.errors, null, 2)).toBe(true);
  });
});
