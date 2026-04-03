import { publicEnv } from "@/env/public";
import { db } from "@/lib/drizzle";
import { createClient } from "@/lib/supabase/server";
import type { UserIdentity } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { cookies } from "next/headers";
import z from "zod";
import {
  githubAccessTokens,
  users,
} from "../../../../drizzle/schema";
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
      const providerScopes = provider === "github" ? "read:user read:email repo" : "email profile";
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
          scopes: providerScopes,
        },
      });

      if (error) throw new Error(error.message);

      return { url: data.url };
    },
    {
      body: z.object({
        provider: z.enum(["google", "github"]),
      }),
    },
  )
  .post('/link-provider', async ({ body }): Promise<{ url: string }> => {
    const { provider, next } = body;
    const supabase = await createClient();
    const callbackParams = new URLSearchParams({ identity: provider });
    if (next) callbackParams.set("next", next);
    const redirectTo = `${publicEnv.NEXT_PUBLIC_APP_URL}/api/auth/callback?${callbackParams.toString()}`;
    const { data, error } = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo,
        scopes: "read:user read:email repo",
      },
    });
    if (error) throw new Error(error.message);
    if (!data?.url) throw new Error("Failed to link provider");
    return { url: data.url };
  }, {
    body: z.object({
      provider: z.enum(["github"]),
      next: z.string().optional(),
    }),
    response: z.object({
      url: z.string(),
    }),
  })
  .post("/unlink-provider", async ({ body }) => {
    const { provider } = body;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return { error: "Unauthorized", status: 401 };
    }

    const { data: identitiesData } = await supabase.auth.getUserIdentities();
    const identities = identitiesData?.identities ?? [];
    if (identities.length < 2) {
      return {
        error: "Cannot unlink. You need at least one other sign-in method.",
        status: 400,
      };
    }

    const identity = identities.find((i: UserIdentity) => i.provider === provider);
    if (!identity) {
      return { error: "Identity not found", status: 404 };
    }

    const { error: unlinkError } = await supabase.auth.unlinkIdentity(identity);
    if (unlinkError) {
      return { error: unlinkError.message, status: 400 };
    }

    if (provider === "github") {
      await db
        .delete(githubAccessTokens)
        .where(eq(githubAccessTokens.userId, user.id));
      const cookieStore = await cookies();
      cookieStore.delete("github_access_token");
    }

    return { success: true };
  }, {
    body: z.object({
      provider: z.enum(["github"]),
    }),
  })
  // callback provider
  .get("/callback", async ({ request, redirect }) => {
    const supabase = await createClient();
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const identity = searchParams.get("identity");
    const callbackError = searchParams.get("error");
    const callbackErrorCode = searchParams.get("error_code");
    const callbackErrorDescription = searchParams.get("error_description");
    const rawNext = searchParams.get("next");
    const nextPath =
      rawNext && rawNext.startsWith("/") ? rawNext : "/";

    const AUTH_ERROR_MESSAGES: Record<string, string> = {
      identity_already_exists:
        "บัญชี GitHub นี้เชื่อมโยงกับผู้ใช้อื่นอยู่แล้ว กรุณาใช้บัญชีอื่นหรือล็อกอินด้วยบัญชีที่มีอยู่",
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
    if (identity && identity === "github") {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return {
          error: error.message,
          status: 400,
        };
      }

      const githubIdentity = data.user.identities?.find(
        (i: UserIdentity) => i.provider === "github",
      );
      const owner =
        (githubIdentity?.identity_data as { user_name?: string })?.user_name ??
        (githubIdentity?.identity_data as { login?: string })?.login ??
        data.user.user_metadata?.name ??
        "";

      await db
        .insert(users)
        .values({
          id: data.user.id!,
          username: data.user.user_metadata?.username ?? undefined,
          email: data.user.email!,
          free: "free" as const,
          avatarUrl: data.user.user_metadata?.avatar_url,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: [users.id],
          set: {
            username: data.user.user_metadata?.username,
            email: data.user.email!,
            avatarUrl: data.user.user_metadata?.avatar_url,
            updatedAt: new Date().toISOString(),
          },
        });

      const providerToken = data.session.provider_token ?? data.session.access_token;
      await db
        .insert(githubAccessTokens)
        .values({
          userId: data.user.id!,
          providerToken,
          expiresAt: new Date(data.session.expires_at!).toISOString(),
          owner,
        })
        .onConflictDoUpdate({
          target: [githubAccessTokens.userId],
          set: {
            providerToken,
            expiresAt: new Date(data.session.expires_at!).toISOString(),
            owner,
          },
        });

      const cookiesOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      };
      const cookieStore = await cookies();
      cookieStore.set("github_access_token", data.session.access_token, cookiesOptions);
      return redirect(`${origin}${nextPath}`, 302);
    }
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw new Error(error.message);
    let next = searchParams.get("next");
    if (!next) next = "/";

    // check if provider is github 
    const providerToken = data.session.provider_token?.includes('gho_') && data.session.provider_token;
    if (providerToken) {
      await db
        .insert(githubAccessTokens)
        .values({
          userId: data.user.id!,
          providerToken,
          expiresAt: new Date(data.session.expires_at!).toISOString(),
          owner: data.user.user_metadata.user_name ?? undefined,
        }).onConflictDoUpdate({
          target: [githubAccessTokens.userId],
          set: {
            providerToken,
            expiresAt: new Date(data.session.expires_at!).toISOString(),
            owner: data.user.user_metadata.user_name ?? undefined,
          },
        });
    }

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

    if (code) {
      if (!error) {
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
      }
    }

    return redirect(`${origin}${next}`, 302);
  });

export default auth;
