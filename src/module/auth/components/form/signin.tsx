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
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Github, Google } from "@lobehub/icons";
import { useCallback, useState } from "react";
import { Controller, useForm, useFormState } from "react-hook-form";
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
  const form = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { errors } = useFormState({ control: form.control });
  const oauthError = errors.root?.serverError?.message as string | undefined;

  const [oauthPendingProvider, setOauthPendingProvider] = useState<
    "google" | "github" | null
  >(null);

  const startOAuth = useCallback(
    async (provider: "google" | "github") => {
      form.clearErrors("root.serverError");
      const toastId = toast.loading("กำลังเปิดหน้าเข้าสู่ระบบ…");
      setOauthPendingProvider(provider);

      try {
        const res = await fetch(`${window.location.origin}/api/auth/provider`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ provider }),
        });
        const text = await res.text();
        let data: { url?: string; message?: string } = {};
        if (text) {
          try {
            data = JSON.parse(text) as { url?: string; message?: string };
          } catch {
            form.setError("root.serverError", {
              message: "เซิร์ฟเวอร์ตอบกลับไม่ใช่ JSON ที่ถูกต้อง",
            });
            toast.error("เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง");
            return;
          }
        }
        if (!res.ok) {
          const msg =
            data.message ??
            `OAuth ล้มเหลว (${res.status}). เปิดแท็บ Network และดู /api/auth/provider`;
          form.setError("root.serverError", { message: msg });
          toast.error(msg);
          return;
        }
        if (!data.url) {
          const msg =
            data.message ?? "ไม่ได้รับ URL สำหรับ OAuth จากเซิร์ฟเวอร์";
          form.setError("root.serverError", { message: msg });
          toast.error(msg);
          return;
        }
        toast.dismiss(toastId);
        window.location.assign(data.url);
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : "เชื่อมต่อเซิร์ฟเวอร์ไม่สำเร็จ — เช็กเน็ตหรือที่บล็อก fetch";
        form.setError("root.serverError", { message: msg });
        toast.error(msg);
      } finally {
        toast.dismiss(toastId);
        setOauthPendingProvider(null);
      }
    },
    [form],
  );

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
      <CardContent className="flex flex-col gap-6">
        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
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
        </form>
        {oauthError ? (
          <FieldError role="alert">{oauthError}</FieldError>
        ) : null}
        <div className="flex flex-col gap-4">
          <div className="relative flex items-center justify-center gap-2">
            <hr className="flex-1" />
            <span className="text-sm whitespace-nowrap text-muted-foreground px-2">
              Or continue with
            </span>
            <hr className="flex-1" />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              disabled={oauthPendingProvider !== null}
              onClick={() => void startOAuth("google")}
              variant={"outline"}
              size={"lg"}
              className="w-full"
            >
              <Google aria-hidden />
              {oauthPendingProvider === "google" ? "กำลังเปิดหน้า…" : "Google"}
            </Button>
            <Button
              type="button"
              disabled={oauthPendingProvider !== null}
              onClick={() => void startOAuth("github")}
              variant={"outline"}
              size={"lg"}
              className="w-full"
            >
              <Github aria-hidden />
              {oauthPendingProvider === "github" ? "กำลังเปิดหน้า…" : "GitHub"}
            </Button>
          </div>
        </div>
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
