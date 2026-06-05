import { createGroq } from "@ai-sdk/groq";
import { NextRequest } from "next/server";

import { serverEnv } from "@/env/server";
import { GenerateParameters } from "../llm.service";
import { AgentsService } from "./agents/agents.service";

export type GroqConfig = {
    headers?: Headers | NextRequest | Record<string, string | undefined>;
    baseUrl?: string | undefined;
};

function getXApiKey(
    source: Headers | NextRequest | Record<string, string | undefined> | undefined,
): string | null {
    if (!source) return null;
    if (source instanceof Headers) {
        return source.get("x-api-key");
    }
    if (
        "headers" in source &&
        (source as NextRequest).headers instanceof Headers
    ) {
        return (source as NextRequest).headers.get("x-api-key");
    }
    const rec = source as Record<string, string | undefined>;
    return rec["x-api-key"] ?? rec["X-API-Key"] ?? null;
}

class GroqService {
    private readonly baseUrl?: string | undefined;
    private readonly apikey: string;

    constructor(config: GroqConfig) {
        this.baseUrl = config.baseUrl;

        const apiKey =
            getXApiKey(config.headers) ?? serverEnv.GROQ_API_KEY;

        // Validate the API Key is provided
        if (!apiKey) {
            throw new Error("GROQ_API_KEY is not set");
        }
        this.apikey = apiKey;
    }

    public async groqModel() {
        // Create the Groq Model
        return createGroq({
            apiKey: this.apikey,
            baseURL: this.baseUrl || "https://api.groq.com/openai/v1",
        });
    }
    
    // Generate Agent
    public async generateAgent(parameters: GenerateParameters) {
        const model = await this.groqModel();
        const agentsService = new AgentsService(model);
        return agentsService.generateAgent(parameters);
    }
}

export { GroqService };
