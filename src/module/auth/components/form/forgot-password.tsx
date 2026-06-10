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
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import appConfig from "@/configs/app.config";
import routerConfig from "@/configs/route.config";
import { api } from "@/lib/elysia/eden-client";
import { cn } from "@/lib/utils";
import {
    ResetPasswordSchema,
    type ResetPasswordSchemaType,
} from "@/module/auth/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function ResetPasswordForm() {
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const form = useForm<ResetPasswordSchemaType>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: ResetPasswordSchemaType) => {
      const response = await api.auth["forgot-password"].post({
        email: data.email,
      });

      if (response.error) throw response.error;

      return response.data;
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    mutate(data, {
      onSuccess: () => {
        setSubmittedEmail(data.email);
        toast.success("Reset link sent", {
          description: "Check your inbox for the password reset email.",
        });
      },
      onError: (error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to send reset email. Please try again.";
        toast.error(message);
      },
    });
  });

  if (submittedEmail) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center flex flex-col gap-2">
          <div
            className={cn(
              "mx-auto mb-2 flex size-14 items-center justify-center rounded-full",
              "bg-primary/10 text-primary ring-1 ring-primary/20",
            )}
          >
            <Mail className="size-6" aria-hidden />
          </div>
          <CardTitle className="text-lg">Check your inbox</CardTitle>
          <CardDescription className="text-sm text-balance">
            We sent a password reset link to{" "}
            <span className="font-medium text-foreground">{submittedEmail}</span>
            . Click the link in the email to set a new password.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => setSubmittedEmail(null)}
          >
            Use a different email
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
          <KeyRound className="size-6" aria-hidden />
        </div>
        <CardTitle className="text-lg">Reset your password</CardTitle>
        <CardDescription className="text-sm">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      placeholder="example@example.com"
                      type="email"
                      autoComplete="email"
                      className={cn(
                        "w-full",
                        fieldState.error &&
                          "border-destructive ring-destructive",
                      )}
                    />
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
            {isPending ? <Spinner /> : "Send reset link"}
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
