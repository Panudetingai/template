import auth from "@/module/auth/server/api";
import { classifier } from "@/module/classifier/server/api";
import { generate } from "@/module/generator/server/api";
import { repositorie } from "@/module/repositorie/server/api";
import { Elysia } from "elysia";

export const app = new Elysia({ prefix: "/api" })
  .get("/", () => "welcome to dayily v2")
  .group("/auth", (app) => app.use(auth))
  .group("/repositorie", (app) => app.use(repositorie))
  .group("/generator", (app) => app.use(generate))
  .group("/classifier", (app) => app.use(classifier));