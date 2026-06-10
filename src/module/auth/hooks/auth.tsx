"use client";

import routerConfig from "@/configs/route.config";
import { createClient } from "@/lib/supabase/client";
import type { Session, User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function isEmailVerified(user: User | undefined) {
  if (!user) return false;
  const user_metadata = user.user_metadata as { email_verified: boolean };
  if (!user_metadata) return false;
  if (user_metadata.email_verified === false) return false;
  return Boolean(user_metadata.email_verified);
}

function redirectIfVerified(session: Session | null, router: ReturnType<typeof useRouter>, setIsPending: (isPending: boolean) => void) {
  if (!session) return false;
  setIsPending(true);
  const verified = isEmailVerified(session.user);

  if (verified) {
    setIsPending(false);
    setTimeout(() => {
      router.push(routerConfig.app.Dashboard);
    }, 3000);
    return true;
  }

  return false;
}

export function useAuthOnChangeEmailVerification(isPending: boolean, setIsPending: (isPending: boolean) => void) {
  const router = useRouter();
  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getSession().then(({ data: { session } }) => {
      redirectIfVerified(session, router, setIsPending);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        redirectIfVerified(session, router, setIsPending);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);
}
