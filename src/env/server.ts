import { z } from "zod";

import { publicEnv } from "./public";

const serverEnvSchema = z.object({
  GROQ_API_KEY: z.string().optional(),
  COOKIE_PREFIX: z
    .string()
    .min(1, "Set COOKIE_PREFIX or NEXT_PUBLIC_COOKIE_PREFIX in your environment file."),
  UPSTASH_REDIS_REST_URL: z.string().min(1, "Set UPSTASH_REDIS_REST_URL in your environment file."),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, "Set UPSTASH_REDIS_REST_TOKEN in your environment file."),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv: ServerEnv = serverEnvSchema.parse({
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  COOKIE_PREFIX: process.env.COOKIE_PREFIX ?? publicEnv.NEXT_PUBLIC_COOKIE_PREFIX,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
});
