import { db } from "@/lib/drizzle";
import { createClient } from "@/lib/supabase/server";
import { Elysia } from "elysia";
import { cookies } from "next/headers";
import z from "zod";
import { githubAccessTokens, users } from "../../../../drizzle/schema";
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
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
          scopes: "email profile",
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
  .post('/link-provider', async ({body}) : Promise<{url: string}> => {
    const {provider} = body
    const supabase = await createClient();
    const {data, error} = await supabase.auth.linkIdentity({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?identity=${provider}`,
        scopes: 'read:user read:email repo'
      }
    });
    if (error) throw new Error(error.message);
    if (!data?.url) throw new Error('Failed to link provider');
    return { url: data.url }
  }, {
    body: z.object({
      provider: z.enum(["github"]),
    }),
    response: z.object({
      url: z.string(),
    })
  })
  // callback provider
  .get("/callback", async ({ request, redirect }) => {
    const supabase = await createClient();
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const identity = searchParams.get("identity");
    const callbackError = searchParams.get("error");
    const callbackErrorDescription = searchParams.get("error_code");
    
    if (callbackError) {
      if (callbackErrorDescription === 'identity_already_exists') {
        return redirect(`${origin}?link-provider-error=${callbackErrorDescription}`, 302);
      } else {
        return redirect(`${origin}/`, 302);
      }
    }
    
    
    if (!code) throw new Error("Invalid code");
    if (identity && identity === 'github') {
      const {data, error} = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        return {
          error: error.message,
          status: 400,
        }
      }

      // set github access token to cookies
      const cookiesoptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      };
      
      // provider token to database
      await db.insert(githubAccessTokens).values({
        userId: data.user.id!,
        providerToken: data.session.access_token,
        expiresAt: new Date(data.session.expires_at!).toISOString(),
        owner: data.session.user.user_metadata.name!,
      }).onConflictDoUpdate({
        target: [githubAccessTokens.userId],
        set: {
          providerToken: data.session.access_token,
          expiresAt: new Date(data.session.expires_at!).toISOString(),
          owner: data.session.user.user_metadata.name!,
        },
      });
      const cookieStore = await cookies();
      cookieStore.set('github_access_token', data.session.access_token, cookiesoptions);
      return redirect(`${origin}/`, 302);
    }
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
