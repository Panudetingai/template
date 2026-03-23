import auth from "@/module/auth/server/api";
import { generate } from "@/module/generator/server/api";
import { repositorie } from "@/module/repositorie/server/api";
import { Elysia } from "elysia";
export const app = new Elysia({prefix: "/api"})
    .get("/", () => "welcome to dayily v2")
    .group('/auth', (app) => app.use(auth))
    .group('/repositorie', (app) => app.use(repositorie))
    .group('/generator', (app) => app.use(generate))
export const GET = app.fetch;
export const POST = app.fetch;