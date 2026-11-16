import { eq } from "drizzle-orm";

import { users } from "../../../drizzle/schema";
import { db } from "../../lib/db";
import type { AuthUser } from "../../plugins/auth";

/**
 * Makes sure a `public.users` row exists for the authenticated user. The
 * `handle_new_user` DB trigger normally creates it; this covers the gap when
 * the trigger hasn't been applied yet, so the API works out of the box.
 */
export async function ensureUser(user: AuthUser) {
  const now = new Date().toISOString();
  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.email,
      username:
        (user.metadata.username as string | undefined) ??
        (user.metadata.name as string | undefined) ??
        null,
      avatarUrl: (user.metadata.avatar_url as string | undefined) ?? null,
      free: "free",
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    })
    .onConflictDoNothing({ target: users.id });

  const [row] = await db.select().from(users).where(eq(users.id, user.id));
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    avatarUrl: row.avatarUrl,
    plan: row.free ?? "free",
  };
}
