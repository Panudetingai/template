"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Controller, useWatch } from "react-hook-form";
import UploadAvatar from "../hooks/upload-avatar";
import StepHeader from "./steps/step-header";
import type { StepComponentProps } from "./steps/types";

export default function SetupProfile({
  user,
  content,
  form,
  onNext,
  onBack,
}: StepComponentProps) {
  const [username, avatarUrl] = useWatch({
    control: form.control,
    name: ["username", "avatarUrl"],
  });

  const displayName = username || user.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-8">
      <StepHeader
        title="Set up your profile"
        description="Tell us a bit about yourself to personalize your experience."
      />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 18 }}
          >
            <UploadAvatar
              initials={initials}
              userId={user.id}
              value={avatarUrl || undefined}
              onChange={(url) =>
                form.setValue("avatarUrl", url, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />
          </motion.div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Click the avatar to upload a photo.
            </p>
          </div>
        </div>

        <FieldGroup>
          <Controller
            control={form.control}
            name="username"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Username</FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    placeholder="johndoe"
                    autoComplete="username"
                    autoFocus
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void onNext();
                      }
                    }}
                    className={cn(
                      fieldState.error &&
                        "border-destructive ring-destructive",
                    )}
                  />
                </FieldContent>
                <FieldDescription>
                  Letters, numbers, and underscores only.
                </FieldDescription>
                {fieldState.error && (
                  <FieldError>{fieldState.error.message}</FieldError>
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          <ArrowLeft />
          Back
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-1"
          onClick={() => void onNext()}
        >
          {content.cta}
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
