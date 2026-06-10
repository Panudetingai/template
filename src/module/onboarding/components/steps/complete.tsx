"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, RotateCcw } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import type { StepComponentProps } from "./types";

/** Delay before auto-advancing so the success animation can play. */
const AUTO_REDIRECT_MS = 1600;

/** A small ring of confetti dots that bursts out once the save succeeds. */
function Confetti() {
  const pieces = Array.from({ length: 14 });
  const colors = [
    "bg-primary",
    "bg-emerald-500",
    "bg-amber-400",
    "bg-sky-500",
    "bg-rose-500",
  ];

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {pieces.map((_, index) => {
        const angle = (index / pieces.length) * Math.PI * 2;
        const distance = 80;
        return (
          <motion.span
            key={index}
            className={cn(
              "absolute size-2 rounded-full",
              colors[index % colors.length],
            )}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{
              x: Math.cos(angle) * distance,
              y: Math.sin(angle) * distance,
              scale: [0, 1, 0.5],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
          />
        );
      })}
    </div>
  );
}

function SuccessCheck() {
  return (
    <div className="relative">
      <Confetti />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        className="flex size-16 items-center justify-center rounded-full bg-primary/10"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="size-8 text-primary"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeInOut" }}
          />
        </svg>
      </motion.div>
    </div>
  );
}

export default function Complete({
  user,
  content,
  form,
  saveStatus,
  onFinish,
  onRetry,
}: StepComponentProps) {
  const name =
    form.getValues("username") || user.email?.split("@")[0] || "there";
  const isError = saveStatus === "error";
  const isSuccess = saveStatus === "success";

  // Once the save succeeds, take the user to the dashboard automatically after
  // a short beat (the middleware also blocks /onboarding for completed users).
  const redirected = useRef(false);
  useEffect(() => {
    if (!isSuccess || redirected.current) return;
    redirected.current = true;
    const timer = setTimeout(onFinish, AUTO_REDIRECT_MS);
    return () => clearTimeout(timer);
  }, [isSuccess, onFinish]);

  return (
    <div className="flex flex-col items-center space-y-8 text-center">
      <div className="flex min-h-16 items-center justify-center">
        {isError ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive"
          >
            <RotateCcw className="size-7" />
          </motion.div>
        ) : isSuccess ? (
          <SuccessCheck />
        ) : (
          <motion.div
            className="size-10 rounded-full border-2 border-muted border-t-primary"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      <div className="space-y-1.5">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {isError
            ? "Something went wrong"
            : isSuccess
              ? `You're all set, ${name}!`
              : "Finishing up…"}
        </h1>
        <p className="text-sm text-muted-foreground text-balance">
          {isError
            ? "We couldn't save your setup. Give it another try."
            : isSuccess
              ? "Your workspace is ready. Let's dive in."
              : "Saving your preferences and getting things ready."}
        </p>
      </div>

      <div className="w-full">
        {isError ? (
          <Button size="lg" className="w-full" onClick={onRetry}>
            <RotateCcw />
            Try again
          </Button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{
              opacity: isSuccess ? 1 : 0.5,
              y: isSuccess ? 0 : 12,
            }}
            transition={{ delay: 0.4 }}
          >
            <Button
              size="lg"
              className="w-full"
              onClick={onFinish}
              disabled={!isSuccess}
            >
              {content.cta}
              <ArrowRight />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
