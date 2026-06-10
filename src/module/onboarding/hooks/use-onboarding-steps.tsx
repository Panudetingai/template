"use client";

import { api } from "@/lib/elysia/eden-client";
import { useQuery } from "@tanstack/react-query";
import {
  getStepContentSeed,
  type OnboardingStepContent,
  type OnboardingStepKey,
} from "../data/onboarding-steps";

/**
 * Fetches the onboarding step definitions from the API (which reads the
 * `onboarding_steps` table). Falls back to the local seed for each step so the
 * wizard always renders, even before the DB is seeded or while offline.
 */
export function useOnboardingSteps() {
  const query = useQuery({
    queryKey: ["onboarding", "steps"],
    queryFn: async () => {
      const response = await api.onboarding.steps.get();
      if (response.error) throw response.error;
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const getContent = (key: OnboardingStepKey): OnboardingStepContent => {
    const fromDb = query.data?.find(
      (step) => step.content?.key === key,
    )?.content as OnboardingStepContent | undefined;

    return fromDb ?? getStepContentSeed(key);
  };

  return { ...query, getContent };
}
