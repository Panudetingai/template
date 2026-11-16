import { Elysia } from "elysia";

import { unauthorized } from "../lib/errors";
import { supabaseAuth } from "../lib/supabase";

export interface AuthUser {
  id: string;
  email: string;
  metadata: Record<string, unknown>;
}

function extractBearer(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  return scheme?.toLowerCase() === "bearer" && token ? token : null;
}

/** Verifies the Supabase access token and returns the caller's identity. */
export async function authenticate(request: Request): Promise<AuthUser> {
  const token = extractBearer(request);
  if (!token) throw unauthorized("Missing bearer token");

  const { data, error } = await supabaseAuth.auth.getClaims(token);
  if (error || !data?.claims?.sub) throw unauthorized("Invalid or expired token");

  const claims = data.claims;
  return {
    id: claims.sub,
    email: (claims.email as string | undefined) ?? "",
    metadata: (claims.user_metadata as Record<string, unknown> | undefined) ?? {},
  };
}

/**
 * Opt a route into authentication with `{ auth: true }`:
 *
 *   .get("/me", ({ user }) => user, { auth: true })
 *
 * `user` is then available (and typed) in the handler.
 */
export const authPlugin = new Elysia({ name: "plugin.auth" }).macro({
  auth: {
    async resolve({ request }) {
      return { user: await authenticate(request) };
    },
  },
});
