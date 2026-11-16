import { cache } from "../lib/cache";
import { tooManyRequests } from "../lib/errors";

/**
 * Fixed-window rate limiter. Throws a 429 HttpError when `limit` is exceeded
 * for `key` within `windowSeconds`.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds = 60,
): Promise<void> {
  const count = await cache.incr(`ratelimit:${key}`, windowSeconds);
  if (count > limit) throw tooManyRequests();
}
