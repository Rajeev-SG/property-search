import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const guardPath = path.join(process.cwd(), ".symphony/bin/gh");
const tempDirectories: string[] = [];
const activeProcesses: ChildProcess[] = [];

type FakeGhState = {
  calls?: string[][];
  commitDate?: string;
  issueComments?: Array<Record<string, unknown>>;
  mergeResult?: { mergedAt?: string };
  merged?: boolean;
  pr: Record<string, unknown>;
  prCommentsPosted?: Array<{ body: string; number: string }>;
  requiredChecks?: Array<Record<string, unknown>>;
  requiredChecksExitCode?: number;
  repo?: { nameWithOwner: string };
  reviewThreads?: Array<Record<string, unknown>>;
  reviews?: Array<Record<string, unknown>>;
};

function isoMinutesAgo(minutesAgo: number) {
  return new Date(Date.now() - minutesAgo * 60 * 1000).toISOString();
}

async function createTempDirectory(prefix: string) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
  tempDirectories.push(directory);
  return directory;
}

async function createPrBodyFile(directory: string) {
  const filePath = path.join(directory, "pr-body.md");
  await fs.writeFile(
    filePath,
    [
      "## Summary",
      "",
      "- Add disposable regression coverage for the Symphony gh guard.",
      "- Keep the change scoped to the OpenReview and Linear handoff loop for RAJ-23.",
      "",
      "## Validation",
      "",
      "- pnpm run doctor",
      "- pnpm typecheck",
      "- pnpm test -- --run tests/symphony-gh-guard.test.ts tests/workflow-contract.test.ts",
      "",
      "## Risks / Follow-ups",
      "",
      "- None.",
      "",
      "## Links",
      "",
      "- Linear: https://linear.app/rajeevs-experiments/issue/RAJ-23/validate-symphony-openreview-and-linear-pr-loop",
      "- Docs or artifacts: .symphony/bin/gh, docs/TESTING.md"
    ].join("\n"),
    "utf8"
  );
  return filePath;
}

async function createFakeGh(directory: string, initialState: FakeGhState) {
  const statePath = path.join(directory, "fake-gh-state.json");
  const scriptPath = path.join(directory, "fake-gh.cjs");

  await fs.writeFile(
    statePath,
    JSON.stringify(
      {
        calls: [],
        commitDate: "2026-03-20T17:00:00Z",
        issueComments: [],
        mergeResult: { mergedAt: "2026-03-20T18:10:06Z" },
        merged: false,
        prCommentsPosted: [],
        requiredChecks: [],
        requiredChecksExitCode: 0,
        repo: { nameWithOwner: "Rajeev-SG/property-search" },
        reviewThreads: [],
        reviews: [],
        ...initialState
      },
      null,
      2
    ),
    "utf8"
  );

  await fs.writeFile(
    scriptPath,
    `#!/usr/bin/env node
const fs = require("node:fs");

const statePath = process.env.FAKE_GH_STATE_PATH;
const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
const args = process.argv.slice(2);
state.calls.push(args);

function save() {
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
}

function printJson(payload) {
  process.stdout.write(JSON.stringify(payload));
}

if (args[0] === "--version") {
  process.stdout.write("gh version 0.0.0-test\\n");
  save();
  process.exit(0);
}

if (args[0] === "repo" && args[1] === "view") {
  printJson(state.repo || { nameWithOwner: "Rajeev-SG/property-search" });
  save();
  process.exit(0);
}

if (args[0] === "pr" && (args[1] === "create" || args[1] === "edit")) {
  process.stdout.write("updated\\n");
  save();
  process.exit(0);
}

if (args[0] === "pr" && args[1] === "view") {
  const payload = { ...state.pr };
  if (state.merged && !payload.mergedAt) {
    payload.mergedAt = (state.mergeResult || {}).mergedAt || "2026-03-20T18:10:06Z";
  }
  printJson(payload);
  save();
  process.exit(0);
}

if (args[0] === "pr" && args[1] === "comment") {
  const bodyIndex = args.indexOf("--body");
  state.prCommentsPosted.push({
    number: args[2],
    body: bodyIndex >= 0 ? args[bodyIndex + 1] : ""
  });
  process.stdout.write("commented\\n");
  save();
  process.exit(0);
}

if (args[0] === "pr" && args[1] === "checks") {
  printJson(state.requiredChecks || []);
  save();
  process.exit(state.requiredChecksExitCode || 0);
}

if (args[0] === "pr" && args[1] === "merge") {
  state.merged = true;
  process.stdout.write("merged\\n");
  save();
  process.exit(0);
}

if (args[0] === "api" && args[1] === "graphql") {
  printJson({
    data: {
      repository: {
        pullRequest: {
          reviewThreads: {
            nodes: state.reviewThreads || []
          }
        }
      }
    }
  });
  save();
  process.exit(0);
}

if (args[0] === "api") {
  const endpoint = args[1] || "";
  if (endpoint.includes("/pulls/") && endpoint.endsWith("/reviews")) {
    printJson(state.reviews || []);
    save();
    process.exit(0);
  }

  if (endpoint.includes("/issues/") && endpoint.endsWith("/comments")) {
    printJson(state.issueComments || []);
    save();
    process.exit(0);
  }

  if (endpoint.includes("/commits/")) {
    printJson({
      commit: {
        committer: {
          date: state.commitDate || "2026-03-20T17:00:00Z"
        }
      }
    });
    save();
    process.exit(0);
  }
}

process.stderr.write("Unexpected gh invocation: " + JSON.stringify(args) + "\\n");
save();
process.exit(1);
`,
    "utf8"
  );

  await fs.chmod(scriptPath, 0o755);

  return { scriptPath, statePath };
}

