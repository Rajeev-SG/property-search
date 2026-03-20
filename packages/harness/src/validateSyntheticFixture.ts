import fs from "node:fs";
import path from "node:path";
import { canonicalPropertySchema } from "@property-search/domain";
import { findRepoRoot } from "./repoRoot.js";

export async function validateSyntheticFixture(startDir: string = process.cwd()) {
  const repoRoot = findRepoRoot(startDir);
  const target = path.join(repoRoot, "data/fixtures/expected-json/detail.synthetic.json");

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
