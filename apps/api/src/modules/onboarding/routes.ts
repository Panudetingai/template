import { OnboardingSchema } from "@template/shared/onboarding";
import { Elysia } from "elysia";

import { authPlugin } from "../../plugins/auth";
import { completeOnboarding, getSteps, getUserOnboarding } from "./service";

export const onboardingRoutes = new Elysia({
  prefix: "/onboarding",
  tags: ["onboarding"],
})
  .use(authPlugin)
  .get("/steps", () => getSteps())
  .get("/me", ({ user }) => getUserOnboarding(user.id), { auth: true })
  .get(
    "/status",
    async ({ user }) => {
      const record = await getUserOnboarding(user.id);
      return { completed: record?.completed ?? false };
    },
    { auth: true },
  )
  .post("/setup-profile", ({ user, body }) => completeOnboarding(user, body), {
    auth: true,
    body: OnboardingSchema,
  });
