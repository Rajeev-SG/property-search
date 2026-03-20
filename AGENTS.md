# AGENTS.md

## Goal

Build a property-search ingestion platform that turns a CSV of estate-agent websites into a normalized property search index.

## Ground rules

- Treat repository docs as the system of record.
- Do not invent hidden rules; update docs when you discover one.
- Prefer deterministic extraction first, schema-constrained LLM extraction second, and site-specific adapters only where needed.
- Record evidence for every extraction.
- Keep changes scoped to the active execution plan or ticket.
- Every significant task must leave behind tests, fixtures, docs, or metrics.

## Where to look first

- `docs/PROJECT_STATUS.md` — current active ticket, blockers, and next move
- `docs/TICKET_INDEX.md` — ordered backlog and dependency graph
- `README.md` — local setup + project intent
- `ARCHITECTURE.md` — system boundaries and flow
- `docs/HARNESS_AUDIT.md` — what was repaired in the seed and what remains deferred
- `docs/product-specs/source-registry.md` — raw seed input vs normalized internal source-registry contract
- `docs/product-specs/canonical-schema.md` — canonical property contract
- `docs/product-specs/adapter-contract.md` — adapter schema and behavior
- `docs/design-docs/extraction-ladder.md` — extraction order of operations
- `docs/backlog/` — ticket-by-ticket execution contracts
- `docs/exec-plans/` — broad phase references
- `docs/QUALITY_SCORE.md` — what “good” means for extraction quality
- `docs/TESTING.md` — expected eval/test coverage
- `skills/` — reusable task-specific workflows

## Current implementation target

Local-first CLI + library implementation with:
- Postgres for source of truth
- filesystem storage for raw artifacts
- Typesense for search index
- Firecrawl / Cloudflare as discovery & extraction providers
- browser-use with OpenRouter `glm-5` for interactive browser automation
- Bright Data as the optional escalation provider

## Definition of done for a feature

A feature is only done when:
1. code exists
2. docs are updated
3. at least one fixture/eval exists
4. tests pass
5. logs or output make failures diagnosable

## Commands

- `pnpm run doctor` — validate local repo prerequisites
- `pnpm plans:list` — list execution plans
- `pnpm validate:fixture` — validate synthetic canonical JSON fixture
- `pnpm test` — run tests
- `pnpm typecheck` — TypeScript no-emit check
- `pnpm run typecheck:workspace` — package-level workspace typecheck
- `pnpm run smoke:cli` — validate the CLI workspace entrypoint
- `pnpm smoke:vendors` — validate OpenRouter, Firecrawl, Cloudflare, and Bright Data access
- `pnpm smoke:browser-use` — validate browser-use with OpenRouter `glm-5`

## Constraints

- No S3 / MinIO yet.
- No observability stack yet.
- Store raw HTML/JSON/markdown/screenshot artifacts on disk under `artifacts/`.
- Respect robots and record crawl-policy signals.
- Never delete fixture evidence without replacing it.

## Preferred workflow

1. read `docs/PROJECT_STATUS.md`
2. read `docs/TICKET_INDEX.md` and the active ticket in `docs/backlog/`
3. identify touched files and check for partial prior work
4. implement the smallest end-to-end slice
5. run tests / fixture validation
6. update status files and stale docs
7. commit with a precise message

## Review guidelines

- Treat regressions in evidence capture, canonical schema handling, crawl-policy handling, and fixture integrity as high-severity review findings.
- Flag any change that skips docs, fixtures/evals, or validation required by the touched scope.
- Flag any change that claims completion without tests or without clearly stating validation gaps.
- Flag any change that introduces provider-specific logic before deterministic extraction options are exhausted, unless the ticket explicitly requires it.
- Flag any change that stores artifacts outside `artifacts/` or weakens provenance recording.
- Flag any change that modifies repo workflow, harness behavior, or ticket/state handling without updating the corresponding docs.
- Flag unrelated refactors, dependency churn, or broad rewrites outside the active ticket scope.

## Tooling policy

Read `docs/cli-tools.md` and prefer tools that are already available in this environment.

Rules:
- Prefer installed tools over suggesting new ones.
- Prefer `pnpm` over `npm`.
- Prefer `uv` over `pip`/`venv`.
- Prefer `gh` over manual GitHub web instructions where appropriate.
- Prefer `docker compose` over `docker-compose`.
- Prefer Playwright CLI over Playwright MCP for testing and validation.
- If a needed CLI or MCP tool is missing, state that clearly and continue with the best available fallback.

Avoid assuming:
- `npm` when `pnpm` is suitable
- `pip` when `uv` is suitable
- `docker-compose` when `docker compose` is available

