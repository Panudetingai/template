"use server";

import { aiWorkerGenerateFromPrompt } from "@/services/ai/worker-ai.service";

type PromptGenerateProduction = {
    prompt: string;
}

export async function generateProduction(payload: PromptGenerateProduction) {
    const result = await aiWorkerGenerateFromPrompt(payload.prompt);
    return result;
}