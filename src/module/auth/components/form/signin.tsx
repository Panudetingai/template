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
import { SignInSchema, type SignInSchemaType } from "@/module/auth/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Google } from "@lobehub/icons";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

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
    mutationFn: async (provider: "google") => {
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

  const {mutate, isPending} = useMutation({
    mutationFn: async (data: SignInSchemaType) => {
      const response = await api.auth.signin.post({
        email: data.email,
        password: data.password,
      });
      if (response.error) throw response.error;
      return response.data;
    },
  })

  const onSubmit = form.handleSubmit(async (data) => {
    mutate(data, {
      onSuccess: () => {
        toast.success("Signed in successfully");
        router.push(routerConfig.app.Dashboard);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  });

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-lg">Sign in to your account</CardTitle>
        <CardDescription className="text-sm">
          Enter your email and password to sign in to your account or continue
          with Google
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
                      className={cn(
                        "w-full",
                        fieldState.error &&
                          "border-destructive ring-destructive",
                      )}
                    />
                    <div className="flex justify-end">
                      <Link
                        href={routerConfig.auth.ForgotPassword}
                        className="text-sm text-primary underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </FieldContent>
                  {fieldState.error && (
                    <FieldError>{fieldState.error.message}</FieldError>
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <Button type="submit" size={"lg"} className="w-full" disabled={isPending}>
            {isPending ? <Spinner /> : "Sign in to your account"}
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
          </div>
          <div className="flex gap-2 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?
            </p>
            <Link
              href={routerConfig.auth.SignUp}
              className="text-sm text-primary underline"
            >
              sign up
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
