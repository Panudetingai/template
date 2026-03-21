import { app } from "@/app/api/[[...slugs]]/route";
import { treaty } from "@elysiajs/eden";

const apiUrl = process.env.NEXT_PUBLIC_API_URL!;

export const api =
  // process is defined on server side and build time
  typeof process !== "undefined"
    ? treaty(app).api
    : treaty<typeof app>(apiUrl).api;
