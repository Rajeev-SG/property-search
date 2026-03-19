# 006 — Provider abstraction and config wiring

## Objective

- Fresh-session start: first inspect `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `AGENTS.md`, `README.md`, and this ticket.
- Build the provider abstraction and configuration layer so crawl, render, and escalation logic can be implemented against stable internal interfaces rather than provider-specific coupling.
- If this ticket is already complete, mark it `done` and continue.

## Scope

- Define provider interfaces for discovery, static fetch, rendered fetch, schema-guided extraction, and escalation.
- Reconcile current placeholder provider types with the actual architecture.
- Wire provider selection to `.env` configuration and documented defaults.
- Add safe local stubs or fakes for testing without live credentials.
- Update provider docs with the implementation contract and continue from any partial interface work already in the repo.

## Files to touch

- `packages/crawl/**`
- `packages/extract/**`
- `packages/**`
- `scripts/**`
- `apps/cli/**`
- `.env.example`
- `ARCHITECTURE.md`
- `docs/design-docs/provider-escalation.md`
- `docs/references/providers.md`
- `docs/references/mcp-setup.md`
- `docs/PROJECT_STATUS.md`
- `docs/TICKET_INDEX.md`

## Constraints

- Keep local-first execution.
- Do not hardcode API keys or secrets.
- Do not assume live provider access in tests.
- Preserve a single internal pipeline regardless of upstream provider.
- Document capability gaps and fallback behavior explicitly.
- Keep the repo agent-legible and deterministic.

## Acceptance criteria

- Internal provider interfaces cover the documented crawl/render/extraction responsibilities.
- Configuration defaults are read from repo-managed env/config locations.
- Tests can exercise the abstraction without requiring live provider credentials.
- Provider docs accurately describe how the abstraction should be used by later tickets.

## Test plan

- Run `pnpm typecheck`.
- Run `pnpm test`.
- Run any new provider smoke tests using fake/stub implementations.
- Manually verify `.env.example` and provider docs stay aligned.

## Rollback notes

- Revert interface/config changes and provider docs together if later tickets cannot compile or resolve providers correctly.
- If environment variable names change, restore previous names or document a migration path before rollback.

## Dependencies

- `002`
- `003`
- `005`

## Deliverables

- Stable provider abstraction interfaces.
- Config wiring for provider defaults.
- Testable fake/stub provider path.
- Updated provider reference docs.

## Status update instructions

- Mark Ticket `006` active and `in_progress` when starting.
- If acceptance criteria are already met, mark the ticket `done`, record the evidence, and advance.
- If partial interfaces already exist, extend them instead of rewriting them wholesale and note the reuse.
- If blocked by unresolved provider capability assumptions, document the exact assumption and recommended next move in `docs/PROJECT_STATUS.md`.
- On completion, update `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, `docs/DEVELOPMENT_LOG.md`, and stale provider docs.

## Human instructions (if any)

- No human action is required for abstraction work itself.
- Do not add live provider credentials until a later ticket explicitly needs them.
