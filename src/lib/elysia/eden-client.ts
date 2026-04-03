"use client";

import { edenTreaty } from "@elysiajs/eden";

import { publicEnv } from "@/env/public";

import { app } from "./app";

const edenClient = edenTreaty<typeof app>(publicEnv.NEXT_PUBLIC_API_URL);

export const api = edenClient.api;