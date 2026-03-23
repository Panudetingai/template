import { LLMProvider } from "@/module/services/agents/llmprovider.service";
import { Elysia } from "elysia";
import { generatePostsService } from "../services/generator.service";
import { generatedPostsRequestSchema } from "../services/types";

const generate = new Elysia().post(
  "/posts",
  async ({ body }) => {
    const result = await generatePostsService(LLMProvider.GROQ).generatePosts(
      body,
    );
    return result;
  },
  {
    body: generatedPostsRequestSchema,
  },
);

export { generate };
