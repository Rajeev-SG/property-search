# 009 — Site profiling and discovery

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Build site profiling that turns normalized source-registry rows into reusable site profiles with robots, sitemap, listing-page, and detail-page discovery evidence.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Implement robots and sitemap discovery.
- Classify candidate listing/search/detail pages and pagination hints.
- Persist site profiles and their evidence/artifacts.
- Use available site hints and source metadata where present.
- Add fixture-backed tests for classification heuristics and continue from partial profiler work if it exists.

## Files to touch

- `packages/crawl/**`
- `packages/**`
- `apps/cli/**`
- `scripts/**`
- `tests/**`
- `data/fixtures/**`
- `docs/design-docs/site-profiling.md`
- `docs/product-specs/recrawl-policy.md`
- `ARCHITECTURE.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Respect robots and record crawl-policy signals.
- Prefer deterministic heuristics before provider-specific hacks.
- Persist enough evidence for later adapter authoring and debugging.
- Keep domain-specific assumptions out of global heuristics unless documented.
- Add tests or fixtures for classification logic.

## Acceptance criteria

- A normalized source entry can be profiled end to end into a persisted site profile.
- The site profile records robots/sitemap signals, candidate listing pages, candidate detail patterns, and pagination hints.
- Fixture-backed tests cover key profiling heuristics.
- Docs explain how profiling output is consumed by later tickets.

## Test plan

- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any new site-profiling CLI or script workflow introduced by the ticket.
- Manually inspect generated site profile artifacts and persisted records for a sample domain.

## Rollback notes

- Revert profiling logic, persistence changes, and related docs together.
- Keep any captured fixtures or evidence if they remain useful for later work.

## Dependencies

- `007`
- `008`

## Deliverables

- Site-profiler implementation.
- Persisted site-profile artifacts/records.
- Tests or fixtures covering discovery heuristics.

## Status update instructions

- Set Ticket `009` active and `in_progress` on start.
- If the profiler already satisfies acceptance criteria, mark it `done`, log the evidence, and continue.
- If partial work exists, continue from it and document what remained.
- If blocked by ambiguous heuristics or robots-policy handling, record the precise blocker and recommended next move in `docs/PROJECT_STATUS.md`.
- On completion, update all status files and any affected profiling or recrawl docs.

## Human instructions (if any)

- No human action is required unless a target domain needs manual policy review.
