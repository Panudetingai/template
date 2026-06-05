import { publicEnv } from "@/env/public";
import { db } from "@/lib/drizzle";
import { createClient } from "@/lib/supabase/server";
import { Elysia } from "elysia";
import z from "zod";
import { users } from "../../../../drizzle/schema";
import { SignInSchema } from "../components/form/signin";

const auth = new Elysia()
  .get("/", () => "auth")
  .post(
    "/signin",
    async ({ body }) => {
      const { email, password } = body;
      const supabase = await createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      return data;
    },
    {
      body: SignInSchema,
    },
  )
  .post(
    "/provider",
    async ({ body }) => {
      const { provider } = body;
      const supabase = await createClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
          scopes: "email profile",
        },
      });

      if (error) throw new Error(error.message);

      return { url: data.url };
    },
    {
      body: z.object({
        provider: z.enum(["google"]),
      }),
    },
  )
  // callback provider
  .get("/callback", async ({ request, redirect }) => {
    const supabase = await createClient();
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const callbackError = searchParams.get("error");
    const callbackErrorCode = searchParams.get("error_code");
    const callbackErrorDescription = searchParams.get("error_description");
    const rawNext = searchParams.get("next");
    const nextPath =
      rawNext && rawNext.startsWith("/") ? rawNext : "/";

    const AUTH_ERROR_MESSAGES: Record<string, string> = {
      server_error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองอีกครั้ง",
      access_denied: "คุณได้ยกเลิกการเชื่อมต่อบัญชี",
    };

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
      return redirect(
        `${origin}${nextPath}${separator}${errorParams.toString()}`,
        302,
      );
    }

    if (!code) throw new Error("Invalid code");

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw new Error(error.message);
    let next = searchParams.get("next");
    if (!next) next = "/";

    // insert user to database
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
      .catch((error) => {
        console.error(error);
        return {
          error: "Failed to insert user to database",
          message: error.message,
          status: 500,
        };
      });

    const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
    const isLocalEnv = process.env.NODE_ENV === "development";
    if (isLocalEnv) {
      // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
      return redirect(`${origin}${next}`, 302);
    } else if (forwardedHost) {
      return redirect(`https://${forwardedHost}${next}`, 302);
    } else {
      return redirect(`${origin}${next}`, 302);
    }
  });

export default auth;
