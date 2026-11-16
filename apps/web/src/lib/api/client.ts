"use client";

import { treaty } from "@elysiajs/eden";
import type { App } from "@template/api";

import { publicEnv } from "@/env/public";
import { createClient } from "@/lib/supabase/client";

/**
 * Typed client for the standalone API (apps/api). Every request carries the
 * current Supabase access token as a bearer token — the API verifies it.
 */
export const api = treaty<App>(publicEnv.NEXT_PUBLIC_API_URL, {
  headers: async () => {
    const {
      data: { session },
    } = await createClient().auth.getSession();
    return session
      ? { authorization: `Bearer ${session.access_token}` }
      : undefined;
  },
});
