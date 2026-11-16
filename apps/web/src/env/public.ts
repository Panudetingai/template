import { z } from "zod";

/**
 * NEXT_PUBLIC_* — validated from process.env (set values in .env.local).
 * Only browser-safe values live here. Secrets (database, Stripe, AI keys…)
 * belong to the API (apps/api/.env), never to the web app.
 */
const production = process.env.NODE_ENV === "production";

const required = (name: string) =>
  z.string().min(1, `Set ${name} in apps/web/.env.local.`);

const publicEnvSchema = z
  .object({
    NEXT_PUBLIC_PRODUCT_NAME: required("NEXT_PUBLIC_PRODUCT_NAME"),
    NEXT_PUBLIC_APP_TITLE: required("NEXT_PUBLIC_APP_TITLE"),
    NEXT_PUBLIC_APP_DESCRIPTION: required("NEXT_PUBLIC_APP_DESCRIPTION"),
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url("Set NEXT_PUBLIC_APP_URL to a valid URL in apps/web/.env.local."),
    NEXT_PUBLIC_COOKIE_PREFIX: required("NEXT_PUBLIC_COOKIE_PREFIX"),
    NEXT_PUBLIC_SUPABASE_PROJECT_REF: required("NEXT_PUBLIC_SUPABASE_PROJECT_REF"),
    NEXT_PUBLIC_SUPABASE_URL: z
      .string()
      .url("Set NEXT_PUBLIC_SUPABASE_URL in apps/web/.env.local."),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    ),
    NEXT_PUBLIC_API_URL: z
      .string()
      .url("Set NEXT_PUBLIC_API_URL (the standalone API) in apps/web/.env.local."),
  })
  .refine(
    (data) => {
      const isCI = process.env.NEXT_PUBLIC_CI;
      if (isCI ?? !production) return true;
      return !data.NEXT_PUBLIC_APP_URL.startsWith("http:");
    },
    {
      message: "In production, NEXT_PUBLIC_APP_URL must use HTTPS (not http:).",
      path: ["NEXT_PUBLIC_APP_URL"],
    },
  );

export type PublicEnv = z.infer<typeof publicEnvSchema>;

// Next.js only inlines NEXT_PUBLIC_* when accessed as literal `process.env.X`.
export const publicEnv: PublicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_PRODUCT_NAME: process.env.NEXT_PUBLIC_PRODUCT_NAME,
  NEXT_PUBLIC_APP_TITLE: process.env.NEXT_PUBLIC_APP_TITLE,
  NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_COOKIE_PREFIX: process.env.NEXT_PUBLIC_COOKIE_PREFIX,
  NEXT_PUBLIC_SUPABASE_PROJECT_REF: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
