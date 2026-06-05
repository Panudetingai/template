import Elysia from "elysia";
import z from "zod";
import { LLMProviderEnum, llmService } from "../LLM/llm.service";

export const generate = new Elysia({ prefix: "/llm" })
  .post(
    "/generate",
    async ({ body, headers }) => {
      const { provider, model, system, prompt } = body;
      const llm = await llmService.LLMProvider({
        provider: provider as LLMProviderEnum,
        headers,
      });

      // Generate the Agent
      const result = await llm.generateAgent({
        model: model,
        prompt: prompt, // -> Prompt is Required because it is the input for the agent
        system: system,
      });
      console.log("result", result.text);
      return result.text;
    },
    {
      body: z.object({
        provider: z.enum(LLMProviderEnum),
        model: z.string(),
        system: z.string().optional(),
        prompt: z.string(),
      }),
    },
  );
