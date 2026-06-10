"use client";

import { api } from "@/lib/elysia/eden-client";
import type { OnboardingProfile } from "@/module/onboarding/schema";
import { useQuery } from "@tanstack/react-query";

/**
 * Fetches the current user's onboarding record (completion + saved profile and
 * preferences). Returns `null` when the user hasn't onboarded yet.
 */
export function useUserOnboarding() {
  const query = useQuery({
    queryKey: ["onboarding", "me"],
    queryFn: async () => {
      const response = await api.onboarding.me.get();
      if (response.error) throw response.error;
      return response.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const profile = (query.data?.onboardingJson ?? null) as OnboardingProfile | null;

  return {
    ...query,
    onboarding: query.data ?? null,
    profile,
    completed: query.data?.completed ?? false,
  };
}
