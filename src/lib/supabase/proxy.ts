import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import routerConfig from "@/configs/route.config";
import { publicEnv } from "@/env/public";

const AUTH_COOKIE_NAME = `${publicEnv.NEXT_PUBLIC_COOKIE_PREFIX}-${publicEnv.NEXT_PUBLIC_SUPABASE_PROJECT_REF}-auth-token`;
type SessionResult = {
  response: NextResponse;
  userId?: string;
};

export async function updateSession(request: NextRequest): Promise<SessionResult> {
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

  console.log("user =>", user)

  const publicAuthPages = [
    routerConfig.auth.SignIn,
    routerConfig.auth.SignUp,
    routerConfig.auth.VerifyEmail,
    routerConfig.auth.ForgotPassword,
    routerConfig.auth.NewPassword,
    routerConfig.onboarding,
  ];

  const authenticatedRedirectPages = [
    routerConfig.auth.SignIn,
    routerConfig.auth.SignUp,
    routerConfig.auth.ForgotPassword,
  ];

  if (
    !user &&
    !publicAuthPages.includes(request.nextUrl.pathname)
  ) {
    const url = request.nextUrl.clone();
    if (!request.nextUrl.pathname.startsWith("/auth/sign-up")) {
      url.pathname = routerConfig.auth.SignIn;
    } else {
      url.pathname = routerConfig.auth.SignUp;
    }
    return {
      response: NextResponse.redirect(url),
    };
  }

  if (user && authenticatedRedirectPages.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = routerConfig.app.Dashboard;
    return {
      response: NextResponse.redirect(url),
      userId: user.sub,
    };
  }

  return {
    response: supabaseResponse,
    userId: user?.sub,
  };
}
