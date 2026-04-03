import { createGroq } from "@ai-sdk/groq";

import { serverEnv } from "@/env/server";

export enum LLMProvider {
    GROQ = "groq",
    OPENAI = "openai",
    ANTHROPIC = "anthropic",
    GOOGLE = "google",
    MICROSOFT = "microsoft",
    AWS = "aws",
    AZURE = "azure",
    OVH = "ovh",
    OTHER = "other",
}

class LLMProviderService {
    constructor(private readonly provider: LLMProvider) {}

    public async providerLLM() {
        switch (this.provider) {
            case LLMProvider.GROQ:
                return this.groqProvider();
            default:
                throw new Error(`Provider ${this.provider} not supported`);
        }
    }


    private async groqProvider() {
        const groq = createGroq({
            apiKey: serverEnv.GROQ_API_KEY ?? "",
        });
        return groq
    }


}

export const LLMModel = (provider: LLMProvider) => {
    return new LLMProviderService(provider).providerLLM();
}

export { LLMProviderService };
