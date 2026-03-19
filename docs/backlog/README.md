# Backlog Usage

Use this directory as the operational implementation queue.

Future clean agent sessions should read in this order:

1. `docs/PROJECT_STATUS.md`
2. `docs/TICKET_INDEX.md`
3. the active ticket in this directory
4. `AGENTS.md`
5. `README.md`
6. any referenced product/design docs

Rules:
- Each ticket is intended to be executable in a fresh chat.
- If a ticket is already complete, mark it done in the status files and move to the next dependency-satisfied ticket.
- If a ticket is partially complete, continue from the existing repo state rather than redoing work.
- If blocked, update `docs/PROJECT_STATUS.md`, `docs/TICKET_INDEX.md`, and `docs/DEVELOPMENT_LOG.md` with the blocker and exact recommended next move.
- Move completed or retired tickets to `docs/backlog/archive/` only after the status files are updated.
