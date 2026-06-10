import { db } from "@/lib/drizzle";
import { createClient } from "@/lib/supabase/server";
import { OnboardingService } from "@/module/service/onboarding.service";
import type { User } from "@supabase/supabase-js";
import { users } from "../../../../drizzle/schema";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/** Provider-side error mapped to a Thai, user-facing message. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  server_error: "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองอีกครั้ง",
  access_denied: "คุณได้ยกเลิกการเชื่อมต่อบัญชี",
};

const DEFAULT_AUTH_ERROR_MESSAGE =
  "เกิดข้อผิดพลาดในการเชื่อมต่อบัญชี กรุณาลองอีกครั้ง";

interface OAuthError {
  code: string;
  description: string | null;
}

type RedirectStatus = 301 | 302 | 303 | 307 | 308;

/** A resolved redirect target for the OAuth callback route. */
export interface CallbackResult {
  url: string;
  status: RedirectStatus;
}

/**
 * Handles the Supabase OAuth callback: validates provider errors, exchanges the
 * auth code for a session, persists the user, and resolves the redirect target.
 *
 * The service is framework-agnostic — it returns a {@link CallbackResult} so the
 * transport layer (Elysia route) decides how to perform the redirect.
 */
export class CallbackService {
  private constructor(
    private readonly request: Request,
    private readonly supabase: SupabaseServerClient,
  ) {}

  static async create(request: Request): Promise<CallbackService> {
    const supabase = await createClient();
    return new CallbackService(request, supabase);
  }

  async handle(): Promise<CallbackResult> {
    const { origin, searchParams } = new URL(this.request.url);
    const nextPath = this.resolveNextPath(searchParams.get("next"));

    // 1) The provider redirected back with an error.
    const oauthError = this.extractOAuthError(searchParams);
    if (oauthError) {
      return this.errorRedirect(origin, nextPath, oauthError);
    }

    // 2) Exchange the authorization code for a session.
    const code = searchParams.get("code");
    if (!code) {
      return this.errorRedirect(origin, nextPath, {
        code: "missing_code",
        description: null,
      });
    }

    const { data, error } =
      await this.supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      return this.errorRedirect(origin, nextPath, {
        code: error?.code ?? "exchange_failed",
        description: error?.message ?? null,
      });
    }

    // 3) Persist the authenticated user.
    await this.upsertUser(data.user);

    // 4) Success — send the user on their way.
    return { url: this.successRedirectUrl(origin, nextPath), status: 302 };
  }

  /** Only allow same-site relative paths; fall back to the app root. */
  private resolveNextPath(raw: string | null): string {
    return raw && raw.startsWith("/") ? raw : "/";
  }

  private extractOAuthError(params: URLSearchParams): OAuthError | null {
    const error = params.get("error");
    if (!error) return null;
    return {
      code: params.get("error_code") ?? error,
      description: params.get("error_description"),
    };
  }

  private errorRedirect(
    origin: string,
    nextPath: string,
    { code, description }: OAuthError,
  ): CallbackResult {
    const message =
      AUTH_ERROR_MESSAGES[code] ?? description ?? DEFAULT_AUTH_ERROR_MESSAGE;
    const params = new URLSearchParams({
      "auth-error": code,
      "auth-error-message": message,
    });
    const separator = nextPath.includes("?") ? "&" : "?";
    return {
      url: `${origin}${nextPath}${separator}${params.toString()}`,
      status: 302,
    };
  }

  private async upsertUser(user: User): Promise<void> {
    const now = new Date().toISOString();
    const profile = {
      email: user.email ?? user.user_metadata?.email ?? "",
      username:
        user.user_metadata?.username ?? user.user_metadata?.name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    };

    console.log("user code data supabase", user);

    try {
      await db
        .insert(users)
        .values({
          id: user.id,
          free: "free",
          createdAt: now,
          updatedAt: now,
          lastActiveAt: now,
          ...profile,
        })
        .onConflictDoUpdate({
          target: [users.id],
          set: { ...profile, updatedAt: now, lastActiveAt: now },
        });
    } catch (error) {
      console.error("[auth/callback] failed to upsert user", error);
      throw new Error("Failed to persist user");
    }
  }

  /**
   * Resolve the post-login URL. Behind a proxy/load balancer we trust the
   * original host from `x-forwarded-host`; locally and otherwise we use origin.
   */
  private successRedirectUrl(origin: string, nextPath: string): string {
    const isLocalEnv = process.env.NODE_ENV === "development";
    const forwardedHost = this.request.headers.get("x-forwarded-host");

    if (!isLocalEnv && forwardedHost) {
      return `https://${forwardedHost}${nextPath}`;
    }
    return `${origin}${nextPath}`;
  }
}
