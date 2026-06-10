"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import {
    InputGroup,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import appConfig from "@/configs/app.config";
import routerConfig from "@/configs/route.config";
import { api } from "@/lib/elysia/eden-client";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
    NewPasswordSchema,
    type NewPasswordSchemaType,
} from "@/module/auth/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, EyeIcon, EyeOffIcon, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

type SessionState = "loading" | "ready" | "invalid";

export default function NewPasswordForm() {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const form = useForm<NewPasswordSchemaType>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionState(session ? "ready" : "invalid");
    });
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: NewPasswordSchemaType) => {
      const response = await api.auth["new-password"].post({
        password: data.password,
        confirmPassword: data.confirmPassword,
      });

      if (response.error) throw response.error;

      return response.data;
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutate(data, {
      onSuccess: async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success("Password updated", {
          description: "You can now sign in with your new password.",
        });
        router.push(routerConfig.auth.SignIn);
      },
      onError: (error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update password. Please try again.";
        toast.error(message);
      },
    });
  });

  if (sessionState === "loading") {
    return <Spinner />;
  }

  if (sessionState === "invalid") {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center flex flex-col gap-2">
          <div
            className={cn(
              "mx-auto mb-2 flex size-14 items-center justify-center rounded-full",
              "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
            )}
          >
            <AlertCircle className="size-6" aria-hidden />
          </div>
          <CardTitle className="text-lg">Invalid or expired link</CardTitle>
          <CardDescription className="text-sm text-balance">
            This password reset link is invalid or has expired. Please request a
            new one.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button asChild size="lg" className="w-full">
            <Link href={routerConfig.auth.ForgotPassword}>
              Request new link
            </Link>
          </Button>
          <div className="flex justify-center">
            <Link
              href={routerConfig.auth.SignIn}
              className="text-sm text-primary underline"
            >
              Back to sign in
            </Link>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            All rights reserved. &copy; {new Date().getFullYear()}{" "}
            {appConfig.name}
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center flex flex-col gap-2">
        <div
          className={cn(
            "mx-auto mb-2 flex size-14 items-center justify-center rounded-full",
            "bg-primary/10 text-primary ring-1 ring-primary/20",
          )}
        >
          <LockKeyhole className="size-6" aria-hidden />
        </div>
        <CardTitle className="text-lg">Set a new password</CardTitle>
        <CardDescription className="text-sm">
          Enter your new password below. Make sure it&apos;s at least 8
          characters with uppercase, lowercase, number, and special character.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>New password</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        placeholder="Enter your new password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={cn(
                          fieldState.error &&
                            "border-destructive ring-destructive",
                        )}
                      />
                      <InputGroupButton
                        type="button"
                        variant="ghost"
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? (
                          <EyeIcon className="size-4 shrink-0 opacity-50" />
                        ) : (
                          <EyeOffIcon className="size-4 shrink-0 opacity-50" />
                        )}
                      </InputGroupButton>
                    </InputGroup>
                  </FieldContent>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Confirm password</FieldLabel>
                  <FieldContent>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        placeholder="Confirm your new password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        className={cn(
                          fieldState.error &&
                            "border-destructive ring-destructive",
                        )}
                      />
                      <InputGroupButton
                        type="button"
                        variant="ghost"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                      >
                        {showConfirmPassword ? (
                          <EyeIcon className="size-4 shrink-0 opacity-50" />
                        ) : (
                          <EyeOffIcon className="size-4 shrink-0 opacity-50" />
                        )}
                      </InputGroupButton>
                    </InputGroup>
                  </FieldContent>
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
            {isPending ? <Spinner /> : "Update password"}
          </Button>
          <div className="flex justify-center">
            <Link
              href={routerConfig.auth.SignIn}
              className="text-sm text-primary underline"
            >
              Back to sign in
            </Link>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          All rights reserved. &copy; {new Date().getFullYear()}{" "}
          {appConfig.name}
        </p>
      </CardFooter>
    </Card>
  );
}
