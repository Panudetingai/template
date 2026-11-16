import { UpdateProfileSchema } from "@template/shared/profile";
import { Elysia } from "elysia";

import { authPlugin } from "../../plugins/auth";
import { updateProfile } from "./service";

export const profileRoutes = new Elysia({ prefix: "/profile", tags: ["profile"] })
  .use(authPlugin)
  .post("/update", ({ user, body }) => updateProfile(user, body), {
    auth: true,
    body: UpdateProfileSchema,
  });
