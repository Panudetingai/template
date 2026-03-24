import type { Platform } from "@/module/generator/stores/use-generator";
import {
  LLMModel,
  LLMProvider,
} from "@/module/services/agents/llmprovider.service";
import { githubService } from "@/module/services/github/github.service";
import { generateText, Output } from "ai";
import { summarizePatches } from "./lib/summzieContext";
import { buildStoryCardCommitContext } from "./lib/story-card-commit-context";
import { generatePostsPrompt } from "./prompts/generate";
import { generateStoryCardBasicPrompt } from "./prompts/story-card-basic";
import { generateStoryCardGlassPrompt } from "./prompts/story-card-glass";
import {
  storyCardBasicAiSchema,
  storyCardGlassAiSchema,
  type GeneratedPostsRequest,
  type GenerateStoryCardFromGithubRequest,
} from "./types";

export interface GeneratedPostResponse {
  platform: Platform;
  content: string;
}

class GeneratorService {
  constructor(private readonly llmProvider: LLMProvider) {}

  public async generatePosts(request: GeneratedPostsRequest) {
    const githubServiceInstance = await githubService();
    const model = await LLMModel(this.llmProvider);

    const commitsContext = await githubServiceInstance.getCommitFiles({
      owner: request.repository.repositoryOwner,
      repoName: request.repository.repositoryName,
      commitSha: request.commit[0].commitSha,
    });

    const files = commitsContext.files?.map((file) => file.filename) ?? [];
    const patches =
      commitsContext.files?.map((file) => file.patch).join("\n") ?? "";

    const posts: GeneratedPostResponse[] = [];
    for (const platform of request.platforms) {
      try {
        const prompt = generatePostsPrompt({
          platforms: platform.toString(),
          tones: request.tones,
          commitsContext: summarizePatches(patches ?? ""),
          commitMessages: request.commit.map((commit) => commit.commitMessage),
          files: files,
        });
        const result = await generateText({
          model: model.languageModel("openai/gpt-oss-120b"),
          prompt,
          output: Output.text(),
          maxOutputTokens: 2500,
        });
        posts.push({
          platform: platform,
          content: result.output,
        });
      } catch (error) {
        console.error(error);
        posts.push({
          platform: platform,
          content: "Error generating post",
        });
      }
    }
    return posts;
  }

  public async generateStoryCardBasic(request: GenerateStoryCardFromGithubRequest) {
    const gh = await githubService();
    const model = await LLMModel(this.llmProvider);

    const ctx = await buildStoryCardCommitContext(
      (args) => gh.getCommitFiles(args),
      request,
    );

    const prompt = generateStoryCardBasicPrompt({
      commitMessages: ctx.commitMessages,
      files: ctx.files,
      commitsContext: ctx.commitsContext,
      userPrompt: request.prompt?.trim() || undefined,
    });

    const result = await generateText({
      model: model.languageModel("openai/gpt-oss-120b"),
      output: Output.object({
        schema: storyCardBasicAiSchema,
        name: "StoryCardBasic",
        description:
          "Copy fields for a 9:16 developer story card (Dayily Wrapped style)",
      }),
      prompt,
      maxOutputTokens: 2000,
    });

    return result.output;
  }

  public async generateStoryCardGlass(request: GenerateStoryCardFromGithubRequest) {
    const gh = await githubService();
    const model = await LLMModel(this.llmProvider);

    const ctx = await buildStoryCardCommitContext(
      (args) => gh.getCommitFiles(args),
      request,
    );

    const prompt = generateStoryCardGlassPrompt({
      commitMessages: ctx.commitMessages,
      files: ctx.files,
      commitsContext: ctx.commitsContext,
      userPrompt: request.prompt?.trim() || undefined,
    });

    const result = await generateText({
      model: model.languageModel("openai/gpt-oss-120b"),
      output: Output.object({
        schema: storyCardGlassAiSchema,
        name: "StoryCardGlass",
        description:
          "Copy fields for glassmorphism COMING SOON style 9:16 story card",
      }),
      prompt,
      maxOutputTokens: 2000,
    });

    return result.output;
  }
}

const generatePostsService = (LLMProvider: LLMProvider) => {
  return new GeneratorService(LLMProvider);
};

export { generatePostsService, GeneratorService };
