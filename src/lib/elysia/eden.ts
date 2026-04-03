import { treaty } from "@elysiajs/eden";

import { publicEnv } from "@/env/public";

import { app } from "./app";

const apiUrl = publicEnv.NEXT_PUBLIC_API_URL;

export const api =
  // process is defined on server side and build time
  typeof process !== "undefined"
    ? treaty(app).api
    : treaty<typeof app>(apiUrl).api;
