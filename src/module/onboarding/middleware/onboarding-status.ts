import { redis } from "@/lib/redis";

type CachedOnboarding = {
  completed?: boolean;
};

export async function getCachedOnboardingStatus(
  userId: string,
): Promise<CachedOnboarding | null> {
  const cached = await redis.get(`onboarding:${userId}`);
  if (!cached) return null;

  if (typeof cached === "string") {
    return JSON.parse(cached) as CachedOnboarding;
  }

  return cached as CachedOnboarding;
}

export function needsOnboarding(status: CachedOnboarding | null): boolean {
  return !status || !status.completed;
}
