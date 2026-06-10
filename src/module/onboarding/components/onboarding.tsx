"use client";

import { Spinner } from "@/components/ui/spinner";
import routerConfig from "@/configs/route.config";
import { publicEnv } from "@/env/public";
import { api } from "@/lib/elysia/eden-client";
import { getUser } from "@/lib/supabase/client";
import {
  OnboardingSchema,
  type OnboardingSchemaType,
} from "@/module/onboarding/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { OnboardingStepKey } from "@/module/onboarding/data/onboarding-steps";
import { useOnboardingSteps } from "../hooks/use-onboarding-steps";
import BrandPanel from "./brand-panel";
import StepProgress from "./step-progress";
import SetupProfile from "./setup-profile";
import Complete from "./steps/complete";
import UseCase from "./steps/use-case";
import Welcome from "./steps/welcome";
import type { StepComponentProps } from "./steps/types";

/** Ordered wizard steps: label (stepper), fields to validate, and the view. */
const STEPS: {
  key: OnboardingStepKey;
  label: string;
  fields: (keyof OnboardingSchemaType)[];
  Component: (props: StepComponentProps) => React.ReactNode;
}[] = [
  { key: "welcome", label: "Welcome", fields: [], Component: Welcome },
  {
    key: "profile",
    label: "Profile",
    fields: ["username"],
    Component: SetupProfile,
  },
  {
    key: "use-case",
    label: "About you",
    fields: ["role", "goal", "teamSize"],
    Component: UseCase,
  },
  { key: "complete", label: "Done", fields: [], Component: Complete },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction >= 0 ? -40 : 40,
    opacity: 0,
  }),
};

export default function Onboarding() {
  const router = useRouter();
  const { getContent } = useOnboardingSteps();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  // [step index, navigation direction] — direction drives the slide animation.
  const [[step, direction], setStep] = useState<[number, number]>([0, 0]);

  const form = useForm<OnboardingSchemaType>({
    resolver: zodResolver(OnboardingSchema),
    mode: "onChange",
    defaultValues: {
      username: "",
      avatarUrl: "",
      role: undefined,
      goal: undefined,
      teamSize: undefined,
    },
  });

  useEffect(() => {
    void getUser().then((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        form.reset({
          username:
            currentUser.user_metadata?.username ??
            currentUser.user_metadata?.name ??
            "",
          avatarUrl: currentUser.user_metadata?.avatar_url ?? "",
        });
      }
      setIsLoadingUser(false);
    });
  }, [form]);

  const completion = useMutation({
    mutationFn: async (data: OnboardingSchemaType) => {
      const response = await api.onboarding["setup-profile"].post({
        username: data.username,
        avatarUrl: data.avatarUrl || undefined,
        role: data.role,
        goal: data.goal,
        teamSize: data.teamSize,
      });

      if (response.error) throw response.error;

      return response.data;
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to finish setup. Please try again.",
      );
    },
  });

  const goNext = async () => {
    const { fields } = STEPS[step];
    if (fields.length) {
      const valid = await form.trigger(fields);
      if (!valid) return;
    }

    // Kick off the save as we slide into the final step so the success
    // animation lands the moment the request resolves.
    if (step === STEPS.length - 2) {
      completion.mutate(form.getValues());
    }

    setStep(([current]) => [Math.min(current + 1, STEPS.length - 1), 1]);
  };

  const goBack = () => {
    setStep(([current]) => [Math.max(current - 1, 0), -1]);
  };

  const finish = useCallback(() => {
    toast.success("You're all set!");
    router.push(routerConfig.app.Dashboard);
  }, [router]);

  const { Component, key } = STEPS[step];

  return (
    <div className="flex min-h-screen w-full bg-background">
      <BrandPanel steps={STEPS} current={step} />

      <div className="flex flex-1 flex-col">
        {/* Mobile top bar: brand + segmented progress (brand panel is desktop-only) */}
        <div className="flex items-center gap-3 border-b px-5 py-4 lg:hidden">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-3.5" />
          </span>
          <span className="font-heading text-sm font-semibold">
            {publicEnv.NEXT_PUBLIC_PRODUCT_NAME}
          </span>
          <div className="ml-auto w-28">
            <StepProgress current={step} total={STEPS.length} />
          </div>
        </div>

        {/* Step content */}
        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {isLoadingUser || !user ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <AnimatePresence
                  mode="popLayout"
                  custom={direction}
                  initial={false}
                >
                  <motion.div
                    key={key}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: "spring", stiffness: 320, damping: 32 },
                      opacity: { duration: 0.2 },
                    }}
                  >
                    <Component
                      user={user}
                      content={getContent(key)}
                      form={form}
                      onNext={goNext}
                      onBack={goBack}
                      onFinish={finish}
                      isFirst={step === 0}
                      isLast={step === STEPS.length - 1}
                      saveStatus={completion.status}
                      onRetry={() => completion.mutate(form.getValues())}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
