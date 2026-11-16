"use client";

import { publicEnv } from "@/env/public";
import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface BrandPanelProps {
  steps: { key: string; label: string }[];
  current: number;
}

export default function BrandPanel({ steps, current }: BrandPanelProps) {
  return (
    <div className="relative hidden overflow-hidden border-r bg-muted/30 lg:flex lg:w-[42%] lg:max-w-md lg:flex-col lg:justify-between lg:p-10">
      {/* Ambient theme-tinted glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-16 size-72 rounded-full bg-primary/5 blur-3xl"
      />

      {/* Brand */}
      <div className="relative flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-4" />
        </span>
        <span className="font-heading text-base font-semibold tracking-tight">
          {publicEnv.NEXT_PUBLIC_PRODUCT_NAME}
        </span>
      </div>

      {/* Headline + vertical stepper */}
      <div className="relative space-y-8">
        <div className="space-y-2">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-balance">
            Set up your workspace in a minute.
          </h2>
          <p className="text-sm text-muted-foreground text-balance">
            A few quick steps and you&apos;ll be ready to go.
          </p>
        </div>

        <ol className="relative">
          {steps.map((step, index) => {
            const state =
              index < current
                ? "done"
                : index === current
                  ? "active"
                  : "upcoming";
            const isLast = index === steps.length - 1;

            return (
              <li key={step.key} className="relative flex gap-3 pb-7 last:pb-0">
                {/* Connector line with animated fill */}
                {!isLast && (
                  <span className="absolute top-7 left-[13px] h-[calc(100%-1.75rem)] w-px bg-border">
                    <motion.span
                      className="block w-full origin-top bg-primary"
                      initial={false}
                      animate={{ scaleY: index < current ? 1 : 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 32 }}
                      style={{ height: "100%" }}
                    />
                  </span>
                )}

                {/* Indicator */}
                <div className="relative z-10">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: state === "active" ? 1.05 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                      state === "done" &&
                        "border-primary bg-primary text-primary-foreground",
                      state === "active" &&
                        "border-primary bg-background text-primary ring-4 ring-primary/15",
                      state === "upcoming" &&
                        "border-border bg-background text-muted-foreground",
                    )}
                  >
                    {state === "done" ? (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 18 }}
                      >
                        <Check className="size-3.5" />
                      </motion.span>
                    ) : (
                      index + 1
                    )}
                  </motion.div>
                </div>

                {/* Label */}
                <div className="flex min-h-7 flex-col justify-center">
                  <span
                    className={cn(
                      "text-sm leading-none transition-colors",
                      state === "upcoming"
                        ? "text-muted-foreground"
                        : "font-medium text-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Footer */}
      <p className="relative text-xs text-muted-foreground">
        © {publicEnv.NEXT_PUBLIC_PRODUCT_NAME}. All rights reserved.
      </p>
    </div>
  );
}
