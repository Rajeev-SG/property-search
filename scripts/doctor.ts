import fs from "node:fs";
import path from "node:path";

function ok(label: string, detail: string) {
  console.log(`✅ ${label}: ${detail}`);
}

function warn(label: string, detail: string) {
  console.log(`⚠️  ${label}: ${detail}`);
}

function fail(label: string, detail: string) {
  console.log(`❌ ${label}: ${detail}`);
}

export async function runDoctor() {
  const cwd = process.cwd();

  const checks = [
    "README.md",
    "AGENTS.md",
    "ARCHITECTURE.md",
    ".env",
    "docs/HARNESS_AUDIT.md",
    "docs/PROJECT_STATUS.md",
    "docs/DEVELOPMENT_LOG.md",
    "docs/TICKET_INDEX.md",
    "docs/exec-plans/README.md",
    "docs/exec-plans/active/001-monorepo-bootstrap.md",
    "docs/backlog/001-harness-hardening-and-source-registry-contract.md",
    "packages/domain/src/canonicalProperty.ts",
    "docs/product-specs/source-registry.md",
    "data/seeds/estate-agents.example.csv",
    "scripts/smoke-external-vendors.ts",
    "scripts/browser-use-smoke.py"
  ];

  for (const file of checks) {
    const full = path.join(cwd, file);
    if (fs.existsSync(full)) ok("file", file);
    else fail("missing", file);
  }

  const actualSeedCsv = path.join(cwd, "data/seeds/estate-agents.csv");
  if (fs.existsSync(actualSeedCsv)) ok("seed", "data/seeds/estate-agents.csv exists");
  else warn("seed", "data/seeds/estate-agents.csv not found — add your real seed file here");

  const artifactRoot = path.join(cwd, "artifacts");
  if (!fs.existsSync(artifactRoot)) {
    fs.mkdirSync(artifactRoot, { recursive: true });
    ok("directory", "created artifacts/");
  } else {
    ok("directory", "artifacts/ exists");
  }

  console.log("\nDoctor complete.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runDoctor();
}
