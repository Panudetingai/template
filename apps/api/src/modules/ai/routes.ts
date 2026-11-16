import { GenerateSchema } from "@template/shared/ai";
import { Elysia } from "elysia";

import { env } from "../../env";
import { authPlugin } from "../../plugins/auth";
import { rateLimit } from "../../plugins/rate-limit";
import { generate, stream } from "./service";

export const aiRoutes = new Elysia({ prefix: "/ai", tags: ["ai"] })
  .use(authPlugin)
  .post(
    "/generate",
    async ({ user, body }) => {
      await rateLimit(`ai:${user.id}`, env.AI_RATE_LIMIT_PER_MINUTE);
      return generate(body);
    },
    { auth: true, body: GenerateSchema },
  )
  .post(
    "/stream",
    async ({ user, body }) => {
      await rateLimit(`ai:${user.id}`, env.AI_RATE_LIMIT_PER_MINUTE);
      return stream(body);
    },
    { auth: true, body: GenerateSchema },
  );
