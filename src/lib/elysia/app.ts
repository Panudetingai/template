import auth from "@/module/auth/server/api";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
// import api services
import tiktokApi from "@/module/tiktok/server/api";
import { generate } from "@/services/server/api";
export const app = new Elysia({ prefix: "/api" })
  .use(swagger({
    documentation: {
      info: {
        title: "SlipCleaner API",
        version: "1.0.0",
        description: "API for SlipCleaner",
      },
    },
  }))
  .get("/", () => "welcome to dayily v2")
  .group("/auth", (app) => app.use(auth))
  .use(generate)
  .use(tiktokApi)