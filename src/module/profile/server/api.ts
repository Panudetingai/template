import { ProfileService } from "@/module/profile/service/profile.service";
import { Elysia } from "elysia";
import { UpdateProfileSchema } from "../schema";

const profile = new Elysia()
  .get("/", () => "profile")
  .post(
    "/update",
    async ({ body }) => {
      const service = new ProfileService();
      const result = await service.updateProfile(body);

      if (!result) throw new Error("Unauthorized");

      return result;
    },
    {
      body: UpdateProfileSchema,
    },
  );

export default profile;
