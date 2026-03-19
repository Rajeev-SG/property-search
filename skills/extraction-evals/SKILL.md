---
name: extraction-evals
description: Run fixture-based extraction checks and improve failure diagnostics without weakening schema requirements.
---

# Extraction evals skill

## Workflow

1. Read `docs/QUALITY_SCORE.md` and `docs/TESTING.md`.
2. Run fixture validation and tests.
3. For failures, identify:
   - field
   - extractor path
   - domain / fixture
   - likely cause
4. Prefer fixes that improve determinism or evidence, not looser validation.
