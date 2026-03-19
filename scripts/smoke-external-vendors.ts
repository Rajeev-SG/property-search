import fs from "node:fs";
import path from "node:path";

function loadEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const entries: Record<string, string> = {};

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    entries[key] = value;
  }

  return entries;
}

function env(name: string, envMap: Record<string, string>): string | undefined {
  return process.env[name] || envMap[name];
}

function normalizeOpenRouterModel(model: string): string {
  if (model === "glm-5") {
    return "z-ai/glm-5";
  }

  return model;
}

function ok(name: string, detail: string) {
  console.log(`✅ ${name}: ${detail}`);
}

function warn(name: string, detail: string) {
  console.log(`⚠️  ${name}: ${detail}`);
}

function fail(name: string, detail: string) {
  console.log(`❌ ${name}: ${detail}`);
}

async function parseJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function testOpenRouter(envMap: Record<string, string>) {
  const apiKey = env("OPENROUTER_API_KEY", envMap);
  const model = normalizeOpenRouterModel(
    env("OPENROUTER_MODEL", envMap) || env("BROWSER_USE_MODEL", envMap) || "glm-5"
  );

  if (!apiKey) {
    warn("openrouter", "OPENROUTER_API_KEY not set; skipping");
    return;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      max_tokens: 20,
      messages: [{ role: "user", content: "Reply with the single word OK." }]
    })
  });

  const body = await parseJson(response);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${JSON.stringify(body)}`);
  }

  ok("openrouter", `chat completion succeeded with model ${model}`);
}

async function testFirecrawl(envMap: Record<string, string>) {
  const apiKey = env("FIRECRAWL_API_KEY", envMap);
  if (!apiKey) {
    warn("firecrawl", "FIRECRAWL_API_KEY not set; skipping");
    return;
  }

  const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url: "https://example.com",
      formats: ["markdown"]
    })
  });

  const body = await parseJson(response);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${JSON.stringify(body)}`);
  }

  ok("firecrawl", "scrape request succeeded");
}

async function testCloudflare(envMap: Record<string, string>) {
  const accountId = env("CLOUDFLARE_ACCOUNT_ID", envMap);
  const apiToken = env("CLOUDFLARE_API_TOKEN", envMap);

  if (!accountId || !apiToken) {
    warn("cloudflare", "CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN missing; skipping");
    return;
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/content`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: "https://example.com"
      })
    }
  );

  const body = await parseJson(response);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${JSON.stringify(body)}`);
  }

  ok("cloudflare", "browser rendering content request succeeded");
}

async function testBrightData(envMap: Record<string, string>) {
  const apiKey = env("BRIGHTDATA_API_KEY", envMap);
  if (!apiKey) {
    warn("brightdata", "BRIGHTDATA_API_KEY not set; skipping");
    return;
  }

  const response = await fetch("https://api.brightdata.com/zone/get_active_zones", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`
    }
  });

  const body = await parseJson(response);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${JSON.stringify(body)}`);
  }

  ok("brightdata", "active zones request succeeded");
}

export async function runVendorSmokeTests() {
  const envMap = loadEnvFile(path.join(process.cwd(), ".env"));
  let failures = 0;

  const checks: Array<[string, () => Promise<void>]> = [
    ["openrouter", () => testOpenRouter(envMap)],
    ["firecrawl", () => testFirecrawl(envMap)],
    ["cloudflare", () => testCloudflare(envMap)],
    ["brightdata", () => testBrightData(envMap)]
  ];

  for (const [name, run] of checks) {
    try {
      await run();
    } catch (error) {
      failures += 1;
      const detail = error instanceof Error ? error.message : String(error);
      fail(name, detail);
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
    console.log(`\nVendor smoke tests completed with ${failures} failure(s).`);
    return;
  }

  console.log("\nVendor smoke tests completed successfully.");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  void runVendorSmokeTests();
}
