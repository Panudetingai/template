import { publicEnv } from "@/env/public";
import { db } from "@/lib/drizzle";
import { users } from "../../../../drizzle/schema";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { serverEnv } from "@/env/server";

function safeNextPath(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/";
  }
  return raw;
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  identity_already_exists:
    "บัญชี GitHub นี้เชื่อมโยงกับผู้ใช้อื่นอยู่แล้ว กรุณาใช้บัญชีอื่นหรือล็อกอินด้วยบัญชีที่มีอยู่",
  server_error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองอีกครั้ง",
  access_denied: "คุณได้ยกเลิกการเชื่อมต่อบัญชี",
};

/**
 * OAuth / PKCE callback — ต้องใช้ NextResponse + response.cookies ตามแพทเทิร์น @supabase/ssr
 * เพื่อให้ session cookies ถูกส่งหลัง exchangeCodeForSession
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const callbackError = url.searchParams.get("error");
  const callbackErrorCode = url.searchParams.get("error_code");
  const callbackErrorDescription = url.searchParams.get("error_description");
  const rawNext = url.searchParams.get("next");
  const nextPath = safeNextPath(rawNext);

  if (callbackError) {
    const errorCode = callbackErrorCode ?? callbackError;
    const userMessage =
      AUTH_ERROR_MESSAGES[errorCode] ??
      AUTH_ERROR_MESSAGES[callbackError] ??
      callbackErrorDescription ??
      "เกิดข้อผิดพลาดในการเชื่อมต่อบัญชี กรุณาลองอีกครั้ง";
    const errorParams = new URLSearchParams({
      "auth-error": errorCode,
      "auth-error-message": userMessage,
    });
    const separator = nextPath.includes("?") ? "&" : "?";
    return NextResponse.redirect(
      new URL(`${nextPath}${separator}${errorParams.toString()}`, url.origin),
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth/sign-in?auth-error=missing_code", url.origin),
    );
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";
  const redirectBase =
    !isLocalEnv && forwardedHost
      ? `https://${forwardedHost}`
      : url.origin;

  const redirectTarget = new URL(nextPath, redirectBase);
  let response = NextResponse.redirect(redirectTarget);

  const cookieStore = await cookies();

  const supabase = createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        flowType: "pkce",
      },
      cookieOptions: {
        name: `${serverEnv.COOKIE_PREFIX}-supabase-auth-token`,
      },
      cookies: {
        getAll() {
          const merged = new Map<string, { name: string; value: string }>();
          for (const c of cookieStore.getAll()) {
            merged.set(c.name, { name: c.name, value: c.value });
          }
          for (const c of request.cookies.getAll()) {
            merged.set(c.name, { name: c.name, value: c.value });
          }
          return [...merged.values()];
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth/callback] exchangeCodeForSession error:", {
      name: error.name,
      message: error.message,
      status: (error as { status?: number }).status,
    });
    const q = new URLSearchParams({
      "auth-error": "exchange_failed",
      "auth-error-message": error.message,
    });
    return NextResponse.redirect(
      new URL(`/auth/sign-in?${q.toString()}`, redirectBase),
    );
  }

  await db
    .insert(users)
    .values({
      id: data.user.id!,
      username: data.user.user_metadata.username ?? undefined,
      email: data.user.user_metadata.email!,
      free: "free" as const,
      avatarUrl: data.user.user_metadata.avatar_url,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: [users.id],
      set: {
        username: data.user.user_metadata.username,
        email: data.user.user_metadata.email!,
        free: "free" as const,
        avatarUrl: data.user.user_metadata.avatar_url,
        updatedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      },
    })
    .catch((e) => {
      console.error(e);
    });

  return response;
}
