import { Elysia } from "elysia";
import { SetupProfileSchema } from "../schema";
import { OnboardingService } from "@/module/service/onboarding.service";

const onboarding = new Elysia()
  .get("/", () => "onboarding")
  .post(
    "/setup-profile",
    async ({ body }) => {
      const service = new OnboardingService();
      const result = await service.setupProfile(body);

      if (!result) throw new Error("Unauthorized");

      return result;
    },
    {
      body: SetupProfileSchema,
    },
  );

export default onboarding;
