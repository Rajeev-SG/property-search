import fs from "node:fs";
import path from "node:path";

const repoRootMarkers = [
  "pnpm-workspace.yaml",
  "AGENTS.md",
  "docs/PROJECT_STATUS.md"
];

function hasRepoRootMarkers(directory: string): boolean {
  return repoRootMarkers.every((marker) => fs.existsSync(path.join(directory, marker)));
}

export function findRepoRoot(startDir: string = process.cwd()): string {
  let currentDir = path.resolve(startDir);

  while (true) {
    if (hasRepoRootMarkers(currentDir)) {
      return currentDir;
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      throw new Error(`Could not find property-search repo root from ${startDir}`);
    }

    currentDir = parentDir;
  }
}
