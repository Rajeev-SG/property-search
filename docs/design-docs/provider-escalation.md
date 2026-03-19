# Provider escalation

## Default
Try the cheapest path first.

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
