import type { Platform } from "@/module/generator/stores/use-generator";
import {
  LLMModel,
  LLMProvider,
} from "@/module/services/agents/llmprovider.service";
import { githubService } from "@/module/services/github/github.service";
import { generateText, Output } from "ai";
import { summarizePatches } from "./lib/summzieContext";
import { generatePostsPrompt } from "./prompts/generate";
import type { GeneratedPostsRequest } from "./types";

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
    })

    const files = commitsContext.files?.map((file) => file.filename) ?? [];
    const patches = commitsContext.files?.map((file) => file.patch).join("\n") ?? "";

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
          maxOutputTokens: 1000,
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
}

const generatePostsService = (LLMProvider: LLMProvider) => {
  return new GeneratorService(LLMProvider);
};

export { generatePostsService, GeneratorService };

