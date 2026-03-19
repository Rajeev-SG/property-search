# Provider notes
 
 ## Firecrawl
 Use for:
 - broad site discovery
 - crawl jobs
 - markdown/html extraction
 - MCP access from coding tools

 Official docs:
 - `https://docs.firecrawl.dev/introduction`

 Current note:
 - Firecrawl documents scrape and crawl flows that can return markdown, HTML, and structured outputs.

 ## Cloudflare Browser Rendering
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
 Use for:
 - interactive browser automation when fetch/render APIs are insufficient
 - multi-step recovery flows such as clicks, form entry, and stateful navigation
 - a portable automation layer that can be driven with an OpenAI-compatible model endpoint

 Official docs:
 - `https://github.com/browser-use/browser-use`
 - `https://docs.browser-use.com/supported-models`

 Current note:
 - Browser-use documents OpenRouter usage through an OpenAI-compatible base URL and model configuration. In this repo, the default harness assumption should be OpenRouter with GLM-5, using the provider model ID `z-ai/glm-5` in requests.

 ## Bright Data
 Use for:
 - escalation on hard targets
 - managed rendering / unblock / anti-bot handling
 - provider fallback where first-pass crawling fails repeatedly

 Official docs:
 - `https://docs.brightdata.com/api-reference/authentication`

 Current note:
 - Keep Bright Data as the optional escalation provider in v1 planning; do not make it mandatory for the local thin slice.

 ## Typesense
 Use locally for search indexing and faceting in v1.

 Official docs:
 - `https://typesense.org/docs/guide/install-typesense.html`

 Current note:
 - Typesense documents local install and official Docker usage suitable for this repo’s local-only search layer.
