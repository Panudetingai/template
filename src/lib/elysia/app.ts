import auth from "@/module/auth/server/api";
import swagger from "@elysiajs/swagger";
import { Elysia } from "elysia";
// import api services
import tiktokApi from "@/module/tiktok/server/api";
import { generate } from "@/services/server/api";
import cors from "@elysiajs/cors";
import { publicEnv } from "@/env/public";
export const app = new Elysia({ prefix: "/api" })
  .use(cors({
    origin: [publicEnv.NEXT_PUBLIC_CLOUDFLARE_URL, publicEnv.NEXT_PUBLIC_APP_URL],
  }))
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