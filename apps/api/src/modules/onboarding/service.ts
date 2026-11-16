import { eq } from "drizzle-orm";
import type { OnboardingStepContent } from "@template/shared/onboarding-steps";
import type { OnboardingSchemaType } from "@template/shared/onboarding";

import { onboarding, onboardingSteps, users } from "../../../drizzle/schema";
import { cache } from "../../lib/cache";
import { db } from "../../lib/db";
import type { AuthUser } from "../../plugins/auth";

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

const STEPS_CACHE_KEY = "onboarding:steps";
const STEPS_CACHE_TTL = 60 * 60;
export const ONBOARDING_CACHE_TTL = 60 * 60 * 24;

const userCacheKey = (userId: string) => `onboarding:${userId}`;

/** Step definitions seeded into `onboarding_steps`, ordered by `content.order`. */
export async function getSteps(): Promise<OnboardingStepRecord[]> {
  const cached = await cache.get<OnboardingStepRecord[]>(STEPS_CACHE_KEY);
  if (cached) return cached;

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

  await cache.set(STEPS_CACHE_KEY, steps, STEPS_CACHE_TTL);
  return steps;
}

export async function getUserOnboarding(
  userId: string,
): Promise<OnboardingSnapshot | null> {
  const cached = await cache.get<OnboardingSnapshot>(userCacheKey(userId));
  if (cached) return cached;

  const [row] = await db
    .select({
      id: onboarding.id,
      userId: onboarding.userId,
      completed: onboarding.completed,
      onboardingJson: onboarding.onboardingJson,
    })
    .from(onboarding)
    .where(eq(onboarding.userId, userId));

  if (!row) return null;

  await cache.set(userCacheKey(userId), row, ONBOARDING_CACHE_TTL);
  return row;
}

export async function completeOnboarding(
  user: AuthUser,
  data: OnboardingSchemaType,
) {
  const now = new Date().toISOString();
  const avatarUrl = data.avatarUrl?.trim() || null;

  // Ensure a public.users row exists before the onboarding FK references it.
  await db
    .insert(users)
    .values({
      id: user.id,
      email: user.email,
      username: data.username,
      avatarUrl,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { username: data.username, avatarUrl, updatedAt: now },
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

  const [record] = await db
    .insert(onboarding)
    .values({
      userId: user.id,
      completed: true,
      onboardingJson: profilePayload,
      createdAt: now,
      updatedAt: now,
    })
    // `idx_user_id` is unique per user, so re-submitting updates in place.
    .onConflictDoUpdate({
      target: onboarding.userId,
      set: { completed: true, onboardingJson: profilePayload, updatedAt: now },
    })
    .returning();

  await cache.set(
    userCacheKey(user.id),
    {
      id: record.id,
      userId: record.userId,
      completed: record.completed,
      onboardingJson: record.onboardingJson,
    },
    ONBOARDING_CACHE_TTL,
  );

  return {
    user: { id: user.id, username: data.username, avatarUrl },
    onboarding: record,
  };
}
