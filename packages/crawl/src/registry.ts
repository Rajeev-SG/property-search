import { resolveProviderConfig, type ProviderConfig, type ProviderConfigOptions } from "./config.js";
import {
  createFakeBrowserAutomationProvider,
  createFakeDiscoveryProvider,
  createFakeEscalationProvider,
  createFakeRenderProvider,
  createFakeSchemaExtractionProvider,
  createFakeStaticFetchProvider
} from "./fakes.js";
import type {
  BrowserAutomationProvider,
  BrowserAutomationProviderName,
  DiscoveryProvider,
  DiscoveryProviderName,
  EscalationProvider,
  EscalationProviderName,
  ProviderCatalogEntry,
  ProviderCredentialKey,
  ProviderDescriptor,
  ProviderImplementation,
  ProviderRole,
  ProviderExecutionMode,
  RenderProvider,
  RenderProviderName,
  SchemaExtractionProvider,
  SchemaExtractionProviderName,
  StaticFetchProvider,
  StaticFetchProviderName
} from "./provider.js";

export interface ProviderRegistry {
  browserAutomation: BrowserAutomationProvider;
  config: ProviderConfig;
  discovery: DiscoveryProvider;
  escalation: EscalationProvider;
  render: RenderProvider;
  resolution: ProviderResolutionMap;
  schemaExtraction: SchemaExtractionProvider;
  staticFetch: StaticFetchProvider;
}

export interface ProviderResolution<TName extends string, TRole extends ProviderRole> {
  configuredProvider: TName;
  displayName: string;
  implementation: ProviderImplementation;
  missingCredentials: ProviderCredentialKey[];
  requiredCredentials: readonly ProviderCredentialKey[];
  role: TRole;
  runtimeMessage?: string;
}

export interface ProviderResolutionMap {
  browserAutomation: ProviderResolution<BrowserAutomationProviderName, "browserAutomation">;
  discovery: ProviderResolution<DiscoveryProviderName, "discovery">;
  escalation: ProviderResolution<EscalationProviderName, "escalation">;
  render: ProviderResolution<RenderProviderName, "render">;
  schemaExtraction: ProviderResolution<SchemaExtractionProviderName, "schemaExtraction">;
  staticFetch: ProviderResolution<StaticFetchProviderName, "staticFetch">;
}

type ProviderFactories = {
  browserAutomation: Record<
    BrowserAutomationProviderName,
    {
      fake: ProviderFactory<BrowserAutomationProvider, BrowserAutomationProviderName, "browserAutomation">;
      live?: ProviderFactory<BrowserAutomationProvider, BrowserAutomationProviderName, "browserAutomation">;
    }
  >;
  discovery: Record<
    DiscoveryProviderName,
    {
      fake: ProviderFactory<DiscoveryProvider, DiscoveryProviderName, "discovery">;
      live?: ProviderFactory<DiscoveryProvider, DiscoveryProviderName, "discovery">;
    }
  >;
  escalation: Record<
    EscalationProviderName,
    {
      fake: ProviderFactory<EscalationProvider, EscalationProviderName, "escalation">;
      live?: ProviderFactory<EscalationProvider, EscalationProviderName, "escalation">;
    }
  >;
  render: Record<
    RenderProviderName,
    {
      fake: ProviderFactory<RenderProvider, RenderProviderName, "render">;
      live?: ProviderFactory<RenderProvider, RenderProviderName, "render">;
    }
  >;
  schemaExtraction: Record<
    SchemaExtractionProviderName,
    {
      fake: ProviderFactory<
        SchemaExtractionProvider,
        SchemaExtractionProviderName,
        "schemaExtraction"
      >;
      live?: ProviderFactory<
        SchemaExtractionProvider,
        SchemaExtractionProviderName,
        "schemaExtraction"
      >;
    }
  >;
  staticFetch: Record<
    StaticFetchProviderName,
    {
      fake: ProviderFactory<StaticFetchProvider, StaticFetchProviderName, "staticFetch">;
      live?: ProviderFactory<StaticFetchProvider, StaticFetchProviderName, "staticFetch">;
    }
  >;
};

type ProviderFactory<TProvider, TName extends string, TRole extends ProviderRole> = (context: {
  config: ProviderConfig;
  resolution: ProviderResolution<TName, TRole>;
}) => TProvider;

export interface ProviderRegistryOptions extends ProviderConfigOptions {
  liveFactories?: PartialLiveProviderFactories;
}

