import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { env } from "../env";
import * as schema from "../../drizzle/schema";

/** Supabase requires TLS; local Postgres (docker, CI) usually doesn't. */
function useSsl(url: string) {
  try {
    const { hostname, searchParams } = new URL(url);
    if (searchParams.get("sslmode") === "disable") return false;
    return !["localhost", "127.0.0.1", "::1"].includes(hostname);
  } catch {
    return true;
  }
}

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  ssl: useSsl(env.DATABASE_URL) ? { rejectUnauthorized: false } : false,
  max: 10,
});

export const db = drizzle({ client: pool, schema });
export { schema };
