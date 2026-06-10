import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import { onboardingSteps } from "../drizzle/schema";
import { ONBOARDING_STEPS_SEED } from "../src/module/onboarding/data/onboarding-steps";

config({ path: ".env.local" });

function getConnectionString() {
  const connectionString =
    process.env.DATABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL_ORM ??
    process.env.NEXT_PUBLIC_SUPABASE_DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Missing database URL. Set DATABASE_URL or NEXT_PUBLIC_SUPABASE_DATABASE_URL_ORM in .env.local.",
    );
  }

  return connectionString;
}

/**
 * Drop the cached steps so the API serves the fresh seed immediately. Best
 * effort — skipped if Upstash isn't configured for this environment.
 */
async function bustStepsCache() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;

  try {
    await fetch(`${url}/del/onboarding:steps`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✓ Cleared Redis cache (onboarding:steps)");
  } catch {
    console.warn("! Could not clear Redis cache — it will expire on its own.");
  }
}

async function main() {
  const pool = new pg.Pool({
    connectionString: getConnectionString(),
    ssl: { rejectUnauthorized: false },
  });
  const db = drizzle({ client: pool });

  try {
    const now = new Date().toISOString();

    for (const step of ONBOARDING_STEPS_SEED) {
      await db
        .insert(onboardingSteps)
        .values({
          title: step.title,
          description: step.description,
          json: step.content,
          createdAt: now,
          updatedAt: now,
        })
        // `idx_title` makes the title unique — re-running the seed updates in place.
        .onConflictDoUpdate({
          target: onboardingSteps.title,
          set: {
            description: step.description,
            json: step.content,
            updatedAt: now,
          },
        });

      console.log(`✓ Seeded step "${step.title}" (${step.content.key})`);
    }

    await bustStepsCache();

    console.log(`\nDone — ${ONBOARDING_STEPS_SEED.length} onboarding steps upserted.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Failed to seed onboarding steps:", message);
    process.exit(1);
  } finally {
    await pool.end().catch(() => undefined);
  }
}

void main();
