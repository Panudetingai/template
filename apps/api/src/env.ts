import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v && v.length > 0 ? v : undefined));

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  WEB_URL: z.string().url(),

  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  UPSTASH_REDIS_REST_URL: optionalString,
  UPSTASH_REDIS_REST_TOKEN: optionalString,

  GROQ_API_KEY: optionalString,
  AI_DEFAULT_MODEL: z.string().default("llama-3.3-70b-versatile"),
  AI_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(20),

  STRIPE_SECRET_KEY: optionalString,
  STRIPE_WEBHOOK_SECRET: optionalString,
  STRIPE_PRICE_PRO_MONTHLY: optionalString,
  STRIPE_PRICE_PRO_YEARLY: optionalString,
});

export type Env = z.infer<typeof schema>;

/** Validated once at boot — the process fails fast on bad config. */
export const env: Env = schema.parse(process.env);
