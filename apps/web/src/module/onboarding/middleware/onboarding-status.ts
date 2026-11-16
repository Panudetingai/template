import { publicEnv } from "@/env/public";

type OnboardingStatus = { completed: boolean };

/**
 * Asks the API whether the user finished onboarding. The API answers from its
 * Redis/in-memory cache, so this stays cheap enough to run in the proxy.
 * Returns `null` when the API is unreachable (callers should fail open).
 */
export async function getOnboardingStatus(
  accessToken: string,
): Promise<OnboardingStatus | null> {
  try {
    const res = await fetch(`${publicEnv.NEXT_PUBLIC_API_URL}/onboarding/status`, {
      headers: { authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    return (await res.json()) as OnboardingStatus;
  } catch {
    return null;
  }
}
