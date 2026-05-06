import { z } from "zod";

/**
 * NEXT_PUBLIC_* — validated from process.env (set values in .env / .env.local).
 * Safe to import from client or server (only public keys are bundled on the client).
 */
const production = process.env.NODE_ENV === "production";

const publicEnvSchema = z
  .object({
    NEXT_PUBLIC_PRODUCT_NAME: z
      .string()
      .min(1, "Set NEXT_PUBLIC_PRODUCT_NAME in your environment file."),
    NEXT_PUBLIC_APP_TITLE: z
      .string()
      .min(1, "Set NEXT_PUBLIC_APP_TITLE in your environment file."),
    NEXT_PUBLIC_APP_DESCRIPTION: z
      .string()
      .min(1, "Set NEXT_PUBLIC_APP_DESCRIPTION in your environment file."),
    NEXT_PUBLIC_APP_URL: z
      .string()
      .url("Set NEXT_PUBLIC_APP_URL to a valid URL in your environment file."),
      NEXT_PUBLIC_CLOUDFLARE_URL: z
      .string()
      .url("Set NEXT_PUBLIC_NGROK_URL to a valid URL in your environment file."),
    NEXT_PUBLIC_COOKIE_PREFIX: z
      .string()
      .min(1, "Set NEXT_PUBLIC_COOKIE_PREFIX in your environment file."),
    NEXT_PUBLIC_SUPABASE_PROJECT_REF: z
      .string()
      .min(1, "Set NEXT_PUBLIC_SUPABASE_PROJECT_REF in your environment file."),
    NEXT_PUBLIC_SUPABASE_URL: z
      .string()
      .url("Set NEXT_PUBLIC_SUPABASE_URL to a valid URL in your environment file.")
      .transform((s) => {
        const t = s.trim().replace(/\/+$/, "");
        try {
          const u = new URL(t);
          // Hosted Supabase requires HTTPS; http:// often returns empty/non-JSON → AuthUnknownError parsing token response.
          if (u.protocol === "http:" && u.hostname.endsWith(".supabase.co")) {
            return `https://${u.hostname}${u.pathname === "/" ? "" : u.pathname}`.replace(
              /\/+$/,
              "",
            );
          }
        } catch {
          /* .url() already validated shape */
        }
        return t;
      }),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
      .string()
      .min(1, "Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your environment file.")
      .transform((s) => s.trim()),
    NEXT_PUBLIC_API_URL: z
      .string()
      .url("Set NEXT_PUBLIC_API_URL to a valid URL in your environment file."),
    NEXT_PUBLIC_SUPABASE_DATABASE_URL: z
      .string()
      .min(1, "Set NEXT_PUBLIC_SUPABASE_DATABASE_URL in your environment file."),
    NEXT_PUBLIC_SUPABASE_DATABASE_URL_ORM: z
      .string()
      .min(1, "Set NEXT_PUBLIC_SUPABASE_DATABASE_URL_ORM in your environment file."),
  })
  .refine(
    (data) => {
      const isCI = process.env.NEXT_PUBLIC_CI;
      if (isCI ?? !production) {
        return true;
      }
      return !data.NEXT_PUBLIC_APP_URL.startsWith("http:");
    },
    {
      message:
        "In production, NEXT_PUBLIC_APP_URL must use HTTPS (not http:).",
      path: ["NEXT_PUBLIC_APP_URL"],
    },
  );

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export const publicEnv: PublicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_PRODUCT_NAME: process.env.NEXT_PUBLIC_PRODUCT_NAME,
  NEXT_PUBLIC_APP_TITLE: process.env.NEXT_PUBLIC_APP_TITLE,
  NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_CLOUDFLARE_URL: process.env.NEXT_PUBLIC_CLOUDFLARE_URL,
  NEXT_PUBLIC_COOKIE_PREFIX: process.env.NEXT_PUBLIC_COOKIE_PREFIX,
  NEXT_PUBLIC_SUPABASE_PROJECT_REF: process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SUPABASE_DATABASE_URL:
    process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL,
  NEXT_PUBLIC_SUPABASE_DATABASE_URL_ORM:
    process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL_ORM,
});
