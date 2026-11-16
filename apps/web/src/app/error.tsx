"use client";

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface to the console in dev; wire to your monitoring service here.
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="max-w-sm text-sm text-muted-foreground text-balance">
          An unexpected error occurred. You can try again, and if it keeps
          happening, please contact support.
        </p>
      </div>
      <Button size="lg" onClick={reset}>
        <RotateCcw />
        Try again
      </Button>
    </div>
  );
}
