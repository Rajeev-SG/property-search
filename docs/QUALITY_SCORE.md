# Quality score

## Objective

Measure extraction reliability per domain and per extractor path.

## Proposed score dimensions

- field completeness
- canonical schema validity
- source evidence coverage
- duplicate rate
- stale listing rate
- false-positive page classification rate
- selector drift rate
- LLM fallback rate

## Golden thresholds for v1

- canonical schema validity: 100% on gold fixtures
- price extraction completeness: >= 95% on gold fixtures
- address extraction completeness: >= 95% on gold fixtures
- page classification precision: >= 95% on gold fixtures
- unexplained extractor failures: 0 in CI fixtures

## Output format

Per domain:
- total pages examined
- candidate detail pages found
- listings extracted
- schema-valid listings
- average extraction confidence
- top failure reasons
