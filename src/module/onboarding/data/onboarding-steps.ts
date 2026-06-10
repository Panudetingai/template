import {
  GOAL_OPTIONS,
  ROLE_OPTIONS,
  TEAM_SIZE_OPTIONS,
} from "@/module/onboarding/schema";

/**
 * Canonical definition of every onboarding step. This is the source that gets
 * seeded into the `onboarding_steps` table (see scripts/seed-onboarding-steps.ts)
 * and the fallback the wizard renders when the DB/network is unavailable.
 *
 * Note: the *allowed values* of each option live in schema.ts so Zod can
 * validate them at build time. The data here only owns presentation — copy,
 * labels, ordering — so the DB and the validation layer can never drift.
 */

export type OnboardingStepKey = "welcome" | "profile" | "use-case" | "complete";

/** Which form field a selectable group writes to. */
export type OnboardingFieldKey = "role" | "goal" | "teamSize";

export interface OnboardingOption {
  value: string;
  label: string;
  description?: string;
}

export interface OnboardingOptionGroup {
  field: OnboardingFieldKey;
  title: string;
  columns: 1 | 2;
  options: OnboardingOption[];
}

/** Step-specific config persisted in `onboarding_steps.json`. */
export interface OnboardingStepContent {
  key: OnboardingStepKey;
  order: number;
  /** Primary button label. */
  cta: string;
  /** Only present for selection steps (use-case). */
  groups?: OnboardingOptionGroup[];
}

export interface OnboardingStepSeed {
  /** Maps to `onboarding_steps.title` (unique). */
  title: string;
  /** Maps to `onboarding_steps.description`. */
  description: string;
  /** Maps to `onboarding_steps.json`. */
  content: OnboardingStepContent;
}

export const ONBOARDING_STEPS_SEED: OnboardingStepSeed[] = [
  {
    title: "Welcome",
    description: "Greet the user and kick off the account setup.",
    content: {
      key: "welcome",
      order: 0,
      cta: "Get started",
    },
  },
  {
    title: "Set up your profile",
    description: "Collect the username and avatar.",
    content: {
      key: "profile",
      order: 1,
      cta: "Continue",
    },
  },
  {
    title: "Tell us about you",
    description: "Capture role, goal and team size to tailor the workspace.",
    content: {
      key: "use-case",
      order: 2,
      cta: "Continue",
      groups: [
        {
          field: "role",
          title: "What best describes you?",
          columns: 1,
          options: [...ROLE_OPTIONS],
        },
        {
          field: "goal",
          title: "What brings you here?",
          columns: 1,
          options: [...GOAL_OPTIONS],
        },
        {
          field: "teamSize",
          title: "How big is your team?",
          columns: 2,
          options: [...TEAM_SIZE_OPTIONS],
        },
      ],
    },
  },
  {
    title: "All set",
    description: "Confirmation and celebration before the dashboard.",
    content: {
      key: "complete",
      order: 3,
      cta: "Go to dashboard",
    },
  },
];

/** Lookup the seeded content for a step by its key (used as a fallback). */
export function getStepContentSeed(
  key: OnboardingStepKey,
): OnboardingStepContent {
  const step = ONBOARDING_STEPS_SEED.find((item) => item.content.key === key);
  if (!step) {
    throw new Error(`No onboarding step seed defined for "${key}"`);
  }
  return step.content;
}
