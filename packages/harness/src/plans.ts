import fs from "node:fs";
import path from "node:path";
import { findRepoRoot } from "./repoRoot.js";

export async function listPlans(startDir: string = process.cwd()) {
  const repoRoot = findRepoRoot(startDir);
  const plansDir = path.join(repoRoot, "docs/exec-plans/active");
  const files = fs.readdirSync(plansDir).filter((file) => file.endsWith(".md")).sort();

  console.log("Active execution plans:");
  for (const file of files) {
    console.log(`- ${file}`);
  }
}
