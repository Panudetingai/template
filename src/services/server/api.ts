import Elysia, { t } from "elysia";
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
  )

  .post("/ocr/slip", async ({ body, headers }) => {
    const llm = await llmService.LLMProvider({
      provider: LLMProviderEnum.GROQ,
      headers,
    });

    const result = await llm.generateOCR(body.file);
    return result;
  }, {
    parse: "multipart/form-data",
    body: t.Object({
      file: t.File({
        type: "image",
        error: "Image must be a valid image file",
      }),
    }),
  })

  .post("/ocr/slips", async ({ body, headers }) => {
    const llm = await llmService.LLMProvider({
      provider: LLMProviderEnum.GROQ,
      headers,
    });
    return llm.generateOCRManyImages(body.files);
  }, {
    parse: "multipart/form-data",
    body: t.Object({
      files: t.Files({
        type: "image",
        minItems: 1,
        maxItems: 100,
        error: "Each item must be an image file",
      }),
    }),
    error: ({error}) => ({
        message: error,
        status: 400,
        code: "INVALID_FILES",
    })
  });
