import auth from "@/module/auth/server/api";
import onboarding from "@/module/onboarding/server/api";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
import { generate } from "@/services/server/api";

export const app = new Elysia({
  prefix: "/api",
  websocket: {
    perMessageDeflate: true,
  },
})
  .use(
    swagger({
      documentation: {
        info: {
          title: "API",
          version: "1.0.0",
          description: "API documentation",
        },
      },
    }),
  )
  .get("/", () => "ok")
  .group("/auth", (app) => app.use(auth))
  .group("/onboarding", (app) => app.use(onboarding))
  .use(generate)