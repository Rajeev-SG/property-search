# Extraction ladder

## Purpose

Use the cheapest and most deterministic extraction path first.

## Order

1. JSON-LD / microdata / explicit structured data
2. script/blob parsing
3. deterministic DOM extraction
4. schema-constrained LLM extraction
5. site adapter override

## Rules

- Every extracted field should record evidence.
- LLM extraction should target the canonical JSON schema or a tightly scoped intermediate schema.
- Site adapters exist to close gaps, not replace the whole pipeline by default.
