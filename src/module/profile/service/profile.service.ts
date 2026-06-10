import { db } from "@/lib/drizzle";
import { redis } from "@/lib/redis";
import { createClient } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { users } from "../../../../drizzle/schema";
import type { UpdateProfileSchemaType } from "../schema";

type CachedSnapshot = {
  onboardingJson?: { username?: string; avatarUrl?: string | null };
} | null;

class ProfileService {
  /**
   * Updates the user's profile in `public.users`, mirrors it into the Supabase
   * auth metadata (so client hooks reflect it immediately) and refreshes the
   * cached onboarding snapshot used for the dashboard greeting.
   */
  async updateProfile(data: UpdateProfileSchemaType) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const now = new Date().toISOString();
    const avatarUrl = data.avatarUrl?.trim() || null;

    await db
      .update(users)
      .set({ username: data.username, avatarUrl, updatedAt: now })
      .where(eq(users.id, user.id));

    // Mirror into auth metadata so useUsers/user-menu update on refetch.
    await supabase.auth.updateUser({
      data: { username: data.username, avatar_url: avatarUrl },
    });

    // Keep the cached onboarding snapshot's greeting in sync.
    const cacheKey = `onboarding:${user.id}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      const snapshot = (
        typeof cached === "string" ? JSON.parse(cached) : cached
      ) as CachedSnapshot;
      if (snapshot?.onboardingJson) {
        snapshot.onboardingJson.username = data.username;
        snapshot.onboardingJson.avatarUrl = avatarUrl;
        await redis.set(cacheKey, JSON.stringify(snapshot));
      }
    }

    return { id: user.id, username: data.username, avatarUrl };
  }
}

export { ProfileService };
