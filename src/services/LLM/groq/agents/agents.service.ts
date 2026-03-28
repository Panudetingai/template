import { GroqProvider } from "@ai-sdk/groq";
import { generateText } from "ai";
import { GenerateParameters } from "../../llm.service";
import { generatePrompt } from "../../prompt/generate";

class AgentsService {
  private readonly groqModel: GroqProvider["languageModel"];
  constructor(groqModel: GroqProvider["languageModel"]) {
    this.groqModel = groqModel;
  }

  /**
   * @description Generate Agent using the Groq Model
   * @param parameters 
   * @returns 
   */
  
  public async generateAgent(parameters: GenerateParameters) {
    const result = await generateText({
      model: this.groqModel(parameters.model as string),
      system: parameters.system ?? generatePrompt(),
      prompt: parameters.prompt ?? "",
    });
    return result;
  }
}

export { AgentsService };
