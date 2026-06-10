import { redis } from "@/lib/redis";
import { OnboardingService } from "@/module/service/onboarding.service";

type CachedOnboarding = {
  completed?: boolean;
};

function toCachedOnboarding(value: unknown): CachedOnboarding {
  if (typeof value !== "object" || value === null) return {};
  return { completed: "completed" in value ? Boolean(value.completed) : undefined };
}

export async function getCachedOnboardingStatus(
  userId: string,
): Promise<CachedOnboarding | null> {
  const cached = await redis.get(`onboarding:${userId}`);
  if (!cached) {
    const record = await new OnboardingService().getUserOnboarding();
    if (!record) return null;
    return { completed: record.completed };
  }

  return toCachedOnboarding(
    typeof cached === "string" ? JSON.parse(cached) : cached,
  );
}

export function needsOnboarding(status: CachedOnboarding | null): boolean {
  return !status || !status.completed;
}
