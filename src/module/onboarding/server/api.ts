import { Elysia } from "elysia";
import { OnboardingSchema } from "../schema";
import { OnboardingService } from "@/module/service/onboarding.service";

const onboarding = new Elysia()
  .get("/", () => "onboarding")
  .get("/steps", async () => {
    const service = new OnboardingService();
    return service.getSteps();
  })
  .get("/me", async () => {
    const service = new OnboardingService();
    return service.getUserOnboarding();
  })
  .post(
    "/setup-profile",
    async ({ body }) => {
      const service = new OnboardingService();
      const result = await service.completeOnboarding(body);

      if (!result) throw new Error("Unauthorized");

      return result;
    },
    {
      body: OnboardingSchema,
    },
  );

export default onboarding;
