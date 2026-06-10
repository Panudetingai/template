import routerConfig from "@/configs/route.config";
import { NextRequest, NextResponse } from "next/server";

import {
    getCachedOnboardingStatus,
    needsOnboarding,
} from "./onboarding-status";

const onboardingExemptPaths = new Set([
  routerConfig.auth.SignIn,
  routerConfig.auth.SignUp,
  routerConfig.auth.VerifyEmail,
  routerConfig.auth.ForgotPassword,
  routerConfig.auth.NewPassword,
  routerConfig.error,
  routerConfig.notFound,
]);

export default async function onboardingProxy(
  request: NextRequest,
  response: NextResponse,
  userId?: string,
) {
  if (!userId) return response;

  const { pathname } = request.nextUrl;
  if (onboardingExemptPaths.has(pathname)) return response;

  const status = await getCachedOnboardingStatus(userId);
  const isOnboardingPage = pathname === routerConfig.onboarding;

  if (needsOnboarding(status)) {
    // Not finished yet — keep them in the onboarding flow (avoid a redirect
    // loop when they're already on the onboarding page).
    if (isOnboardingPage) return response;

    const url = request.nextUrl.clone();
    url.pathname = routerConfig.onboarding;
    return NextResponse.redirect(url);
  }

  // Onboarding is complete — never let them sit on the onboarding page.
  if (isOnboardingPage) {
    const url = request.nextUrl.clone();
    url.pathname = routerConfig.app.Dashboard;
    return NextResponse.redirect(url);
  }

  return response;
}