export type PartialLiveProviderFactories = {
  browserAutomation?: Partial<
    Record<
      BrowserAutomationProviderName,
      ProviderFactory<BrowserAutomationProvider, BrowserAutomationProviderName, "browserAutomation">
    >
  >;
  discovery?: Partial<
    Record<
      DiscoveryProviderName,
      ProviderFactory<DiscoveryProvider, DiscoveryProviderName, "discovery">
    >
  >;
  escalation?: Partial<
    Record<
      EscalationProviderName,
      ProviderFactory<EscalationProvider, EscalationProviderName, "escalation">
    >
  >;
  render?: Partial<
    Record<RenderProviderName, ProviderFactory<RenderProvider, RenderProviderName, "render">>
  >;
  schemaExtraction?: Partial<
    Record<
      SchemaExtractionProviderName,
      ProviderFactory<SchemaExtractionProvider, SchemaExtractionProviderName, "schemaExtraction">
    >
  >;
  staticFetch?: Partial<
    Record<
      StaticFetchProviderName,
      ProviderFactory<StaticFetchProvider, StaticFetchProviderName, "staticFetch">
    >
  >;
};

export const providerCatalog = {
  browserAutomation: {
    browseruse: {
      displayName: "browser-use",
      name: "browseruse",
      requiredCredentials: ["openRouterApiKey"],
      role: "browserAutomation"
    },
    none: {
      displayName: "None",
      name: "none",
      requiredCredentials: [],
      role: "browserAutomation"
    }
  },
  discovery: {
    cloudflare: {
      displayName: "Cloudflare Browser Rendering",
      name: "cloudflare",
      requiredCredentials: ["cloudflareAccountId", "cloudflareApiToken"],
      role: "discovery"
    },
    firecrawl: {
      displayName: "Firecrawl",
      name: "firecrawl",
      requiredCredentials: ["firecrawlApiKey"],
      role: "discovery"
    },
    none: {
      displayName: "None",
      name: "none",
      requiredCredentials: [],
      role: "discovery"
    }
  },
  escalation: {
    brightdata: {
      displayName: "Bright Data",
      name: "brightdata",
      requiredCredentials: ["brightDataApiKey", "brightDataZone"],
      role: "escalation"
    },
    none: {
      displayName: "None",
      name: "none",
      requiredCredentials: [],
      role: "escalation"
    }
  },
  render: {
    cloudflare: {
      displayName: "Cloudflare Browser Rendering",
      name: "cloudflare",
      requiredCredentials: ["cloudflareAccountId", "cloudflareApiToken"],
      role: "render"
    },
    firecrawl: {
      displayName: "Firecrawl",
      name: "firecrawl",
      requiredCredentials: ["firecrawlApiKey"],
      role: "render"
    },
    none: {
      displayName: "None",
      name: "none",
      requiredCredentials: [],
      role: "render"
    }
  },
  schemaExtraction: {
    cloudflare: {
      displayName: "Cloudflare Browser Rendering",
      name: "cloudflare",
      requiredCredentials: ["cloudflareAccountId", "cloudflareApiToken"],
      role: "schemaExtraction"
    },
    firecrawl: {
      displayName: "Firecrawl",
      name: "firecrawl",
      requiredCredentials: ["firecrawlApiKey"],
      role: "schemaExtraction"
    },
    none: {
      displayName: "None",
      name: "none",
      requiredCredentials: [],
      role: "schemaExtraction"
    }
  },
  staticFetch: {
    direct: {
      displayName: "Direct HTTP",
      name: "direct",
      requiredCredentials: [],
      role: "staticFetch"
    }
  }
} as const satisfies {
  browserAutomation: Record<
    BrowserAutomationProviderName,
    ProviderCatalogEntry<BrowserAutomationProviderName, "browserAutomation">
  >;
  discovery: Record<
    DiscoveryProviderName,
    ProviderCatalogEntry<DiscoveryProviderName, "discovery">
  >;
  escalation: Record<
    EscalationProviderName,
    ProviderCatalogEntry<EscalationProviderName, "escalation">
  >;
  render: Record<RenderProviderName, ProviderCatalogEntry<RenderProviderName, "render">>;
  schemaExtraction: Record<
    SchemaExtractionProviderName,
    ProviderCatalogEntry<SchemaExtractionProviderName, "schemaExtraction">
  >;
  staticFetch: Record<
    StaticFetchProviderName,
    ProviderCatalogEntry<StaticFetchProviderName, "staticFetch">
  >;
};

