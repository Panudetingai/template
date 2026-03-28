import auth from "@/module/auth/server/api";
import { Elysia } from "elysia";

export const app = new Elysia({ prefix: "/api" })
  .get("/", () => "welcome to dayily v2")
  .group("/auth", (app) => app.use(auth))