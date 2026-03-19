import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { canonicalPropertySchema } from "../packages/domain/src/canonicalProperty.js";

describe("synthetic canonical fixture", () => {
  it("validates against the canonical schema", () => {
    const raw = fs.readFileSync(
      path.join(process.cwd(), "data/fixtures/expected-json/detail.synthetic.json"),
      "utf8"
    );
    const parsed = JSON.parse(raw);
    const result = canonicalPropertySchema.safeParse(parsed);

    expect(result.success).toBe(true);
  });
});
