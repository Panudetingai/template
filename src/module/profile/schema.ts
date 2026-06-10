import {
  SetupProfileSchema,
  type SetupProfileSchemaType,
} from "@/module/onboarding/schema";

/**
 * Profile edits reuse the same validation as the onboarding profile step
 * (username + optional avatar URL) so the rules can never drift.
 */
export const UpdateProfileSchema = SetupProfileSchema;
export type UpdateProfileSchemaType = SetupProfileSchemaType;
