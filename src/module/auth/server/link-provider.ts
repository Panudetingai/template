import { publicEnv } from "@/env/public";
import { serverEnv } from "@/env/server";
import { oauthCallbackUrl } from "@/lib/supabase/oauth-public-origin";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  provider: z.enum(["github"]),
  next: z.string().optional(),
});

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

  const { provider, next } = parsed.data;
  const callbackParams = new URLSearchParams({ identity: provider });
  if (next) {
    callbackParams.set("next", next);
  }
  const redirectTo = `${oauthCallbackUrl(request)}?${callbackParams.toString()}`;

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

  const { data, error } = await supabase.auth.linkIdentity({
    provider,
    options: {
      redirectTo,
      scopes: "read:user read:email repo",
    },
  });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (!data?.url) {
    return NextResponse.json(
      { message: "Failed to link provider" },
      { status: 500 },
    );
  }

  const res = NextResponse.json({ url: data.url });
  for (const { name, value, options } of cookiesToApply) {
    res.cookies.set(name, value, options);
  }
  return res;
}
