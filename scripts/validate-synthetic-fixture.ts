import fs from "node:fs";
import path from "node:path";
import { canonicalPropertySchema } from "../packages/domain/src/canonicalProperty.js";

export async function validateSyntheticFixture() {
  const target = path.join(
    process.cwd(),
    "data/fixtures/expected-json/detail.synthetic.json"
  );

  const raw = fs.readFileSync(target, "utf8");
  const parsed = JSON.parse(raw);
  const result = canonicalPropertySchema.safeParse(parsed);

  if (!result.success) {
    console.error("Fixture validation failed");
    console.error(result.error.format());
    process.exitCode = 1;
    return;
  }

  console.log("Synthetic fixture validated successfully.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  validateSyntheticFixture();
}
