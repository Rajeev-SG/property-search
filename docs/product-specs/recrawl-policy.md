# Recrawl policy

## v1 defaults

- profile each new domain once
- recrawl active domains every 24 hours
- re-fetch recently changed detail pages first
- prioritize sitemap and known listing/detail patterns
- keep an allowlist of successful detail URL patterns per domain

## Future refinements

- change-rate based recrawl intervals
- adaptive backoff on low-yield domains
- portal / agent change detection
