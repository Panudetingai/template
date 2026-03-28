import { generateText } from "ai";
import { NextRequest } from "next/server";
import { GroqService } from "./groq/index.service";

export enum LLMProviderEnum {
  GROQ = "groq",
  CHATGPT = "chatgpt",
  GEMINI = "gemini",
  ANTHROPIC = "anthropic",
}
export type LLMProviderConfig = {
  provider: LLMProviderEnum;
  headers?: Headers | NextRequest | Record<string, string | undefined>;
  baseUrl?: string | undefined;
};

// generate Parameters
export type GenerateParameters = Parameters<typeof generateText>[0];

class LLMService {
  // Get the LLM Provider
  public async LLMProvider(config: LLMProviderConfig) {
    switch (config.provider) {
      case LLMProviderEnum.GROQ:
        return new GroqService({
          headers: config.headers,
          baseUrl: config.baseUrl,
        });
      default:
        throw new Error(`LLM Provider ${config.provider} is not supported`);
    }
  }
}

export const llmService = new LLMService();

export { LLMService };
