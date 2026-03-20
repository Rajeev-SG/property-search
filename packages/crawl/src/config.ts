import fs from "node:fs";
import path from "node:path";
import {
  browserAutomationProviderNames,
  discoveryProviderNames,
  escalationProviderNames,
  providerExecutionModes,
  renderProviderNames,
  schemaExtractionProviderNames,
  staticFetchProviderNames,
  type BrowserAutomationProviderName,
  type DiscoveryProviderName,
  type EscalationProviderName,
  type ProviderCredentialKey,
  type ProviderExecutionMode,
  type RenderProviderName,
  type SchemaExtractionProviderName,
  type StaticFetchProviderName
} from "./provider.js";

const DEFAULT_ENV_FILES = [".env.example", ".env"] as const;

export interface ProviderDefaults {
  browserAutomation: BrowserAutomationProviderName;
  discovery: DiscoveryProviderName;
  escalation: EscalationProviderName;
  render: RenderProviderName;
  schemaExtraction: SchemaExtractionProviderName;
  staticFetch: StaticFetchProviderName;
}

export interface ProviderCredentialAvailability {
  brightDataApiKey: boolean;
  brightDataBrowserWs: boolean;
  brightDataZone: boolean;
  cloudflareAccountId: boolean;
  cloudflareApiToken: boolean;
  firecrawlApiKey: boolean;
  openRouterApiKey: boolean;
}

export interface ProviderModelConfig {
  browserUseBaseUrl: string;
  browserUseModel: string;
  extractModel: string;
  openRouterModel: string;
  reviewModel: string;
}

export interface ProviderConfig {
  artifactRoot: string;
  credentials: ProviderCredentialAvailability;
  defaultMaxPagesPerSite: number;
  defaultRecrawlHours: number;
  defaults: ProviderDefaults;
  envFilesRead: string[];
  executionMode: ProviderExecutionMode;
  models: ProviderModelConfig;
  respectRobots: boolean;
}

export interface ProviderEnvironment {
  filesRead: string[];
  values: Record<string, string>;
}

export interface ProviderConfigOptions {
  env?: Record<string, string | undefined>;
  includeProcessEnv?: boolean;
  repoRoot?: string;
}

function readEnvFile(filePath: string) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const parsed: Record<string, string> = {};
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const normalized = line.startsWith("export ") ? line.slice(7) : line;
    const separatorIndex = normalized.indexOf("=");
    if (separatorIndex < 1) {
      continue;
    }

    const key = normalized.slice(0, separatorIndex).trim();
    let value = normalized.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

export function loadProviderEnvironment(options: ProviderConfigOptions = {}): ProviderEnvironment {
  const repoRoot = options.repoRoot ?? process.cwd();
  const values: Record<string, string> = {};
  const filesRead: string[] = [];

  for (const relativePath of DEFAULT_ENV_FILES) {
    const absolutePath = path.join(repoRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    Object.assign(values, readEnvFile(absolutePath));
    filesRead.push(relativePath);
  }

  if (options.includeProcessEnv ?? true) {
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        values[key] = value;
      }
    }
  }

  if (options.env) {
    for (const [key, value] of Object.entries(options.env)) {
      if (value !== undefined) {
        values[key] = value;
      }
    }
  }

  return {
    filesRead,
    values
  };
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined || value === "") {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  throw new Error(`Invalid boolean value "${value}"`);
}

