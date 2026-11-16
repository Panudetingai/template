---
name: ai-feature
description: Use when adding AI/LLM features (new provider, new endpoint, streaming chat UI) to this template. Trigger on "AI", "LLM", "Groq", "OpenAI", "Anthropic", "chat", "generate text", "streaming".
---

# AI features

AI lives **only in the API** (`apps/api/src/modules/ai/`) so keys never reach the browser. Endpoints (both need a bearer token and are rate-limited per user via `AI_RATE_LIMIT_PER_MINUTE`):

- `POST /ai/generate` `{ prompt, system?, model?, provider? }` → `{ text }`
- `POST /ai/stream` same body → `text/plain` stream

Uses the Vercel AI SDK (`ai`) + provider packages. Groq is wired; set `GROQ_API_KEY` (optional until then → `503`).

## Add a provider
1. `cd apps/api && bun add @ai-sdk/openai` (or `@ai-sdk/anthropic`, `@ai-sdk/google`).
2. `packages/shared/src/ai.ts`: add the name to `AI_PROVIDERS`.
3. `modules/ai/service.ts`: add a `case` in `resolveModel` (check the key with `notConfigured(...)`), and a key in `src/env.ts` + `.env.example`.
TypeScript will flag the `switch` as non-exhaustive until all providers are handled.

## Add a task-specific endpoint
Don't expose raw prompts to clients for product features. Add a service function (e.g. `summarize(text)`) that owns the system prompt and a route in `modules/ai/routes.ts`, using `add-api-module` conventions. For structured output use `generateObject` with a zod schema from `packages/shared`.

## Show streaming output in the web app
`apps/web/src/components/streaming.tsx` renders markdown from a growing string. Read the stream with `fetch` (Eden doesn't stream plain text bodies well):
```ts
const res = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/ai/stream`, {
  method: "POST",
  headers: { "content-type": "application/json", authorization: `Bearer ${session.access_token}` },
  body: JSON.stringify({ prompt }),
});
const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
for (;;) { const { done, value } = await reader.read(); if (done) break; setText((t) => t + value); }
```
Get `session` from `createClient().auth.getSession()` (`@/lib/supabase/client`).

## Rules
- Never accept an API key from the client (the old `x-api-key` header override was removed on purpose).
- Cap input sizes in the zod schema; keep the rate limit on every AI route.
