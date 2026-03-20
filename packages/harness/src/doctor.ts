import fs from "node:fs";
import path from "node:path";
import { findRepoRoot } from "./repoRoot.js";

const requiredPaths = [
  "README.md",
  "AGENTS.md",
  "ARCHITECTURE.md",
  ".env",
  ".github/workflows/ci.yml",
  "pnpm-workspace.yaml",
  "docs/HARNESS_AUDIT.md",
  "docs/PROJECT_STATUS.md",
  "docs/DEVELOPMENT_LOG.md",
  "docs/TICKET_INDEX.md",
  "docs/exec-plans/README.md",
  "docs/exec-plans/active/001-monorepo-bootstrap.md",
  "docs/backlog/001-harness-hardening-and-source-registry-contract.md",
  "docs/backlog/002-monorepo-bootstrap-and-dev-ergonomics.md",
  "apps/cli/package.json",
  "packages/domain/package.json",
  "packages/harness/package.json",
  "packages/domain/src/canonicalProperty.ts",
  "docs/product-specs/source-registry.md",
  "data/seeds/estate-agents.example.csv",
  "scripts/smoke-external-vendors.ts",
  "scripts/browser-use-smoke.py"
];

function ok(label: string, detail: string) {
  console.log(`✅ ${label}: ${detail}`);
}

function warn(label: string, detail: string) {
  console.log(`⚠️  ${label}: ${detail}`);
}

function fail(label: string, detail: string) {
  console.log(`❌ ${label}: ${detail}`);
}

export async function runDoctor(startDir: string = process.cwd()) {
  const repoRoot = findRepoRoot(startDir);

  for (const relativePath of requiredPaths) {
    const fullPath = path.join(repoRoot, relativePath);
    if (fs.existsSync(fullPath)) ok("file", relativePath);
    else fail("missing", relativePath);
  }

  const actualSeedCsv = path.join(repoRoot, "data/seeds/estate-agents.csv");
  if (fs.existsSync(actualSeedCsv)) ok("seed", "data/seeds/estate-agents.csv exists");
  else warn("seed", "data/seeds/estate-agents.csv not found — add your real seed file here");

  const artifactRoot = path.join(repoRoot, "artifacts");
  if (!fs.existsSync(artifactRoot)) {
    fs.mkdirSync(artifactRoot, { recursive: true });
    ok("directory", "created artifacts/");
  } else {
    ok("directory", "artifacts/ exists");
  }

  console.log("\nDoctor complete.");
}
