import { z } from "zod";

export const AI_PROVIDERS = ["groq"] as const;
export type AiProvider = (typeof AI_PROVIDERS)[number];

export const GenerateSchema = z.object({
  provider: z.enum(AI_PROVIDERS).default("groq"),
  model: z.string().min(1).max(100).optional(),
  system: z.string().max(4000).optional(),
  prompt: z.string().min(1).max(8000),
});
export type GenerateSchemaType = z.infer<typeof GenerateSchema>;
