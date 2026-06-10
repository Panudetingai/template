import routerConfig from "@/configs/route.config";
import { publicEnv } from "@/env/public";
import { createClient } from "@/lib/supabase/server";
import { AuthError } from "@supabase/supabase-js";
import { Elysia } from "elysia";
import z from "zod";
import {
    NewPasswordSchema,
    ResetPasswordSchema,
    SignInSchema,
    SignupSchema,
} from "../schema";
import { AuthService } from "../service/auth.service";
import { CallbackService } from "../service/callback.service";

const auth = new Elysia()
  .get("/", () => "auth")
  .post(
    "/signin",
    async ({ body }) => {
      const { email, password } = body;
      const supabase = await createClient();

      const authService = new AuthService(supabase);
      const authResponse = await authService.signIn({ email, password });
      if (authResponse instanceof AuthError) throw new Error(authResponse.message);
      return authResponse;
    },
    {
      body: SignInSchema,
    },
  )
  .post(
    "/signup",
    async ({ body }) => {
      const { email, password } = body;
      const supabase = await createClient();
      const authService = new AuthService(supabase);
      const response = await authService.signup({ email, password });
      if (response instanceof AuthError) throw response;
      return response;
    },
    {
      body: SignupSchema,
    },
  )
  .post(
    "/forgot-password",
    async ({ body }) => {
      const { email } = body;
      const supabase = await createClient();
      const authService = new AuthService(supabase);
      const response = await authService.resetPassword(email);
      if (response instanceof AuthError) throw new Error(response.message);
      return response;
    },
    {
      body: ResetPasswordSchema,
    },
  )
  .post(
    "/new-password",
    async ({ body }) => {
      const { password } = body;
      const supabase = await createClient();
      const authService = new AuthService(supabase);
      const response = await authService.updatePassword(password);
      if (response instanceof AuthError) throw new Error(response.message);
      return response;
    },
    {
      body: NewPasswordSchema,
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
          redirectTo: `${publicEnv.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=${encodeURIComponent(routerConfig.app.Dashboard)}`,
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
  // OAuth callback — delegated to the auth service.
  .get("/callback", async ({ request, redirect }) => {
    const callback = await CallbackService.create(request);
    const { url, status } = await callback.handle();
    return redirect(url, status);
  })
;

export default auth;
