"use client";

import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import type {
  OnboardingFieldKey,
  OnboardingOption,
} from "@/module/onboarding/data/onboarding-steps";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useWatch } from "react-hook-form";
import StepHeader from "./step-header";
import type { StepComponentProps } from "./types";

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};
const card = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0 },
};

const slide = {
  enter: (dir: number) => ({ x: dir >= 0 ? 32 : -32, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? -32 : 32, opacity: 0 }),
};

interface OptionGroupProps {
  value: string | undefined;
  options: OnboardingOption[];
  columns?: number;
  onSelect: (value: string) => void;
}

function OptionGroup({
  value,
  options,
  columns = 1,
  onSelect,
}: OptionGroupProps) {
  return (
    <motion.div
      variants={list}
      initial="hidden"
      animate="show"
      className={cn(
        "grid gap-2.5",
        columns === 2 ? "grid-cols-2" : "grid-cols-1",
      )}
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <motion.button
            key={option.value}
            type="button"
            variants={card}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(option.value)}
            aria-pressed={selected}
            className={cn(
              "group relative flex items-center justify-between gap-2 rounded-xl border bg-card px-3.5 py-3 text-left transition-all",
              "hover:border-primary/40 hover:shadow-sm",
              selected
                ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30"
                : "border-border",
            )}
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium">{option.label}</span>
              {option.description && (
                <span className="block truncate text-xs text-muted-foreground">
                  {option.description}
                </span>
              )}
            </span>
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-transparent group-hover:border-primary/40",
              )}
            >
              <motion.span
                initial={false}
                animate={{ scale: selected ? 1 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <Check className="size-3" />
              </motion.span>
            </span>
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export default function UseCase({
  content,
  form,
  onNext,
  onBack,
}: StepComponentProps) {
  const groups = content.groups ?? [];
  // Page through one question per screen. [index, direction] for the slide.
  const [[index, dir], setIndex] = useState<[number, number]>([0, 0]);

  const values = useWatch({
    control: form.control,
    name: ["role", "goal", "teamSize"],
  });
  const selectedByField: Record<OnboardingFieldKey, string | undefined> = {
    role: values[0],
    goal: values[1],
    teamSize: values[2],
  };
  const { errors } = form.formState;

  const group = groups[index];
  const total = groups.length;
  const isLastQuestion = index === total - 1;

  const select = (field: OnboardingFieldKey) => (value: string) => {
    form.setValue(field, value as never, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleNext = async () => {
    if (group) {
      const valid = await form.trigger(group.field);
      if (!valid) return;
    }
    if (isLastQuestion) {
      void onNext(); // hand control back to the wizard (advance to "Done")
    } else {
      setIndex([index + 1, 1]);
    }
  };

  const handleBack = () => {
    if (index > 0) {
      setIndex([index - 1, -1]);
    } else {
      onBack(); // back to the previous wizard step ("Profile")
    }
  };

  if (!group) return null;

  return (
    <div className="space-y-7">
      {/* Section eyebrow + sub-step indicator */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          About you
        </span>
        <div className="flex items-center gap-1.5">
          {groups.map((g, i) => (
            <motion.span
              key={g.field}
              initial={false}
              animate={{
                width: i === index ? 18 : 6,
                opacity: i <= index ? 1 : 0.4,
              }}
              className={cn(
                "h-1.5 rounded-full",
                i <= index ? "bg-primary" : "bg-muted-foreground/30",
              )}
            />
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={dir} initial={false}>
          <motion.div
            key={group.field}
            custom={dir}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 340, damping: 32 },
              opacity: { duration: 0.18 },
            }}
            className="space-y-5"
          >
            <StepHeader title={group.title} />
            <OptionGroup
              value={selectedByField[group.field]}
              options={group.options}
              columns={group.columns}
              onSelect={select(group.field)}
            />
            {errors[group.field]?.message && (
              <FieldError>{errors[group.field]?.message}</FieldError>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={handleBack}>
          <ArrowLeft />
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1"
          onClick={() => void handleNext()}
        >
          {isLastQuestion ? content.cta : "Next"}
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
