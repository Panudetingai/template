import { eq } from "drizzle-orm";
import type { UpdateProfileSchemaType } from "@template/shared/profile";

import { users } from "../../../drizzle/schema";
import { cache } from "../../lib/cache";
import { db } from "../../lib/db";
import { supabaseAdmin } from "../../lib/supabase";
import type { AuthUser } from "../../plugins/auth";
import { ONBOARDING_CACHE_TTL } from "../onboarding/service";

type CachedSnapshot = {
  onboardingJson?: { username?: string; avatarUrl?: string | null };
} | null;

/**
 * Updates `public.users`, mirrors the change into Supabase auth metadata (so
 * the client session reflects it) and refreshes the cached onboarding snapshot.
 */
export async function updateProfile(
  user: AuthUser,
  data: UpdateProfileSchemaType,
) {
  const avatarUrl = data.avatarUrl?.trim() || null;

  await db
    .update(users)
    .set({
      username: data.username,
      avatarUrl,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(users.id, user.id));

  await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: { username: data.username, avatar_url: avatarUrl },
  });

  const cacheKey = `onboarding:${user.id}`;
  const snapshot = await cache.get<CachedSnapshot>(cacheKey);
  if (snapshot?.onboardingJson) {
    snapshot.onboardingJson.username = data.username;
    snapshot.onboardingJson.avatarUrl = avatarUrl;
    await cache.set(cacheKey, snapshot, ONBOARDING_CACHE_TTL);
  }

  return { id: user.id, username: data.username, avatarUrl };
}
