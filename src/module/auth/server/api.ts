import { publicEnv } from "@/env/public";
import { createClient } from "@/lib/supabase/server";
import { Elysia } from "elysia";
import z from "zod";
import { SignInSchema } from "../components/form/signin";
import { CallbackService } from "../service/callback.service";

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
  // OAuth callback — delegated to the auth service.
  .get("/callback", async ({ request, redirect }) => {
    const callback = await CallbackService.create(request);
    const { url, status } = await callback.handle();
    return redirect(url, status);
  });

export default auth;
