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
    expect(workflow).toContain("CURRENT_ORIGIN_URL");
    expect(workflow).toContain("workspace origin still points at local source path");
    expect(workflow).toContain("Collect PR review comments, unresolved review threads, review state, mergeability, OpenReview state for the current PR head, and required check status.");
    expect(workflow).toContain("apply the smallest fix on the same branch");
    expect(workflow).toContain("openreview-property-search");
    expect(workflow).toContain("OpenReview `triggered` state in a Linear milestone comment");
    expect(workflow).toContain("If current-head OpenReview remains pending within the configured timeout window");
    expect(workflow).toContain("add a `pending` milestone comment instead of falling back to `In Review`");
    expect(workflow).toContain("OpenReview is satisfied for the current PR head");
    expect(workflow).toContain("Keep Linear updated with concise milestone comments");
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
    expect(runbook).toContain("@openreview-property-search");
    expect(runbook).toContain("OPENREVIEW_CURRENT_HEAD_REVIEWED");
    expect(runbook).toContain("If OpenReview has not reviewed the current PR head yet, trigger it.");
    expect(runbook).toContain("OpenReview is satisfied for the current PR head");
    expect(runbook).toContain("milestone-oriented");
    expect(runbook).toContain("gh pr merge \"$PR_NUMBER\" --delete-branch");
    expect(readme).toContain("skills/pr-automation/SKILL.md");
    expect(readme).toContain(".github/pull_request_template.md");
    expect(readme).toContain("concise Linear milestone comments for the `triggered`, `pending`, and final OpenReview lifecycle state");
    expect(readme).toContain("That naming isolation does not make concurrent stack startup fully safe");
    expect(readme).toContain("fixed host ports still conflict across simultaneous runs");
    expect(workflow).toContain("workspace-safe in naming terms");
    expect(agents).toContain("Gather PR review comments, unresolved review threads, review state, OpenReview state for the current head, and required checks before deciding whether the work is ready to merge.");
    expect(agents).toContain("keep the issue in `In Progress` while that wait state is still within the configured timeout window");
    expect(agents).toContain("OpenReview state for the current head");
    expect(agents).toContain("Linear milestone comments");
    expect(agents).toContain("final Linear comment");
  });
});
