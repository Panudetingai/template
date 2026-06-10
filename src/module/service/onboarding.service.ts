import { db } from "@/lib/drizzle";
import { redis } from "@/lib/redis";
import { getUser } from "@/lib/supabase/server";
import type { OnboardingStepContent } from "@/module/onboarding/data/onboarding-steps";
import type { OnboardingSchemaType } from "@/module/onboarding/schema";
import { eq } from "drizzle-orm";
import { onboarding, onboardingSteps, users } from "../../../drizzle/schema";

export type Onboarding = typeof onboarding.$inferSelect;

export type OnboardingSnapshot = Pick<
  Onboarding,
  "id" | "userId" | "completed" | "onboardingJson"
>;

export interface OnboardingStepRecord {
  id: string;
  title: string;
  description: string;
  content: OnboardingStepContent;
}

const ONBOARDING_STEPS_CACHE_KEY = "onboarding:steps";

class OnboardingService {
  /**
   * Returns the onboarding step definitions seeded into `onboarding_steps`,
   * ordered by their `content.order`. Cached in Redis since the content rarely
   * changes between deploys.
   */
  async getSteps(): Promise<OnboardingStepRecord[]> {
    const cached = await redis.get(ONBOARDING_STEPS_CACHE_KEY);
    if (cached) {
      return typeof cached === "string"
        ? (JSON.parse(cached) as OnboardingStepRecord[])
        : (cached as OnboardingStepRecord[]);
    }

    const rows = await db
      .select({
        id: onboardingSteps.id,
        title: onboardingSteps.title,
        description: onboardingSteps.description,
        json: onboardingSteps.json,
      })
      .from(onboardingSteps);

    const steps: OnboardingStepRecord[] = rows
      .map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        content: row.json as OnboardingStepContent,
      }))
      .sort((a, b) => (a.content?.order ?? 0) - (b.content?.order ?? 0));

    await redis.set(ONBOARDING_STEPS_CACHE_KEY, JSON.stringify(steps));
    return steps;
  }

  async getUserOnboarding(): Promise<OnboardingSnapshot | null> {
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

  async completeOnboarding(data: OnboardingSchemaType) {
    const user = await getUser();
    if (!user) return null;

    const now = new Date().toISOString();
    const avatarUrl = data.avatarUrl?.trim() || null;

    // Ensure a public.users row exists before the onboarding FK references it.
    // The auth user may not have been mirrored here yet (e.g. the signup
    // webhook didn't run), so upsert instead of a plain update.
    await db
      .insert(users)
      .values({
        id: user.id,
        email: user.email ?? "",
        username: data.username,
        avatarUrl,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          username: data.username,
          avatarUrl,
          updatedAt: now,
        },
      });

    const profilePayload = {
      username: data.username,
      avatarUrl,
      preferences: {
        role: data.role,
        goal: data.goal,
        teamSize: data.teamSize,
      },
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
