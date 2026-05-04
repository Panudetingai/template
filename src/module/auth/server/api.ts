import { createClient } from "@/lib/supabase/server";
import type { UserIdentity } from "@supabase/supabase-js";
import { Elysia } from "elysia";
import z from "zod";

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

    return { success: true };
  }, {
    body: z.object({
      provider: z.enum(["github"]),
    }),
  });

export default auth;
