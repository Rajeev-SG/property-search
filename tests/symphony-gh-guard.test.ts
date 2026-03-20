import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const wrapperPath = path.join(process.cwd(), ".symphony/bin/gh");

const tempDirectories: string[] = [];

async function createTempDir(prefix: string) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirectories.push(directory);
  return directory;
}

async function writeFile(filePath: string, content: string) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
}

async function createFakeGitHubCli(repoRoot: string) {
  const statePath = path.join(repoRoot, "fake-gh-state.json");
  const logPath = path.join(repoRoot, "fake-gh-log.jsonl");
  await fs.writeFile(statePath, JSON.stringify({ comments: [] }), "utf8");
  await fs.writeFile(logPath, "", "utf8");

  const scriptPath = path.join(repoRoot, "fake-gh.py");
  await writeFile(
    scriptPath,
    `#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path

args = sys.argv[1:]
repo_root = Path(os.environ["FAKE_GH_REPO_ROOT"])
state_path = repo_root / "fake-gh-state.json"
log_path = repo_root / "fake-gh-log.jsonl"

state = json.loads(state_path.read_text())
with log_path.open("a", encoding="utf-8") as handle:
    handle.write(json.dumps(args) + "\\n")

def save():
    state_path.write_text(json.dumps(state), encoding="utf-8")

if args == ["--version"]:
    print("gh version 0.0.0-test")
    raise SystemExit(0)

if args[:3] == ["repo", "view", "--json"]:
    fields = args[3]
    if fields == "nameWithOwner":
        print(json.dumps({"nameWithOwner": "Rajeev-SG/property-search"}))
        raise SystemExit(0)
    if fields == "defaultBranchRef":
        print(json.dumps({"defaultBranchRef": {"name": "main"}}))
        raise SystemExit(0)

if args[:2] == ["pr", "edit"]:
    print("https://github.com/Rajeev-SG/property-search/pull/999")
    raise SystemExit(0)

if args[:2] == ["pr", "merge"]:
    print("merged")
    raise SystemExit(0)

if args[:2] == ["pr", "view"]:
    if "--json" in args:
        fields = args[args.index("--json") + 1]
        if fields == "number,headRefOid":
            print(json.dumps({"number": 999, "headRefOid": "head-sha"}))
            raise SystemExit(0)
        if fields == "number,url,title,body,reviewDecision,mergeStateStatus,mergeable,headRefName,headRefOid,mergedAt":
            print(json.dumps({
                "number": 999,
                "url": "https://github.com/Rajeev-SG/property-search/pull/999",
                "title": "RAJ-23: Validate Symphony OpenReview and Linear PR loop",
                "body": "## Summary\\n\\n- Wrapper merge validation.\\n\\n## Validation\\n\\n- pnpm test -- --run tests/symphony-gh-guard.test.ts\\n\\n## Risks / Follow-ups\\n\\n- None.\\n\\n## Links\\n\\n- Linear: https://linear.app/rajeevs-experiments/issue/RAJ-23/validate-symphony-openreview-and-linear-pr-loop\\n- Docs or artifacts: None.",
                "reviewDecision": "",
                "mergeStateStatus": "CLEAN",
                "mergeable": "MERGEABLE",
                "headRefName": "rajeevsgill/raj-23-validate-symphony-openreview-and-linear-pr-loop",
                "headRefOid": "head-sha",
                "mergedAt": None
            }))
            raise SystemExit(0)
        if fields == "number,url,title,body,headRefName,mergedAt":
            print(json.dumps({
                "number": 999,
                "url": "https://github.com/Rajeev-SG/property-search/pull/999",
                "title": "RAJ-23: Validate Symphony OpenReview and Linear PR loop",
                "body": "## Summary\\n\\n- Wrapper merge validation.\\n\\n## Validation\\n\\n- pnpm test -- --run tests/symphony-gh-guard.test.ts\\n\\n## Risks / Follow-ups\\n\\n- None.\\n\\n## Links\\n\\n- Linear: https://linear.app/rajeevs-experiments/issue/RAJ-23/validate-symphony-openreview-and-linear-pr-loop\\n- Docs or artifacts: None.",
                "headRefName": "rajeevsgill/raj-23-validate-symphony-openreview-and-linear-pr-loop",
                "mergedAt": "2026-03-20T18:00:00Z"
            }))
            raise SystemExit(0)

if args[:3] == ["pr", "checks", "999"]:
    print("[]")
    raise SystemExit(0)

if args[:2] == ["pr", "comment"]:
    body = args[args.index("--body") + 1]
    state["comments"].append(body)
    save()
    print("commented")
    raise SystemExit(0)

if args[:2] == ["api", "graphql"]:
    print(json.dumps({
        "data": {
            "repository": {
                "pullRequest": {
                    "reviewThreads": {
                        "nodes": []
                    }
                }
            }
        }
    }))
    raise SystemExit(0)

if args[:2] == ["api", "repos/Rajeev-SG/property-search/pulls/999/reviews"]:
    print("[]")
    raise SystemExit(0)

if args[:2] == ["api", "repos/Rajeev-SG/property-search/issues/999/comments"]:
    print(json.dumps([{"body": body, "created_at": "2026-03-20T18:00:00Z", "user": {"login": "Rajeev-SG"}} for body in state["comments"]]))
    raise SystemExit(0)

if args[:2] == ["api", "repos/Rajeev-SG/property-search/commits/head-sha"]:
    print(json.dumps({"commit": {"committer": {"date": "2026-03-20T17:59:00Z"}}}))
    raise SystemExit(0)

print(json.dumps({"args": args}))
`
  );
  await fs.chmod(scriptPath, 0o755);

  return {
    logPath,
    scriptPath,
    statePath
  };
}