function runGuard(args: string[], env: Record<string, string>) {
  return spawnSync("python3", [guardPath, ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: {
      ...process.env,
      ...env
    }
  });
}

async function startFakeLinearServer(directory: string) {
  const scriptPath = path.join(directory, "fake-linear-server.cjs");
  const statePath = path.join(directory, "fake-linear-state.json");
  const portPath = path.join(directory, "fake-linear-port.txt");

  await fs.writeFile(statePath, JSON.stringify({ requests: [] }, null, 2), "utf8");
  await fs.writeFile(
    scriptPath,
    `#!/usr/bin/env node
const fs = require("node:fs");
const http = require("node:http");

const statePath = process.env.FAKE_LINEAR_STATE_PATH;
const portPath = process.env.FAKE_LINEAR_PORT_PATH;
const state = JSON.parse(fs.readFileSync(statePath, "utf8"));

const server = http.createServer((request, response) => {
  const chunks = [];
  request.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
  request.on("end", () => {
    state.requests.push({
      authorization: request.headers.authorization,
      body: Buffer.concat(chunks).toString("utf8")
    });
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ data: { commentCreate: { success: true } } }));
  });
});

server.listen(0, "127.0.0.1", () => {
  const address = server.address();
  fs.writeFileSync(portPath, String(address.port));
});
`,
    "utf8"
  );
  await fs.chmod(scriptPath, 0o755);

  const processHandle = spawn("node", [scriptPath], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      FAKE_LINEAR_PORT_PATH: portPath,
      FAKE_LINEAR_STATE_PATH: statePath
    },
    stdio: "ignore"
  });
  activeProcesses.push(processHandle);

  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const port = Number(await fs.readFile(portPath, "utf8"));
      if (Number.isFinite(port) && port > 0) {
        return {
          port,
          statePath
        };
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Fake Linear server did not start.");
}

afterEach(async () => {
  for (const processHandle of activeProcesses.splice(0)) {
    if (!processHandle.killed) {
      processHandle.kill("SIGTERM");
    }
  }

  await Promise.all(
    tempDirectories.splice(0).map((directory) =>
      fs.rm(directory, { recursive: true, force: true })
    )
  );
});

