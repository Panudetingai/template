import { createGroq } from "@ai-sdk/groq";
import { generateText, streamText } from "ai";
import type { GenerateSchemaType } from "@template/shared/ai";

import { env } from "../../env";
import { notConfigured } from "../../lib/errors";

const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful assistant that can help with tasks and questions.";

/**
 * Provider registry. To add a provider (OpenAI, Anthropic, …): install its
 * `@ai-sdk/*` package, add a case here and extend `AI_PROVIDERS` in
 * packages/shared/src/ai.ts.
 */
function resolveModel({ provider, model }: GenerateSchemaType) {
  switch (provider) {
    case "groq": {
      if (!env.GROQ_API_KEY) throw notConfigured("AI (GROQ_API_KEY)");
      const groq = createGroq({ apiKey: env.GROQ_API_KEY });
      return groq(model ?? env.AI_DEFAULT_MODEL);
    }
  }
}

export async function generate(input: GenerateSchemaType) {
  const { text } = await generateText({
    model: resolveModel(input),
    system: input.system ?? DEFAULT_SYSTEM_PROMPT,
    prompt: input.prompt,
  });
  return { text };
}

export function stream(input: GenerateSchemaType) {
  return streamText({
    model: resolveModel(input),
    system: input.system ?? DEFAULT_SYSTEM_PROMPT,
    prompt: input.prompt,
  }).toTextStreamResponse();
}
