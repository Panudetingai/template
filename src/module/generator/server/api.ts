import { LLMProvider } from "@/module/services/agents/llmprovider.service";
import { Elysia } from "elysia";
import { generatePostsService } from "../services/generator.service";
import {
  generatedPostsRequestSchema,
  generateStoryCardFromGithubRequestSchema,
} from "../services/types";

const generate = new Elysia()
  .post(
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
  )
  .post(
    "/storyCardBasic",
    async ({ body }) => {
      return await generatePostsService(
        LLMProvider.GROQ,
      ).generateStoryCardBasic(body);
    },
    {
      body: generateStoryCardFromGithubRequestSchema,
    },
  )
  .post(
    "/storyCardGlass",
    async ({ body }) => {
      return await generatePostsService(
        LLMProvider.GROQ,
      ).generateStoryCardGlass(body);
    },
    {
      body: generateStoryCardFromGithubRequestSchema,
    },
  )
  .post(
    "/storyCardSettleTheDebate",
    async ({ body }) => {
      return await generatePostsService(
        LLMProvider.GROQ,
      ).generateStoryCardSettleTheDebate(body);
    },
    {
      body: generateStoryCardFromGithubRequestSchema,
    },
  )
  .post(
    "/storyCardAurora",
    async ({ body }) => {
      return await generatePostsService(
        LLMProvider.GROQ,
      ).generateStoryCardEditorialAurora(body);
    },
    {
      body: generateStoryCardFromGithubRequestSchema,
    },
  )
  .post(
    "/storyCardOrage",
    async ({ body }) => {
      return await generatePostsService(
        LLMProvider.GROQ,
      ).generateStoryCardEditorialOrage(body);
    },
    {
      body: generateStoryCardFromGithubRequestSchema,
    },
  );

export { generate };
