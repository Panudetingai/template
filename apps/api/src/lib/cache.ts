import { Redis } from "@upstash/redis";

import { env } from "../env";

/**
 * Tiny cache + counter abstraction. Uses Upstash Redis when configured and an
 * in-memory Map otherwise, so the API runs locally with zero extra setup.
 * (The in-memory fallback is per-process — use Redis in production.)
 */
const redis =
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: env.UPSTASH_REDIS_REST_URL,
        token: env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

const memory = new Map<string, { value: unknown; expiresAt: number | null }>();

function memGet(key: string) {
  const hit = memory.get(key);
  if (!hit) return undefined;
  if (hit.expiresAt && hit.expiresAt < Date.now()) {
    memory.delete(key);
    return undefined;
  }
  return hit;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (redis) return (await redis.get<T>(key)) ?? null;
    return (memGet(key)?.value as T | undefined) ?? null;
  },

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    if (redis) {
      await (ttlSeconds
        ? redis.set(key, value, { ex: ttlSeconds })
        : redis.set(key, value));
      return;
    }
    memory.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  },

  async del(key: string): Promise<void> {
    if (redis) await redis.del(key);
    else memory.delete(key);
  },

  /** Atomically increment a counter that expires after `ttlSeconds`. */
  async incr(key: string, ttlSeconds: number): Promise<number> {
    if (redis) {
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, ttlSeconds);
      return count;
    }
    const hit = memGet(key);
    const count = ((hit?.value as number | undefined) ?? 0) + 1;
    memory.set(key, {
      value: count,
      expiresAt: hit?.expiresAt ?? Date.now() + ttlSeconds * 1000,
    });
    return count;
  },
};
