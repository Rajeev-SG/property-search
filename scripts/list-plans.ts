import fs from "node:fs";
import path from "node:path";

export async function listPlans() {
  const dir = path.join(process.cwd(), "docs/exec-plans/active");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort();

  console.log("Active execution plans:");
  for (const file of files) {
    console.log(`- ${file}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  listPlans();
}