function parseInteger(value: string | undefined, fallback: number, envName: string) {
  if (value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid integer for ${envName}: "${value}"`);
  }

  return parsed;
}

function pickExecutionMode(value: string | undefined) {
  return pickProvider(
    "PROVIDER_EXECUTION_MODE",
    value,
    providerExecutionModes,
    "fake"
  );
}

function pickProvider<TName extends string>(
  envName: string,
  value: string | undefined,
  allowed: readonly TName[],
  fallback: TName
) {
  const resolved = (value && value.trim()) || fallback;
  if (!allowed.includes(resolved as TName)) {
    throw new Error(
      `Invalid ${envName} value "${resolved}". Allowed values: ${allowed.join(", ")}`
    );
  }

  return resolved as TName;
}

export function resolveProviderConfig(options: ProviderConfigOptions = {}): ProviderConfig {
  const environment = loadProviderEnvironment(options);
  const env = environment.values;
  const credentials: ProviderCredentialAvailability = {
    brightDataApiKey: Boolean(env.BRIGHTDATA_API_KEY),
    brightDataBrowserWs: Boolean(env.BRIGHTDATA_BROWSER_WS),
    brightDataZone: Boolean(env.BRIGHTDATA_ZONE),
    cloudflareAccountId: Boolean(env.CLOUDFLARE_ACCOUNT_ID),
    cloudflareApiToken: Boolean(env.CLOUDFLARE_API_TOKEN),
    firecrawlApiKey: Boolean(env.FIRECRAWL_API_KEY),
    openRouterApiKey: Boolean(env.OPENROUTER_API_KEY)
  };

  return {
    artifactRoot: env.ARTIFACT_ROOT || "./artifacts",
    credentials,
    defaultMaxPagesPerSite: parseInteger(
      env.DEFAULT_MAX_PAGES_PER_SITE,
      500,
      "DEFAULT_MAX_PAGES_PER_SITE"
    ),
    defaultRecrawlHours: parseInteger(
      env.DEFAULT_RECRAWL_HOURS,
      24,
      "DEFAULT_RECRAWL_HOURS"
    ),
    defaults: {
      browserAutomation: pickProvider(
        "DEFAULT_BROWSER_AUTOMATION_PROVIDER",
        env.DEFAULT_BROWSER_AUTOMATION_PROVIDER,
        browserAutomationProviderNames,
        "browseruse"
      ),
      discovery: pickProvider(
        "DEFAULT_DISCOVERY_PROVIDER",
        env.DEFAULT_DISCOVERY_PROVIDER,
        discoveryProviderNames,
        "firecrawl"
      ),
      escalation: pickProvider(
        "DEFAULT_ESCALATION_PROVIDER",
        env.DEFAULT_ESCALATION_PROVIDER,
        escalationProviderNames,
        "brightdata"
      ),
      render: pickProvider(
        "DEFAULT_RENDER_PROVIDER",
        env.DEFAULT_RENDER_PROVIDER,
        renderProviderNames,
        "cloudflare"
      ),
      schemaExtraction: pickProvider(
        "DEFAULT_SCHEMA_EXTRACTION_PROVIDER",
        env.DEFAULT_SCHEMA_EXTRACTION_PROVIDER,
        schemaExtractionProviderNames,
        "cloudflare"
      ),
      staticFetch: pickProvider(
        "DEFAULT_STATIC_FETCH_PROVIDER",
        env.DEFAULT_STATIC_FETCH_PROVIDER,
        staticFetchProviderNames,
        "direct"
      )
    },
    envFilesRead: environment.filesRead,
    executionMode: pickExecutionMode(env.PROVIDER_EXECUTION_MODE),
    models: {
      browserUseBaseUrl:
        env.BROWSER_USE_OPENAI_COMPATIBLE_BASE_URL || "https://openrouter.ai/api/v1",
      browserUseModel:
        env.BROWSER_USE_MODEL || env.OPENROUTER_MODEL || env.OPENROUTER_MODEL_EXTRACT || "z-ai/glm-5",
      extractModel:
        env.OPENROUTER_MODEL_EXTRACT || env.OPENROUTER_MODEL || env.BROWSER_USE_MODEL || "z-ai/glm-5",
      openRouterModel: env.OPENROUTER_MODEL || env.BROWSER_USE_MODEL || "z-ai/glm-5",
      reviewModel:
        env.OPENROUTER_MODEL_REVIEW || env.OPENROUTER_MODEL || env.BROWSER_USE_MODEL || "z-ai/glm-5"
    },
    respectRobots: parseBoolean(env.RESPECT_ROBOTS, true)
  };
}
