"use client";

import routerConfig from "@/configs/route.config";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect } from "react";
import { toast } from "sonner";

function AuthErrorHandlerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const handleAuthError = useCallback(() => {
    const error = searchParams.get("auth-error");
    const message = searchParams.get("auth-error-message");

    if (!error && !message) return;

    const displayMessage =
      message ?? "เกิดข้อผิดพลาดในการเชื่อมต่อบัญชี กรุณาลองอีกครั้ง";
    toast.error(displayMessage);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("auth-error");
    params.delete("auth-error-message");
    router.replace(routerConfig.app.Repositorie);
  }, [searchParams, router]);

  useEffect(() => {
    handleAuthError();
  }, [handleAuthError]);

  return null;
}

export function AuthErrorHandler() {
  return (
    <Suspense fallback={null}>
      <AuthErrorHandlerInner />
    </Suspense>
  );
}
