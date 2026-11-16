"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import StepHeader from "./step-header";
import type { StepComponentProps } from "./types";

export default function Welcome({ user, content, onNext }: StepComponentProps) {
  const name =
    user.user_metadata?.username ??
    user.user_metadata?.name ??
    user.email?.split("@")[0] ??
    "there";

  return (
    <div className="space-y-8">
      <StepHeader
        align="center"
        icon={<Sparkles className="size-6" />}
        title={<>Welcome, {name} 👋</>}
        description="Let's get your account set up. It only takes a minute — we'll personalize things along the way."
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button size="lg" className="w-full" onClick={onNext}>
          {content.cta}
          <ArrowRight />
        </Button>
      </motion.div>
    </div>
  );
}
