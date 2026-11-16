import { NextResponse, type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";

/** Provider-side error codes mapped to user-facing messages. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  server_error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองอีกครั้ง",
  access_denied: "คุณได้ยกเลิกการเชื่อมต่อบัญชี",
};
const DEFAULT_ERROR_MESSAGE =
  "เกิดข้อผิดพลาดในการเชื่อมต่อบัญชี กรุณาลองอีกครั้ง";

/** Only same-site relative paths — rejects `//evil.com` and `/\evil.com`. */
function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return "/";
  }
  return raw;
}

function redirectWithError(
  origin: string,
  nextPath: string,
  code: string,
  description: string | null,
) {
  const params = new URLSearchParams({
    "auth-error": code,
    "auth-error-message":
      AUTH_ERROR_MESSAGES[code] ?? description ?? DEFAULT_ERROR_MESSAGE,
  });
  const separator = nextPath.includes("?") ? "&" : "?";
  return NextResponse.redirect(`${origin}${nextPath}${separator}${params}`);
}

/**
 * OAuth / email-link landing route. Exchanges the auth code for a session
 * (cookies are set here, on the web origin) and redirects onward. The API
 * creates the user's row lazily on first authenticated request.
 */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const nextPath = safeNextPath(searchParams.get("next"));

  const providerError = searchParams.get("error");
  if (providerError) {
    return redirectWithError(
      origin,
      nextPath,
      searchParams.get("error_code") ?? providerError,
      searchParams.get("error_description"),
    );
  }

  const code = searchParams.get("code");
  if (!code) return redirectWithError(origin, nextPath, "missing_code", null);

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return redirectWithError(origin, nextPath, error.code ?? "exchange_failed", error.message);
  }

  // Behind a proxy/load balancer trust the original host.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = !isLocal && forwardedHost ? `https://${forwardedHost}` : origin;
  return NextResponse.redirect(`${base}${nextPath}`);
}
