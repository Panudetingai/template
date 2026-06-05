import auth from "@/module/auth/server/api";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
// import api services
import { generate } from "@/services/server/api";
export const app = new Elysia({ prefix: "/api" })
  .use(swagger({
    documentation: {
      info: {
        title: "API",
        version: "1.0.0",
        description: "API documentation",
      },
    },
  }))
  .get("/", () => "ok")
  .group("/auth", (app) => app.use(auth))
  .use(generate)