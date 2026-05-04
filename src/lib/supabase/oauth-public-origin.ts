import { publicEnv } from "@/env/public";
import type { NextRequest } from "next/server";

/**
 * Origin สำหรับ OAuth redirect_uri ต้องตรงกับที่ผู้ใช้เปิดจริง (host + scheme)
 * ถ้าใช้แค่ NEXT_PUBLIC_APP_URL ขณะที่เปิด http://localhost แต่ env เป็น https://localhost
 * จะทำให้ PKCE / แลกโค้ดพัง → "Unexpected end of JSON input"
 */
export function oauthPublicOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    const host = forwardedHost.split(",")[0]?.trim() ?? forwardedHost;
    const proto =
      (forwardedProto ?? "https").split(",")[0]?.trim() || "https";
    return `${proto}://${host}`;
  }
  if (process.env.NODE_ENV === "development") {
    return request.nextUrl.origin;
  }
  return publicEnv.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
}

export function oauthCallbackUrl(request: NextRequest): string {
  return `${oauthPublicOrigin(request)}/api/auth/callback`;
}