describe.skipIf(!existsSync(guardPath))("symphony gh guard", () => {
  it("triggers OpenReview after PR edits when the current head has not been reviewed", async () => {
    const directory = await createTempDirectory("property-search-gh-guard-");
    const bodyFile = await createPrBodyFile(directory);
    const { scriptPath, statePath } = await createFakeGh(directory, {
      pr: {
        headRefOid: "abc123",
        number: 11
      }
    });

    const result = runGuard(
      ["pr", "edit", "11", "--title", "RAJ-23: Validate Symphony OpenReview and Linear PR loop", "--body-file", bodyFile],
      {
        FAKE_GH_STATE_PATH: statePath,
        SYMPHONY_OPENREVIEW_APP_SLUG: "openreview-property-search",
        SYMPHONY_OPENREVIEW_TRIGGER_COMMENT:
          "@openreview-property-search please review this PR end to end and leave your findings as a GitHub review comment.",
        SYMPHONY_REAL_GH: scriptPath
      }
    );

    expect(result.status, result.stderr).toBe(0);

    const state = JSON.parse(await fs.readFile(statePath, "utf8")) as FakeGhState;
    expect(state.prCommentsPosted).toEqual([
      {
        body: "@openreview-property-search please review this PR end to end and leave your findings as a GitHub review comment.",
        number: "11"
      }
    ]);
  });

  it("blocks merge while current-head OpenReview is still pending", async () => {
    const directory = await createTempDirectory("property-search-gh-guard-");
    const headCommitAt = isoMinutesAgo(2);
    const triggerCommentAt = isoMinutesAgo(1);
    const { scriptPath, statePath } = await createFakeGh(directory, {
      commitDate: headCommitAt,
      issueComments: [
        {
          body: "@openreview-property-search please review this PR end to end and leave your findings as a GitHub review comment.",
          created_at: triggerCommentAt
        }
      ],
      pr: {
        body: [
          "## Summary",
          "",
          "- Disposable validation PR.",
          "",
          "## Validation",
          "",
          "- pnpm test -- --run tests/symphony-gh-guard.test.ts",
          "",
          "## Risks / Follow-ups",
          "",
          "- None.",
          "",
          "## Links",
          "",
          "- Linear: https://linear.app/rajeevs-experiments/issue/RAJ-23/validate-symphony-openreview-and-linear-pr-loop",
          "- Docs or artifacts: .symphony/bin/gh"
        ].join("\n"),
        headRefName: "rajeevsgill/raj-23-validate-symphony-openreview-and-linear-pr-loop",
        headRefOid: "abc123",
        mergeStateStatus: "CLEAN",
        mergeable: "MERGEABLE",
        mergedAt: null,
        number: 11,
        reviewDecision: "",
        title: "RAJ-23: Validate Symphony OpenReview and Linear PR loop",
        url: "https://github.com/Rajeev-SG/property-search/pull/11"
      }
    });

    const result = runGuard(["pr", "merge", "11", "--delete-branch"], {
      FAKE_GH_STATE_PATH: statePath,
      SYMPHONY_OPENREVIEW_TIMEOUT_MS: "600000",
      SYMPHONY_OPENREVIEW_APP_SLUG: "openreview-property-search",
      SYMPHONY_OPENREVIEW_TRIGGER_COMMENT:
        "@openreview-property-search please review this PR end to end and leave your findings as a GitHub review comment.",
      SYMPHONY_REAL_GH: scriptPath
    });

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain("OpenReview is still reviewing the current PR head.");

    const state = JSON.parse(await fs.readFile(statePath, "utf8")) as FakeGhState;
    expect(state.merged).toBe(false);
  });

  it("posts the final Linear completion comment after a successful merge", async () => {
    const directory = await createTempDirectory("property-search-gh-guard-");
    const linearServer = await startFakeLinearServer(directory);

    const { scriptPath, statePath } = await createFakeGh(directory, {
      pr: {
        body: [
          "## Summary",
          "",
          "- Disposable validation PR.",
          "",
          "## Validation",
          "",
          "- pnpm run doctor",
          "- pnpm typecheck",
          "",
          "## Risks / Follow-ups",
          "",
          "- None.",
          "",
          "## Links",
          "",
          "- Linear: https://linear.app/rajeevs-experiments/issue/RAJ-23/validate-symphony-openreview-and-linear-pr-loop",
          "- Docs or artifacts: docs/TESTING.md"
        ].join("\n"),
        headRefName: "rajeevsgill/raj-23-validate-symphony-openreview-and-linear-pr-loop",
        headRefOid: "abc123",
        mergeStateStatus: "CLEAN",
        mergeable: "MERGEABLE",
        mergedAt: null,
        number: 11,
        reviewDecision: "",
        title: "RAJ-23: Validate Symphony OpenReview and Linear PR loop",
        url: "https://github.com/Rajeev-SG/property-search/pull/11"
      },
      requiredChecks: [
        {
          link: "https://github.com/Rajeev-SG/property-search/actions/runs/1",
          name: "validate",
          state: "SUCCESS",
          workflow: "CI"
        }
      ]
    });

    const result = runGuard(["pr", "merge", "11", "--delete-branch"], {
      FAKE_GH_STATE_PATH: statePath,
      LINEAR_API_KEY: "test-linear-key",
      SYMPHONY_ISSUE_ID: "RAJ-23",
      SYMPHONY_LINEAR_ENDPOINT: `http://127.0.0.1:${linearServer.port}/graphql`,
      SYMPHONY_OPENREVIEW_APP_SLUG: "",
      SYMPHONY_OPENREVIEW_TRIGGER_COMMENT: "",
      SYMPHONY_REAL_GH: scriptPath
    });

    expect(result.status, result.stderr).toBe(0);
    const linearState = JSON.parse(await fs.readFile(linearServer.statePath, "utf8")) as {
      requests: Array<{ authorization?: string; body: string }>;
    };
    expect(linearState.requests).toHaveLength(1);
    expect(linearState.requests[0]?.authorization).toBe("test-linear-key");

    const payload = JSON.parse(linearState.requests[0]!.body) as {
      query: string;
      variables: { body: string; issueId: string };
    };
    expect(payload.query).toContain("commentCreate");
    expect(payload.variables.issueId).toBe("RAJ-23");
    expect(payload.variables.body).toContain("Unattended handoff completed.");
    expect(payload.variables.body).toContain("https://github.com/Rajeev-SG/property-search/pull/11");
    expect(payload.variables.body).toContain("- pnpm run doctor");
    expect(payload.variables.body).toContain("- validate — SUCCESS");
  });
});