If a task needs a CLI or MCP tool that is not listed in `docs/cli-tools.md`, say so explicitly before designing around it.

## Tool selection and evidence strategy

- Use the narrowest, highest-confidence tool first.
- Prefer native file search, file reading, grep/search, and terminal tools for repo-local code, config, tests, logs, and direct implementation work.
- Prefer native web/docs search tools for current external facts, release notes, vendor docs, and linked web pages.
- Use `qmd` for local markdown documentation, notes, meeting transcripts, runbooks, and knowledge-base search.
- Use `context7` for third-party libraries, frameworks, SDKs, APIs, and version-specific documentation or code examples.
- Use `probe` for semantic search across large codebases or documentation sets when native search has poor recall, or when a repo/docs source is exposed through Probe.
- Prefer official or vendor documentation when using external sources.
- Do not use broader or heavier tools when direct file inspection or a narrower source is sufficient.

## Confidence gate and escalation

- If the first source is incomplete, stale, ambiguous, conflicting, or low-signal, escalate to a more suitable tool and cross-check before proceeding.
- Cross-check with another source when version-specific behavior, external APIs, current web facts, or high-risk changes are involved.
- When tool output does not materially help achieve the objective, switch tools rather than forcing progress on weak evidence.
- Briefly note the tools or sources used when they materially affected implementation decisions.

## Working approach

- Keep changes small, relevant, and reversible.
- Read the relevant files before editing.
- Follow existing repository patterns unless the task explicitly requires a change.
- Avoid unrelated refactors, dependency churn, or broad rewrites unless necessary.

## Validation

- Validate all changes with the most relevant checks available for the area touched.
- Run linting, formatting, type-checking, unit tests, and integration or regression tests where appropriate.
- If UI, browser, or end-to-end behavior changed, run the relevant Playwright CLI tests, including screenshot and visual regression checks where available.
- Prefer targeted validation that covers the changed surface area, then broaden if needed.
- Use browser or MCP-based inspection for exploration, reproduction, or diagnosis when needed, but use Playwright CLI for automated validation whenever possible.
- Do not claim completion without validation.
- If validation could not be run, state exactly what was not run, why, and the likely impact.

## Git hygiene

- When a task is fully completed and validated, create a git commit with a concise, helpful message.
- Do not commit partial, broken, or unvalidated work.
- If a commit is not possible, say why.
- For unattended Symphony work, use one branch per active ticket / PR and reuse it while the PR remains open.
- Unattended PR bodies must follow `.github/pull_request_template.md` and fill every section with concrete ticket-specific content.
- After pushing validated work, use `gh` to create or update exactly one PR for the active ticket branch.
- Trigger `@openreview-property-search` on the PR whenever the latest pushed head has not yet received an OpenReview pass.
- Gather PR review comments, unresolved review threads, review state, OpenReview state for the current head, and required checks before deciding whether the work is ready to merge.
- Apply actionable review, OpenReview, or check feedback on the same branch, then commit, push, and re-check the same PR.
- Do not treat a PR as complete while current-head OpenReview is still pending or while actionable OpenReview feedback remains unresolved; keep the issue in `In Progress` while that wait state is still within the configured timeout window.
- Leave concise Linear milestone comments when implementation starts, when the PR is created, when OpenReview is `triggered`, when OpenReview remains `pending`, when OpenReview requires more changes, when follow-up changes are pushed, when the PR is approved or merged, and when the workflow is blocked.
- After merge succeeds, leave a final Linear comment with the merged PR URL plus the validation/check snapshot that justified completion.
- Prefer finishing the automated flow with PR merge plus remote branch deletion; move a ticket to `Done` only after merge succeeds.
- Use `In Review` only when merge cannot complete automatically because of unresolved review, unresolved OpenReview, failing required checks, missing auth or permissions, or another explicit blocker that the unattended run cannot clear.

## Documentation and harness maintenance

- Update any and all relevant documentation affected by the change.
- Keep repo docs, examples, setup instructions, architecture notes, workflow docs, status files, and agent or harness files accurate and in sync with the codebase.
- Treat stale docs, stale agent guidance, and stale harness metadata as defects to be fixed as part of the task when relevant.
- Keep documentation updates proportional to the change, but do not omit necessary updates.

## Completion reporting

- Provide a concise summary covering:
  - what changed
  - evidence-backed progress against the original instruction
  - validation performed and results
  - any unresolved issues or risks
  - any user actions required because the agent cannot perform them directly
  - sensible next steps, if any

## Completion standard

- Do not claim completion unless the requested work is implemented and the relevant validation has been run.
- If the work is only partially complete, explicitly label it as partial and explain what remains.
