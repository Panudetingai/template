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
import appConfig from "@/configs/app.config";
import { api } from "@/lib/elysia/eden-client";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Github, Google } from "@lobehub/icons";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export const SignInSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email" })
    .email({ message: "Please enter a valid email address" })
    .max(100, { message: "Email must be less than 100 characters" }),
  password: z
    .string()
    .min(1, { message: "Please enter your password" })
    .min(8, { message: "Please enter a valid password" })
    .max(20, { message: "Password must be less than 20 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: "Please enter a valid password" }),
});

export type SignInSchemaType = z.infer<typeof SignInSchema>;

export default function SignInForm() {
  const router = useRouter();
  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: handleProvider } = useMutation({
    mutationFn: async (provider: "google" | "github") => {
      const response = await api.auth.provider.post({ provider });
      if (response.error) {
        form.setError("root.serverError", {
          message: response.error.value.message as string,
        });
        return;
      }
      router.push(response.data.url);
      return;
    },
  });

  const onSubmit = form.handleSubmit(async (data) => {
    toast.warning("Coming soon to use email and password to sign in", {
      description: `We are working on it ${data.email} ${data.password}`,
    });
  });

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">Sign in to your account</CardTitle>
        <CardDescription className="text-sm">
          Enter your email and password to sign in to your account or continue
          with Google or GitHub
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
                     disabled
                      {...field}
                      placeholder="example@example.com"
                      type="email"
                      className={cn("w-full", fieldState.error && "border-destructive ring-destructive")}
                    />
                  </FieldContent>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel>Password</FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      placeholder="Enter your password"
                      type="password"
                      className={cn("w-full", fieldState.error && "border-destructive ring-destructive")}
                    />
                  </FieldContent>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" size={"lg"} className="w-full">
            Sign in to your account
          </Button>
          <div className="relative flex items-center justify-center">
            <hr className="flex-1" />
            <span className="text-sm text-muted-foreground px-2">
              Or continue with
            </span>
            <hr className="flex-1" />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              onClick={() => handleProvider("google")}
              variant={"outline"}
              size={"lg"}
              className="w-full"
            >
              <Google />
              Google
            </Button>
            <Button
              type="button"
              onClick={() => handleProvider("github")}
              variant={"outline"}
              size={"lg"}
              className="w-full"
            >
              <Github />
              GitHub
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          All rights reserved.
          &copy; {new Date().getFullYear()} {appConfig.name}
        </p>
      </CardFooter>
    </Card>
  );
}
