"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface StepProgressProps {
  current: number;
  total: number;
}

export default function StepProgress({ current, total }: StepProgressProps) {
  return (
    <div className="flex items-center gap-2" aria-hidden>
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index <= current;
        return (
          <div
            key={index}
            className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
          >
            <motion.div
              className={cn(
                "absolute inset-0 origin-left rounded-full bg-primary",
              )}
              initial={false}
              animate={{ scaleX: isActive ? 1 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            />
          </div>
        );
      })}
    </div>
  );
}
