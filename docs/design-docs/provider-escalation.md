# Provider escalation

## Default
Try the cheapest path first.

The repo now resolves providers in two layers:
- configured provider name per role, from `.env` / `.env.example`
- runtime implementation, which is `fake` by default for local deterministic tests and can become `live` only when `PROVIDER_EXECUTION_MODE=auto`, credentials exist, and a live factory is registered for that role

## Escalation order
1. static fetch / existing saved HTML
2. Firecrawl or Cloudflare rendered fetch
3. browser-use with OpenRouter `glm-5` for interactive browser automation or recovery
4. Bright Data scraping/browser capability

## Escalate when
- page requires JS rendering
- provider returns blocked/challenge result
- listing extraction repeatedly fails due to missing rendered content
- the site flow requires interactive clicks, form entry, or multi-step browser state

## Notes for later tickets
- Ticket `006` intentionally stops at the abstraction and config layer. The fake providers preserve stable request/response contracts and deterministic artifact paths without requiring live vendor access.
- When live providers are added, they should register against the existing role/name contracts rather than changing pipeline stage APIs.
