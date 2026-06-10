import type { OnboardingStepContent } from "@/module/onboarding/data/onboarding-steps";
import type { OnboardingSchemaType } from "@/module/onboarding/schema";
import type { User } from "@supabase/supabase-js";
import type { UseFormReturn } from "react-hook-form";

/** react-query mutation status of the final "save onboarding" request. */
export type SaveStatus = "idle" | "pending" | "success" | "error";

/** Props every wizard step receives from the orchestrator. */
export interface StepComponentProps {
  user: User;
  form: UseFormReturn<OnboardingSchemaType>;
  /** Step content (title/cta/groups) sourced from the DB, with a seed fallback. */
  content: OnboardingStepContent;
  onNext: () => void;
  onBack: () => void;
  onFinish: () => void;
  isFirst: boolean;
  isLast: boolean;
  saveStatus: SaveStatus;
  onRetry: () => void;
}