export function createProviderRegistry(options: ProviderRegistryOptions = {}): ProviderRegistry {
  const config = resolveProviderConfig(options);
  const factories = buildProviderFactories(options.liveFactories);
  const resolution = resolveProviderResolutionMap(config, factories);

  return {
    browserAutomation: createProvider(resolution.browserAutomation, config, factories.browserAutomation),
    config,
    discovery: createProvider(resolution.discovery, config, factories.discovery),
    escalation: createProvider(resolution.escalation, config, factories.escalation),
    render: createProvider(resolution.render, config, factories.render),
    resolution,
    schemaExtraction: createProvider(
      resolution.schemaExtraction,
      config,
      factories.schemaExtraction
    ),
    staticFetch: createProvider(resolution.staticFetch, config, factories.staticFetch)
  };
}

export function summarizeProviderRegistry(registry: ProviderRegistry) {
  return {
    artifactRoot: registry.config.artifactRoot,
    credentialAvailability: registry.config.credentials,
    defaults: registry.config.defaults,
    envFilesRead: registry.config.envFilesRead,
    executionMode: registry.config.executionMode,
    models: registry.config.models,
    providers: summarizeProviderResolutionMap(registry.resolution, registry),
    respectRobots: registry.config.respectRobots
  };
}

function summarizeProviderResolutionMap(
  resolution: ProviderResolutionMap,
  registry: ProviderRegistry
) {
  return {
    browserAutomation: summarizeResolvedProvider(registry.browserAutomation, resolution.browserAutomation),
    discovery: summarizeResolvedProvider(registry.discovery, resolution.discovery),
    escalation: summarizeResolvedProvider(registry.escalation, resolution.escalation),
    render: summarizeResolvedProvider(registry.render, resolution.render),
    schemaExtraction: summarizeResolvedProvider(
      registry.schemaExtraction,
      resolution.schemaExtraction
    ),
    staticFetch: summarizeResolvedProvider(registry.staticFetch, resolution.staticFetch)
  };
}

function summarizeResolvedProvider<
  TProvider extends ProviderDescriptor<string, ProviderRole>,
  TName extends string,
  TRole extends ProviderRole
>(provider: TProvider, resolution: ProviderResolution<TName, TRole>) {
  return {
    configuredProvider: resolution.configuredProvider,
    displayName: resolution.displayName,
    implementation: provider.implementation,
    missingCredentials: resolution.missingCredentials,
    name: provider.name,
    requiredCredentials: resolution.requiredCredentials,
    role: provider.role,
    runtimeMessage: resolution.runtimeMessage
  };
}

function buildProviderFactories(liveFactories: PartialLiveProviderFactories = {}): ProviderFactories {
  return {
    browserAutomation: {
      browseruse: {
        fake: () => createFakeBrowserAutomationProvider("browseruse"),
        live: liveFactories.browserAutomation?.browseruse
      },
      none: {
        fake: () => createFakeBrowserAutomationProvider("none"),
        live: liveFactories.browserAutomation?.none
      }
    },
    discovery: {
      cloudflare: {
        fake: () => createFakeDiscoveryProvider("cloudflare"),
        live: liveFactories.discovery?.cloudflare
      },
      firecrawl: {
        fake: () => createFakeDiscoveryProvider("firecrawl"),
        live: liveFactories.discovery?.firecrawl
      },
      none: {
        fake: () => createFakeDiscoveryProvider("none"),
        live: liveFactories.discovery?.none
      }
    },
    escalation: {
      brightdata: {
        fake: () => createFakeEscalationProvider("brightdata"),
        live: liveFactories.escalation?.brightdata
      },
      none: {
        fake: () => createFakeEscalationProvider("none"),
        live: liveFactories.escalation?.none
      }
    },
    render: {
      cloudflare: {
        fake: () => createFakeRenderProvider("cloudflare"),
        live: liveFactories.render?.cloudflare
      },
      firecrawl: {
        fake: () => createFakeRenderProvider("firecrawl"),
        live: liveFactories.render?.firecrawl
      },
      none: {
        fake: () => createFakeRenderProvider("none"),
        live: liveFactories.render?.none
      }
    },
    schemaExtraction: {
      cloudflare: {
        fake: () => createFakeSchemaExtractionProvider("cloudflare"),
        live: liveFactories.schemaExtraction?.cloudflare
      },
      firecrawl: {
        fake: () => createFakeSchemaExtractionProvider("firecrawl"),
        live: liveFactories.schemaExtraction?.firecrawl
      },
      none: {
        fake: () => createFakeSchemaExtractionProvider("none"),
        live: liveFactories.schemaExtraction?.none
      }
    },
    staticFetch: {
      direct: {
        fake: () => createFakeStaticFetchProvider("direct"),
        live: liveFactories.staticFetch?.direct
      }
    }
  };
}

