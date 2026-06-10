"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import routerConfig from "@/configs/route.config";
import { api } from "@/lib/elysia/eden-client";
import { getUser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
    SetupProfileSchema,
    type SetupProfileSchemaType,
} from "@/module/onboarding/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@supabase/supabase-js";
import { useMutation } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import UploadAvatar from "../hooks/upload-avatar";

interface SetupProfileProps {
  onComplete?: () => void;
}

export default function SetupProfile({ onComplete }: SetupProfileProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const form = useForm<SetupProfileSchemaType>({
    resolver: zodResolver(SetupProfileSchema),
    defaultValues: {
      username: "",
      avatarUrl: "",
    },
  });

  const [username, avatarUrl] = useWatch({
    control: form.control,
    name: ["username", "avatarUrl"],
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

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: SetupProfileSchemaType) => {
      const response = await api.onboarding["setup-profile"].post({
        username: data.username,
        avatarUrl: data.avatarUrl || undefined,
      });

      if (response.error) throw response.error;

      return response.data;
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Profile saved", {
          description: "Your profile has been set up successfully.",
        });
        onComplete?.();
        router.push(routerConfig.app.Dashboard);
      },
      onError: (error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to save profile. Please try again.";
        toast.error(message);
      },
    });
  });

  if (isLoadingUser) {
    return <Spinner />;
  }

  if (!user) return null;

  const displayName = username || user.email?.split("@")[0] || "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="max-w-sm w-md">
        <CardHeader className="items-center text-center">
          <CardTitle className="text-lg">Set up your profile</CardTitle>
          <CardDescription className="text-sm">
            Tell us a bit about yourself to personalize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="flex flex-col items-center gap-3">
            <UploadAvatar initials={initials} />
              <p className="text-sm text-muted-foreground">{user.email}</p>
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

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? <Spinner /> : "Continue"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
