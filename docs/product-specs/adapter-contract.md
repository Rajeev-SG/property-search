# Adapter contract

Adapters exist to close persistent domain-specific gaps after generic profiling and extraction logic has been tried.

They should remain declarative, evidence-backed, and narrow in scope.

A site adapter should describe:

- domain
- enabled flag
- start URLs
- allowed paths
- exclude patterns
- listing page patterns
- detail page patterns
- pagination type
- selectors for high-value fields
- whether structured-data extraction should be preferred
- whether schema-LLM fallback is allowed
- notes / caveats

Additional rules:

- adapters should not replace the generic extraction pipeline by default
- adapter behavior should be explainable from profiling evidence or fixture failures
- adding a real adapter should also add or update at least one fixture or eval

Machine-readable schema:
- `packages/adapters/src/siteAdapter.ts`
- `packages/adapters/examples/example-estates.co.uk.yaml`
