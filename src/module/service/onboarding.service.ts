import { db } from "@/lib/drizzle";
import { redis } from "@/lib/redis";
import { getUser } from "@/lib/supabase/server";
import { eq } from "drizzle-orm";
import { onboarding, users } from "../../../drizzle/schema";
import type { SetupProfileSchemaType } from "@/module/onboarding/schema";

type Onboarding = typeof onboarding.$inferSelect;

class OnboardingService {
  async getUserOnboarding() {
    const user = await getUser();
    if (!user) return null;

    const cachedOnboarding = await redis.get(`onboarding:${user.id}`);
    if (cachedOnboarding) {
      const parsed =
        typeof cachedOnboarding === "string"
          ? (JSON.parse(cachedOnboarding) as Onboarding)
          : (cachedOnboarding as Onboarding);
      return parsed;
    }

    const [onboardingData] = await db
      .select({
        id: onboarding.id,
        userId: onboarding.userId,
        completed: onboarding.completed,
        onboardingJson: onboarding.onboardingJson,
      })
      .from(onboarding)
      .where(eq(onboarding.userId, user.id));

    if (!onboardingData) return null;

    await redis.set(
      `onboarding:${user.id}`,
      JSON.stringify(onboardingData),
    );
    return onboardingData;
  }

  async setupProfile(data: SetupProfileSchemaType) {
    const user = await getUser();
    if (!user) return null;

    const now = new Date().toISOString();
    const avatarUrl = data.avatarUrl?.trim() || null;

    await db
      .update(users)
      .set({
        username: data.username,
        avatarUrl,
        updatedAt: now,
      })
      .where(eq(users.id, user.id));

    const profilePayload = {
      username: data.username,
      avatarUrl,
      completedAt: now,
    };

    const [existingOnboarding] = await db
      .select({ id: onboarding.id })
      .from(onboarding)
      .where(eq(onboarding.userId, user.id));

    let onboardingRecord: Onboarding;

    if (existingOnboarding) {
      const [updated] = await db
        .update(onboarding)
        .set({
          completed: true,
          onboardingJson: profilePayload,
          updatedAt: now,
        })
        .where(eq(onboarding.userId, user.id))
        .returning();

      onboardingRecord = updated;
    } else {
      const [created] = await db
        .insert(onboarding)
        .values({
          userId: user.id,
          completed: true,
          onboardingJson: profilePayload,
          createdAt: now,
          updatedAt: now,
        })
        .returning();

      onboardingRecord = created;
    }

    await redis.set(
      `onboarding:${user.id}`,
      JSON.stringify({
        id: onboardingRecord.id,
        userId: onboardingRecord.userId,
        completed: onboardingRecord.completed,
        onboardingJson: onboardingRecord.onboardingJson,
      }),
    );

    return {
      user: {
        id: user.id,
        username: data.username,
        avatarUrl,
      },
      onboarding: onboardingRecord,
    };
  }
}

export { OnboardingService };