async function createBodyFile(repoRoot: string) {
  const filePath = path.join(repoRoot, "pr-body.md");
  await writeFile(
    filePath,
    `## Summary

- Disposable workflow validation change.

## Validation

- pnpm test -- --run tests/symphony-gh-guard.test.ts

## Risks / Follow-ups

- None.

## Links

- Linear: https://linear.app/rajeevs-experiments/issue/RAJ-23/validate-symphony-openreview-and-linear-pr-loop
- Docs or artifacts: None.
`
  );
  return filePath;
}

afterEach(async () => {
  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true })
    )
  );
});

describe("Symphony gh guard", () => {
  it("defaults the OpenReview trigger comment to the app mention", async () => {
    const repoRoot = await createTempDir("property-search-gh-guard-");
    const { logPath, scriptPath, statePath } = await createFakeGitHubCli(repoRoot);
    const bodyFile = await createBodyFile(repoRoot);

    await execFileAsync(wrapperPath, ["pr", "edit", "999", "--body-file", bodyFile], {
      cwd: repoRoot,
      env: {
        ...process.env,
        FAKE_GH_REPO_ROOT: repoRoot,
        SYMPHONY_OPENREVIEW_APP_SLUG: "openreview-property-search",
        SYMPHONY_REAL_GH: scriptPath
      }
    });

    const loggedCalls = (await fs.readFile(logPath, "utf8"))
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as string[]);
    const commentCall = loggedCalls.find(
      (call) => call[0] === "pr" && call[1] === "comment"
    );

    expect(commentCall).toEqual([
      "pr",
      "comment",
      "999",
      "--body",
      "@openreview-property-search"
    ]);

    const state = JSON.parse(await fs.readFile(statePath, "utf8")) as {
      comments: string[];
    };
    expect(state.comments).toEqual(["@openreview-property-search"]);
  });

  it("posts the final Linear comment after a successful merge", async () => {
    const repoRoot = await createTempDir("property-search-gh-guard-");
    const { scriptPath } = await createFakeGitHubCli(repoRoot);
    const requests: Array<{ authorization: string | undefined; body: string }> = [];

    const server = http.createServer((request, response) => {
      let body = "";
      request.on("data", (chunk) => {
        body += chunk.toString();
      });
      request.on("end", () => {
        requests.push({
          authorization: request.headers.authorization,
          body
        });
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ data: { commentCreate: { success: true } } }));
      });
    });

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    if (!address || typeof address === "string") {
      throw new Error("Could not determine test server address.");
    }

    try {
      await execFileAsync(wrapperPath, ["pr", "merge", "999", "--delete-branch"], {
        cwd: repoRoot,
        env: {
          ...process.env,
          FAKE_GH_REPO_ROOT: repoRoot,
          LINEAR_API_KEY: "linear-test-token",
          SYMPHONY_ISSUE_ID: "linear-issue-id",
          SYMPHONY_LINEAR_ENDPOINT: `http://127.0.0.1:${address.port}`,
          SYMPHONY_REAL_GH: scriptPath
        }
      });
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      );
    }

    expect(requests).toHaveLength(1);
    expect(requests[0]?.authorization).toBe("linear-test-token");

    const payload = JSON.parse(requests[0]!.body) as {
      query: string;
      variables: {
        body: string;
        issueId: string;
      };
    };

    expect(payload.variables.issueId).toBe("linear-issue-id");
    expect(payload.variables.body).toContain("Unattended handoff completed.");
    expect(payload.variables.body).toContain("https://github.com/Rajeev-SG/property-search/pull/999");
    expect(payload.variables.body).toContain("pnpm test -- --run tests/symphony-gh-guard.test.ts");
  });
});
