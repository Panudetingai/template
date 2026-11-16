import VerifyEmail from "@/module/auth/components/ui/verify-email";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Suspense fallback={null}>
        <VerifyEmail />
      </Suspense>
    </div>
  );
}
