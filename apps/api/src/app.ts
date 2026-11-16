import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

import { env } from "./env";
import { HttpError } from "./lib/errors";
import { aiRoutes } from "./modules/ai/routes";
import { authRoutes } from "./modules/auth/routes";
import { billingRoutes, stripeWebhookRoutes } from "./modules/billing/routes";
import { onboardingRoutes } from "./modules/onboarding/routes";
import { profileRoutes } from "./modules/profile/routes";

export const app = new Elysia()
  .use(cors({ origin: env.WEB_URL, allowedHeaders: ["Authorization", "Content-Type"] }))
  .use(
    env.NODE_ENV === "production"
      ? new Elysia()
      : swagger({
          path: "/docs",
          documentation: { info: { title: "API", version: "1.0.0" } },
        }),
  )
  .onError(({ code, error, set }) => {
    if (error instanceof HttpError) {
      set.status = error.status;
      return { message: error.message, code: error.code };
    }
    if (code === "VALIDATION") {
      set.status = 422;
      return { message: "Invalid request", code: "validation_error" };
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { message: "Not found", code: "not_found" };
    }
    console.error("[api] unhandled error", error);
    set.status = 500;
    return { message: "Internal server error", code: "internal_error" };
  })
  .get("/health", () => ({ status: "ok" }))
  .use(authRoutes)
  .use(profileRoutes)
  .use(onboardingRoutes)
  .use(billingRoutes)
  .use(aiRoutes)
  .use(stripeWebhookRoutes);

/** Imported (type-only) by the web app for end-to-end typed requests. */
export type App = typeof app;
