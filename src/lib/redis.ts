import { serverEnv } from "@/env/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: serverEnv.UPSTASH_REDIS_REST_URL,
  token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
});

export { redis };
