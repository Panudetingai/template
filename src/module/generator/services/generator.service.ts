import {
    LLMModel,
    LLMProvider,
} from "@/module/services/agents/llmprovider.service";
import { githubService } from "@/module/services/github/github.service";
import { generateText, Output } from "ai";
import { summarizeContext } from "./lib/summzieContext";
import { generatePostsPrompt } from "./prompts/generate";
import { GeneratedPostsRequest } from "./types";
class GeneratorService {
  constructor(private readonly llmProvider: LLMProvider) {}

  public async generatePosts(request: GeneratedPostsRequest) {
    const githubServiceInstance = await githubService();
    const model = await LLMModel(this.llmProvider);

    const commitsContext = await githubServiceInstance.getCommitFiles({
        owner: request.repository.repositoryOwner,
        repoName: request.repository.repositoryName,
        commitSha: request.commit[0].commitSha,
    }).then((files) => files.files?.map((file) => file.filename).join("\n")) ?? "";

    const posts: {
        platforms: string;
        post: string;
    }[] = [];
    for (const platform of request.platforms) {
        console.log("platform", platform);
      const result = await generateText({
        model: model.languageModel("openai/gpt-oss-120b"),
        prompt: generatePostsPrompt({
          platforms: platform.toString(),
          tones: request.tones,
          commitsContext: summarizeContext(commitsContext),
        }),
        output: Output.text(),
      });
      posts.push({
        platforms: platform.toString(),
        post: result.text,
      });
    }
    console.log("posts", posts);
    return posts;
  }
}

const generatePostsService = (LLMProvider: LLMProvider) => {
  return new GeneratorService(LLMProvider);
};

export { generatePostsService, GeneratorService };
