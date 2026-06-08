import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { publicEnv } from "@/env/public";

const AUTH_COOKIE_NAME = `${publicEnv.NEXT_PUBLIC_COOKIE_PREFIX}-${publicEnv.NEXT_PUBLIC_SUPABASE_PROJECT_REF}-auth-token`;
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookieOptions: {
        name: AUTH_COOKIE_NAME,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  if (
    !user &&
    !request.nextUrl.pathname.startsWith("/auth/sign-in") &&
    !request.nextUrl.pathname.startsWith("/auth/sign-up") &&
    !request.nextUrl.pathname.startsWith("/auth/verify-email")
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    if (!request.nextUrl.pathname.startsWith("/auth/sign-up")) {
      url.pathname = "/auth/sign-in"  ;
    } else {
      url.pathname = "/auth/sign-up";
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
