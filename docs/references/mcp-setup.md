# MCP setup notes

## Codex
Codex can run as an MCP server. See `.codex/config.toml.example` for a starter template.

## Firecrawl
Recommended for web scraping access from agents:
- hosted MCP endpoint
- local `npx`-based server

Reference docs:
- `https://docs.firecrawl.dev/introduction`

## browser-use
Treat this as an external browser-automation vendor capability rather than an MCP dependency for this repo.

Repo-default assumptions:
- model provider: OpenRouter
- default model: GLM-5 via OpenRouter model ID `z-ai/glm-5`
- OpenAI-compatible base URL: `https://openrouter.ai/api/v1`

Reference docs:
- `https://github.com/browser-use/browser-use`
- `https://docs.browser-use.com/supported-models`

## Playwright
Prefer CLI + SKILLS for coding-agent workflows when browser automation is needed.
Use MCP only when that fits the surrounding toolchain better.

## Cloudflare Browser Rendering
Use official Browser Rendering docs when implementing rendered fetch or crawl provider paths:
- `https://developers.cloudflare.com/browser-rendering/`
