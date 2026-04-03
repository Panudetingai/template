import { z } from "zod";

import { publicEnv } from "./public";

const serverEnvSchema = z.object({
  GROQ_API_KEY: z.string().optional(),
  COOKIE_PREFIX: z
    .string()
    .min(1, "Set COOKIE_PREFIX or NEXT_PUBLIC_COOKIE_PREFIX in your environment file."),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export const serverEnv: ServerEnv = serverEnvSchema.parse({
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  COOKIE_PREFIX: process.env.COOKIE_PREFIX ?? publicEnv.NEXT_PUBLIC_COOKIE_PREFIX,
});
