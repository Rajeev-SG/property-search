import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const readRepoFile = (relativePath: string) =>
  fs.readFileSync(path.join(process.cwd(), relativePath), "utf8");

describe("workflow contract", () => {
  it("encodes unattended PR automation requirements in WORKFLOW.md", () => {
    const workflow = readRepoFile("WORKFLOW.md");

    expect(workflow).toContain("create or update exactly one PR");
    expect(workflow).toContain(".github/pull_request_template.md");
    expect(workflow).toContain("Collect PR review comments, unresolved review threads, review state, mergeability, and required check status.");
    expect(workflow).toContain("apply the smallest fix on the same branch");
    expect(workflow).toContain("gh pr merge \"$PR_NUMBER\" --delete-branch");
    expect(workflow).toContain("post a final Linear comment");
    expect(workflow).toContain("Move the Linear issue to `Done` only after merge succeeds.");
    expect(workflow).toContain("move the issue to `In Review`, record the exact blocker summary with the PR URL and blocking signals, and stop.");
  });

  it("documents the reusable PR automation guidance", () => {
    const skill = readRepoFile("skills/pr-automation/SKILL.md");
    const runbook = readRepoFile("docs/references/github-pr-automation.md");
    const readme = readRepoFile("README.md");
    const agents = readRepoFile("AGENTS.md");

    expect(skill).toContain("Read `docs/references/github-pr-automation.md`.");
    expect(skill).toContain("Reuse the existing ticket branch and existing PR for that branch when they already exist.");
    expect(runbook).toContain("gh pr list --head \"$CURRENT_BRANCH\" --state open");
    expect(runbook).toContain("gh api graphql");
    expect(runbook).toContain("gh pr merge \"$PR_NUMBER\" --delete-branch");
    expect(readme).toContain("skills/pr-automation/SKILL.md");
    expect(readme).toContain(".github/pull_request_template.md");
    expect(agents).toContain("Gather PR review comments, unresolved review threads, review state, and required checks before deciding whether the work is ready to merge.");
    expect(agents).toContain("final Linear comment");
  });
});
