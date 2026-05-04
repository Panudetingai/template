import { publicEnv } from "@/env/public";
import { serverEnv } from "@/env/server";
import { oauthCallbackUrl } from "@/lib/supabase/oauth-public-origin";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  provider: z.enum(["google", "github"]),
});

/**
 * OAuth เริ่มต้น — ต้องให้ PKCE / session cookies ไปกับ Response จริง
 * (Elysia อย่างเดียวมักทำให้คุกกี้ไม่ถึง client → callback แลก code แล้วได้ body ว่าง)
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  let jsonBody: unknown;
  try {
    jsonBody = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(jsonBody);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid body" }, { status: 400 });
  }

  const { provider } = parsed.data;
  const providerScopes =
    provider === "github" ? "read:user read:email repo" : "email profile";

  const cookiesToApply: {
    name: string;
    value: string;
    options: CookieOptions;
  }[] = [];

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
        setAll(newCookies) {
          cookiesToApply.push(...newCookies);
        },
      },
    },
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: oauthCallbackUrl(request),
      scopes: providerScopes,
    },
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (!data.url) {
    return NextResponse.json(
      { message: "No OAuth URL returned" },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ url: data.url });
  for (const { name, value, options } of cookiesToApply) {
    res.cookies.set(name, value, options);
  }
  return res;
}
