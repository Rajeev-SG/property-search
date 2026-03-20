# OpenReview on Vercel with OpenRouter

## Current upstream state

Reference target: `vercel-labs/openreview`.

Observed upstream behavior:
- The upstream README describes OpenReview as "powered by Claude" and documents `ANTHROPIC_API_KEY` as the model credential.
- `lib/agent.ts` constructs the workflow agent with `model: "anthropic/claude-sonnet-4.6"`.
- `lib/env.ts` validates only GitHub App and Redis configuration, so there is no upstream model-provider or model-id env seam yet.

Current conclusion:
- A zero-code OpenRouter deployment is not currently supported by upstream OpenReview.
- OpenRouter support requires a fork or an upstream contribution.

## Smallest plausible fork change

The smallest likely patch is in the OpenReview app code rather than the Vercel project settings:

1. Add an OpenRouter-compatible provider dependency:
   - `@openrouter/ai-sdk-provider`
2. Add explicit env configuration for model selection:
   - `OPENREVIEW_MODEL`
   - `OPENROUTER_API_KEY`
3. Replace the Anthropic-only model binding in `lib/agent.ts` with a configurable provider/model path.
4. Keep Anthropic as an optional fallback so existing upstream-style deployments still work.

A practical fork contract would be:
- `OPENREVIEW_MODEL=anthropic/claude-sonnet-4.6`
- `OPENROUTER_API_KEY=...`

or another OpenRouter model ID that the deployment wants to use.

## Recommended fork shape

Recommended runtime behavior for a forked deployment:
- Default `OPENREVIEW_MODEL` to `anthropic/claude-sonnet-4.6`.
- If `OPENROUTER_API_KEY` is present, instantiate the model through the OpenRouter AI SDK provider.
- If only `ANTHROPIC_API_KEY` is present, keep the current Anthropic path.
- Fail fast when neither provider credential is available.

## Vercel deployment env plan

For a forked OpenReview deployment on Vercel, the environment contract should be:

Required GitHub/Vercel workflow env:
- `GITHUB_APP_ID`
- `GITHUB_APP_INSTALLATION_ID`
- `GITHUB_APP_PRIVATE_KEY`
- `GITHUB_APP_WEBHOOK_SECRET`

Model env for OpenRouter path:
- `OPENROUTER_API_KEY`
- `OPENREVIEW_MODEL`

Optional persistence env:
- `REDIS_URL`

Recommended example values:
- `OPENREVIEW_MODEL=anthropic/claude-sonnet-4.6`
- `OPENREVIEW_MODEL=openai/gpt-4o`
- `OPENREVIEW_MODEL=z-ai/glm-5`

The exact model ID should stay deployment-configurable so Vercel env changes do not require another code change.

## Validation status

Validated from upstream source inspection:
- Upstream README currently documents `ANTHROPIC_API_KEY` only.
- Upstream `lib/agent.ts` currently hard-codes `anthropic/claude-sonnet-4.6`.
- Upstream `lib/env.ts` does not expose a model-provider seam yet.
- OpenRouter's Vercel AI SDK provider supports provider-created model instances such as `openrouter('anthropic/claude-3.5-sonnet')`.

Not yet validated locally:
- Whether `@workflow/ai` `DurableAgent` accepts an OpenRouter provider-created model object without any additional adaptation.
- A real Vercel deployment of a forked OpenReview app.
- End-to-end GitHub App review execution against a fork using OpenRouter credentials.

## Recommended next step

To move from documentation to implementation:
- create or clone a local OpenReview fork,
- patch `lib/agent.ts` plus env handling,
- deploy that fork to Vercel,
- validate a real PR review run against a disposable GitHub repository.
