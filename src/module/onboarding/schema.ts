import { z } from "zod";

/**
 * Single source of truth for the onboarding selection options.
 * The enum values below are derived from these arrays so the UI cards and the
 * schema validation can never drift apart.
 */
export const ROLE_OPTIONS = [
  {
    value: "founder",
    label: "Founder / CEO",
    description: "Running the business",
  },
  {
    value: "developer",
    label: "Developer",
    description: "Building the product",
  },
  {
    value: "designer",
    label: "Designer",
    description: "Crafting the experience",
  },
  {
    value: "marketing",
    label: "Marketing / Growth",
    description: "Reaching more people",
  },
  {
    value: "other",
    label: "Something else",
    description: "A bit of everything",
  },
] as const;

export const GOAL_OPTIONS = [
  {
    value: "explore",
    label: "Just exploring",
    description: "Taking a look around first",
  },
  {
    value: "personal",
    label: "A personal project",
    description: "Building something of my own",
  },
  {
    value: "work",
    label: "Work with my team",
    description: "Collaborating with others",
  },
  {
    value: "client",
    label: "Work for a client",
    description: "Delivering for someone else",
  },
] as const;

export const TEAM_SIZE_OPTIONS = [
  { value: "solo", label: "Just me" },
  { value: "small", label: "2–10" },
  { value: "medium", label: "11–50" },
  { value: "large", label: "50+" },
] as const;

const ROLE_VALUES = ROLE_OPTIONS.map((option) => option.value) as [
  (typeof ROLE_OPTIONS)[number]["value"],
  ...(typeof ROLE_OPTIONS)[number]["value"][],
];
const GOAL_VALUES = GOAL_OPTIONS.map((option) => option.value) as [
  (typeof GOAL_OPTIONS)[number]["value"],
  ...(typeof GOAL_OPTIONS)[number]["value"][],
];
const TEAM_SIZE_VALUES = TEAM_SIZE_OPTIONS.map((option) => option.value) as [
  (typeof TEAM_SIZE_OPTIONS)[number]["value"],
  ...(typeof TEAM_SIZE_OPTIONS)[number]["value"][],
];

/** Profile fields collected in the "Set up your profile" step. */
export const SetupProfileSchema = z.object({
  username: z
    .string()
    .min(1, { message: "Please enter your username" })
    .min(2, { message: "Username must be at least 2 characters" })
    .max(50, { message: "Username must be less than 50 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers, and underscores",
    }),
  avatarUrl: z
    .string()
    .url({ message: "Please enter a valid URL" })
    .max(255, { message: "Avatar URL must be less than 255 characters" })
    .optional()
    .or(z.literal("")),
});

export type SetupProfileSchemaType = z.infer<typeof SetupProfileSchema>;

/** Use-case fields collected in the "Tell us about you" step. */
export const PreferencesSchema = z.object({
  role: z.enum(ROLE_VALUES, {
    message: "Pick the option that fits you best",
  }),
  goal: z.enum(GOAL_VALUES, {
    message: "Let us know what you want to do first",
  }),
  teamSize: z.enum(TEAM_SIZE_VALUES, {
    message: "Tell us how big your team is",
  }),
});

export type PreferencesSchemaType = z.infer<typeof PreferencesSchema>;

/**
 * The full onboarding payload — profile + preferences. Drives the wizard's
 * single react-hook-form instance and is the body of the completion request.
 */
export const OnboardingSchema = SetupProfileSchema.extend(
  PreferencesSchema.shape,
);

export type OnboardingSchemaType = z.infer<typeof OnboardingSchema>;

/** Shape persisted in `onboarding.onboardingJson` by completeOnboarding. */
export interface OnboardingProfile {
  username: string;
  avatarUrl: string | null;
  preferences: PreferencesSchemaType;
  completedAt: string;
}

const PREFERENCE_OPTIONS = {
  role: ROLE_OPTIONS,
  goal: GOAL_OPTIONS,
  teamSize: TEAM_SIZE_OPTIONS,
} as const;

/** Resolve a stored preference value to its human-readable label. */
export function getPreferenceLabel(
  field: keyof typeof PREFERENCE_OPTIONS,
  value: string,
): string {
  const option = PREFERENCE_OPTIONS[field].find((item) => item.value === value);
  return option?.label ?? value;
}