function resolveProviderResolutionMap(
  config: ProviderConfig,
  factories: ProviderFactories
): ProviderResolutionMap {
  return {
    browserAutomation: resolveProviderResolution(
      config.executionMode,
      config.defaults.browserAutomation,
      config.credentials,
      providerCatalog.browserAutomation[config.defaults.browserAutomation],
      factories.browserAutomation[config.defaults.browserAutomation].live
    ),
    discovery: resolveProviderResolution(
      config.executionMode,
      config.defaults.discovery,
      config.credentials,
      providerCatalog.discovery[config.defaults.discovery],
      factories.discovery[config.defaults.discovery].live
    ),
    escalation: resolveProviderResolution(
      config.executionMode,
      config.defaults.escalation,
      config.credentials,
      providerCatalog.escalation[config.defaults.escalation],
      factories.escalation[config.defaults.escalation].live
    ),
    render: resolveProviderResolution(
      config.executionMode,
      config.defaults.render,
      config.credentials,
      providerCatalog.render[config.defaults.render],
      factories.render[config.defaults.render].live
    ),
    schemaExtraction: resolveProviderResolution(
      config.executionMode,
      config.defaults.schemaExtraction,
      config.credentials,
      providerCatalog.schemaExtraction[config.defaults.schemaExtraction],
      factories.schemaExtraction[config.defaults.schemaExtraction].live
    ),
    staticFetch: resolveProviderResolution(
      config.executionMode,
      config.defaults.staticFetch,
      config.credentials,
      providerCatalog.staticFetch[config.defaults.staticFetch],
      factories.staticFetch[config.defaults.staticFetch].live
    )
  };
}

function resolveProviderResolution<TName extends string, TRole extends ProviderRole>(
  executionMode: ProviderExecutionMode,
  configuredProvider: TName,
  credentials: Record<ProviderCredentialKey, boolean>,
  catalogEntry: ProviderCatalogEntry<TName, TRole>,
  liveFactory?: ProviderFactory<ProviderDescriptor<TName, TRole>, TName, TRole>
): ProviderResolution<TName, TRole> {
  const missingCredentials = catalogEntry.requiredCredentials.filter((key) => !credentials[key]);

  if (executionMode === "auto" && liveFactory && missingCredentials.length === 0) {
    return {
      configuredProvider,
      displayName: catalogEntry.displayName,
      implementation: "live",
      missingCredentials,
      requiredCredentials: catalogEntry.requiredCredentials,
      role: catalogEntry.role
    };
  }

  return {
    configuredProvider,
    displayName: catalogEntry.displayName,
    implementation: "fake",
    missingCredentials,
    requiredCredentials: catalogEntry.requiredCredentials,
    role: catalogEntry.role,
    runtimeMessage: describeFakeFallback(executionMode, catalogEntry.displayName, missingCredentials, Boolean(liveFactory))
  };
}

function describeFakeFallback(
  executionMode: ProviderExecutionMode,
  displayName: string,
  missingCredentials: ProviderCredentialKey[],
  hasLiveFactory: boolean
) {
  if (executionMode === "fake") {
    return `Running ${displayName} in fake mode because PROVIDER_EXECUTION_MODE=fake.`;
  }

  if (missingCredentials.length > 0) {
    const missingCredentialMessage = `credentials are missing: ${missingCredentials.join(", ")}`;
    if (!hasLiveFactory) {
      return `Running ${displayName} in fake mode because no live factory is registered yet and ${missingCredentialMessage}.`;
    }

    return `Running ${displayName} in fake mode because ${missingCredentialMessage}.`;
  }

  if (!hasLiveFactory) {
    return `Running ${displayName} in fake mode because no live factory is registered yet.`;
  }

  return undefined;
}

function createProvider<
  TProvider extends ProviderDescriptor<TName, TRole>,
  TName extends string,
  TRole extends ProviderRole
>(
  resolution: ProviderResolution<TName, TRole>,
  config: ProviderConfig,
  roleFactories: Record<
    TName,
    {
      fake: ProviderFactory<TProvider, TName, TRole>;
      live?: ProviderFactory<TProvider, TName, TRole>;
    }
  >
) {
  const factories = roleFactories[resolution.configuredProvider];
  const factory =
    resolution.implementation === "live" ? (factories.live ?? factories.fake) : factories.fake;

  return factory({
    config,
    resolution
  });
}
