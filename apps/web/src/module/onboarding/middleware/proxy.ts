import routerConfig from "@/configs/route.config";
import { NextRequest, NextResponse } from "next/server";

import { getOnboardingStatus } from "./onboarding-status";

const onboardingExemptPaths = new Set([
  routerConfig.auth.SignIn,
  routerConfig.auth.SignUp,
  routerConfig.auth.VerifyEmail,
  routerConfig.auth.ForgotPassword,
  routerConfig.auth.NewPassword,
  routerConfig.auth.Callback,
  routerConfig.error,
  routerConfig.notFound,
]);

export default async function onboardingProxy(
  request: NextRequest,
  response: NextResponse,
  accessToken?: string,
) {
  if (!accessToken) return response;

  const { pathname } = request.nextUrl;
  if (onboardingExemptPaths.has(pathname)) return response;

  const status = await getOnboardingStatus(accessToken);
  // API unreachable: fail open rather than locking everyone out of the app.
  if (!status) return response;
  const isOnboardingPage = pathname === routerConfig.onboarding;

  if (!status.completed) {
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
