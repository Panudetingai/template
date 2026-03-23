"use client";

import { app } from "./app";
import { edenTreaty } from "@elysiajs/eden";

const edenClient = edenTreaty<typeof app>(process.env.NEXT_PUBLIC_API_URL!);

export const api = edenClient.api;