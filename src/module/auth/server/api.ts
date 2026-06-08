import { publicEnv } from "@/env/public";
import { createClient } from "@/lib/supabase/server";
import { Elysia } from "elysia";
import z from "zod";
import { SignInSchema, SignupSchema } from "../schema";
import { CallbackService } from "../service/callback.service";
import { AuthService } from "../service/auth.service";
import { AuthError } from "@supabase/supabase-js";
import routerConfig from "@/configs/route.config";

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
