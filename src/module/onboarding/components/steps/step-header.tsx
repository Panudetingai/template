"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface StepHeaderProps {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

export default function StepHeader({
  icon,
  title,
  description,
  align = "left",
}: StepHeaderProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn(
        "flex flex-col gap-3",
        align === "center" ? "items-center text-center" : "items-start",
      )}
    >
      {icon && (
        <motion.div
          variants={item}
          className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        >
          {icon}
        </motion.div>
      )}
      <div className="space-y-1.5">
        <motion.h1
          variants={item}
          className="font-heading text-2xl font-semibold tracking-tight"
        >
          {title}
        </motion.h1>
        {description && (
          <motion.p
            variants={item}
            className="text-sm text-muted-foreground text-balance"
          >
            {description}
          </motion.p>
        )}
      </div>
    </motion.div>
  );
}
