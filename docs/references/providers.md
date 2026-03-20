# Provider notes

## Runtime contract

Ticket `006` defines six internal provider roles:
- `discovery`
- `staticFetch`
- `render`
- `schemaExtraction`
- `browserAutomation`
- `escalation`

Each role has:
- a configured provider name from `.env` / `.env.example`
- a stable request/response interface used by the pipeline
- a deterministic fake implementation for tests and local harness work

`PROVIDER_EXECUTION_MODE=fake` is the repo default. In this mode the registry still reports the configured vendor name, but execution stays on checked-in fake providers so tests do not require live credentials.

`PROVIDER_EXECUTION_MODE=auto` may switch a role to a live implementation only when:
- the selected provider has the required credentials
- the codebase has registered a live factory for that exact role/provider pair

If either condition is missing, the registry falls back to the fake implementation and exposes the reason through the provider summary.

## Firecrawl
Role coverage:
- `discovery`
- `render`
- `schemaExtraction`

Credential expectations:
- `FIRECRAWL_API_KEY`

Use for:
- broad site discovery
- crawl jobs
- markdown/html extraction
- structured extraction once live factories are implemented

Official docs:
- `https://docs.firecrawl.dev/introduction`

Current note:
- The repo currently wires Firecrawl through the provider abstraction only. Live Firecrawl calls are deferred to later tickets; fake Firecrawl providers preserve the contract meanwhile.

## Cloudflare Browser Rendering
Role coverage:
- `discovery`
- `render`
- `schemaExtraction`

Credential expectations:
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Use for:
- rendered HTML fetch
- structured JSON extraction with schema
- optional custom worker/browser flows later

Official docs:
- `https://developers.cloudflare.com/browser-rendering/`
- `https://developers.cloudflare.com/browser-rendering/rest-api/content-endpoint/`
- `https://developers.cloudflare.com/browser-rendering/rest-api/crawl-endpoint/`

Current note:
- Browser Rendering documents rendered HTML capture and crawl endpoints, with explicit notes that requests self-identify as bots and cannot bypass bot protection.

## browser-use
Role coverage:
- `browserAutomation`

Credential expectations:
- `OPENROUTER_API_KEY`

Use for:
- interactive browser automation when fetch/render APIs are insufficient
- multi-step recovery flows such as clicks, form entry, and stateful navigation
- a portable automation layer that can be driven with an OpenAI-compatible model endpoint

Official docs:
- `https://github.com/browser-use/browser-use`
- `https://docs.browser-use.com/supported-models`

Current note:
- Browser-use documents OpenRouter usage through an OpenAI-compatible base URL and model configuration. In this repo, the default harness assumption remains OpenRouter with GLM-5, using the provider model ID `z-ai/glm-5`.

## Bright Data
Role coverage:
- `escalation`

Credential expectations:
- `BRIGHTDATA_API_KEY`
- `BRIGHTDATA_ZONE`

Use for:
- escalation on hard targets
- managed rendering / unblock / anti-bot handling
- provider fallback where first-pass crawling fails repeatedly

Official docs:
- `https://docs.brightdata.com/api-reference/authentication`

Current note:
- Keep Bright Data optional in the local thin slice. The fake escalation provider preserves the contract and next-action output for tests.

## Direct HTTP
Role coverage:
- `staticFetch`

Credential expectations:
- none

Current note:
- Static fetch starts as a deterministic direct HTTP role in the abstraction layer. The fake implementation keeps artifact-path and evidence behavior stable for local tests.
- Ticket `008` now consumes the static-fetch and render role responses through a shared fetch pipeline that expects provider calls to return response content plus attribution metadata so the pipeline can persist replayable artifacts on disk.

## Typesense
Use locally for search indexing and faceting in v1.

Official docs:
- `https://typesense.org/docs/guide/install-typesense.html`

Current note:
- Typesense documents local install and official Docker usage suitable for this repo’s local-only search layer.
