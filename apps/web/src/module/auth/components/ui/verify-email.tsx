"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import appConfig from "@/configs/app.config";
import { cn } from "@/lib/utils";
import { CheckCircleIcon, Mail, MailCheck, RefreshCw } from "lucide-react";
import { useAuthOnChangeEmailVerification } from "../../hooks/auth";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Loader, TextDotsLoader } from "@/components/ui/loader";
import { Spinner } from "@/components/ui/spinner";

const RESEND_COOLDOWN_SECONDS = 60;

const steps = [
  "Open the inbox for the email address you used to sign up.",
  "Find the message from us and click the verification link.",
  "This page will redirect you to the dashboard automatically.",
] as const;

export default function VerifyEmail() {
  const search = useSearchParams();
  const email = search.get("email");
  const [isPendingVerifyEmail, setIsPendingVerifyEmail] = useState(true);

  // onchange email verification
  useAuthOnChangeEmailVerification(isPendingVerifyEmail, setIsPendingVerifyEmail);

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
        <Badge variant="secondary" className="mb-1">
          <MailCheck data-icon="inline-start" />
          Check your inbox
        </Badge>
        <CardTitle className="text-lg">Verify your email</CardTitle>
        <CardDescription className="text-sm text-balance">
          We sent a confirmation link to your email. Once you verify, this page
          will take you to the dashboard automatically.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-center flex flex-col items-center justify-center gap-2">
          <p className="text-xs text-muted-foreground"><span className="font-medium">{email}</span></p>
          <div className="flex items-center justify-center gap-2">
            {
              isPendingVerifyEmail ? <Loader variant="text-shimmer" text="Waiting for verification..." /> : <CheckCircleIcon className="size-4 text-green-500" />
            }
          </div>
        </div>

        <ol className="space-y-3">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full",
                  "bg-muted text-xs font-medium text-muted-foreground",
                )}
              >
                {index + 1}
              </span>
              <span className="pt-0.5 text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full mt-4"
          onClick={() => { }}
          disabled={false}
        >
          <RefreshCw data-icon="inline-start" />
          Resend verification email
        </Button>
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
