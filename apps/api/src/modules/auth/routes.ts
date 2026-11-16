import { Elysia } from "elysia";

import { authPlugin } from "../../plugins/auth";
import { ensureUser } from "./service";

/**
 * Credential flows (sign in/up, OAuth, password reset) are handled by Supabase
 * Auth directly from the web app. This API only *verifies* the resulting
 * access token and exposes the caller's identity.
 */
export const authRoutes = new Elysia({ prefix: "/auth", tags: ["auth"] })
  .use(authPlugin)
  .get("/me", ({ user }) => ensureUser(user), { auth: true });
